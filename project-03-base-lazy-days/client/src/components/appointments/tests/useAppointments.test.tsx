import { act, renderHook, waitFor } from "@testing-library/react";

import { useAppointments } from "../hooks/useAppointments";
import { createQueryClientWrapper } from "@/test-utils";
import { AppointmentDateMap } from "../types";


const getAppointmentCount = (appointments:AppointmentDateMap) => 
  Object.values(appointments).reduce((runningCount, appointmentsOnDate) => runningCount + appointmentsOnDate.length, 0);

test("filter appointments by availability", async () => {

  const { result } = renderHook(()=> useAppointments(), {
    wrapper: createQueryClientWrapper()
  });

  console.log(result);  //see console.log() 

  //wait for appointments to populate
  await waitFor(()=> 
    expect(getAppointmentCount(result.current.appointments)).toBeGreaterThan(0)
  );

  //appointments start out filted (show only available)
  const filteredAppointmentsLength = getAppointmentCount(
    result.current.appointments
  );

  //set to return all appointments -> the update happens realtime ie result.current is affected by setShowAll
  act(()=> result.current.setShowAll(true));

  //wait for count of appointments to be greater than when filtered
  expect(getAppointmentCount(result.current.appointments)).toBeGreaterThan(filteredAppointmentsLength)
});
