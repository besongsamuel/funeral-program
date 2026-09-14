import { defineFunction } from '@aws-amplify/backend';

export const tributeGuard = defineFunction({
  name: 'tribute-guard',
  entry: './handler.ts',
  timeoutSeconds: 10,
  memoryMB: 256,
});
