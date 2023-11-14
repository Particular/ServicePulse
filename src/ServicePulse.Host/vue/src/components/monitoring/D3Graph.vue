<script setup>
    import { ref, onMounted } from "vue";
    import * as d3 from 'd3';
    import { useFormatTime, useFormatLargeNumber } from "../../composables/formatter.js";
const props = defineProps({
    plotdata: Object,
    minimumyaxis: Number,
    avglabelcolor: String,
    isdurationgraph: Boolean,
    metricsuffix: String,
    csclass: String,
    endpointname: String,
    colname:String
});
    const averageDecimalsDefault = 2;
    const avgLabelColorDefault = '#2700CB';
    const avgLabelSuffixDefault = '';
    //var plotData= '=';
    //var minimumYaxis = '@';
    //var isDurationGraph = '=isDurationGraph';
    //var avgDecimals = '@';

       // formatter: '&',

    //<graph plot-data="endpoint.metrics.throughput" minimum-YAxis="{{smallGraphsMinimumYAxis.throughput}}"
    //avg-label-color="#176397" metric-suffix="MSGS/S" class="graph throughput pull-left"></graph>

   // const svgelement = ref([]);
    const svgelement = ref(null);
    //scope: {
    //    plotData: '=',
    //        formatter: '&',
    //            minimumYaxis: '@',
    //                isDurationGraph: '=isDurationGraph',
    //                    avgDecimals: '@'
    //},
    //attrs.avgLabelColor = attrs.avgLabelColor || avgLabelColorDefault;
    //attrs.metricSuffix = attrs.metricSuffix || avgLabelSuffixDefault;
    //scope.avgDecimals = scope.avgDecimals || averageDecimalsDefault;

    //scope.plotData = scope.plotData || { points: [], average: 0 };
    function displayGraphValues() {
        var svg = svgelement.value;
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

        var scaleY = d3.scaleLinear()
            .domain([0, max])
            .range([height - verticalMargin, verticalMargin]);

        var scaleX = d3.scaleLinear()
            .domain([0, numberOfPoints - 1])
            .range([horizontalMargin, width - horizontalMargin]);

        var area = d3.area()
            .x(function (d, i) {
                console.log("X"+":"+d + "," + i + "," +scaleX(i));
                return scaleX(i);
            })
            .y(function (d) {  return scaleY(d); })
            .y1(function () {  return scaleY(0); })
            .curve(d3.curveLinear);

        var line = d3.line()
            .x(function (i) {
                return scaleX(i);
            })
            .y(function (d) {
                return scaleY(d);
            })
            .curve(d3.curveLinear);

        d3.select("svg").selectAll("*").remove();
        var chart = d3.select("svg").attr("width", width).attr("height", height);
        chart.append('rect')
            .attr('width', width - 2 * horizontalMargin)
            .attr('height', height - 2 * verticalMargin)
            .attr('transform', 'translate(' + horizontalMargin + ',' + verticalMargin + ')')
            .attr('fill', '#F2F6F7');

        if (points) {
            console.log(props.endpointname + ":" + props.colname + ":" +points.length);
            chart.append('path')
                .datum(points)
                .attr('d', area)
                .attr('class', 'graph-data-fill');

            chart.append('path')
                .datum(points)
                .attr('d', line)
                .attr('class', 'graph-data-line');
        }
        var averageLine = chart.append('path')
            .datum(Array(numberOfPoints).fill(average))
            .attr('d', line)
            .attr('class', 'graph-avg-line');

        var displayAverageLabel = function (averageLine, label, value, color, unit) {
            var { x, y, width } = averageLine.node().getBoundingClientRect();
            label.value(value, unit);

            if (label.pointingToTheLeft) {
                label.displayAt({ x: x + width + window.pageXOffset, y: y + window.pageYOffset, color });
            } else {
                label.displayAt({ x: x + window.pageXOffset, y: y + window.pageYOffset, color });
            }
        }

        chart.on("mouseover", function () {
            var value = useFormatLargeNumber(average, avgDecimals);
            var suffix = metricSuffix;

            if (props.isdurationgraph) {
                value = useFormatTime(average).value;
                suffix = useFormatTime(average).unit.toUpperCase();
            }

           // displayAverageLabel(averageLine, averageLabelToTheRight, value, avgLabelColor, suffix);
            displayAverageLabel(averageLine, null, value, avgLabelColor, suffix);
        })
            .on("mouseout", function () {
               // averageLabelToTheRight.hide();
            });
    }
    onMounted(() => {
      displayGraphValues();
    });
</script>

<template>
    <svg ref="svgelement"></svg>


</template>

<style>

@media (min-width: 768px) {
    .graph-values .col-sm-6 {
        width: 45%;
    }
}

.large-graphs {
    width: 100%;
    background-color: white;
    margin-bottom: 34px;
    padding: 30px 0;
}

.large-graph {
    width: 100%;
}

.large-graph svg {
    width: 100%
}

.graph {
    width: 68%;
}

.graph svg {
    position: relative;
    width: 100%;
    height: 50px;
}

.graph * .graph-data-line {
    stroke-width: 1.75px;
    fill: none;
}

.graph * .graph-data-fill {
    opacity: 0.8;
}

.graph * .graph-avg-line {
    stroke-width: 1px;
    opacity: 0.5;
    stroke-dasharray: 5,5;
}

.graph.queue-length * .graph-data-line {
    stroke: #EA7E00;
}

.graph.queue-length * .graph-data-fill {
    fill: #EADDCE;
    stroke: #EADDCE;
}

.graph.queue-length * .graph-avg-line {
    stroke: #EA7E00;
}

.graph.throughput * .graph-data-line {
    stroke: #176397;
}

.graph.throughput * .graph-data-fill {
    fill: #CADCE8;
    stroke: #CADCE8;
}

.graph.throughput * .graph-avg-line {
    stroke: #176397;
}

.graph.retries * .graph-data-line {
    stroke: #CC1252;
}

.graph.retries * .graph-data-fill {
    fill: #E9C4D1;
    stroke: #E9C4D1;
}

.graph.retries * .graph-avg-line {
    stroke: #CC1252;
}

.graph.processing-time * .graph-data-line {
    stroke: #258135;
}

.graph.processing-time * .graph-data-fill {
    fill: #BEE6C5;
    stroke: #BEE6C5;
}

.graph.processing-time * .graph-avg-line {
    stroke: #258135;
}

.graph.critical-time * .graph-data-line {
    stroke: #2700CB;
}

.graph.critical-time * .graph-data-fill {
    fill: #C4BCE5;
    stroke: #C4BCE5;
}

.graph.critical-time * .graph-avg-line {
    stroke: #2700CB;
}

.graph-area {
    width: 33%;
    box-sizing: border-box;
}

.graph-values {
    margin-left: 60px;
    padding-top: 10px;
    border-top: 3px solid #fff;
    margin-top: -8.5px;
    width: 93%;
}

.graph-message-retries-throughputs, .graph-critical-processing-times {
    margin-left: 0.5%;
}

.endpoint-row .graphicon {
    top: 14px;
    left: 120px;
    position: absolute;
    width: 94px;
    padding-left: 36px;
    display: block;
}

.endpoint-row .graphicon.graphicon-row-hover {
    background-color: #edf6f7 !important;
}
</style>