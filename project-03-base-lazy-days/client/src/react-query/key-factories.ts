import { queryKeys } from "./constants";

export const generateUserKey = (userId: number, userToken: string) => {
  //deliberately delete `userToken` from dependency
  return [queryKeys.user, userId];
};

export const generateAppointmentKey = (userId: number, userToken: string) => {
  return [queryKeys.appointments, queryKeys.user, userId, userToken];
};
