import { createECDH, ECDH } from 'node:crypto';

export const notificationTestOrigin = 'https://development--game-trace.netlify.app';
export function notificationTestKey() {
  const privateKey = process.env.GAMETRACE_DEV_PUSH_PRIVATE_KEY;
  if (!privateKey || !/^[A-Za-z0-9_-]{43}$/.test(privateKey)) return null;
  try {
    const ecdh = createECDH('prime256v1');
    ecdh.setPrivateKey(Buffer.from(privateKey, 'base64url'));
    return { privateKey, publicKey: ecdh.getPublicKey().toString('base64url') };
  } catch {
    return null;
  }
}

export function validSubscription(subscription) {
  try {
    const url = new URL(subscription.endpoint);
    const { p256dh, auth } = subscription.keys;
    const key = Buffer.from(p256dh, 'base64url');
    if (url.protocol !== 'https:' || !/^(?:[a-z0-9-]+\.)*push\.apple\.com$/.test(url.hostname) ||
        url.username || url.password || url.port || url.hash || url.pathname === '/' ||
        !/^[A-Za-z0-9_-]{87}$/.test(p256dh) || key[0] !== 4 ||
        !/^[A-Za-z0-9_-]{22}$/.test(auth)) return false;
    ECDH.convertKey(key, 'prime256v1');
    return true;
  } catch {
    return false;
  }
}

