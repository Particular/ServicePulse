import { screen } from "@testing-library/vue";

export default async function numberOfGroupingOptions() {
    return (await screen.findAllByRole("link", { name: /max\..*segments/i })).length;
}