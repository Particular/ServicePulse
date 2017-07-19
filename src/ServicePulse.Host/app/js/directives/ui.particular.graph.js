(function(window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graph', [])
        .directive('graph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        data: '=plotPoints',
                        xAxis: '=plotXAxis',
                        avg: '=plotAverage'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        var svg = element.find('svg')[0];
                        var heigth = 50;
                        var graphWidth = 130;
                        var totalWidth = 180;
                        var margin = 2;
                        var points = scope.data;
                        var average = scope.avg;
                        var max = Math.max(average * 1.5, d3.max(points));

                        var scaleY = d3.scaleLinear()
                            .domain([0, max])
                            .range([heigth - margin, margin]);

                        var xAxisEnd = points.length - 1;
                        if (scope.xAxis && scope.xAxis.length) {
                            xAxisEnd = scope.xAxis[scope.xAxis.length - 1];
                        }

                        var scaleX = d3.scaleLinear()
                            .domain([0, xAxisEnd])
                            .range([margin, graphWidth - margin]);

                        var area = d3.area()
                            .x(function (d, i) {
                                if (scope.xAxis) {
                                    return scaleX(scope.xAxis[i]);
                                }
                                return scaleX(i);
                            })
                            .y(function (d, i) { return scaleY(d); })
                            .y1(function (d) { return scaleY(0); }) 
                            .curve(d3.curveLinear);

                        var line = d3.line()
                            .x(function (d, i) {
                                if (scope.xAxis) {
                                    return scaleX(scope.xAxis[i]);
                                }
                                return scaleX(i);
                            })
                            .y(function(d, i) {
                                return scaleY(d);
                            })
                            .curve(d3.curveLinear);

                        var chart = d3.select(svg)
                            .attr('width', totalWidth)
                            .attr('height', heigth);

                        chart.append('path')
                            .datum(points)
                            .attr('d', area)
                            .attr('fill', attrs.color);

                        chart.append('path')
                            .datum(Array(points.length).fill(average))
                            .attr('d', line)
                            .attr('stroke', 'black');

                        chart.append("text")
                            .attr("x", graphWidth)
                            .attr("y", heigth / 2 + 5)
                            .attr("text-anchor", "start")
                            .attr("font-size", 12)
                            .attr("font-family", "sans-serif")
                            .text(average);
                    }
                };
            });

}(window, window.angular));