/**
 * Seed script for Amplify Data.
 * Run after `npx ampx sandbox` generates amplify_outputs.json:
 *   yarn seed
 *
 * In demo mode (no Amplify), data is served from src/lib/demo-data.ts automatically.
 */
import { demoContext, MEMORIAL_ID } from '../src/lib/demo-data';

console.log('Memorial seed data ready for memorial ID:', MEMORIAL_ID);
console.log('Memorial slug:', demoContext.memorial.slug);
console.log('');
console.log('To seed Amplify Data, connect to your sandbox and use the Amplify client');
console.log('to create records matching demo-data.ts. Example models to create:');
console.log('  - Memorial (1 record)');
console.log(`  - BiographySection (${demoContext.biographySections.length} records)`);
console.log(`  - TimelineEvent (${demoContext.timelineEvents.length} records)`);
console.log(`  - FamilyMember (${demoContext.familyMembers.length} records)`);
console.log(`  - FuneralEvent (${demoContext.funeralEvents.length} records)`);
console.log(`  - ProgramItem (${demoContext.programItems.length} records)`);
console.log(`  - GalleryAlbum (${demoContext.galleryAlbums.length} records)`);
console.log(`  - GalleryPhoto (${demoContext.galleryPhotos.length} records)`);
console.log(`  - Tribute (${demoContext.tributes.length} records)`);
console.log(`  - Story (${demoContext.stories.length} records)`);
console.log(`  - MediaItem (${demoContext.mediaItems.length} records)`);
console.log(`  - DonationCause (${demoContext.donationCauses.length} records)`);
console.log(`  - FamilyContact (${demoContext.familyContacts.length} records)`);
console.log('  - AiSettings (1 record)');
console.log(`  - AiQuickQuestion (${demoContext.aiQuickQuestions.length} records)`);
console.log(`  - AiKnowledgeEntry (${demoContext.aiKnowledgeEntries.length} records)`);
console.log('');
console.log('Demo mode works out of the box without seeding.');
