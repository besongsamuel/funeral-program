import type { MemorialContext } from './types';

export const MEMORIAL_ID = 'mami-christiana-enanga-besong';
export const MEMORIAL_SLUG = 'mami-christiana-enanga-besong';
export const MAMI_HONOREE_ID = 'honoree-mami-christiana';
export const HILARY_HONOREE_ID = 'honoree-hilary-akem';

const portrait = '/images/portrait.jpg';
const hilaryPortrait = '/images/hilary-portrait.jpg';
const programme = '/images/funeral-programme.jpg';

export const demoContext: MemorialContext = {
  memorial: {
    id: MEMORIAL_ID,
    slug: MEMORIAL_SLUG,
    fullName: 'Mami Christiana Enanga Besong & Hilary Akem Oben',
    portraitUrl: portrait,
    bornOn: '1936-05-24',
    diedOn: '2026-09-18',
    tagline: 'Forever in our hearts.',
    shortTribute:
      'We remember Mami Christiana Enanga Besong and Hilary Akem Oben — two remarkable lives, one family, and a love that endures.',
    isPublished: true,
    programPdfUrl: programme,
  },
  honorees: [
    {
      id: MAMI_HONOREE_ID,
      memorialId: MEMORIAL_ID,
      slug: 'mami-christiana-enanga-besong',
      fullName: 'Mami Christiana Enanga Besong',
      maidenName: 'Njie Nambeke',
      portraitUrl: portrait,
      bornOn: '1936-05-24',
      diedOn: '2026-08-14',
      tagline: 'Her legacy lives on in us all.',
      shortTribute:
        'A beloved mother, a cherished grandmother, a pillar of family, a legacy forever. Her kindness lives on. Her love endures. Her legacy inspires us all.',
      tributePreface: `We gather these tributes to honor a remarkable matriarch who lived for 90 beautiful years. Mami Christiana Enanga was the true definition of a homebuilder, opening her doors so widely that her household warmly sheltered at least 20 individuals at any given time.

Though born Bimbia, she embraced her husband’s culture with profound love, speaking the Ejagham dialect with the fluency of a native.

In a large household alongside junior wives, she anchored her family with grace, remaining fiercely faithful and steadfast in her marriage. Her enduring legacy of love, unity, and strength lives on through the family and community.

As you read through these pages, we hope you find comfort in the shared stories, the laughter preserved in ink, and the reminder that Mami Enanga's legacy lives on through each of us.

Thank you to everyone who contributed their cherished memories to make this tribute possible.`,
      anniversaryLine: '90 Years of Grace, Love & Legacy',
      obituaryHtml: `<p class="obituary-theme">90 Years of Grace • Faith • Family • Culture • Love • Legacy</p>
<p>Celebrating the life and legacy of Mami Christiana Enanga Besong, née Njie Nambeke.</p>
<p><strong>Born</strong> 24 May 1936 &nbsp;|&nbsp; <strong>90th Birthday</strong> 24 May 2026 &nbsp;|&nbsp; <strong>Called to Glory</strong> 14 August 2026</p>
<blockquote>
<p>“Blessed are the dead who die in the Lord from now on. ‘Yes,’ says the Spirit, ‘that they may rest from their labor, and their works follow them.’”</p>
<footer>— Revelation 14:13</footer>
</blockquote>
<p>The family will honour her life through a joint Funeral Programme from 7 to 21 November 2026. Her burial and final farewell will be held on Saturday 14 November at the family compound in Limbola, following the joint funeral service at Ebenezer Baptist Church Limbe.</p>
<p>Family and friends are invited to celebrate a life well lived. <a href="/funeral">View the Funeral Programme</a>.</p>`,
      sortOrder: 1,
    },
    {
      id: HILARY_HONOREE_ID,
      memorialId: MEMORIAL_ID,
      slug: 'hilary-akem-oben',
      fullName: 'Hilary Akem Oben',
      portraitUrl: hilaryPortrait,
      bornOn: '1971-06-19',
      diedOn: '2026-09-18',
      tagline: 'A beautiful soul has departed, but his memory lives on.',
      shortTribute:
        'He will be remembered for his kindness, generosity, warm heart and the positive impact he made in the lives of many.',
      tributePreface: `On the following pages, we honor the remarkable life of our beloved brother, Hilary Akem Oben, who passed away too soon at the age of 55. His sudden departure comes just one month after the devastating loss of our matriarch, leaving our hearts doubly broken.

Hilary was a pillar of devotion; in Mami's final days, he was the one who tenderly took Mom to the hospital, caring for her until her passing. Now, they are reunited in eternity.

As we share these tributes, we celebrate Hilary’s profound kindness, his unwavering strength, and the deep love he gave to our family.`,
      obituaryHtml: `<p>With deep sorrow, we announce the passing of our beloved Hilary Akem Oben, who peacefully passed away on Friday, 18 September 2026, in Limbe, Cameroon.</p>
<p>He will be remembered for his kindness, generosity, warm heart and the positive impact he made in the lives of many.</p>
<blockquote>
<p>A beautiful soul has departed, but his memory lives on.</p>
</blockquote>
<p>May his soul rest in perfect peace.</p>
<p>His viewing, funeral service, and burial will be held on Tuesday, 17 November 2026 at 10:00 AM at the family residence, Kembong Village, as part of the joint programme from 7 to 21 November 2026.</p>
<p><a href="/funeral">View the Funeral Programme</a>.</p>`,
      sortOrder: 2,
    },
  ],
  biographySections: [
    {
      id: 'bio-1',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      kind: 'childhood',
      heading: 'Family & Legacy',
      body: 'Mami Christiana Enanga Besong, née Njie Nambeke, was a beloved mother, a cherished grandmother, and a pillar of her family. Born on 24 May 1936, she lived 90 years of grace, love, and legacy. Her family across Cameroon, Germany, the United States, and Canada continues to honour the life she lived.',
      sortOrder: 1,
    },
    {
      id: 'bio-2',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      kind: 'faith',
      heading: 'Faith',
      body: 'The family will give thanks for her life at Ebenezer Baptist Church Limbe, where the joint funeral service will be held. Scripture chosen in her honour: “Blessed are the dead who die in the Lord.” — Revelation 14:13.',
      sortOrder: 2,
    },
    {
      id: 'bio-3',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      kind: 'qualities',
      heading: 'A Life Well Lived',
      body: 'Her kindness lives on. Her love endures. Her legacy inspires us all. She is remembered as a pillar of family — a legacy forever, forever in our hearts.',
      sortOrder: 3,
    },
    {
      id: 'bio-4',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      kind: 'quotes',
      heading: 'In Honour of Mami',
      body: '“Her legacy lives on in us all.” The family celebrates 90 years of grace, love, and legacy, and invites all who loved her to gather in Clerk’s Quarter, Limbe, and Limbola.',
      sortOrder: 4,
    },
    {
      id: 'bio-5',
      memorialId: MEMORIAL_ID,
      honoreeId: HILARY_HONOREE_ID,
      kind: 'qualities',
      heading: 'A Beautiful Soul',
      body: 'Hilary Akem Oben was born on 19 June 1971 and peacefully passed away on Friday, 18 September 2026, in Limbe, Cameroon. He will be remembered for his kindness, generosity, warm heart, and the positive impact he made in the lives of many. A beautiful soul has departed, but his memory lives on. May his soul rest in perfect peace.',
      sortOrder: 1,
    },
  ],
  timelineEvents: [
    {
      id: 'tl-1',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      eventDate: '1936-05-24',
      title: 'Sunrise',
      description: 'Mami Christiana Enanga Besong, née Njie Nambeke, was born.',
      sortOrder: 1,
    },
    {
      id: 'tl-2',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      eventDate: '2026-05-24',
      title: '90th Birthday',
      description: 'Celebrating 90 years of grace, faith, family, culture, love, and legacy.',
      sortOrder: 2,
    },
    {
      id: 'tl-3',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      eventDate: '2026-08-14',
      title: 'Called to Glory',
      description: 'Called home after 90 years of grace, faith, family, culture, love, and legacy.',
      sortOrder: 3,
    },
    {
      id: 'tl-4',
      memorialId: MEMORIAL_ID,
      honoreeId: MAMI_HONOREE_ID,
      eventDate: '2026-11-14',
      title: 'Joint Funeral Service and Burial',
      description: 'Removal, viewing, the joint funeral service at Ebenezer Baptist Church Limbe, and a private burial and final farewell at the family compound in Limbola.',
      sortOrder: 4,
    },
    {
      id: 'tl-5',
      memorialId: MEMORIAL_ID,
      honoreeId: HILARY_HONOREE_ID,
      eventDate: '1971-06-19',
      title: 'Sunrise',
      description: 'Hilary Akem Oben was born.',
      sortOrder: 1,
    },
    {
      id: 'tl-6',
      memorialId: MEMORIAL_ID,
      honoreeId: HILARY_HONOREE_ID,
      eventDate: '2026-09-18',
      title: 'Called Home',
      description: 'He peacefully passed away in Limbe, Cameroon.',
      sortOrder: 2,
    },
    {
      id: 'tl-7',
      memorialId: MEMORIAL_ID,
      honoreeId: HILARY_HONOREE_ID,
      eventDate: '2026-11-17',
      title: 'Viewing, Funeral Service and Burial',
      description: 'Family residence, Kembong Village, at 10:00 AM.',
      sortOrder: 3,
    },
  ],
  familyMembers: [
    { id: 'fam-1', memorialId: MEMORIAL_ID, fullName: 'Chief Moses Obenofunde', relation: 'Cameroon', sortOrder: 1 },
    { id: 'fam-2', memorialId: MEMORIAL_ID, fullName: 'Oben Francis Essie', relation: 'Cameroon', sortOrder: 2 },
    { id: 'fam-3', memorialId: MEMORIAL_ID, fullName: 'Silo Oben Bertha', relation: 'Cameroon', sortOrder: 3 },
    { id: 'fam-5', memorialId: MEMORIAL_ID, fullName: 'Benjamin Tanyi Oben', relation: 'Cameroon', sortOrder: 4 },
    { id: 'fam-6', memorialId: MEMORIAL_ID, fullName: 'Samuel Njie Besong', relation: 'Germany', sortOrder: 5 },
    { id: 'fam-7', memorialId: MEMORIAL_ID, fullName: 'Obsaley Oben Besong', relation: 'Germany', sortOrder: 6 },
    { id: 'fam-8', memorialId: MEMORIAL_ID, fullName: 'Robert Molango Oben', relation: 'Germany', sortOrder: 7 },
    { id: 'fam-9', memorialId: MEMORIAL_ID, fullName: 'Apst Dr. Drusilla Dinka', relation: 'USA', sortOrder: 8 },
    { id: 'fam-10', memorialId: MEMORIAL_ID, fullName: 'Sessekou Awu Moses Besong', relation: 'USA', sortOrder: 9 },
    { id: 'fam-11', memorialId: MEMORIAL_ID, fullName: 'Mrs Helen Enanga Oben Nche', relation: 'USA', sortOrder: 10 },
    { id: 'fam-12', memorialId: MEMORIAL_ID, fullName: 'Edward Besong Oben', relation: 'Canada', sortOrder: 11 },
  ],
  funeralEvents: [
    {
      id: 'fe-1',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Opening of Mourning',
      startsAt: '2026-11-07T16:00:00+01:00',
      timeLabel: '4:00 PM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-2',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Continuation of Mourning',
      startsAt: '2026-11-08T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
      notes: 'Sunday 8 through Thursday 12 November, 10:00 AM daily.',
    },
    {
      id: 'fe-3',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Continuation of Mourning',
      startsAt: '2026-11-09T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-4',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Continuation of Mourning',
      startsAt: '2026-11-10T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-5',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Continuation of Mourning',
      startsAt: '2026-11-11T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-6',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Continuation of Mourning',
      startsAt: '2026-11-12T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-7',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Wake-Keeping Without the Mortal Remains Present',
      startsAt: '2026-11-13T18:00:00+01:00',
      timeLabel: '6:00 PM – Till Dawn',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-8',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Removal of the Mortal Remains',
      startsAt: '2026-11-14T06:00:00+01:00',
      timeLabel: '6:00 AM',
      venueName: 'Limbe Regional Hospital Mortuary',
      address: 'Limbe, Cameroon',
      notes: 'Removal, joint funeral service, and burial of Mami Christiana Enanga Besong.',
    },
    {
      id: 'fe-9',
      memorialId: MEMORIAL_ID,
      kind: 'visitation',
      title: 'Viewing and Family Photographs',
      startsAt: '2026-11-14T07:00:00+01:00',
      endsAt: '2026-11-14T11:30:00+01:00',
      timeLabel: '7:00 AM – 11:30 AM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-10',
      memorialId: MEMORIAL_ID,
      kind: 'service',
      title: 'Joint Funeral Service',
      startsAt: '2026-11-14T12:00:00+01:00',
      endsAt: '2026-11-14T14:00:00+01:00',
      timeLabel: '12:00 PM – 2:00 PM',
      venueName: 'Ebenezer Baptist Church, Limbe',
      address: 'Limbe, Cameroon',
    },
    {
      id: 'fe-11',
      memorialId: MEMORIAL_ID,
      kind: 'burial',
      title: 'Private Burial and Final Farewell to Mami Christiana Enanga Besong née Njie Nambeke',
      startsAt: '2026-11-14T15:00:00+01:00',
      endsAt: '2026-11-14T16:00:00+01:00',
      timeLabel: '3:00 PM – 4:00 PM',
      venueName: 'Family Compound, Limbola',
      address: 'Limbola, Cameroon',
    },
    {
      id: 'fe-12',
      memorialId: MEMORIAL_ID,
      kind: 'reception',
      title: 'Reception',
      startsAt: '2026-11-14T16:00:00+01:00',
      endsAt: '2026-11-14T20:00:00+01:00',
      timeLabel: '4:00 PM – 8:00 PM',
      venueName: 'Family Residence, Clerk’s Quarter',
      address: 'Clerk’s Quarter, Limbe, Cameroon',
    },
    {
      id: 'fe-13',
      memorialId: MEMORIAL_ID,
      kind: 'service',
      title: 'Viewing, Funeral Service and Burial of Hilary Akem Oben',
      startsAt: '2026-11-17T10:00:00+01:00',
      timeLabel: '10:00 AM',
      venueName: 'Family Residence, Kembong Village',
      address: 'Kembong Village, Cameroon',
    },
    {
      id: 'fe-14',
      memorialId: MEMORIAL_ID,
      kind: 'reception',
      title: 'Sasa / Cultural Feast',
      startsAt: '2026-11-21T06:00:00+01:00',
      timeLabel: '6:00 AM',
      venueName: 'Family Compound, Limbola',
      address: 'Limbola, Cameroon',
    },
  ],
  programItems: [],
  galleryAlbums: [
    { id: 'alb-1', memorialId: MEMORIAL_ID, name: 'Portraits', category: 'family', sortOrder: 1 },
    { id: 'alb-2', memorialId: MEMORIAL_ID, name: 'Programme', category: 'funeral', sortOrder: 2 },
  ],
  galleryPhotos: [
    { id: 'gp-1', memorialId: MEMORIAL_ID, honoreeId: MAMI_HONOREE_ID, albumId: 'alb-1', url: portrait, caption: 'Mami Christiana Enanga Besong', status: 'approved', sortOrder: 1 },
    { id: 'gp-3', memorialId: MEMORIAL_ID, honoreeId: HILARY_HONOREE_ID, albumId: 'alb-1', url: hilaryPortrait, caption: 'Hilary Akem Oben', status: 'approved', sortOrder: 2 },
    { id: 'gp-2', memorialId: MEMORIAL_ID, honoreeId: MAMI_HONOREE_ID, albumId: 'alb-2', url: programme, caption: 'Funeral Programme, 7–21 November 2026', status: 'approved', sortOrder: 1 },
  ],
  tributes: [],
  stories: [],
  mediaItems: [],
  donationCauses: [],
  familyContacts: [
    { id: 'fc-1', memorialId: MEMORIAL_ID, name: 'Chief Moses Obenofunde', relation: 'Cameroon', phone: '+237 682 946 016' },
    { id: 'fc-2', memorialId: MEMORIAL_ID, name: 'Oben Francis Essie', relation: 'Cameroon', phone: '+237 699 961 466' },
    { id: 'fc-3', memorialId: MEMORIAL_ID, name: 'Silo Oben Bertha', relation: 'Cameroon', phone: '+237 677 786 431' },
    { id: 'fc-5', memorialId: MEMORIAL_ID, name: 'Benjamin Tanyi Oben', relation: 'Cameroon', phone: '+237 695 935 064' },
    { id: 'fc-6', memorialId: MEMORIAL_ID, name: 'Samuel Njie Besong', relation: 'Germany', phone: '+49 163 176 0291' },
    { id: 'fc-7', memorialId: MEMORIAL_ID, name: 'Obsaley Oben Besong', relation: 'Germany', phone: '+49 173 992 3221' },
    { id: 'fc-8', memorialId: MEMORIAL_ID, name: 'Robert Molango Oben', relation: 'Germany', phone: '+49 178 554 8658' },
    { id: 'fc-9', memorialId: MEMORIAL_ID, name: 'Apst Dr. Drusilla Dinka', relation: 'USA', phone: '+1 972 880 2633' },
    { id: 'fc-10', memorialId: MEMORIAL_ID, name: 'Sessekou Moses Awu Besong', relation: 'USA', phone: '+1 617 875 5151' },
    { id: 'fc-11', memorialId: MEMORIAL_ID, name: 'Mrs Helen Enanga Oben Nche', relation: 'USA', phone: '+1 240 645 8767' },
    { id: 'fc-12', memorialId: MEMORIAL_ID, name: 'Edward Besong Oben', relation: 'Canada', phone: '+1 306 717 0771' },
  ],
  aiSettings: {
    id: 'ai-1',
    memorialId: MEMORIAL_ID,
    assistantName: 'Memorial Guide',
    persona:
      'Speak warmly and respectfully, as a gentle guide helping visitors learn about Mami Christiana Enanga Besong and Hilary Akem Oben, and the joint funeral programme in Limbe, Kembong Village, and Limbola.',
    greeting:
      'Hello, I am here to help you learn about Mami Christiana Enanga Besong and Hilary Akem Oben, and the funeral programme. Feel free to ask me anything.',
    isEnabled: true,
    fallbackMessage: 'I am sorry, I do not have that information. Please contact the family using the details on the Funeral page.',
  },
  aiQuickQuestions: [
    { id: 'qq-1', memorialId: MEMORIAL_ID, label: 'When is the funeral?', questionText: 'When and where is the funeral service?', sortOrder: 1 },
    { id: 'qq-2', memorialId: MEMORIAL_ID, label: 'The programme', questionText: 'What is the funeral programme?', sortOrder: 2 },
    { id: 'qq-3', memorialId: MEMORIAL_ID, label: 'Who was Mami?', questionText: 'Who was Mami Christiana Enanga Besong?', sortOrder: 3 },
    { id: 'qq-6', memorialId: MEMORIAL_ID, label: 'Who was Hilary?', questionText: 'Who was Hilary Akem Oben?', sortOrder: 4 },
    { id: 'qq-4', memorialId: MEMORIAL_ID, label: 'Share a memory', questionText: 'How can I share a memory or condolence message?', sortOrder: 5 },
    { id: 'qq-5', memorialId: MEMORIAL_ID, label: 'Family contacts', questionText: 'How can I contact the family?', sortOrder: 6 },
  ],
  aiKnowledgeEntries: [
    {
      id: 'ke-1',
      memorialId: MEMORIAL_ID,
      question: 'What was her maiden name?',
      answer: 'Mami Christiana Enanga Besong was born Njie Nambeke. Her full name is Mami Christiana Enanga Besong, née Njie Nambeke.',
      tags: ['name', 'family', 'mami'],
    },
    {
      id: 'ke-2',
      memorialId: MEMORIAL_ID,
      question: 'When was Mami born and when did she die?',
      answer: 'Mami Christiana Enanga Besong: sunrise 24 May 1936, sunset 14 August 2026. She was 90 years old.',
      tags: ['dates', 'life', 'mami'],
    },
    {
      id: 'ke-4',
      memorialId: MEMORIAL_ID,
      question: 'When was Hilary born and when did he die?',
      answer: 'Hilary Akem Oben was born on 19 June 1971 and peacefully passed away on Friday, 18 September 2026, in Limbe, Cameroon. He will be remembered for his kindness, generosity, warm heart, and the positive impact he made in the lives of many.',
      tags: ['dates', 'life', 'hilary'],
    },
    {
      id: 'ke-3',
      memorialId: MEMORIAL_ID,
      question: 'What is the funeral programme?',
      answer:
        'The joint funeral programme runs from 7 to 21 November 2026. Opening of mourning is Saturday 7 November at 4:00 PM at the family residence, Clerk’s Quarter. Mourning continues Sunday 8 through Thursday 12 November at 10:00 AM daily. Wake-keeping without the mortal remains is Friday 13 November from 6:00 PM till dawn. On Saturday 14 November there is removal at 6:00 AM from Limbe Regional Hospital Mortuary, viewing from 7:00 AM to 11:30 AM, a joint funeral service from 12:00 PM to 2:00 PM at Ebenezer Baptist Church Limbe, burial of Mami Christiana Enanga Besong from 3:00 PM to 4:00 PM at the family compound in Limbola, and a reception from 4:00 PM to 8:00 PM at Clerk’s Quarter. Hilary Akem Oben’s viewing, funeral service, and burial are on Tuesday 17 November at 10:00 AM at the family residence, Kembong Village. The Sasa / cultural feast is Saturday 21 November at 6:00 AM at the family compound, Limbola.',
      tags: ['funeral', 'programme'],
    },
  ],
};
