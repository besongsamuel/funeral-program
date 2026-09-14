import { defineFunction } from '@aws-amplify/backend';

export const memorialAssistant = defineFunction({
  name: 'memorial-assistant',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
  },
});
