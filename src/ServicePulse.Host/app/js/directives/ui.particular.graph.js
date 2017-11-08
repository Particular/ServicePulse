﻿(function(window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graph', [])
        .directive('graph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        plotData: '&',
                        formatter: '&'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.plotData = scope.plotData() || { points: [], average: 0 };

                        var svg = element.find('svg')[0];
                        var heigth = 50;
                        var graphWidth = 130;
                        var totalWidth = 180;
                        var margin = 12;
                        var points = scope.plotData.points;
                        var average = scope.plotData.average || 0;
                        var lastValue = scope.plotData.points.length > 0 ? scope.plotData.points[scope.plotData.points.length - 1] : 0;
                        var max = points && points.length ? Math.max(average * 1.5, d3.max(points)) : 1;
                        var numberOfPoints = points && points.length ? points.length : 2;

                        var scaleY = d3.scaleLinear()
                            .domain([0, max])
                            .range([heigth - margin, margin]);

                        var scaleX = d3.scaleLinear()
                            .domain([0, numberOfPoints - 1])
                            .range([margin, graphWidth - margin]);

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
                            .y(function(d, i) {
                                return scaleY(d);
                            })
                            .curve(d3.curveLinear);

                        var chart = d3.select(svg)
                            .attr('width', totalWidth)
                            .attr('height', heigth);

                        if (points) {
                            chart.append('path')
                                .datum(points)
                                .attr('d', area)
                                .attr('fill', attrs.color);
                        }

                        chart.append('path')
                            .datum(Array(numberOfPoints).fill(average))
                            .attr('d', line)
                            .attr('stroke', '#000000')
                            .attr('stroke-width', '1')
                            .attr('opacity', 0.5)
                            .attr('stroke-dasharray', '5,5');

                        chart.append('path')
                            .datum(Array(numberOfPoints).fill(0))
                            .attr('d', line)
                            .attr('stroke', 'gray');

                        var displayValue = lastValue.toFixed(2);
                        var unit = "s";
                        if (typeof scope.plotData.displayValue !== "undefined") {
                            displayValue = scope.plotData.displayValue;
                            unit = displayValue.split(' ')[1];
                            displayValue = displayValue.split(' ')[0];
                        }

                        chart.append("text")
                            .attr("x", graphWidth - margin + 23)
                            .attr("y", heigth / 2 + 5)
                            .attr("text-anchor", "end")
                            .attr("font-size", 12)
                            .attr("font-family", "sans-serif")
                            .text(displayValue);

                        chart.append("text")
                            .attr("x", graphWidth - margin + 25)
                            .attr("y", heigth / 2 + 5)
                            .attr("text-anchor", "start")
                            .attr("font-size", 12)
                            .attr("font-family", "sans-serif")
                            .text(unit);
                    }
                };
            });

}(window, window.angular));