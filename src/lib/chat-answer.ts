import type { FamilyMember, Honoree, MemorialContext } from './types';
import { matchesHonoree } from './honorees';

function stripHtml(value?: string) {
  return (value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function relationMatches(relation: string, pattern: RegExp) {
  return pattern.test(relation);
}

export function familyByKind(members: FamilyMember[]) {
  const children = members.filter(
    (member) =>
      relationMatches(member.relation, /\b(son|daughter|child|children)\b/i) &&
      !relationMatches(member.relation, /\bgrand/i),
  );
  const grandchildren = members.filter((member) =>
    relationMatches(member.relation, /\b(grandson|granddaughter|grandchild)/i),
  );
  const countsByRelation = members.reduce<Record<string, number>>((acc, member) => {
    const key = member.relation.trim() || 'Family';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return { children, grandchildren, countsByRelation };
}

function describeHonoree(honoree: Honoree, ctx: MemorialContext) {
  const sections = ctx.biographySections
    .filter((section) => matchesHonoree(section.honoreeId, honoree, ctx.honorees))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((section) => `**${section.heading}**\n${section.body}`)
    .join('\n\n');
  const name = `${honoree.fullName}${honoree.maidenName ? `, née ${honoree.maidenName}` : ''}`;
  return [
    `${name}, sunrise ${honoree.bornOn}, sunset ${honoree.diedOn}.`,
    honoree.shortTribute,
    sections,
    stripHtml(honoree.obituaryHtml),
    `[Read the story](/legacy?person=${honoree.slug})`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function answerFromContext(question: string, ctx: MemorialContext): string {
  const q = question.toLowerCase();
  const { funeralEvents, biographySections, donationCauses, aiKnowledgeEntries, familyMembers, timelineEvents, honorees } =
    ctx;
  const childhood = biographySections.find((section) => section.kind === 'childhood');
  const { children, grandchildren, countsByRelation } = familyByKind(familyMembers);
  const mami = honorees.find((honoree) => /mami|christiana/i.test(honoree.fullName));
  const hilary = honorees.find((honoree) => /hilary/i.test(honoree.fullName));

  const wantsFuneral =
    !/\b(grow|grew|childhood|born)\b/.test(q) &&
    (q.includes('service') || q.includes('funeral') || q.includes('when') || q.includes('where') || q.includes('programme') || q.includes('program'));

  if (wantsFuneral) {
    const lines = funeralEvents.map((event) => {
      const day = new Date(event.startsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      return `- ${day}: ${event.title ?? event.kind} at ${event.venueName}${event.timeLabel ? ` (${event.timeLabel})` : ''}`;
    });
    return `The joint funeral programme runs from 7 to 21 November 2026.\n\n${lines.join('\n')}\n\n[View the full programme](/funeral)`;
  }

  if (/\b(child|children|son|daughter|grandchild|grandchildren|grandson|granddaughter)\b/.test(q) && !/\bchildhood\b/.test(q)) {
    const lines: string[] = [];
    if (children.length) {
      lines.push(`Recorded children (${children.length}): ${children.map((member) => `${member.fullName} (${member.relation})`).join(', ')}.`);
    }
    if (grandchildren.length) {
      lines.push(`Recorded grandchildren (${grandchildren.length}): ${grandchildren.map((member) => `${member.fullName} (${member.relation})`).join(', ')}.`);
    }
    if (lines.length) {
      return `${lines.join('\n\n')}\n\n[View the family page](/family)`;
    }
    const relations = Object.entries(countsByRelation)
      .map(([relation, count]) => `${count} listed as ${relation}`)
      .join('; ');
    return `An exact count of children or grandchildren is not recorded in the family list yet. The family page currently lists ${familyMembers.length} people${relations ? ` (${relations})` : ''}.\n\n[Read more](/legacy)`;
  }

  const asksHilary = /\bhilary|akem|about him|his life\b/.test(q);
  const asksMami = /\bmami|christiana|enanga|about her|her life\b/.test(q);
  if (asksHilary && hilary && !asksMami) return describeHonoree(hilary, ctx);
  if (asksMami && mami && !asksHilary) return describeHonoree(mami, ctx);
  if (/\bwho (was|is|were)\b|\btell me about\b|\bbiograph/.test(q)) {
    return honorees.map((honoree) => describeHonoree(honoree, ctx)).join('\n\n');
  }

  if (/\b(grow up|grew up|childhood|born|maiden)\b/.test(q)) {
    const birth = timelineEvents.find((event) => /sunrise|born/i.test(event.title));
    const parts = [
      childhood ? `**${childhood.heading}**\n${childhood.body}` : null,
      birth?.description,
      mami?.maidenName ? `Mami Christiana Enanga Besong’s maiden name was ${mami.maidenName}.` : null,
      '[Read more](/legacy)',
    ].filter(Boolean);
    if (parts.length > 1) return parts.join('\n\n');
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('reach')) {
    return 'Family contacts are listed by country on the Funeral page, including Cameroon, Germany, the USA, and Canada.\n\n[View family contacts](/funeral)';
  }
  if (q.includes('legacy') || q.includes('accomplish')) {
    const acc = biographySections.find((section) => section.kind === 'accomplishments');
    return acc ? `${acc.body}\n\n[Explore their legacy](/legacy)` : ctx.memorial.shortTribute ?? 'Two remarkable lives. [Learn more](/legacy)';
  }
  if (q.includes('donat') || q.includes('flowers')) {
    const cause = donationCauses[0];
    return cause ? `${cause.inLieuOfFlowersNote ?? cause.description}\n\n[Make a donation](/donations)` : 'Please see the donations page.';
  }
  if (q.includes('memory') || q.includes('tribute') || q.includes('condolence') || q.includes('share')) {
    return 'You can share a memory or condolence on the Tributes page. Choose whether your message is for Mami Christiana Enanga Besong or Hilary Akem Oben. Your message appears on the memorial as soon as you send it.\n\n[Share a memory](/tributes)';
  }

  const terms = q.split(/\s+/).filter((word) => word.length > 3);
  const knowledge = aiKnowledgeEntries.find((entry) => {
    const haystack = `${entry.question} ${entry.answer} ${(entry.tags ?? []).join(' ')}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
  if (knowledge) return knowledge.answer;

  const bioHit = biographySections.find((section) => {
    const haystack = `${section.heading} ${section.body} ${section.kind}`.toLowerCase();
    return terms.some((term) => haystack.includes(term));
  });
  if (bioHit) return `${bioHit.body}\n\n[Read more](/legacy)`;

  return ctx.aiSettings.fallbackMessage ?? "I'm sorry, I don't have that information. Please contact the family on the Funeral page.";
}
