import webPush from 'web-push';
import { timingSafeEqual } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { notificationTestOrigin, notificationTestKey, validSubscription } from '../lib/notification-test.mjs';

export async function sendTestNotifications(subscription, { send, sleep = delay, now = Date.now } = {}) {
  const started = now();
  for (const minute of [1, 2, 3]) {
    await sleep(Math.max(0, started + minute * 60_000 - now()));
    try {
      await send(subscription, JSON.stringify({ minute }));
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) return;
      console.warn('DEV notification test delivery failed', minute, error.statusCode ?? 'network error');
    }
  }
}

export default async function handler(request) {
  if (request.method !== 'POST' || new URL(request.url).origin !== notificationTestOrigin) return;
  const keys = notificationTestKey();
  if (!keys) return;
  const { subscription } = await request.json().catch(() => ({})) ?? {};
  const authorization = request.headers.get('x-gt-test-key');
  if (typeof authorization !== 'string') return;
  const supplied = Buffer.from(authorization);
  const expected = Buffer.from(keys.privateKey);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected) || !validSubscription(subscription)) return;
  await sendTestNotifications(subscription, {
    send: (target, payload) => webPush.sendNotification(target, payload, {
      TTL: 45,
      timeout: 8000,
      vapidDetails: { subject: notificationTestOrigin, ...keys }
    })
  });
}
