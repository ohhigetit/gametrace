import { notificationTestOrigin, notificationTestKey, validSubscription } from '../lib/notification-test.mjs';

export default async function handler(request) {
  if (new URL(request.url).origin !== notificationTestOrigin) return new Response(null, { status: 404 });
  if (!['GET', 'POST'].includes(request.method)) return new Response(null, { status: 405 });
  const keys = notificationTestKey();
  if (keys && request.method === 'POST') {
    if (request.headers.get('origin') !== notificationTestOrigin) return new Response(null, { status: 403 });
    const body = await request.text();
    if (body.length > 2048) return new Response(null, { status: 413 });
    const { subscription } = await Promise.resolve().then(() => JSON.parse(body)).catch(() => ({})) ?? {};
    if (!validSubscription(subscription)) return Response.json({ error: 'Open GameTrace DEV from your iPhone Home Screen.' }, { status: 400 });
    try {
      const queued = await fetch(new URL('/.netlify/functions/notification-test-background', notificationTestOrigin), {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-gt-test-key': keys.privateKey },
        body: JSON.stringify({ subscription }), redirect: 'error'
      });
      if (queued.status === 202) return new Response(null, { status: 202 });
    } catch {
      // The client can retry when the background function becomes available.
    }
    return Response.json({ error: 'Could not queue the notification test. Try again.' }, { status: 502 });
  }
  return Response.json(keys ? { publicKey: keys.publicKey } : { error: 'DEV notification signing key has not been configured.' }, {
    status: keys ? 200 : 503, headers: { 'Cache-Control': 'no-store' }
  });
}

export const config = {
  rateLimit: { windowLimit: 10, windowSize: 180, aggregateBy: ['ip', 'domain'] }
};
