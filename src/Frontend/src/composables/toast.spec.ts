import { describe, expect, test, vi } from "vitest";
import { TYPE } from "vue-toastification";
import ToastPopup from "@/components/ToastPopup.vue";
import { useShowToast } from "./toast";

const toast = vi.hoisted(() => {
  vi.resetModules();
  return vi.fn();
});

vi.mock("vue-toastification", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-toastification")>()),
  useToast: () => toast,
}));

describe("useShowToast", () => {
  test("wraps string messages in the existing popup with the default timeout", () => {
    useShowToast(TYPE.SUCCESS, "Success", "Operation completed");

    expect(toast).toHaveBeenCalledWith({ component: ToastPopup, props: { type: TYPE.SUCCESS, title: "Success", message: "Operation completed" } }, { timeout: undefined, type: TYPE.SUCCESS });
  });

  test("forwards component content and disables the timeout when requested", () => {
    const content = { component: ToastPopup, props: { title: "Warning" }, listeners: { close: vi.fn() } };

    useShowToast(TYPE.WARNING, "", content, true);

    expect(toast).toHaveBeenCalledWith(content, { timeout: false, type: TYPE.WARNING });
    expect(toast.mock.calls[0]?.[0]).toBe(content);
  });

  test("preserves persistent string messages and explicit option overrides", () => {
    useShowToast(TYPE.ERROR, "Error", "Failed", true);
    expect(toast).toHaveBeenLastCalledWith(expect.anything(), { timeout: false, type: TYPE.ERROR });

    useShowToast(TYPE.WARNING, "", { component: ToastPopup }, true, { timeout: 5000, type: TYPE.INFO, id: "notification" });
    expect(toast).toHaveBeenLastCalledWith(expect.anything(), { timeout: 5000, type: TYPE.INFO, id: "notification" });
  });
});
