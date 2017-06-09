(function(window, angular, undefined) {
    "use strict";

    angular.module("monitored-endpoints", [])
        .directive("graph",
            function() {
                return {
                    restrict: "A",
                    link: function link(scope, element, attrs) {
                        var heigth = 50;
                        var width = 120;
                        var margin = 2;

                        var data = [10, 15, 30, 50, 20, 10, 10, 15, 0];
                        var average = 25;

                        var scaleY = d3.scaleLinear()
                            .domain([d3.min(data), d3.max(data)])
                            .range([heigth - margin, margin]); // include some margin

                        var scaleX = d3.scaleLinear()
                            .domain([0, data.length - 1])
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

                        var chart = d3.select(element[0])
                            .attr("width", width)
                            .attr("height", heigth);

                        chart.append("path")
                            .datum(data)
                            .attr("d", area)
                            .attr("fill", attrs.color);

                        // paint a border for the graph
                        //chart.append("path")
                        //    .datum(data)
                        //    .attr("d", line)
                        //    .attr("stroke", "red")
                        //    .attr("stroke-width", 2)
                        //    .attr("fill", "none");

                        chart.append("path")
                            .datum(Array(data.length).fill(average))
                            .attr("d", line)
                            .attr("stroke", "black");
                    }
                };
            });

}(window, window.angular));