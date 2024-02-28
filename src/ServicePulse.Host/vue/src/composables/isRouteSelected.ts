import { useLink, useRoute } from "vue-router";

export default function isRouteSelected(path: string) {
  const route = useRoute();

  if (route.path === path) {
    return true;
  }

  if (`${path}/` === route.path) {
    return true;
  }

  const pathRoute = useLink({ to: path }).route.value;
  return route.matched.some((match) => match.name === pathRoute.name);
}
