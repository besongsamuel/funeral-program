import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'memorialStorage',
  access: (allow) => ({
    'memorial-media/*': [
      allow.guest.to(['read']),
      allow.groups(['MemorialAdmin']).to(['read', 'write', 'delete']),
    ],
    'tribute-uploads/*': [
      allow.guest.to(['read', 'write']),
      allow.groups(['MemorialAdmin']).to(['read', 'write', 'delete']),
    ],
    'gallery-uploads/*': [
      allow.guest.to(['read', 'write']),
      allow.groups(['MemorialAdmin']).to(['read', 'write', 'delete']),
    ],
  }),
});
