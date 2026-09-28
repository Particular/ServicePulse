import { screen } from "@testing-library/vue";
import UserEvent from "@testing-library/user-event";

export async function selectFailedMessageGroup(groupName: string) {
  const group = await screen.findByText(groupName, { selector: ".failed-message-group p.lead" });
  await UserEvent.click(group);
}
