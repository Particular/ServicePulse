import { render } from "@testing-library/vue";
import { describe, test, expect } from "vitest";
import PermissionGate from "@/components/PermissionGate.vue";

function mountGate(allowed: boolean) {
  return render(PermissionGate, {
    props: { allowed, reason: "You don't have permission" },
    slots: { default: '<button class="btn">Do it</button>' },
  });
}

describe("PermissionGate", () => {
  test("renders the slot and marks the wrapper denied when not allowed", () => {
    const { container, getByText } = mountGate(false);
    expect(getByText("Do it")).toBeTruthy();
    expect(container.querySelector(".permission-gate.denied")).not.toBeNull();
  });

  test("does not mark the wrapper denied when allowed", () => {
    const { container } = mountGate(true);
    expect(container.querySelector(".permission-gate")).not.toBeNull();
    expect(container.querySelector(".permission-gate.denied")).toBeNull();
  });
});
