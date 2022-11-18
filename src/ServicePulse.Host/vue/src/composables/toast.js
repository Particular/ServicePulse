import ToastView from "../components/Toast.vue"
import { useToast } from "vue-toastification";

export function useShowToast(type, title, message) {
  const toast = useToast()
  const content = {
    // Your component or JSX template
    component: ToastView,

    // Props are just regular props, but these won't be reactive
    props: {
        type: type,
        title: title,
        message: message
    },        
  };

  toast(content, {type: type})
}
