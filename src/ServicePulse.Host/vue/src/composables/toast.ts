import ToastPopup from "../components/ToastPopup.vue";
import { useToast } from "vue-toastification";
import type { ToastOptions } from "vue-toastification/dist/types/types";
import { TYPE } from "vue-toastification/src/ts/constants";

export function useShowToast(type: TYPE, title: string, message: string, doNotUseTimeout: boolean = false) {
  const toast = useToast();
  const content = {
    // Your component or JSX template
    component: ToastPopup,

    // Props are just regular props, but these won't be reactive
    props: {
      type: type,
      title: title,
      message: message,
    },
  };

  const options: ToastOptions = {
    type: type,
  };

  if (doNotUseTimeout) {
    options.timeout = false;
  }

  toast(content, options);
}
