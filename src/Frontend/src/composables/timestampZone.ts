import { ref, watch } from "vue";

export type TimestampZone = "local" | "utc";

const STORAGE_KEY = "timestampZone";

function load(): TimestampZone {
  try {
    return localStorage.getItem(STORAGE_KEY) === "utc" ? "utc" : "local";
  } catch {
    return "local";
  }
}

// Module-level so every timestamp on screen flips together, and the choice
// survives navigation; persisted per browser
const zone = ref<TimestampZone>(load());

watch(zone, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable: the preference just doesn't persist
  }
});

export function useTimestampZone() {
  function toggle() {
    zone.value = zone.value === "local" ? "utc" : "local";
  }

  return { zone, toggle };
}
