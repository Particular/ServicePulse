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
                        var width = 130;
                        var margin = 2;

                        var average = 25;

                        var scaleY = d3.scaleLinear()
                            .domain([d3.min(scope.data), d3.max(scope.data)])
                            .range([heigth - margin, margin]);

                        var scaleX = d3.scaleLinear()
                            .domain([0, scope.data.length - 1])
                            .range([margin, width - margin]);

                        var area = d3.area()
                            .x((d, i) => scaleX(i))
                            .y((d, i) => scaleY(d))
                            .y1(d => scaleY(0))
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
                            .attr('width', width)
                            .attr('height', heigth);

                        chart.append('path')
                            .datum(scope.data)
                            .attr('d', area)
                            .attr('fill', attrs.color);

                        chart.append('path')
                            .datum(Array(scope.data.length).fill(average))
                            .attr('d', line)
                            .attr('stroke', 'black');
                    }
                };
            });

}(window, window.angular));