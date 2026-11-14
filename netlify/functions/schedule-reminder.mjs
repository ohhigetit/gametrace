import webPush from 'web-push';
import { timingSafeEqual } from 'node:crypto';
import { notificationTestOrigin, notificationTestKey, pushSigningKey, validSubscription } from '../lib/notification-test.mjs';

const messages = {
  45: ['Game day! 45 minutes to tipoff 🏀', 'Grab your gear and bring your energy.'],
  30: ['Time to lock in · 30 minutes to tipoff', 'Take a breath. Trust the work you’ve put in.'],
  15: ['Let’s go! 15 minutes to tipoff 🔥', 'Play your game, lift up your team, and have fun out there.']
};

export function reminderPayload({id, minutes, title, startsAt, venue}) {
  if (![45, 30, 15].includes(minutes)) return null;
  const message = messages[minutes];
  if (!message || !Number.isFinite(Date.parse(startsAt)) || typeof id !== 'string') return null;
  return {id, minutes, title: message[0], encouragement: message[1], event: title || 'Scheduled game', startsAt, venue};
}

export default async function handler(request) {
  const origin = new URL(request.url).origin;
  const production = origin === 'https://game-trace.netlify.app';
  if (!production && origin !== notificationTestOrigin) return new Response(null,{status:404});
  const keys = production ? pushSigningKey(process.env.GAMETRACE_PUSH_PRIVATE_KEY) : notificationTestKey();
  if (production && request.method === 'GET') {
    return Response.json(keys ? {publicKey:keys.publicKey} : {error:'Notification setup is unavailable.'}, {
      status:keys ? 200 : 503, headers:{'Cache-Control':'no-store'}
    });
  }
  if (request.method !== 'POST') return new Response(null,{status:405});
  const secret = production ? process.env.GAMETRACE_REMINDER_JOB_KEY : process.env.GAMETRACE_DEV_REMINDER_JOB_KEY;
  if (!secret || !keys) return new Response(null,{status:503});
  const expected = Buffer.from('Bearer '+secret);
  const supplied = Buffer.from(request.headers.get('authorization') || '');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied,expected)) return new Response(null,{status:401});
  const data = await request.json().catch(()=>null);
  const payload = data && reminderPayload(data);
  if (!payload || !validSubscription(data.subscription)) return new Response(null,{status:400});
  try {
    await webPush.sendNotification(data.subscription,JSON.stringify(payload),{
      TTL:90,timeout:8000,vapidDetails:{subject:origin,...keys}
    });
    return new Response(null,{status:204});
  } catch (error) {
    return new Response(null,{status:[404,410].includes(error.statusCode)?410:502});
  }
}
