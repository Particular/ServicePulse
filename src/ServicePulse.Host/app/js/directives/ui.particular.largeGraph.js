(function(window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.largeGraph', [])
        .directive('largeGraph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        data: '=plotPoints',
                        avg: '=plotAverage',
                        dates: '=xaxisPoints',
                        width: '=plotWidth',
                        heigth: '=plotHeight'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.$watch('data', function () {
                            d3.selectAll('svg > *').remove();
                            var svg = element.find('svg')[0];
                            var margin = 35;

                            var totalWidth = scope.width;
                            var heigth = scope.heigth;
                            var graphWidth = totalWidth - (2 * margin) - 30;
                            var points = scope.data;
                            var average = scope.avg;
                            var dates = scope.dates;
                            var max = Math.max(average * 1.5, d3.max(points));
                            
                            var scaleY = d3.scaleLinear()
                                .domain([0, max])
                                .range([heigth - margin, margin]);

                            var scaleX = d3.scaleLinear()
                                .domain([0, points.length - 1])
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
                                .y(function (d, i) {
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

                            chart.selectAll('dot')
                                .data(points)
                                .enter().append('circle')
                                .attr('r', 3)
                                .attr('cx', function (d, i) { return scaleX(i); })
                                .attr('cy', function (d) { return scaleY(d); })
                                .append('svg:title')
                                .text(function (d, i) { return dates[i] + ' | ' + d; }); 

                            chart.append('text')
                                .attr('x', graphWidth - margin + 3)
                                .attr('y', heigth / 2 + 5)
                                .attr('text-anchor', 'start')
                                .attr('font-size', 12)
                                .attr('font-family', 'sans-serif')
                                .text(average.toFixed(2));

                            chart.append('g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + (heigth - margin) + ')')
                                .call(d3.axisBottom(scaleX).tickFormat(function(d) {
                                    return dates[d];
                                }));
                            
                            chart.append('g')
                                .attr('class', 'y axis')
                                .attr('transform', 'translate(' + margin + ', 0)')
                                .call(d3.axisLeft(scaleY));

                            var scaleYValue = (scaleY(average == 0 ? 1 : average) + 3) | 0;

                            chart.append('text')
                                .attr('x', 0)
                                .attr('y', scaleYValue)
                                .attr('text-anchor', 'start')
                                .attr('font-size', 12)
                                .attr('font-family', 'sans-serif')
                                .text('ø');
                        });
                    }
                };
            });

}(window, window.angular));