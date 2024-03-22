import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from "@testing-library/vue";

export default async function openGroupingOptions() {
    await userEvent.click(await screen.findByRole("link", { name: /no grouping/i }));
}