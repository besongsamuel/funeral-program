import type { FamilyMember, MemorialContext } from './types';

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

export function answerFromContext(question: string, ctx: MemorialContext): string {
  const q = question.toLowerCase();
  const { memorial, funeralEvents, biographySections, donationCauses, aiKnowledgeEntries, familyMembers, timelineEvents } =
    ctx;
  const childhood = biographySections.find((section) => section.kind === 'childhood');
  const { children, grandchildren, countsByRelation } = familyByKind(familyMembers);

  const wantsFuneral =
    !/\b(grow|grew|childhood|born)\b/.test(q) &&
    (q.includes('service') || q.includes('funeral') || q.includes('when') || q.includes('where') || q.includes('programme') || q.includes('program'));

  if (wantsFuneral) {
    const service = funeralEvents.find((event) => event.kind === 'service');
    if (service) {
      const when = service.timeLabel
        ? `${new Date(service.startsAt).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} at ${service.timeLabel}`
        : new Date(service.startsAt).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
      return `The Funeral and Thanksgiving Programme runs from 7 to 19 November 2026.\n\nThe funeral service will be held at **${service.venueName}** on ${when}.\n\nAddress: ${service.address ?? 'See funeral page for details'}\n\nBurial follows at the family compound in Limbola. [View the full programme](/funeral)`;
    }
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
    return `An exact count of children or grandchildren is not recorded in the family list yet. The family page currently lists ${familyMembers.length} people${relations ? ` (${relations})` : ''}.\n\nThe biography remembers her as a beloved mother and grandmother. [Read more](/legacy)`;
  }

  if (/\bwho (was|is)\b|\btell me about\b|\babout her\b|\bher life\b|\bbiograph/.test(q)) {
    const sections = biographySections
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((section) => `**${section.heading}**\n${section.body}`)
      .join('\n\n');
    const obituary = stripHtml(memorial.obituaryHtml);
    return [`${memorial.fullName}${memorial.maidenName ? `, née ${memorial.maidenName}` : ''}, sunrise ${memorial.bornOn}, sunset ${memorial.diedOn}.`, memorial.shortTribute, sections, obituary, '[Read her full story](/legacy)']
      .filter(Boolean)
      .join('\n\n');
  }

  if (/\b(grow up|grew up|childhood|born|maiden)\b/.test(q)) {
    const birth = timelineEvents.find((event) => /sunrise|born/i.test(event.title));
    const parts = [
      childhood ? `**${childhood.heading}**\n${childhood.body}` : null,
      birth?.description,
      memorial.maidenName ? `Her maiden name was ${memorial.maidenName}.` : null,
      '[Read more about her life](/legacy)',
    ].filter(Boolean);
    if (parts.length > 1) return parts.join('\n\n');
  }

  if (q.includes('contact') || q.includes('phone') || q.includes('reach')) {
    return 'Family contacts are listed by country on the Funeral page, including Cameroon, Germany, the USA, and Canada.\n\n[View family contacts](/funeral)';
  }
  if (q.includes('legacy') || q.includes('accomplish')) {
    const acc = biographySections.find((section) => section.kind === 'accomplishments');
    return acc ? `${acc.body}\n\n[Explore her legacy](/legacy)` : memorial.shortTribute ?? 'A remarkable life. [Learn more](/legacy)';
  }
  if (q.includes('donat') || q.includes('flowers')) {
    const cause = donationCauses[0];
    return cause ? `${cause.inLieuOfFlowersNote ?? cause.description}\n\n[Make a donation](/donations)` : 'Please see the donations page.';
  }
  if (q.includes('memory') || q.includes('tribute') || q.includes('condolence') || q.includes('share')) {
    return 'You can share a memory or condolence on the Tributes page. Your message will be reviewed by the family before appearing publicly.\n\n[Share a memory](/tributes)';
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
  if (bioHit) return `${bioHit.body}\n\n[Read more about her life](/legacy)`;

  return ctx.aiSettings.fallbackMessage ?? "I'm sorry, I don't have that information. Please contact the family on the Funeral page.";
}
