import ArrowLabel from './ui.particular.arrowLabel';

(function(window, angular, d3) {
    'use strict';

    const averageDecimalsDefault = 2;
    const avgLabelColorDefault = '#2700CB';
    const avgLabelSuffixDefault = '';

    var averageLabelToTheRight = ArrowLabel({pointToTheLeft: false, caption: 'AVG'});
    

    angular.module('ui.particular.graph', [])
        .directive('graph',
            function(formatter) {
                return {
                    restrict: 'E',
                    scope: {
                        plotData: '=',
                        formatter: '&',
                        minimumYaxis: '@',
                        isDurationGraph: '=isDurationGraph',
                        avgDecimals: '@'
                    },
                    template: '<svg></svg>',
                    link: function link(scope, element, attrs) {
                        attrs.avgLabelColor = attrs.avgLabelColor || avgLabelColorDefault;
                        attrs.metricSuffix = attrs.metricSuffix || avgLabelSuffixDefault;
                        scope.avgDecimals = scope.avgDecimals || averageDecimalsDefault;
                        
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
                                if (points.length === 0) {
                                    points = new Array(10).fill(0);
                                }
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

                                var averageLine = chart.append('path')
                                    .datum(Array(numberOfPoints).fill(average))
                                    .attr('d', line)
                                    .attr('class', 'graph-avg-line');

                                var displayAverageLabel = function(averageLine, label, value, color, unit) {
                                    var {x, y, width} = averageLine.node().getBoundingClientRect();
                                    label.value(value, unit);
    
                                    if (label.pointingToTheLeft) {
                                        label.displayAt({x:x + width + window.pageXOffset, y:y + window.pageYOffset, color});
                                    } else {
                                        label.displayAt({x:x + window.pageXOffset, y:y + window.pageYOffset, color});
                                    }
                                }

                                chart.on("mouseover", function() {    
                                    var value = `${formatter.formatLargeNumber(average,scope.avgDecimals)}`;
                                    var suffix = attrs.metricSuffix;

                                    if (scope.isDurationGraph) {
                                        value = `${formatter.formatTime(average).value}`;
                                        suffix = formatter.formatTime(average).unit.toUpperCase();
                                    } 
                                    
                                    displayAverageLabel(averageLine, averageLabelToTheRight, value, attrs.avgLabelColor, suffix);
                                })
                                .on("mouseout", function(){
                                    averageLabelToTheRight.hide();
                                });
                            });
                    }
                };
            });            

}(window, window.angular, window.d3));