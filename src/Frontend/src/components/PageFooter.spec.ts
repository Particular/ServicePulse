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
  test("shows the trial license notice for a trial license", () => {
    renderFooter({ isTrialLicense: true });

    expect(screen.getByRole("status", { name: /trial license bar information/i })).toHaveTextContent(/non-production use only/i);
  });

  test("renders nothing for a non-trial license", () => {
    const { container } = renderFooter({ isTrialLicense: false });

    expect(container.querySelector("footer")).toBeNull();
  });
});

function renderFooter({ isTrialLicense }: { isTrialLicense: boolean }) {
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
