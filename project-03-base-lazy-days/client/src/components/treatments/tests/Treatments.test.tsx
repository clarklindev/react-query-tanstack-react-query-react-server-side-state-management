// import { render, screen } from "@testing-library/react"; //removed for custom render (see below)
import {render, screen} from '@/test-utils';

import { Treatments } from "../Treatments";

test("renders response from query", () => {
  // write test here
  render(<Treatments/>)
});
