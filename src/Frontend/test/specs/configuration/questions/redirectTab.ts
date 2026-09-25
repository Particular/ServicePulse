import { screen } from "@testing-library/vue";

export async function getRedirectTab(): Promise<HTMLElement> {
  const tab = await screen.findByRole("tab", { name: /retry-redirects/i });
  return tab as HTMLElement;
}

export async function getRedirectTabCount(): Promise<number> {
  const tab = await getRedirectTab();
  const match = tab.textContent?.match(/Retry Redirects \((\d+)\)/i);
  return match ? Number(match[1]) : NaN;
}
