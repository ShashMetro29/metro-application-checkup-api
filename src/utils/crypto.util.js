import crypto from 'node:crypto';
import { env } from '../config/env.js';
const key = Buffer.from(env.COMPONENT_ENCRYPTION_KEY, 'base64');
if (key.length !== 32) throw new Error('COMPONENT_ENCRYPTION_KEY must decode to 32 bytes');
export function encryptJson(value) {
  const iv=crypto.randomBytes(12); const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const data=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return { version:1, algorithm:'AES-256-GCM', iv:iv.toString('base64'), tag:cipher.getAuthTag().toString('base64'), data:data.toString('base64') };
}
export function decryptJson(payload) {
  const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(payload.iv,'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag,'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(payload.data,'base64')),decipher.final()]).toString('utf8'));
}
