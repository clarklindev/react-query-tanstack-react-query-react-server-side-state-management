// import { render, screen } from "@testing-library/react"; //removed for custom render (see below)
import {render, screen} from '@/test-utils';

import { Treatments } from "../Treatments";

test("renders response from query", async () => {
  // write test here
  render(<Treatments/>);
  const treatmentTitles = await screen.findAllByRole("heading", {
    name: /massage|facial|scrub/i,
  });

  expect(treatmentTitles).toHaveLength(3);  
});
