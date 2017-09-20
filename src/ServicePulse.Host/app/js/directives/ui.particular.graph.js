(function(window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graph', [])
        .directive('graph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        data: '=plotPoints',
                        avg: '=plotAverage',
                        formatter: '&'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.formatter = scope.formatter(); // unwrap the function
                        var svg = element.find('svg')[0];
                        var heigth = 50;
                        var graphWidth = 130;
                        var totalWidth = 180;
                        var margin = 12;
                        var points = scope.data;
                        var average = scope.avg || 0;
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
                            .attr('stroke', '#AAAFAD');

                        chart.append('path')
                            .datum(Array(numberOfPoints).fill(0))
                            .attr('d', line)
                            .attr('stroke', 'gray');

                        var displayValue = average.toFixed(2);
                        if (scope.formatter) {
                            displayValue = scope.formatter(average);
                        }

                        chart.append("text")
                            .attr("x", graphWidth - margin + 3)
                            .attr("y", heigth / 2 + 5)
                            .attr("text-anchor", "start")
                            .attr("font-size", 12)
                            .attr("font-family", "sans-serif")
                            .text(displayValue);
                    }
                };
            });

}(window, window.angular));