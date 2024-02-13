<script setup>
import { computed, ref } from "vue";
import { useFormatLargeNumber, useFormatTime } from "../../composables/formatter";
import { useGraph } from "./graphLines";
const props = defineProps({
  plotdata: Object,
  minimumyaxis: Number,
  avglabelcolor: String,
  isdurationgraph: Boolean,
  metricsuffix: String,
  endpointname: String,
  type: String,
});

const hover = ref(false);

const { valuesPath, valuesArea, maxYaxis, average, averageLine } = useGraph(
  () => props.plotdata,
  () => props.minimumyaxis
);

const averageLabelValue = computed(() => {
  return props.isdurationgraph ? useFormatTime(average.value).value : useFormatLargeNumber(average.value, 2);
});
const averageLabelSuffix = computed(() => (props.isdurationgraph ? useFormatTime(average.value).unit.toUpperCase() : props.metricsuffix ?? ""));
//38 is 50 (height of parent) - 6 - 6 for padding.
//To get it exact without hard coding a height value, we would need to perform measurement on the rendered SVG element, which we want to avoid
const averageLabelPosition = computed(() => `calc(${(average.value / maxYaxis.value) * 38}px - 1em)`);
</script>

<template>
  <div class="graph pull-left ng-isolate-scope" :class="[type, hover ? 'hover' : '']" @mouseover="hover = true" @mouseout="hover = false">
    <div class="padding">
      <svg :viewBox="`0 0 100 ${maxYaxis}`" preserveAspectRatio="none">
        <path :d="valuesArea" class="graph-data-fill" />
        <path :d="valuesPath" vector-effect="non-scaling-stroke" class="graph-data-line" />
        <path :d="averageLine" vector-effect="non-scaling-stroke" class="graph-avg-line" />
      </svg>
    </div>
    <div class="avg-tooltip" :style="{ '--avg-tooltip-background-color': avglabelcolor, bottom: averageLabelPosition }">
      <div>AVG</div>
      <div class="value">
        {{ averageLabelValue }} <span>{{ averageLabelSuffix }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph {
  position: relative;
}

.padding {
  padding: 6px 2px;
  height: 50px;
  display: flex;
  flex-direction: column;
  background-color: #f2f6f7;
}

svg {
  transform: scaleY(-1);
}

.graph .avg-tooltip {
  position: absolute;
  z-index: 10;
  right: calc(100% + 1.3em);
  display: none;
}

.graph.hover .avg-tooltip {
  display: block;
}
</style>
