import { useSearchParams } from 'react-router-dom';
import { useMemorial } from './useMemorial';

export function useSelectedHonoree() {
  const query = useMemorial();
  const [params, setParams] = useSearchParams();
  const slug = params.get('person');
  const honorees = query.data?.honorees ?? [];
  const selected = honorees.find((honoree) => honoree.slug === slug) ?? null;

  function selectPerson(next: string | null) {
    const updated = new URLSearchParams(params);
    if (next) updated.set('person', next);
    else updated.delete('person');
    setParams(updated, { replace: true });
  }

  return { ...query, honorees, selected, selectPerson };
}
