import { ref, watch } from "vue";

const STORAGE_KEY = "servicepulse.sideBarCollapsed";

function load(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

const collapsed = ref(load());

watch(collapsed, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // storage unavailable: the preference just doesn't persist
  }
});

export function useSideBarCollapsed() {
  return {
    collapsed,
    toggleCollapsed: () => (collapsed.value = !collapsed.value),
  };
}
