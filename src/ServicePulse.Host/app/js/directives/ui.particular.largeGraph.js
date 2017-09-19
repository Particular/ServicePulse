(function(window, angular, undefined) {
    'use strict';

    function drawDataSeries(dataSeries, color, yAxisAllignedLeft, scaleX, chart, height, graphWidth, margin, dates, className, unit) {

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

        var group = chart.append('g').attr('class', className);

        group.append('path')
            .datum(dataSeries.points)
            .attr('d', area)
            .attr('fill', color)
            .attr('opacity', 0.2)
            .attr('stroke', color);

        group.append('path')
            .datum(Array(dataSeries.points.length).fill(dataSeries.average))
            .attr('d', line)
            .attr('stroke', '#AAAFAD')
            .attr('stroke-width', 2);

        group.selectAll('dot')
            .data(dataSeries.points)
            .enter().append('circle')
            .attr('r', 3)
            .attr('cx', function (d, i) { return scaleX(i); })
            .attr('cy', function (d) { return scaleY(d); })
            .append('svg:title')
            .text(function (d, i) { return 'Time: ' + dates[i] + ', Value: ' + d.toFixed(2) + ' ' + unit; });
            
        group.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (yAxisAllignedLeft ? margin : graphWidth - margin) + ', 0)')
            .call((yAxisAllignedLeft ? d3.axisLeft(scaleY) : d3.axisRight(scaleY)));
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
                            var firstSeries = scope.firstDataSeries;
                            var secondSeries = scope.secondDataSeries;

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

                            var scaleYValue = (scaleY(average == 0 ? 1 : average) + 3) | 0;

                            chart.append('text')
                                .attr('x', 0)
                                .attr('y', scaleYValue)
                                .attr('text-anchor', 'start')
                                .attr('font-size', 12)
                                .attr('font-family', 'sans-serif')
                                .text('ø');

                            drawDataSeries(firstSeries,
                                attrs.firstSeriesColor,
                                true,
                                scaleX,
                                chart,
                                height,
                                graphWidth,
                                margin,
                                dates,
                                firstSeries.className,
                                firstSeries.unit);

                            drawDataSeries(secondSeries,
                                attrs.secondSeriesColor,
                                false,
                                scaleX,
                                chart,
                                height,
                                graphWidth,
                                margin,
                                dates,
                                secondSeries.className,
                                secondSeries.unit);

                            chart.append('text')
                                .attr('text-anchor', 'middle')
                                .attr('stroke', attrs.firstSeriesColor)
                                .attr('opacity', 0.5)
                                .attr('transform', 'translate(' + (margin / 2) + ',' + (height / 2) + ')rotate(-90)')
                                .text(firstSeries.axisName);

                            chart.append('text')
                                .attr('text-anchor', 'middle')  
                                .attr('stroke', attrs.secondSeriesColor)
                                .attr('opacity', 0.5)
                                .attr('transform', 'translate(' + (graphWidth) + ',' + (height / 2) + ')rotate(90)') 
                                .text(secondSeries.axisName);
                        });
                    }
                };
            });

}(window, window.angular));