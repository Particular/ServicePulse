<script setup>
import { computed, ref } from "vue";
import { useFormatLargeNumber, useFormatTime } from "../../composables/formatter";
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

const plotData = computed(() => props.plotdata ?? { points: [], average: 0 });
const values = computed(() => {
  let result = plotData.value.points;
  if (result.length === 0) {
    result = new Array(10).fill(0);
  }
  return result;
});
const xTick = computed(() => 100 / (values.value.length - 1));
const coordinates = computed(() => values.value.reduce((points, yValue, i) => [...points, [i * xTick.value, yValue]], []));
const valuesPath = computed(() => `${coordinates.value.map((c, i) => (i ? `L${c[0]} ${c[1]}` : `M${c[0]} ${c[1]}`)).join(" ")}`);
const valuesArea = computed(() => `M0 0 ${coordinates.value.map((c) => `L${c[0]} ${c[1]}`).join(" ")} L${100} 0 Z`);

const average = computed(() => plotData.value.average);
//TODO: why is this called minimumYaxis when it's only used to determine the maxYaxis?
const minimumYaxis = computed(() => (!isNaN(props.minimumyaxis) ? Number(props.minimumyaxis) : 10));
const maxYaxis = computed(() => Math.max(...[...values.value, average.value * 1.5, minimumYaxis.value]));

const averageLine = computed(() => `M0 ${average.value} L100 ${average.value}`);
const averageLabelValue = computed(() => {
  return props.isdurationgraph ? useFormatTime(average.value).value : useFormatLargeNumber(average.value, 2);
});
const averageLabelSuffix = computed(() => (props.isdurationgraph ? useFormatTime(average.value).unit.toUpperCase() : props.metricsuffix ?? ""));
//38 is an arbitrary 'tested' number that ends up with the label in approximately the correct position.
//To get it exact, we would need to perform measurement on the rendered element, which we want to avoid since this is close enough
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
