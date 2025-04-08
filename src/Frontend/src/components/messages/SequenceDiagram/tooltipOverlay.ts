import { useSequenceDiagramStore } from "@/stores/SequenceDiagramStore";
import { storeToRefs } from "pinia";
import { h, watch } from "vue";
import { useTippy } from "vue-tippy";
import EndpointTooltip from "./EndpointTooltip.vue";
import HandlerTooltip from "./HandlerTooltip.vue";

export default function useTooltips() {
  const store = useSequenceDiagramStore();
  const { endpoints, handlers } = storeToRefs(store);

  watch(
    () => endpoints.value.map((endpoint) => endpoint.uiRef),
    () =>
      endpoints.value
        .filter((endpoint) => endpoint.uiRef)
        .forEach((endpoint) =>
          useTippy(endpoint.uiRef, {
            interactive: true,
            appendTo: () => document.body,
            content: h(EndpointTooltip, { endpoint }),
            placement: "bottom",
            delay: [800, null],
          })
        )
  );

  watch(
    () => handlers.value.map((handler) => handler.uiRef),
    () =>
      handlers.value
        .filter((handler) => handler.uiRef)
        .forEach((handler) =>
          useTippy(handler.uiRef, {
            interactive: true,
            appendTo: () => document.body,
            content: h(HandlerTooltip, { handler }),
            delay: [800, null],
          })
        )
  );
}
