import { render, screen } from "@component-test-utils";
import { createTestingPinia } from "@pinia/testing";
import { describe, expect, test } from "vitest";
import PageFooter from "@/components/PageFooter.vue";
import { useLicenseStore } from "@/stores/LicenseStore";

const RouterLinkStub = {
  props: ["to"],
  template: '<a :href="typeof to === `string` ? to : to?.link ?? ``"><slot /></a>',
};

describe("PageFooter", () => {
  test("shows the trial license bar for a trial license", () => {
    renderFooter(true);

    expect(screen.getByRole("status", { name: /trial license bar information/i })).toBeInTheDocument();
  });

  test("shows nothing for a non-trial license", () => {
    renderFooter(false);

    expect(screen.queryByRole("status", { name: /trial license bar information/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });
});

function renderFooter(isTrialLicense: boolean) {
  const pinia = createTestingPinia({ stubActions: false });
  const licenseStore = useLicenseStore(pinia);
  licenseStore.license.license_status = "valid" as never;
  licenseStore.licenseStatus.isTrialLicense = isTrialLicense;

  return render(PageFooter, {
    global: {
      plugins: [pinia],
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });
}
