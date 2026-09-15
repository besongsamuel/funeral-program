import { Fragment, type ReactNode } from 'react';

/** WhatsApp-style markers: *bold* and _italic_ */
const INLINE_RE = /(\*[^*\n]+?\*|_[^_\n]+?_)/g;

function parseInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      return (
        <strong key={key} className="font-semibold text-memorial-900">
          {part.slice(1, -1)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith('_') && part.endsWith('_')) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

interface FormattedTextProps {
  text: string;
  className?: string;
}

/** Renders plain tribute/story text with *bold*, _italic_, and line breaks. */
export function FormattedText({ text, className }: FormattedTextProps) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return null;

  const paragraphs = normalized.split(/\n{2,}/);

  return (
    <div className={className}>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n');
        return (
          <p key={pi} className={pi > 0 ? 'mt-3' : undefined}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 ? <br /> : null}
                {parseInline(line, `${pi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
