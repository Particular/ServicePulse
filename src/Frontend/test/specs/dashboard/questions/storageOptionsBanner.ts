import { screen, within } from "@testing-library/vue";

const bannerTitle = "ServiceControl supports new storage options";

export function storageOptionsBanner(): HTMLElement | null {
  return screen.queryByText(bannerTitle)?.closest<HTMLElement>(".capability-banner") ?? null;
}

export function storageOptionsBannerDescription(banner: HTMLElement): string {
  return banner.querySelector(".banner-text p")?.textContent ?? "";
}

export function storageOptionsLink(banner: HTMLElement): HTMLAnchorElement {
  return within(banner).getByRole<HTMLAnchorElement>("link", { name: "See storage options" });
}

export function storageOptionsDismissButton(banner: HTMLElement): HTMLButtonElement {
  return within(banner).getByRole<HTMLButtonElement>("button", { name: "Dismiss" });
}
