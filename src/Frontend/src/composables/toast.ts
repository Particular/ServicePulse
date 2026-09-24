import ToastPopup from "@/components/ToastPopup.vue";
import { TYPE, useToast } from "vue-toastification";
import type { ToastComponent, ToastOptions } from "vue-toastification/dist/types/types";

export function useShowToast(type: TYPE, title: string, message: string | ToastComponent, doNotUseTimeout: boolean = false, options?: ToastOptions) {
  const toast = useToast();
  const content =
    typeof message === "string"
      ? {
          component: ToastPopup,
          props: {
            type: type,
            title: title,
            message: message,
          },
        }
      : message;
  toast(content, {
    timeout: doNotUseTimeout ? false : undefined,
    type: type,
    ...options,
  });
}

export const showToastAfterOperation = async (operation: () => Promise<void>, toastType: TYPE, title: string, message: string) => {
  await operation();
  useShowToast(toastType, title, message);
};
