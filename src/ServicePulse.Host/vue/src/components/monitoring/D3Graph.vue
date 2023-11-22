<script setup>
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter.js";
import { getArrowLabel } from "../../composables/graphLabel.js";
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
var averageLabelToTheRight = getArrowLabel(false, 'AVG');

function displayGraphValues() {
  var svg = root.value.getElementsByTagName("svg")[0];
  var width = svg.clientWidth;
  var height = svg.clientHeight;
  //HINT: This is workaround for Firefox
  if (width === 0) {
    var box = svg.getBoundingClientRect();

    width = box.right - box.left;
    height = box.bottom - box.top;
  }

  var verticalMargin = 6;
  var horizontalMargin = 2;
  var avgDecimals = avgDecimals || averageDecimalsDefault;
  var avgLabelColor = props.avglabelcolor || avgLabelColorDefault;
  var metricSuffix = props.metricsuffix || avgLabelSuffixDefault;
  var plotData = props.plotdata || { points: [], average: 0 };
  var points = plotData.points;
  if (points.length === 0) {
    points = new Array(10).fill(0);
  }
  var average = plotData.average || 0;
  var minimumYaxis = !isNaN(props.minimumyaxis) ? Number(props.minimumyaxis) : 10;
  var max = points && points.length ? Math.max(average * 1.5, d3.max(points), minimumYaxis) : 1;
  var numberOfPoints = points && points.length ? points.length : 2;

  var scaleY = d3
    .scaleLinear()
    .domain([0, max])
    .range([height - verticalMargin, verticalMargin]);

  var scaleX = d3
    .scaleLinear()
    .domain([0, numberOfPoints - 1])
    .range([horizontalMargin, width - horizontalMargin]);
    var area = d3
        .area()
        .x(function (d, i) {
            return scaleX(i);
        })
        .y(function (d, i) {
            return scaleY(d);
        })
        .y1(function (d) {
            return scaleY(0);
        })
        .curve(d3.curveLinear);

    var line = d3
        .line()
        .x(function (d, i) {
            return scaleX(i);
        })
        .y(function (d, i) {
            return scaleY(d);
        })
        .curve(d3.curveLinear);

  d3.select(svg).selectAll("*").remove();
  var chart = d3.select(svg).attr("width", width).attr("height", height);
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
  var averageLine = chart.append("path").datum(Array(numberOfPoints).fill(average)).attr("d", line).attr("class", "graph-avg-line");
    var displayAverageLabel = function (averageLine, label, value, color, unit) {
        if (label != null) {
            var { x, y, width } = averageLine.node().getBoundingClientRect();
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
      var value = useFormatLargeNumber(average, avgDecimals);
      var suffix = metricSuffix;

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
</script>

<template>
    <div ref="root" class="graph pull-left ng-isolate-scope"  :class="[type]">
     <svg></svg>
    </div>
</template>
