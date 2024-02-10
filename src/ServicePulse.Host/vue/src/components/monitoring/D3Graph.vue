<script setup>
import { ref, onMounted, onBeforeUnmount, watchEffect } from "vue";
import * as d3 from "d3";
import { useFormatTime, useFormatLargeNumber } from "@/composables/formatter";
import { getArrowLabel } from "@/composables/graphLabel";
const props = defineProps({
  plotdata: Object,
  minimumyaxis: Number,
  avglabelcolor: String,
  isdurationgraph: Boolean,
  metricsuffix: String,
  endpointname: String,
  type: String,
});
const averageDecimalsDefault = 2;
const avgLabelColorDefault = "#2700CB";
const avgLabelSuffixDefault = "";
const root = ref(null);
const averageLabelToTheRight = getArrowLabel(false, "AVG");

watchEffect(displayGraphValues, { flush: "post" });

function displayGraphValues() {
  const svg = root.value.getElementsByTagName("svg")[0];
  let width = svg.clientWidth;
  let height = svg.clientHeight;
  //HINT: This is workaround for Firefox
  if (width === 0) {
    const box = svg.getBoundingClientRect();

    width = box.right - box.left;
    height = box.bottom - box.top;
  }

  let avgDecimals = 0;

  const verticalMargin = 6;
  const horizontalMargin = 2;
  avgDecimals = avgDecimals || averageDecimalsDefault;
  const avgLabelColor = props.avglabelcolor || avgLabelColorDefault;
  const metricSuffix = props.metricsuffix || avgLabelSuffixDefault;
  const plotData = props.plotdata || { points: [], average: 0 };
  let points = plotData.points;
  if (points.length === 0) {
    points = new Array(10).fill(0);
  }
  const average = plotData.average || 0;
  const minimumYaxis = !isNaN(props.minimumyaxis) ? Number(props.minimumyaxis) : 10;
  const max = points && points.length ? Math.max(average * 1.5, d3.max(points), minimumYaxis) : 1;
  const numberOfPoints = points && points.length ? points.length : 2;

  const scaleY = d3
    .scaleLinear()
    .domain([0, max])
    .range([height - verticalMargin, verticalMargin]);

  const scaleX = d3
    .scaleLinear()
    .domain([0, numberOfPoints - 1])
    .range([horizontalMargin, width - horizontalMargin]);
  const area = d3
    .area()
    .x(function (d, i) {
      return scaleX(i);
    })
    .y(function (d) {
      return scaleY(d);
    })
    .y1(function () {
      return scaleY(0);
    })
    .curve(d3.curveLinear);

  const line = d3
    .line()
    .x(function (d, i) {
      return scaleX(i);
    })
    .y(function (d) {
      return scaleY(d);
    })
    .curve(d3.curveLinear);

  d3.select(svg).selectAll("*").remove();
  const chart = d3.select(svg).attr("width", width).attr("height", height);
  chart
    .append("rect")
    .attr("width", width - 2 * horizontalMargin)
    .attr("height", height - 2 * verticalMargin)
    .attr("transform", "translate(" + horizontalMargin + "," + verticalMargin + ")")
    .attr("fill", "#F2F6F7");

  if (points) {
    chart.append("path").datum(points).attr("d", area).attr("class", "graph-data-fill");

    chart.append("path").datum(points).attr("d", line).attr("class", "graph-data-line");
  }
  const averageLine = chart.append("path").datum(Array(numberOfPoints).fill(average)).attr("d", line).attr("class", "graph-avg-line");
  const displayAverageLabel = function (averageLine, label, value, color, unit) {
    if (label != null) {
      const { x, y, width } = averageLine.node().getBoundingClientRect();
      label.value(value, unit);

      if (label.pointingToTheLeft) {
        label.displayAt({ x: x + width + window.pageXOffset, y: y + window.pageYOffset, color });
      } else {
        label.displayAt({ x: x + window.pageXOffset, y: y + window.pageYOffset, color });
      }
    }
  };

  chart
    .on("mouseover", function () {
      let value = useFormatLargeNumber(average, avgDecimals);
      let suffix = metricSuffix;

      if (props.isdurationgraph) {
        value = useFormatTime(average).value;
        suffix = useFormatTime(average).unit.toUpperCase();
      }

      displayAverageLabel(averageLine, averageLabelToTheRight, value, avgLabelColor, suffix);
    })
    .on("mouseout", function () {
      averageLabelToTheRight.hide();
    });
}
onMounted(() => {
  displayGraphValues();
});
onBeforeUnmount(() => {
  if (averageLabelToTheRight) {
    averageLabelToTheRight.hide();
  }
});
</script>

<template>
  <div ref="root" class="graph pull-left ng-isolate-scope" :class="[type]">
    <svg></svg>
  </div>
</template>
