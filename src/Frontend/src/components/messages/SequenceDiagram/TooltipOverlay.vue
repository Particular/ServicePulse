<script setup lang="ts">
import { useSequenceDiagramStore } from "@/stores/SequenceDiagramStore";
import { storeToRefs } from "pinia";
import { h, watch } from "vue";
import { useTippy } from "vue-tippy";
import EndpointTooltip from "./EndpointTooltip.vue";

const store = useSequenceDiagramStore();
const { endpoints } = storeToRefs(store);

watch(endpoints, (endpoints) =>
  endpoints
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
</script>
