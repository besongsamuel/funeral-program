import { useQuery } from '@tanstack/react-query';
import { getMemorialContext } from '@/lib/data-service';

export function useMemorial() {
  return useQuery({
    queryKey: ['memorial'],
    queryFn: () => getMemorialContext(),
    staleTime: 60_000,
  });
}
