import type { Story, Tribute } from './types';

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((row) => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportSubmissionsCsv(
  tributes: Tribute[],
  stories: Story[],
  memorialSlug?: string,
  honoreeNames: Record<string, string> = {},
) {
  const headers = [
    'type',
    'honoree',
    'status',
    'authorName',
    'relationship',
    'title',
    'content',
    'id',
    'createdAt',
  ];

  const nameFor = (honoreeId?: string) => (honoreeId && honoreeNames[honoreeId]) || honoreeId || '';

  const tributeRows = tributes.map((t) => [
    t.isGuestbookSignature ? 'guestbook' : 'tribute',
    nameFor(t.honoreeId),
    t.status,
    t.authorName,
    t.relationship ?? '',
    '',
    t.message,
    t.id,
    t.createdAt ?? '',
  ]);

  const storyRows = stories.map((s) => [
    'story',
    nameFor(s.honoreeId),
    s.status,
    s.authorName,
    '',
    s.title,
    s.body,
    s.id,
    '',
  ]);

  const stamp = new Date().toISOString().slice(0, 10);
  const slug = memorialSlug ? `${memorialSlug}-` : '';
  downloadCsv(`${slug}tributes-guestbook-stories-${stamp}.csv`, [headers, ...tributeRows, ...storyRows]);
}
