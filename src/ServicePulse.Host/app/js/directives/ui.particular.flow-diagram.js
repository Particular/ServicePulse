(function (window, angular, d3) {
    'use strict';


    function controller($scope, serviceControlService) {        
        serviceControlService.getConversation($scope.conversationId).then(messages => {
        //serviceControlService.getConversation('1dc69cf1-1511-4c85-bd1f-aec200948225').then(messages =>{
            var tree = createTreeStructure(messages.map(x => mapMessage(x)));
            drawTree(tree[0]);
        });
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
            var parentid;
            var header = message.headers.find(x => x.key === 'NServiceBus.RelatedTo');
            if(header){
                parentid = header.value;   
            }
            
            return {
                "nodeName": message.message_type,
                "id": message.id,
                "messageId": message.message_id,
                "parentId": parentid,
                "type": message.headers.findIndex(x => x.key === 'NServiceBus.DeliverAt') > -1 ? 'Delay' : message.headers.find(x => x.key === 'NServiceBus.MessageIntent').value === 'Publish' ? 'Event' : 'Command',
                "isError": message.headers.findIndex(x => x.key === 'NServiceBus.ExceptionInfo.ExceptionType') > -1,
                "link" : {
                    "name" : "Link "+message.id,
                    "nodeName" : message.id                    
                },
                "timeSent": new Date(message.time_sent)
            };
        }

        // Set the dimensions and margins of the diagram
        var margin = {top: 20, right: 90, bottom: 30, left: 90},
            width = 1860 - margin.left - margin.right,
            height = 1500 - margin.top - margin.bottom;
        var rectNode = { width : 120, height : 90, textMargin : 5 }
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
        var svg = d3.select("#tree-container").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate("
                + margin.left + "," + margin.top + ")");

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
        
        var i = 0,
            duration = 750,
            root;

// declares a tree layout and assigns the size
        var treemap = d3.tree().size([height, width]);

        function drawTree(treeData) {
// Assigns parent, children, height, depth
            root = d3.hierarchy(treeData, function (d) {
                return d.children;
            });
            root.x0 = height / 2;
            root.y0 = 0;

            update(root);
        }

// Collapse the node and all it's children
        function collapse(d) {
            if(d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
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
                .attr('class', 'node')
                .attr("transform", function(d) {
                    return "translate(" + source.x0 + "," + source.y0 + ")";
                })
                .on('click', click);

            // Add rectangle for the nodes
            nodeEnter.append('rect')                
                .attr('class', function(d){return `node ${d.data.type.toLowerCase()} ${d.data.isError ? 'error' : ''}`;})
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('width', rectNode.width)
                .attr('height', rectNode.height)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            nodeEnter.append('foreignObject')
                .attr('x', rectNode.textMargin)
                .attr('y', rectNode.textMargin)
                .attr('width', function() {
                    return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0
                        : (rectNode.width - rectNode.textMargin * 2)
                })
                .attr('height', function() {
                    return (rectNode.height - rectNode.textMargin * 2) < 0 ? 0
                        : (rectNode.height - rectNode.textMargin * 2)
                })
                .append('xhtml').html(function(d) {
                return '<div style="width: '
                    + (rectNode.width - rectNode.textMargin * 2) + 'px; height: '
                    + (rectNode.height - rectNode.textMargin * 2) + 'px;" class="node-text wordwrap">'
                    + `<i class="fa ${d.data.type === 'Delay' ? 'fa-clock-o' : d.data.type === 'Event' ? 'fa-arrows' : 'fa-arrow-right'}"></i><b>${(d.data.isError ? `<a href=#/failed-messages/message/${d.data.id}>${d.data.nodeName}</a>` : d.data.nodeName)}</b><br>
<span class="time-sent">${d.data.timeSent.toLocaleString()}</span> <br>
</div>`;
            })

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
                    return diagonal(o, o)
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return diagonal(d, d.parent) });

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {x: source.x, y: source.y}
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function(d){
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                var path = "M" + (s.x + rectNode.width / 2) + "," + s.y
                    + "C" + (s.x + rectNode.width / 2) + "," + (s.y + d.y) / 2
                    + " " + (d.x  + rectNode.width / 2) + "," + (s.y + d.y) / 2
                    + " " + (d.x  + rectNode.width / 2) + "," + (d.y + rectNode.height);

                return path
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
    }
    
    controller.$inject = ['$scope', 'serviceControlService'];

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

