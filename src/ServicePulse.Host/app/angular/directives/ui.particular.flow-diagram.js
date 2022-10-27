(function (window, angular, d3) {
    'use strict';


    function controller($scope, serviceControlService, $routeParams, $compile) {
        
        function createTreeStructure(messages) {
            var map = {}, node, roots = [], i;

            for (i = 0; i < messages.length; i += 1) {
                map[messages[i].messageId] = i; // initialize the map
                messages[i].children = []; // initialize the children
            }

            for (i = 0; i < messages.length; i += 1) {
                node = messages[i];
                if (node.parentId && map[node.parentId] ) {
                    // if you have dangling branches check that map[node.parentId] exists
                    messages[map[node.parentId]].children.push(node);                    
                } else {
                    roots.push(node);
                }
            }
            return roots;
        }

        function mapMessage(message) {
            var parentid, saga = '';
            var header = message.headers.find(function(x) { return x.key === 'NServiceBus.RelatedTo';});
            if(header){
                parentid = header.value;   
            }
            var sagaHeader = message.headers.find(function(x) { return x.key === 'NServiceBus.OriginatingSagaType';});
            if(sagaHeader){
                saga = sagaHeader.value.split(', ')[0];
            }
            
            return {
                "nodeName": message.message_type,
                "id": message.id,
                "messageId": message.message_id,
                "parentId": parentid,
                "type": message.headers.findIndex(function(x) { return x.key === 'NServiceBus.DeliverAt'; }) > -1 ? 'Timeout message' : message.headers.find(function(x) { return x.key === 'NServiceBus.MessageIntent'; }).value === 'Publish' ? 'Event message' : 'Command message',
                "isError": message.headers.findIndex(function(x) { return x.key === 'NServiceBus.ExceptionInfo.ExceptionType'; }) > -1,
                "sagaName": saga,
                "link" : {
                    "name" : "Link "+message.id,
                    "nodeName" : message.id                    
                },
                "timeSent": new Date(message.time_sent)
            };
        }

        // Set the dimensions and margins of the diagram
        var margin = {top: 20, right: 90, bottom: 30, left: 90},
            width = 3600 - margin.left - margin.right;
            
        var rectNode = { width : 250, height : 90, textMargin : 5 }

        
        var i = 0,
            duration = 750,
            root, treemap, svg, parentSvg;
        
        var currentMessageId = $routeParams.messageId;

        function drawTree(treeData) {
            // Assigns parent, children, height, depth
            root = d3.hierarchy(treeData, function (d) {
                return d.children;
            });
                        
            // append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
            parentSvg = d3.select("#tree-container").append("svg")
                .attr('viewBox', '-1000 -10 2000 2000');
                
            svg = parentSvg.append("g")
                .attr("transform", "scale(.7,.7)");

            var zoom = d3.zoom()
                .scaleExtent([1 / 2, 8])
                .on("zoom", zoomed);
            
            svg.append('defs').append('marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 0)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .attr('class', 'arrow')
                .append('path')
                .attr('d', 'M10,-5L0,0L10,5');

            // declares a tree layout and assigns the size
            treemap = d3.tree().nodeSize([rectNode.width + 20, rectNode.height]);
            
            root.x0 = width / 2;
            root.y0 = 0;

            parentSvg.call(zoom);
            
            update(root);
        }

        function zoomed() {
            svg.attr("transform", d3.event.transform);
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = d.depth * 180 });
            
            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.selectAll('g.node')
                .data(nodes, function(d) {return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', function(d){ return 'node ' + d.data.type.toLowerCase() + ' ' + (d.data.isError ? 'error' : '') + ' ' + (d.data.id === currentMessageId ? 'current-message' : '');})
                .attr('transform', function(d) {
                    return 'translate(' + source.x0 + "," + source.y0 + ')';
                })
                .on('click', click);

            // Add rectangle for the nodes
            nodeEnter.append('rect')
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('width', rectNode.width)
                .attr('height', function(d) {
                    return !d.data.sagaName ? rectNode.height - 22 : rectNode.height;
                })
                .style("fill", function(d) {
                    return d._children ? 'lightsteelblue' : '#fff';
                });

            nodeEnter.append('foreignObject')
                .attr('x', rectNode.textMargin)
                .attr('y', rectNode.textMargin)
                .attr('width', function() {
                    return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0
                        : (rectNode.width - rectNode.textMargin * 2)
                })
                .attr('height', function(d) {
                    var height = rectNode.height;
                    if(!d.data.sagaName){
                        height -= 10; 
                    }
                    return (height - rectNode.textMargin * 2) < 0 ? 0
                        : (height - rectNode.textMargin * 2)
                })
                .append('xhtml').html(function(d) {
                return '<div style="width:' + 
                    (rectNode.width - rectNode.textMargin * 2) + ' px; height:' + 
                    (rectNode.height - rectNode.textMargin * 2) + ' px;" class="node-text wordwrap">' +
                    (d.data.isError ? '<i class="fa pa-flow-failed"></i>' : '') + 
                    '<i class="fa '+ (d.data.type === 'Timeout message' ? 'pa-flow-timeout' : d.data.type === 'Event message' ? 'pa-flow-event' : 'pa-flow-command') + '" title="' + d.data.type + '"></i><div class="lead righ-side-ellipsis" title="' + d.data.nodeName + '"><strong>' + (d.data.isError ? '<a href=#/failed-messages/message/' + d.data.id + '>' + d.data.nodeName + '</a>' : d.data.nodeName) + '</strong></div>' +
                    '<span class="time-sent"><sp-moment date="' + d.data.timeSent + '"></sp-moment></span>' +
                    (d.data.sagaName ? '<i class="fa pa-flow-saga"></i><div class="saga lead righ-side-ellipsis" title="' + d.data.sagaName + '">' + d.data.sagaName + '</div>' : '') + 
                    '</div>';
            }).each(function(){
                    $compile(this)($scope);
                });

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('rect.node')
                .attr('r', 10)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, function(d) { return d.id; });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", function(d){
                    if(d.data.type === 'Event')
                        return 'link event';
                    else 
                        return 'link command';
                })
                .attr('marker-start', 'url(#end-arrow)')
                .attr('d', function(d){
                    var o = {x: source.x0, y: source.y0}
                    return straight(o, o);
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return straight(d, d.parent) });

            // Remove any exiting links
            link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {x: source.x, y: source.y};
                    return straight(o, o);
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function(d){
                d.x0 = d.x;
                d.y0 = d.y;
            });
            
            function straight(s, d){
                return 'M ' + (s.x + rectNode.width / 2) + ' ' + s.y +
                    ' C ' + (s.x + rectNode.width / 2) + ' ' + s.y + ' ,' +
                    (d.x + rectNode.width / 2) + ' ' + (d.y + rectNode.height - 22) + ' ,' +
                    (d.x + rectNode.width / 2) + ' ' + (d.y + rectNode.height - 22);
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
        }
        
        serviceControlService.getConversation($scope.conversationId).then(function(messages) {
            var tree = createTreeStructure(messages.map(mapMessage));
            drawTree(tree[0]);
        });
    }
    
    controller.$inject = ['$scope', 'serviceControlService', '$routeParams', '$compile'];

    function directive() {
        return {
            scope: { conversationId: '@' },
            restrict: 'E',
            template: '<div id="tree-container"></div>',
            controller: controller
            
        };
    }

    directive.$inject = [];

    angular
        .module('sc')
        .directive('flowDiagram', directive);

}(window, window.angular, window.d3));

