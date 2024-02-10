<script setup>
import { ref, onMounted, onBeforeUnmount, watchEffect } from "vue";
import * as d3 from "d3";
import { useFormatTime, useFormatLargeNumber } from "@/composables/formatter";
import { getArrowLabel } from "@/composables/graphLabel";
const props = defineProps({
  isdurationgraph: Boolean,
  metricsuffix: String,
  firstdataseries: Object,
  seconddataseries: Object,
  minimumyaxis: Number,
  avgdecimals: Number,
  firstseriescolor: String,
  firstseriesfillcolor: String,
  secondseriescolor: String,
  secondseriesfillcolor: String,
});

const averageDecimalsDefault = 2;
const avgLabelSuffixDefault = "";
const root = ref(null);
const averageLabelToTheRight = getArrowLabel(false, "AVG");
const averageLabelToTheLeft = getArrowLabel(true, "AVG");

watchEffect(displayGraphValues, { flush: "post" });

function displayGraphValues() {
  const avgDecimals = props.avgdecimals || averageDecimalsDefault;
  const metricSuffix = props.metricsuffix || avgLabelSuffixDefault;

  const svg = root.value.getElementsByTagName("svg")[0];

  d3.select(svg).selectAll("*").remove();

  const topMargin = 10;
  const bottomMargin = 5;
  const leftMargin = 60;
  let width = svg.clientWidth;
  let height = svg.clientHeight;

  const chart = d3.select(svg).attr("width", width).attr("height", height);

  //HINT: This is workaround for Firefox
  if (width === 0) {
    const box = svg.getBoundingClientRect();

    width = box.right - box.left;
    height = box.bottom - box.top;
  }

  const firstSeries = props.firstdataseries;
  const secondSeries = props.seconddataseries;
  const firstSeriesColor = props.firstseriescolor;
  const firstSeriesFillColor = props.firstseriesfillcolor;
  const secondSeriesColor = props.secondseriescolor;
  const secondSeriesFillColor = props.secondseriesfillcolor;

  const amountOfValues = Math.max(firstSeries.points.length, secondSeries ? secondSeries.points.length : 0) || 10;
  if (firstSeries.points.length === 0) {
    firstSeries.points = new Array(amountOfValues).fill(0);
  }
  const scaleX = d3
    .scaleLinear()
    .domain([0, amountOfValues - 1])
    .range([leftMargin, width]);

  chart
    .append("rect")
    .attr("width", width - leftMargin)
    .attr("height", height - topMargin - bottomMargin)
    .attr("transform", "translate(" + leftMargin + "," + topMargin + ")")
    .attr("fill", "#F2F6F7");

  const minimumYaxis = !isNaN(props.minimumyaxis) ? Number(props.minimumyaxis) : 10;
  let max = Math.max(firstSeries.average, firstSeries.points.length > 0 ? d3.max(firstSeries.points) : 0, minimumYaxis);

  if (secondSeries && secondSeries.points.length > 0) {
    max = Math.max(max, secondSeries.average, d3.max(secondSeries.points));
  }

  max = padToWholeValue(max);

  const scaleY = d3
    .scaleLinear()
    .domain([0, max])
    .range([height - bottomMargin, topMargin]);

  let yAxis = d3.axisLeft(scaleY).tickValues([0, (max * 1) / 4, (max * 1) / 2, (max * 3) / 4, max]);

  if (props.isdurationgraph) {
    yAxis = yAxis.tickFormat(function (v) {
      const formattedTime = useFormatTime(v);
      return formattedTime.value + "  " + formattedTime.unit;
    });
  }

  chart
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + leftMargin + ", 0)")
    .call(function (g) {
      g.call(yAxis);
      g.select(".domain").remove();
      g.selectAll(".tick line")
        .attr("stroke", "black")
        .attr("stroke-width", "1.75")
        .attr("opacity", 0.1)
        .attr("x", 0)
        .attr("x2", width - leftMargin);
      g.selectAll(".tick text").attr("x", -4).attr("fill", "#828282");
    });

  const drawSeries = function (data, lineColor, fillColor) {
    drawDataSeries(chart, data, lineColor, fillColor, scaleX, scaleY);
  };

  const drawAverage = function (data, lineColor, fillColor) {
    return drawAverageLine(chart, data, lineColor, fillColor, scaleX, scaleY);
  };

  drawSeries(firstSeries, firstSeriesColor, firstSeriesFillColor);

  if (secondSeries) {
    drawSeries(secondSeries, secondSeriesColor, secondSeriesFillColor);
  }

  const firstAverageLine = drawAverage(firstSeries, firstSeriesColor, firstSeriesFillColor);

  let secondAverageLine = null;

  if (secondSeries) {
    secondAverageLine = drawAverage(secondSeries, secondSeriesColor, secondSeriesFillColor);
  }

  chart
    .on("mouseover", function () {
      let value = useFormatLargeNumber(firstSeries.average, avgDecimals);
      let suffix = metricSuffix;

      if (props.isdurationgraph) {
        value = useFormatTime(firstSeries.average).value;
        suffix = useFormatTime(firstSeries.average).unit.toUpperCase();
      }

      displayAverageLabel(firstAverageLine, averageLabelToTheRight, value, firstSeriesColor, suffix);

      if (secondAverageLine && secondSeries.points.length > 0) {
        value = useFormatLargeNumber(secondSeries.average, avgDecimals);
        if (props.isdurationgraph) {
          value = useFormatTime(secondSeries.average).value;
          suffix = useFormatTime(secondSeries.average).unit.toUpperCase();
        }

        displayAverageLabel(secondAverageLine, averageLabelToTheLeft, value, secondSeriesColor, suffix);
      }
    })
    .on("mouseout", function () {
      averageLabelToTheRight.hide();
      averageLabelToTheLeft.hide();
    });
}

function displayAverageLabel(averageLine, label, value, color, unit) {
  const { x, y, width } = averageLine.node().getBoundingClientRect();
  label.value(value, unit);

  if (label.pointingToTheLeft) {
    label.displayAt({ x: x + width + window.pageXOffset, y: y + window.pageYOffset, color });
  } else {
    label.displayAt({ x: x + window.pageXOffset, y: y + window.pageYOffset, color });
  }
}

function drawDataSeries(chart, data, color, fillColor, scaleX, scaleY) {
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

  const group = chart.append("g").attr("class", "dataSeries");

  group.append("path").datum(data.points).attr("d", area).attr("fill", fillColor).attr("opacity", 0.8).attr("stroke", fillColor);

  group.append("path").datum(data.points).attr("d", line).attr("stroke", color).attr("stroke-width", 2.75).attr("fill", "none");
}

function drawAverageLine(chart, data, color, fillColor, scaleX, scaleY) {
  const line = d3
    .line()
    .x(function (d, i) {
      return scaleX(i);
    })
    .y(function (d) {
      return scaleY(d);
    })
    .curve(d3.curveLinear);

  const group = chart.append("g").attr("class", "dataAverage");

  const avgLine = group.append("path").datum(Array(data.points.length).fill(data.average)).attr("d", line).attr("stroke", color).attr("stroke-width", 1.5).attr("opacity", 0.5).attr("stroke-dasharray", "10,10");

  return avgLine;
}

function padToWholeValue(value) {
  const emptyDataSetyAxisMax = 10;

  if (!value) {
    return emptyDataSetyAxisMax;
  }

  let upperBound = 10;

  while (value > upperBound) {
    upperBound *= 10;
  }

  upperBound /= 10;

  return Math.floor(value / upperBound) * upperBound + upperBound;
}
onMounted(() => {
  displayGraphValues();
});
onBeforeUnmount(() => {
  if (averageLabelToTheRight || averageLabelToTheLeft) {
    averageLabelToTheRight?.hide();
    averageLabelToTheLeft?.hide();
  }
});
</script>

<template>
  <div ref="root" class="large-graph pull-left">
    <svg width="750" height="200"></svg>
  </div>
</template>
