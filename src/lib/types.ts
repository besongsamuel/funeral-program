export type ContentStatus = 'pending' | 'approved' | 'rejected';

export interface Memorial {
  id: string;
  slug: string;
  fullName: string;
  maidenName?: string;
  portraitUrl?: string;
  heroImageUrl?: string;
  bornOn: string;
  diedOn: string;
  tagline?: string;
  shortTribute?: string;
  obituaryHtml?: string;
  theme?: Record<string, unknown>;
  isPublished: boolean;
  programPdfUrl?: string;
}

export interface BiographySection {
  id: string;
  memorialId: string;
  kind: string;
  heading: string;
  body: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface TimelineEvent {
  id: string;
  memorialId: string;
  eventDate: string;
  title: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
}

export interface FamilyMember {
  id: string;
  memorialId: string;
  fullName: string;
  relation: string;
  photoUrl?: string;
  bio?: string;
  parentId?: string;
  sortOrder: number;
}

export interface FuneralEvent {
  id: string;
  memorialId: string;
  kind: 'service' | 'visitation' | 'reception' | 'burial';
  title?: string;
  startsAt: string;
  endsAt?: string;
  timeLabel?: string;
  venueName: string;
  address?: string;
  mapEmbedUrl?: string;
  parkingNotes?: string;
  dressCode?: string;
  notes?: string;
}

export interface ProgramItem {
  id: string;
  memorialId: string;
  kind: string;
  title: string;
  person?: string;
  reference?: string;
  sortOrder: number;
}

export interface GalleryAlbum {
  id: string;
  memorialId: string;
  name: string;
  category: string;
  sortOrder: number;
}

export interface GalleryPhoto {
  id: string;
  memorialId: string;
  albumId: string;
  url: string;
  caption?: string;
  sortOrder: number;
}

export interface Tribute {
  id: string;
  memorialId: string;
  authorName: string;
  relationship?: string;
  message: string;
  photoUrl?: string;
  isGuestbookSignature: boolean;
  status: ContentStatus;
  createdAt?: string;
}

export interface Story {
  id: string;
  memorialId: string;
  authorName: string;
  title: string;
  body: string;
  mediaUrl?: string;
  status: ContentStatus;
}

export interface MediaItem {
  id: string;
  memorialId: string;
  kind: 'video' | 'audio' | 'livestream';
  provider: string;
  url: string;
  title: string;
  category?: string;
  sortOrder: number;
}

export interface DonationCause {
  id: string;
  memorialId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  donateUrl?: string;
  inLieuOfFlowersNote?: string;
  sortOrder: number;
}

export interface FamilyContact {
  id: string;
  memorialId: string;
  name: string;
  relation?: string;
  phone?: string;
  email?: string;
  note?: string;
}

export interface AiSettings {
  id: string;
  memorialId: string;
  assistantName: string;
  persona?: string;
  greeting?: string;
  isEnabled: boolean;
  fallbackMessage?: string;
}

export interface AiQuickQuestion {
  id: string;
  memorialId: string;
  label: string;
  questionText: string;
  sortOrder: number;
}

export interface AiKnowledgeEntry {
  id: string;
  memorialId: string;
  question: string;
  answer: string;
  tags?: string[];
}

export interface MemorialContext {
  memorial: Memorial;
  biographySections: BiographySection[];
  timelineEvents: TimelineEvent[];
  familyMembers: FamilyMember[];
  funeralEvents: FuneralEvent[];
  programItems: ProgramItem[];
  galleryAlbums: GalleryAlbum[];
  galleryPhotos: GalleryPhoto[];
  tributes: Tribute[];
  stories: Story[];
  mediaItems: MediaItem[];
  donationCauses: DonationCause[];
  familyContacts: FamilyContact[];
  aiSettings: AiSettings;
  aiQuickQuestions: AiQuickQuestion[];
  aiKnowledgeEntries: AiKnowledgeEntry[];
}
