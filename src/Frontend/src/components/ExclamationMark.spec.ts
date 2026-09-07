import { render } from "@component-test-utils";
import { describe, expect, test } from "vitest";
import ExclamationMark from "@/components/ExclamationMark.vue";
import { WarningLevel } from "@/components/WarningLevel";

describe("ExclamationMark", () => {
  test("updates icon class when the warning level changes", async () => {
    const { container, rerender } = render(ExclamationMark, {
      props: {
        type: WarningLevel.Info,
      },
    });

    expect(container.querySelector(".info")).not.toBeNull();

    await rerender({
      type: WarningLevel.Warning,
    });

    expect(container.querySelector(".warning")).not.toBeNull();
    expect(container.querySelector(".info")).toBeNull();
  });
});
