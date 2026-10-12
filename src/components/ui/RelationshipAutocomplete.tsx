import { useEffect, useId, useRef, useState } from 'react';
import { filterRelationships } from '@/lib/relationships';

interface RelationshipAutocompleteProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

export function RelationshipAutocomplete({ id, value, onChange, onBlur }: RelationshipAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = filterRelationships(value);
  const activeOption = matches[activeIndex];

  useEffect(() => {
    setActiveIndex(0);
  }, [value]);

  useEffect(() => {
    if (!open || !activeOption) return;
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, activeOption, listId]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div ref={rootRef}>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeOption ? `${listId}-${activeIndex}` : undefined}
          className="input-field"
          placeholder="Niece, brother-in-law, friend…"
          autoComplete="off"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => Math.min(index + 1, Math.max(matches.length - 1, 0)));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === 'Enter' && open && activeOption) {
              event.preventDefault();
              choose(activeOption);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gold-200 bg-white py-1 shadow-lg"
        >
          {matches.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">No matches. Your wording will be saved as typed.</li>
          ) : (
            matches.map((option, index) => (
              <li key={option} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  className={`w-full px-4 py-2 text-left text-sm ${
                    index === activeIndex ? 'bg-memorial-50 text-memorial-900' : 'text-gray-700 hover:bg-memorial-50'
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  {option}
                </button>
              </li>
            ))
          )}
        </ul>
        )}
      </div>
      <p className="mt-1.5 text-xs text-gray-500">Choose a suggestion, or type your own relationship.</p>
    </div>
  );
}
