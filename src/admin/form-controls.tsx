import { useEffect, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { isDraftId } from '@/lib/admin-api';

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-field ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`input-field ${props.className ?? ''}`} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`input-field ${props.className ?? ''}`} />;
}

export function toDateTimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 16);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocal(value: string) {
  if (!value) return '';
  return new Date(value).toISOString();
}

export function SaveBar({
  onDelete,
  saving,
  message,
  isNew,
}: {
  onDelete?: () => void;
  saving: boolean;
  message: string;
  isNew?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      <button type="submit" className="btn-primary text-xs" disabled={saving}>
        {saving ? 'Saving…' : isNew ? 'Add record' : 'Save'}
      </button>
      {onDelete && (
        <button type="button" onClick={onDelete} className="btn-ghost text-xs text-red-600" disabled={saving}>
          {isNew ? 'Cancel' : 'Delete'}
        </button>
      )}
      {message && <span className="text-xs text-gray-600">{message}</span>}
    </div>
  );
}

export function useRecordForm<T extends { id?: string }>(record: T) {
  const [draft, setDraft] = useState(record);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const recordId = record.id;

  useEffect(() => {
    setDraft(record);
    // Keep the open form when parent re-renders with the same record id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  const set = (key: keyof T, value: unknown) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent, save: (values: T) => Promise<void>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await save(draft);
      setMessage('Saved');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (destroy: () => Promise<void>) => {
    if (!isDraftId(record.id) && !confirm('Delete this record?')) return;
    setSaving(true);
    setMessage('');
    try {
      await destroy();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed');
      setSaving(false);
    }
  };

  return { draft, set, saving, message, submit, remove };
}
