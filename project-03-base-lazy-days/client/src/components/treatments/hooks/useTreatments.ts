import type { Treatment } from "@shared/types";
import { axiosInstance } from "@/axiosInstance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/react-query/constants";

// for when we need a query function for useQuery
async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}

//'data' is destructured prop of the return object from calling useQuery
//fallback is the default return data
export function useTreatments(): Treatment[] {
  const fallback:Treatment[] = [];

  const {data = fallback} = useQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments
  })

  return data;
}

export function usePrefetchTreatments(): void {
  const queryClient = useQueryClient();
  queryClient.prefetchQuery({
    queryKey: [queryKeys.treatments],
    queryFn: getTreatments,
  });
}