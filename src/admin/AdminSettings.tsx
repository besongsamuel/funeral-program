import { useState } from 'react';
import { adminRemove, adminSave, isDraftId, newDraftId } from '@/lib/admin-api';
import type { AiKnowledgeEntry, AiQuickQuestion, AiSettings, Memorial } from '@/lib/types';
import { Field, SaveBar, TextArea, TextInput, useRecordForm } from './form-controls';

export function AdminProfile({ memorial, onChanged }: { memorial: Memorial; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(memorial);
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-2xl font-semibold">Profile & Theme</h2>
      <form className="card space-y-4" onSubmit={(event) => form.submit(event, async (values) => {
        await adminSave('Memorial', values);
        await onChanged();
      })}>
        <Field label="Full name">
          <TextInput value={form.draft.fullName} onChange={(e) => form.set('fullName', e.target.value)} required />
        </Field>
        <Field label="Maiden name">
          <TextInput value={form.draft.maidenName ?? ''} onChange={(e) => form.set('maidenName', e.target.value)} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sunrise">
            <TextInput type="date" value={form.draft.bornOn} onChange={(e) => form.set('bornOn', e.target.value)} required />
          </Field>
          <Field label="Sunset">
            <TextInput type="date" value={form.draft.diedOn} onChange={(e) => form.set('diedOn', e.target.value)} required />
          </Field>
        </div>
        <Field label="Tagline">
          <TextInput value={form.draft.tagline ?? ''} onChange={(e) => form.set('tagline', e.target.value)} />
        </Field>
        <Field label="Short tribute">
          <TextArea rows={4} value={form.draft.shortTribute ?? ''} onChange={(e) => form.set('shortTribute', e.target.value)} />
        </Field>
        <Field label="Obituary HTML">
          <TextArea rows={6} value={form.draft.obituaryHtml ?? ''} onChange={(e) => form.set('obituaryHtml', e.target.value)} />
        </Field>
        <Field label="Portrait URL">
          <TextInput value={form.draft.portraitUrl ?? ''} onChange={(e) => form.set('portraitUrl', e.target.value)} />
        </Field>
        <Field label="Programme image / PDF URL">
          <TextInput value={form.draft.programPdfUrl ?? ''} onChange={(e) => form.set('programPdfUrl', e.target.value)} />
        </Field>
        <SaveBar saving={form.saving} message={form.message} />
      </form>
    </div>
  );
}

export function AdminAi({
  settings,
  questions,
  knowledge,
  memorialId,
  onChanged,
}: {
  settings: AiSettings;
  questions: AiQuickQuestion[];
  knowledge: AiKnowledgeEntry[];
  memorialId: string;
  onChanged: () => Promise<void> | void;
}) {
  const [questionDrafts, setQuestionDrafts] = useState<AiQuickQuestion[]>([]);
  const [knowledgeDrafts, setKnowledgeDrafts] = useState<AiKnowledgeEntry[]>([]);
  const form = useRecordForm(settings);

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-serif text-2xl font-semibold">AI Assistant</h2>
      <form className="card space-y-4" onSubmit={(event) => form.submit(event, async (values) => {
        await adminSave('AiSettings', values);
        await onChanged();
      })}>
        <Field label="Assistant name">
          <TextInput value={form.draft.assistantName} onChange={(e) => form.set('assistantName', e.target.value)} />
        </Field>
        <Field label="Greeting">
          <TextArea rows={3} value={form.draft.greeting ?? ''} onChange={(e) => form.set('greeting', e.target.value)} />
        </Field>
        <Field label="Persona / tone">
          <TextArea rows={3} value={form.draft.persona ?? ''} onChange={(e) => form.set('persona', e.target.value)} />
        </Field>
        <Field label="Fallback message">
          <TextArea rows={2} value={form.draft.fallbackMessage ?? ''} onChange={(e) => form.set('fallbackMessage', e.target.value)} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.draft.isEnabled}
            onChange={(e) => form.set('isEnabled', e.target.checked)}
          />
          Assistant enabled
        </label>
        <SaveBar saving={form.saving} message={form.message} />
      </form>

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">Quick questions</h3>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() =>
            setQuestionDrafts((items) => [
              ...items,
              {
                id: newDraftId(),
                memorialId,
                label: '',
                questionText: '',
                sortOrder: questions.length + items.length + 1,
              },
            ])
          }
        >
          Add question
        </button>
      </div>
      {[...questions, ...questionDrafts].map((item) => (
        <QuestionForm
          key={item.id}
          item={item}
          onChanged={() => {
            setQuestionDrafts((rows) => rows.filter((row) => row.id !== item.id));
            return onChanged();
          }}
        />
      ))}

      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">Custom knowledge</h3>
        <button
          type="button"
          className="btn-secondary text-xs"
          onClick={() =>
            setKnowledgeDrafts((items) => [
              ...items,
              { id: newDraftId(), memorialId, question: '', answer: '', tags: [] },
            ])
          }
        >
          Add knowledge
        </button>
      </div>
      {[...knowledge, ...knowledgeDrafts].map((item) => (
        <KnowledgeForm
          key={item.id}
          item={item}
          onChanged={() => {
            setKnowledgeDrafts((rows) => rows.filter((row) => row.id !== item.id));
            return onChanged();
          }}
        />
      ))}
    </div>
  );
}

function QuestionForm({ item, onChanged }: { item: AiQuickQuestion; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm(item);
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      await adminSave('AiQuickQuestion', values);
      await onChanged();
    })}>
      <Field label="Button label">
        <TextInput value={form.draft.label} onChange={(e) => form.set('label', e.target.value)} required />
      </Field>
      <Field label="Question sent to the assistant">
        <TextInput value={form.draft.questionText} onChange={(e) => form.set('questionText', e.target.value)} required />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('AiQuickQuestion', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}

function KnowledgeForm({ item, onChanged }: { item: AiKnowledgeEntry; onChanged: () => Promise<void> | void }) {
  const form = useRecordForm({
    ...item,
    tagsText: (item.tags ?? []).join(', '),
  });
  return (
    <form className="card space-y-3" onSubmit={(event) => form.submit(event, async (values) => {
      const tags = String(values.tagsText ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const { tagsText: _tagsText, ...rest } = values;
      await adminSave('AiKnowledgeEntry', { ...rest, tags });
      await onChanged();
    })}>
      <Field label="Question">
        <TextInput value={form.draft.question} onChange={(e) => form.set('question', e.target.value)} required />
      </Field>
      <Field label="Answer">
        <TextArea rows={3} value={form.draft.answer} onChange={(e) => form.set('answer', e.target.value)} required />
      </Field>
      <Field label="Tags (comma separated)">
        <TextInput value={form.draft.tagsText} onChange={(e) => form.set('tagsText', e.target.value)} />
      </Field>
      <SaveBar
        saving={form.saving}
        message={form.message}
        isNew={isDraftId(item.id)}
        onDelete={() => form.remove(async () => {
          await adminRemove('AiKnowledgeEntry', item.id);
          await onChanged();
        })}
      />
    </form>
  );
}
