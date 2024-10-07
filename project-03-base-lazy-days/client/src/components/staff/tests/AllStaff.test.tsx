//src/components/staff/tests/AllStaff.test.tsx
import { AllStaff } from "../AllStaff";

import { http, HttpResponse } from "msw";
import { render, screen } from "@/test-utils";
import { server } from '@/mocks/server';

test("renders response from query", async () => {
  render(<AllStaff/>);

  // (re)set handler to return a 500 error for staff and treatments
  server.use(
    http.get("http://localhost:3030/staff", () => {
      return new HttpResponse(null, { status: 500 });
    }),
    http.get("http://localhost:3030/treatments", () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const staffTitles = await screen.findAllByRole('heading', {
    name: /sandra|divya|mateo|michael/i
  });
  expect(staffTitles).toHaveLength(4);
});