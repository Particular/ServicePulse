(function(window, angular, undefined) {
    'use strict';

    angular.module('ui.particular.graph', [])
        .directive('graph',
            function() {
                return {
                    restrict: 'E',
                    scope: {
                        plotData: '=',
                        formatter: '&',
                        minimumYaxis: '@'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.plotData = scope.plotData || { points: [], average: 0 };

                        scope.$watch('plotData',
                            function() {
                                var svg = element.find('svg')[0];

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

                                var points = scope.plotData.points;
                                var average = scope.plotData.average || 0;
                                var minimumYaxis = !isNaN(scope.minimumYaxis) ? Number(scope.minimumYaxis) : 10;
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

                                d3.select(svg).selectAll("*").remove();

                                var chart = d3.select(svg)
                                    .attr('width', width)
                                    .attr('height', height);

                                chart.append('rect')
                                    .attr('width', width - 2 * horizontalMargin)
                                    .attr('height', height - 2 * verticalMargin)
                                    .attr('transform', 'translate(' + horizontalMargin + ',' + verticalMargin + ')')
                                    .attr('fill', '#F2F6F7');

                                if (points) {
                                    chart.append('path')
                                        .datum(points)
                                        .attr('d', area)
                                        .attr('class', 'graph-data-fill');


                                    chart.append('path')
                                        .datum(points)
                                        .attr('d', line)
                                        .attr('class', 'graph-data-line');
                                }

                                chart.append('path')
                                    .datum(Array(numberOfPoints).fill(average))
                                    .attr('d', line)
                                    .attr('class', 'graph-avg-line');
                            });
                    }
                };
            });

}(window, window.angular));