import { useLink, useRoute } from "vue-router";

export default function isRouteSelected(path: string) {
  const route = useRoute();

  if (route.path === path) {
    return true;
  }

  if (`${path}/` === route.path) {
    return true;
  }

  return useLink({ to: path }).route.value.name === route.name;
}
