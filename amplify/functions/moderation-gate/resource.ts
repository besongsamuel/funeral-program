import { defineFunction, secret } from '@aws-amplify/backend';

export const moderationGate = defineFunction({
  name: 'moderation-gate',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  environment: {
    MODERATION_CODE: secret('MODERATION_CODE'),
    MODERATION_SESSION_SECRET: secret('MODERATION_SESSION_SECRET'),
    MEMORIAL_ID: 'mami-christiana-enanga-besong',
    SESSION_TTL_HOURS: '12',
  },
});
