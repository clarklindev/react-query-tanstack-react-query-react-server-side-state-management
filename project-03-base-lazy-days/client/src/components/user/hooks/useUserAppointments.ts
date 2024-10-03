import type { Appointment } from "@shared/types";

import { useQuery } from "@tanstack/react-query";
import { axiosInstance, getJWTHeader } from "../../../axiosInstance";

import { useLoginData } from "@/auth/AuthContext";
import { queryKeys } from "@/react-query/constants";
import { generateAppointmentKey } from "@/react-query/key-factories";

// for when we need a query function for useQuery
async function getUserAppointments(
  userId: number,
  userToken: string
): Promise<Appointment[] | null> {
  const { data } = await axiosInstance.get(`/user/${userId}/appointments`, {
    headers: getJWTHeader(userToken),
  });
  return data.appointments;
}

export function useUserAppointments(): Appointment[] {
  const { userId, userToken } = useLoginData();

  const fallback: Appointment[] = [];

  const { data: userAppointments = fallback } = useQuery({
    enabled: !!userId,
    queryKey: generateAppointmentKey(userId, userToken), //must call like this because result of function call is a value
    queryFn: () => getUserAppointments(userId, userToken), //must call like this because its a function
  });
  return userAppointments;
}
