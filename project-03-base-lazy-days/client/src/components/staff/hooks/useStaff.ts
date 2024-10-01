import { useState, useCallback } from "react";
import { useQuery} from '@tanstack/react-query';

import type { Staff } from "@shared/types";

import { filterByTreatment } from "../utils";

import { axiosInstance } from "@/axiosInstance";
import { queryKeys } from "@/react-query/constants";

// query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

export function useStaff() {
  // for filtering staff by treatment
  const [filter, setFilter] = useState("all");

  const filterFunction = useCallback(
    (unfilteredStaff:Staff[]) => {
      if(filter === 'all'){
        return unfilteredStaff;
      }
      return filterByTreatment(unfilteredStaff, filter)
  }, [filter]); //when filter changes...this function will re-run

  // TODO: get data from server via useQuery
  const fallback: Staff[] = [];

  const {data:staff = fallback} = useQuery({
    queryKey: [queryKeys.staff],
    queryFn: getStaff,
    select: filterFunction
  })

  return { staff, filter, setFilter };
}
