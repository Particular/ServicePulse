<script setup>
import { onMounted, ref } from "vue";
import { useFetchFromServiceControl } from "../../composables/serviceServiceControlUrls";
import moment from "moment";
import { VueFlow, useVueFlow, MarkerType } from "@vue-flow/core";

const props = defineProps({
  conversationId: String,
  messageId: String,
});

function getConversation(conversationId) {
  return useFetchFromServiceControl(`conversations/${conversationId}`).then(function (response) {
    return response.json();
  });
}

function mapMessage(message) {
  let parentId = "",
    parentEndpoint = "",
    sagaName = "";
  let header = message.headers.find((header) => header.key === "NServiceBus.RelatedTo");
  if (header) {
    parentId = header.value;
    parentEndpoint = message.headers.find((h) => h.key === "NServiceBus.OriginatingEndpoint")?.value;
  }

  let sagaHeader = message.headers.find((header) => header.key === "NServiceBus.OriginatingSagaType");
  if (sagaHeader) {
    sagaName = sagaHeader.value.split(", ")[0];
  }

  return {
    nodeName: message.message_type,
    id: message.id,
    messageId: message.message_id,
    sendingEndpoint: message.sending_endpoint?.name,
    receivingEndpoint: message.receiving_endpoint?.name,
    parentId,
    parentEndpoint,
    type: message.headers.findIndex((header) => header.key === "NServiceBus.DeliverAt") > -1 ? "Timeout message" : message.headers.find((header) => header.key === "NServiceBus.MessageIntent").value === "Publish" ? "Event message" : "Command message",
    isError:
      message.headers.findIndex(function (x) {
        return x.key === "NServiceBus.ExceptionInfo.ExceptionType";
      }) > -1,
    sagaName,
    link: {
      name: `Link ${message.id}`,
      nodeName: message.id,
    },
    timeSent: new Date(message.time_sent),
  };
}

function constructNodes(mappedMessages) {
  return (
    mappedMessages
      //group by level
      .reduce((groups, message) => {
        groups[message.level] = [...(groups[message.level] ?? []), message];
        return groups;
      }, [])
      //ensure each level has their items in the same "grouped" order as the level above
      .map((group, level, messagesByLevel) => {
        const previousLevel = level > 0 ? messagesByLevel[level - 1] : null;
        return group.sort(
          (a, b) =>
            (previousLevel?.findIndex((plMessage) => a.parentId === plMessage.messageId && a.parentEndpoint === plMessage.receivingEndpoint) ?? 1) -
            (previousLevel?.findIndex((plMessage) => b.parentId === plMessage.messageId && b.parentEndpoint === plMessage.receivingEndpoint) ?? 1)
        );
      })
      //flatten to actual flow diagram nodes, with positioning based on parent node/level
      .flatMap((group, level, messagesByLevel) => {
        const previousLevel = level > 0 ? messagesByLevel[level - 1] : null;
        return group.reduce(
          ({ result, currentWidth }, message) => {
            //TODO: this prefix space isn't giving what I want
            // i.e.
            //          node1
            //    node11      node12
            //           node121    node122   //works for this level
            //    node1211           node1221 //doesn't work for this level: we want these nodes directly under their parents
            //              node12211         //also doesn't work for this level: we want this node directly under node1221
            //    node122111                  //even worse
            //TODO investigate https://vueflow.dev/typedocs/interfaces/Node.html#parentnode, does this help us?
            const prefixSpace =
              previousLevel == null
                ? 0
                : (() => {
                    let width = 0;
                    for (const plMessage of previousLevel) {
                      if (message.parentId === plMessage.messageId && message.parentEndpoint === plMessage.receivingEndpoint) return width * 300;
                      width += plMessage.width;
                    }
                  })();
            return {
              result: [
                ...result,
                {
                  id: `${message.messageId}##${message.receivingEndpoint}`,
                  type: "message",
                  data: message,
                  label: message.nodeName,
                  position: { x: prefixSpace + (currentWidth + message.width / 2) * 300, y: message.level * 200 },
                },
              ],
              currentWidth: currentWidth + message.width,
            };
          },
          { result: [], currentWidth: 0 }
        ).result;
      })
  );
}

function constructEdges(mappedMessages) {
  return mappedMessages
    .filter((message) => message.parentId)
    .map((message) => ({
      id: `${message.parentId}##${message.messageId}`,
      source: `${message.parentId}##${message.parentEndpoint}`,
      target: `${message.messageId}##${message.receivingEndpoint}`,
      markerEnd: MarkerType.ArrowClosed,
      style: {
        "stroke-dasharray": message.type === "Event message" && "5, 3",
      },
    }));
}

const elements = ref([]);
const { onPaneReady, fitView } = useVueFlow();

onMounted(async () => {
  const messages = await getConversation(props.conversationId);
  const mappedMessages = messages.map(mapMessage);

  const assignDescendantLevelsAndWidth = (message, level = 0) => {
    message.level = level;
    const children = mappedMessages.filter((mm) => mm.parentId === message.messageId && mm.parentEndpoint === message.receivingEndpoint);
    message.width =
      children.length === 0
        ? 1 //leaf node
        : children.map((child) => (child.width == null ? assignDescendantLevelsAndWidth(child, level + 1) : child)).reduce((sum, { width }) => sum + width, 0);
    return message;
  };
  for (const root of mappedMessages.filter((message) => !message.parentId)) assignDescendantLevelsAndWidth(root);

  elements.value = [...constructNodes(mappedMessages), ...constructEdges(mappedMessages)];
  //TODO: if doing fitView on next Vue onUpdated() then it doesn't appear the elements
  // are actually drawn yet. See if we can determine a better event to use this on rather than relying on setTimeout
  setTimeout(() => fitView(), 50);
});

onPaneReady(({ fitView }) => {
  fitView();
});

function typeIcon(type) {
  //TODO can this be done without the type magic strings?
  switch (type) {
    case "Timeout message":
      return "pa-flow-timeout";
    case "Event message":
      return "pa-flow-event";
    default:
      return "pa-flow-command";
  }
}
</script>

<template>
  <div id="tree-container">
    <VueFlow v-model="elements" :min-zoom="0.1">
      <template #node-message="nodeProps">
        <div class="node" :class="[nodeProps.data.type, nodeProps.data.isError && 'error', nodeProps.data.id === props.messageId && 'current-message']">
          <div class="node-text wordwrap">
            <i v-if="nodeProps.data.isError" class="fa pa-flow-failed" />
            <i class="fa" :class="typeIcon(nodeProps.data.type)" :title="nodeProps.data.type" />
            <div class="lead righ-side-ellipsis" :title="nodeProps.data.nodeName">
              <!-- TODO (d.data.isError ? "<a onclick='__routerReferenceForDynamicAnchorTags.push( { path: \"/failed-messages/message/" + d.data.id + "\" })' href='javascript:void(0)'>" + d.data.nodeName + "</a>" : d.data.nodeName) + -->
              <strong>{{ nodeProps.data.nodeName }}</strong>
            </div>
            <span class="time-sent">
              <span class="time-since">{{ moment.utc(nodeProps.data.timeSent).fromNow() }}</span>
            </span>
            <template v-if="nodeProps.data.sagaName">
              <i class="fa pa-flow-saga" />
              <div class="saga lead righ-side-ellipsis" :title="nodeProps.data.sagaName">{{ nodeProps.data.sagaName }}</div>
            </template>
          </div>
        </div>
      </template>
    </VueFlow>
  </div>
</template>

<style>
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";

#tree-container {
  width: 90vw;
  height: 60vh;
}

.node {
  --vf-handle: var(--vf-node-color, #1a192b);
  --vf-box-shadow: var(--vf-node-color, #1a192b);
  background: var(--vf-node-bg);
  border-color: var(--vf-node-color, #1a192b);
  padding: 10px;
  border-radius: 3px;
  font-size: 12px;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  color: var(--vf-node-text);
  text-align: left;
}

.righ-side-ellipsis {
  direction: rtl;
  text-align: left;
}

.node {
  background-color: #fff;
  border-color: #cccbcc;
  border-width: 3px;
}

.node .error {
  border-color: red;
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

.error .node-text .lead,
.current-message.error .node-text .lead {
  width: 184px;
}

.node-text .lead.saga {
  font-weight: normal;
  width: 182px;
}

.current-message.error {
  border-color: #be514a;
  background-color: #be514a !important;
}

.current-message.error .node-text,
.current-message .node-text .lead {
  color: #fff !important;
}

.error .node-text i:not(.pa-flow-saga) {
  filter: brightness(0) saturate(100%) invert(46%) sepia(9%) saturate(4493%) hue-rotate(317deg) brightness(81%) contrast(82%);
}

.current-message.error .node-text i {
  color: #fff;
  filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7475%) hue-rotate(21deg) brightness(100%) contrast(106%);
}

.current-message.error .node-text strong {
  color: #fff;
}

.current-message.error .node-text .time-sent .time-since {
  color: #ffcecb !important;
}

.error {
  border-color: #be514a;
}

.current-message.error .node-text a {
  color: #fff;
}

.current-message.error .node-text a:hover {
  cursor: text;
  text-decoration: none;
}

.error .node-text a {
  color: #be514a;
}

.error .node-text .time-sent .time-since {
  color: #be514a;
}

.error .node-text .lead.saga {
  color: #be514a;
}

.error .node-text a:hover {
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
