import ToastPopup from "../components/ToastPopup.vue";
import { useToast } from "vue-toastification";

export function useShowToast(type, title, message, doNotUseTimeout) {
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

  const options = {
    type: type
  }

  if (doNotUseTimeout) {
    options.timeout = false
  }

  toast(content, options);
}
