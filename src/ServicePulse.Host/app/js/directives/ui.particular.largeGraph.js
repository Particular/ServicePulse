﻿(function(window, angular, undefined) {
    'use strict';

    function drawDataSeries(dataSeries, color, yAxisAllignedLeft, scaleX, chart, height, graphWidth, margin, dates) {

        var max = Math.max(dataSeries.average * 1.5, d3.max(dataSeries.points));

        var scaleY = d3.scaleLinear()
            .domain([0, max])
            .range([height - margin, margin]);

        var area = d3.area()
            .x(function (d, i) {
                return scaleX(i);
            })
            .y(function (d, i) { return scaleY(d); })
            .y1(function (d) { return scaleY(0); })
            .curve(d3.curveLinear);

        var line = d3.line()
            .x(function (d, i) {
                return scaleX(i);
            })
            .y(function (d, i) {
                return scaleY(d);
            })
            .curve(d3.curveLinear);

        chart.append('path')
            .datum(dataSeries.points)
            .attr('d', area)
            .attr('fill', color)
            .attr('opacity', 0.2)
            .attr('stroke', color);

        chart.append('path')
            .datum(Array(dataSeries.points.length).fill(dataSeries.average))
            .attr('d', line)
            .attr('stroke', color)
            .attr('stroke-width', 2)            ;

        chart.selectAll('dot')
            .data(dataSeries.points)
            .enter().append('circle')
            .attr('r', 3)
            .attr('cx', function (d, i) { return scaleX(i); })
            .attr('cy', function (d) { return scaleY(d); })
            .append('svg:title')
            .text(function (d, i) { return dates[i] + ' | ' + d; });
            
        chart.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (yAxisAllignedLeft ? margin : graphWidth - margin) + ', 0)')
            .call((yAxisAllignedLeft ? d3.axisLeft(scaleY) : d3.axisRight(scaleY)));
}


        chart.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (margin / 2) + "," + (height / 2) + ")rotate(-90)")  
            .text("Throughput [msgs/s]");

        chart.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate(" + (graphWidth) + "," + (height / 2) + ")rotate(90)")  // centre below axis
            .text("Queue Length [msgs]");
    }

    angular.module('ui.particular.largeGraph', [])
        .directive('largeGraph',
            function() {
                return {
                    restrict: 'E',
                    scope: {                        
                        dates: '=xaxisPoints',
                        firstDataSeries: '=firstDataSeries',
                        secondDataSeries: '=secondDataSeries',
                        width: '=plotWidth',
                        height: '=plotHeight'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.$watch('firstDataSeries', function () {
                            d3.selectAll('large-graph svg > *').remove();
                            var svg = element.find('svg')[0];
                            var margin = 60;

                            var totalWidth = scope.width;
                            var height = scope.height;
                            var graphWidth = totalWidth - (2 * margin) - 30;
                            var firstSeries = {
                                points: scope.firstDataSeries.points,
                                average: scope.firstDataSeries.average
                            };
                            var secondSeries = {
                                points: scope.secondDataSeries.points,
                                average: scope.secondDataSeries.average
                            };

                            var dates = scope.dates;

                            var scaleX = d3.scaleLinear()
                                .domain([0, firstSeries.points.length - 1])
                                .range([margin, graphWidth - margin]);

                            
                            var chart = d3.select(svg)
                                .attr('width', totalWidth)
                                .attr('height', height);

                            chart.append('g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + (height - margin) + ')')
                                .call(d3.axisBottom(scaleX).tickFormat(function(d) {
                                    return dates[d];
                                }));

                            drawDataSeries(firstSeries,
                                attrs.firstSeriesColor,
                                true,
                                scaleX,
                                chart,
                                height,
                                graphWidth,
                                margin,
                                dates);

                            drawDataSeries(secondSeries,
                                attrs.secondSeriesColor,
                                false,
                                scaleX,
                                chart,
                                height,
                                graphWidth,
                                margin,
                                dates);
                            
                        });
                    }
                };
            });

}(window, window.angular));