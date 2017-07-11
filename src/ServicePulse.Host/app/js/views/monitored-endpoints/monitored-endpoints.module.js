(function(window, angular, undefined) {
    'use strict';

    angular.module('monitored-endpoints', [])
        .directive('graph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        data: '=plotPoints'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        var svg = element.find('svg')[0];

                        var heigth = 50;
                        var graphWidth = 130;
                        var totalWidth = 180;
                        var margin = 2;
                        var points = scope.data.points;
                        var average = scope.data.average;
                        var max = Math.max(average * 1.5, d3.max(points));
                        var scaleY = d3.scaleLinear()
                            .domain([0, max])
                            .range([heigth - margin, margin]);

                        var scaleX = d3.scaleLinear()
                            .domain([0, points.length - 1])
                            .range([margin, graphWidth - margin]);

                        var area = d3.area()
                            .x(function(d, i) { return scaleX(i); })
                            .y(function (d, i) { return scaleY(d); })
                            .y1(function (d) { return scaleY(0); }) 
                            .curve(d3.curveNatural);

                        var line = d3.line()
                            .x(function(d, i) {
                                return scaleX(i);
                            })
                            .y(function(d, i) {
                                return scaleY(d);
                            })
                            .curve(d3.curveNatural);

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