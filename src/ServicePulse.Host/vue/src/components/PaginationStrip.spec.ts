import { expect, it, render, screen } from "@component-test-utils";
import paginationStrip from "./PaginationStrip.vue";


it("Disables navigating to previous page while on first page", async () => {
  render(paginationStrip, {
    props: {
      modelValue: 1,
      itemsPerPage: 0,
      totalCount: 100,
      pageBuffer: 0,
    },
  });    
  
  expect(screen.queryByLabelText("Previous")).toBeDisabled();    
});

it("Enables navigating to previous page while not on first page", async () => {
  render(paginationStrip, {
    props: {
      modelValue: 2,
      itemsPerPage: 0,
      totalCount: 100,
      pageBuffer: 0,
    },
  });    
  
  expect(screen.queryByLabelText("Previous")).not.toBeDisabled();    
});
