<script setup>
import { onMounted, onUnmounted } from "vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
import { select, hierarchy, zoom, tree } from "d3";
import { useRouter } from "vue-router";
import moment from "moment";

const props = defineProps({
  conversationId: String,
  messageId: String,
});

// Set the dimensions and margins of the diagram
const margin = { top: 20, right: 90, bottom: 30, left: 90 },
  width = 3600 - margin.left - margin.right;

const rectNode = { width: 250, height: 90, textMargin: 5 };

let i = 0,
  duration = 750,
  root,
  treemap,
  svg,
  parentSvg;

function getConversation(conversationId) {
  return useFetchFromServiceControl(`conversations/${conversationId}`).then(function (response) {
    return response.json();
  });
}

function mapMessage(message) {
  let parentid = "",
    saga = "";
  let header = message.headers.find((header) => header.key === "NServiceBus.RelatedTo");
  if (header) {
    parentid = header.value;
  }

  let sagaHeader = message.headers.find((header) => header.key === "NServiceBus.OriginatingSagaType");
  if (sagaHeader) {
    saga = sagaHeader.value.split(", ")[0];
  }

  return {
    nodeName: message.message_type,
    id: message.id,
    messageId: message.message_id,
    parentId: parentid,
    type: message.headers.findIndex((header) => header.key === "NServiceBus.DeliverAt") > -1 ? "Timeout message" : message.headers.find((header) => header.key === "NServiceBus.MessageIntent").value === "Publish" ? "Event message" : "Command message",
    isError:
      message.headers.findIndex(function (x) {
        return x.key === "NServiceBus.ExceptionInfo.ExceptionType";
      }) > -1,
    sagaName: saga,
    link: {
      name: `Link ${message.id}`,
      nodeName: message.id,
    },
    timeSent: new Date(message.time_sent),
  };
}

function createTreeStructure(messages) {
  let map = {},
    node,
    roots = [],
    i;

  for (i = 0; i < messages.length; i += 1) {
    map[messages[i].messageId] = i; // initialize the map
    messages[i].children = []; // initialize the children
  }

  for (i = 0; i < messages.length; i += 1) {
    node = messages[i];
    if (node.parentId && map[node.parentId]) {
      // if you have dangling branches check that map[node.parentId] exists
      messages[map[node.parentId]].children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function drawTree(treeData) {
  // Assigns parent, children, height, depth
  root = hierarchy(treeData, function (d) {
    return d.children;
  });

  // append the svg object to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  parentSvg = select("#tree-container").append("svg").attr("viewBox", "-1000 -10 2000 2000");

  svg = parentSvg.append("g").attr("transform", "scale(.7,.7)");

  var zoomElement = zoom()
    .scaleExtent([1 / 2, 8])
    .on("zoom", (event) => {
      svg.attr("transform", event.transform);
    });

  svg.append("defs").append("marker").attr("id", "end-arrow").attr("viewBox", "0 -5 10 10").attr("refX", 0).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").attr("class", "arrow").append("path").attr("d", "M10,-5L0,0L10,5");

  // declares a tree layout and assigns the size
  treemap = tree().nodeSize([rectNode.width + 20, rectNode.height]);

  root.x0 = width / 2;
  root.y0 = 0;

  parentSvg.call(zoomElement);

  update(root);
}

function update(source) {
  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function (d) {
    d.y = d.depth * 180;
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll("g.node").data(nodes, function (d) {
    return d.id || (d.id = ++i);
  });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", (d) => {
      return "node " + d.data.type.toLowerCase() + " " + (d.data.isError ? "error" : "") + " " + (d.data.id === props.messageId ? "current-message" : "");
    })
    .attr("transform", () => {
      return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on("click", click);

  // Add rectangle for the nodes
  nodeEnter
    .append("rect")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("width", rectNode.width)
    .attr("height", function (d) {
      return !d.data.sagaName ? rectNode.height - 22 : rectNode.height;
    })
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

  nodeEnter
    .append("foreignObject")
    .attr("x", rectNode.textMargin)
    .attr("y", rectNode.textMargin)
    .attr("width", function () {
      return rectNode.width - rectNode.textMargin * 2 < 0 ? 0 : rectNode.width - rectNode.textMargin * 2;
    })
    .attr("height", function (d) {
      var height = rectNode.height;
      if (!d.data.sagaName) {
        height -= 10;
      }
      return height - rectNode.textMargin * 2 < 0 ? 0 : height - rectNode.textMargin * 2;
    })
    .append("xhtml")
    .html((d) => {
      const m = moment.utc(d.data.timeSent);
      return '<div style="width:' + (rectNode.width - rectNode.textMargin * 2) + " px; height:" + (rectNode.height - rectNode.textMargin * 2) + ' px;" class="node-text wordwrap">' + (d.data.isError ? '<i class="fa pa-flow-failed"></i>' : "") + '<i class="fa ' + (d.data.type === "Timeout message" ? "pa-flow-timeout" : d.data.type === "Event message" ? "pa-flow-event" : "pa-flow-command") + '" title="' + d.data.type + '"></i><div class="lead righ-side-ellipsis" title="' + d.data.nodeName + '"><strong>' + (d.data.isError ? "<a onclick='__routerReferenceForDynamicAnchorTags.push( { path: \"/failed-messages/message/" + d.data.id + "\" })' href='javascript:void(0)'>" + d.data.nodeName + "</a>" : d.data.nodeName) + "</strong></div>" + '<span class="time-sent">' + `<span class="time-since">${m.fromNow()}</span></span>` + (d.data.sagaName ? '<i class="fa pa-flow-saga"></i><div class="saga lead righ-side-ellipsis" title="' + d.data.sagaName + '">' + d.data.sagaName + "</div>" : "") + "</div>";
    });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", (d) => {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // Update the node attributes and style
  nodeUpdate
    .select("rect.node")
    .attr("r", 10)
    .style("fill", (d) => {
      return d._children ? "lightsteelblue" : "#fff";
    })
    .attr("cursor", "pointer");

  // Remove any exiting nodes
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", () => {
      return "translate(" + source.x + "," + source.y + ")";
    })
    .remove();

  // On exit reduce the opacity of text labels
  nodeExit.select("text").style("fill-opacity", 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll("path.link").data(links, (d) => d.id);

  // Enter any new links at the parent's previous position.
  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", (d) => {
      if (d.data.type === "Event") return "link event";
      else return "link command";
    })
    .attr("marker-start", "url(#end-arrow)")
    .attr("d", () => {
      var o = { x: source.x0, y: source.y0 };
      return straight(o, o);
    });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", (d) => {
      return straight(d, d.parent);
    });

  // Remove any exiting links
  link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", () => {
      var o = { x: source.x, y: source.y };
      return straight(o, o);
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach((d) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  function straight(s, d) {
    return "M " + (s.x + rectNode.width / 2) + " " + s.y + " C " + (s.x + rectNode.width / 2) + " " + s.y + " ," + (d.x + rectNode.width / 2) + " " + (d.y + rectNode.height - 22) + " ," + (d.x + rectNode.width / 2) + " " + (d.y + rectNode.height - 22);
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

onUnmounted(() => {
  // dereference the router
  window.__routerReferenceForDynamicAnchorTags = undefined;
});

onMounted(() => {
  // This is needed to expose the router to the dynamic HTML that's created as part of the rendering
  // Without this a full page refresh is required
  // I'm so sorry for this :(
  window.__routerReferenceForDynamicAnchorTags = useRouter();

  getConversation(props.conversationId)
    .then((messages) => {
      return messages.map(mapMessage);
    })
    .then((mappedMessages) => {
      return createTreeStructure(mappedMessages);
    })
    .then((nodes) => {
      return drawTree(nodes[0]);
    });
});
</script>

<template>
  <div id="tree-container"></div>
</template>

<style>
.node rect {
  fill: #fff;
  stroke: #cccbcc;
  stroke-width: 3px;
}

.node rect.error {
  stroke: red;
}

.node text {
  font: 12px sans-serif;
}

.node .time-sent .time-since {
  display: block;
  margin-left: 20px;
  padding-top: 0;
  color: #777f7f;
  text-transform: capitalize;
}

.node-text {
  padding: 3px 8px 1px;
}

.node-text i {
  display: inline-block;
  position: relative;
  top: -1px;
  margin-right: 5px;
  filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(346deg) brightness(104%) contrast(104%);
}

.node-text .lead {
  display: inline-block;
  width: 204px;
  position: relative;
  top: 4px;
}

g.error .node-text .lead,
g.current-message.error .node-text .lead {
  width: 184px;
}

.node-text .lead.saga {
  font-weight: normal;
  width: 182px;
}

g.current-message.error rect {
  stroke: #be514a;
  fill: #be514a !important;
}

g.current-message.error .node-text,
g.current-message .node-text .lead {
  color: #fff !important;
}

g.error .node-text i:not(.pa-flow-saga) {
  filter: brightness(0) saturate(100%) invert(46%) sepia(9%) saturate(4493%) hue-rotate(317deg) brightness(81%) contrast(82%);
}

g.current-message.error .node-text i {
  color: #fff;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7475%) hue-rotate(21deg) brightness(100%) contrast(106%);
}

g.current-message.error .node-text strong {
  color: #fff;
}

g.current-message.error .node-text .time-sent .time-since {
  color: #ffcecb !important;
}

g.error rect {
  stroke: #be514a;
}

g.current-message.error .node-text a {
  color: #fff;
}

g.current-message.error .node-text a:hover {
  cursor: text;
  text-decoration: none;
}

g.error .node-text a {
  color: #be514a;
}

g.error .node-text .time-sent .time-since {
  color: #be514a;
}

g.error .node-text .lead.saga {
  color: #be514a;
}

g.error .node-text a:hover {
  text-decoration: underline;
}

.pa-flow-failed {
  background-image: url("@/assets/failed-msg.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}

.pa-flow-saga {
  background-image: url("@/assets/saga.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
  margin-left: 20px;
}

.pa-flow-timeout {
  background-image: url("@/assets/timeout.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}

.pa-flow-event {
  background-image: url("@/assets/event.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}

.pa-flow-command {
  background-image: url("@/assets/command.svg");
  background-position: center;
  background-repeat: no-repeat;
  height: 15px;
  width: 15px;
}
</style>
