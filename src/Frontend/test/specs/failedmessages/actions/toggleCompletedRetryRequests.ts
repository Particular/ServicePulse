import userEvent from "@testing-library/user-event";
import { completedRetryRequestsHeading } from "../questions/completedRetryRequests";

export async function toggleCompletedRetryRequests(): Promise<void> {
  await userEvent.click(completedRetryRequestsHeading());
}
