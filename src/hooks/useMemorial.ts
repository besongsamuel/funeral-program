import { useQuery } from '@tanstack/react-query';
import { getMemorialContext } from '@/lib/data-service';
import { demoContext } from '@/lib/demo-data';

export function useMemorial() {
  return useQuery({
    queryKey: ['memorial'],
    queryFn: () => getMemorialContext(),
    staleTime: 60_000,
    placeholderData: demoContext,
  });
}
