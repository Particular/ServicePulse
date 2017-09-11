(function(window, angular, undefined) {
    'use strict';

    function drawDataSeries(dataSeries, color, scaleX, chart, heigth, graphWidth, margin, dates) {

        var max = Math.max(dataSeries.average * 1.5, d3.max(dataSeries.points));

        var scaleY = d3.scaleLinear()
            .domain([0, max])
            .range([heigth - margin, margin]);

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
            .attr('fill', color);

        chart.append('path')
            .datum(Array(dataSeries.points.length).fill(dataSeries.average))
            .attr('d', line)
            .attr('stroke', 'black');

        chart.selectAll('dot')
            .data(dataSeries.points)
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
            .text(dataSeries.average.toFixed(2));

        chart.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + margin + ', 0)')
            .call(d3.axisLeft(scaleY));
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
                        heigth: '=plotHeight'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        scope.$watch('firstDataSeries', function () {
                            d3.selectAll('large-graph svg > *').remove();
                            var svg = element.find('svg')[0];
                            var margin = 35;

                            var totalWidth = scope.width;
                            var heigth = scope.heigth;
                            var graphWidth = totalWidth - (2 * margin) - 30;
                            var firstSeries = {
                                points: scope.firstDataSeries.points,
                                average: scope.firstDataSeries.average
                            };
                            
                            var dates = scope.dates;

                            var scaleX = d3.scaleLinear()
                                .domain([0, firstSeries.points.length - 1])
                                .range([margin, graphWidth - margin]);

                            
                            var chart = d3.select(svg)
                                .attr('width', totalWidth)
                                .attr('height', heigth);

                            chart.append('g')
                                .attr('class', 'x axis')
                                .attr('transform', 'translate(0,' + (heigth - margin) + ')')
                                .call(d3.axisBottom(scaleX).tickFormat(function(d) {
                                    return dates[d];
                                }));

                            drawDataSeries(firstSeries,
                                attrs.firstSeriesColor,
                                scaleX,
                                chart,
                                heigth,
                                graphWidth,
                                margin,
                                dates);
                        });
                    }
                };
            });

}(window, window.angular));