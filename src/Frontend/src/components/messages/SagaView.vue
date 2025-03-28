<script setup lang="ts">
import Message from "@/resources/Message";
import { SagaHistory } from "@/resources/SagaHistory";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    message: Message;
    sagaHistory?: SagaHistory;
  }>(),
  { sagaHistory: undefined }
);

const participatedInSaga = computed(() => (props.message?.invoked_sagas ?? []).length > 0);
const hasSagaData = computed(() => (props.sagaHistory?.changes?.length ?? 0) > 0);
const showNoPluginActiveLeged = computed(() => participatedInSaga.value === true && hasSagaData.value === false);
</script>

<template>
  <div v-if="participatedInSaga == false">
    <span role="status" aria-label="message-not-involved-in-saga">No Saga Data Available</span>
  </div>
  <div v-if="showNoPluginActiveLeged">
    <span role="status" aria-label="saga-plugin-needed">To visualize your saga, please install the appropriate nuget package in your endpoint. Saga audit plugin needed to visualize saga</span>
  </div>
  <div v-if="hasSagaData" role="list" aria-label="saga-sequence-list">
    <div class="header">
      <div>Saga</div>
      <btn aria-label="message-not-involved-in-saga">Show Message Data</btn>
    </div>
    <div class="body">
      <div class="container">
        <div class="block">
          <div class="row row--center">
            <div class="cell cell--center">
              <a href="">Back to Message View</a>
              <h1 class="main-title">AuditingSaga</h1>
              <div><b>guid</b> 85bbb156-431b-73ff-ef32-83e8df9ed051</div>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="row">
            <div class="cell cell--side cell--left">
              <div class="box-lines-side">
                <h2 class="message-title">SagaMessage1</h2>
                <div class="timestamp">17/3/2025 21:17:15</div>
              </div>
            </div>
            <div class="cell cell--center cell--bottom-border">
              <h2 class="saga-status saga-status--inline">Saga Initiated</h2>
              <div class="timestamp timestamp--inline">17/3/2025 21:17:15</div>
            </div>
          </div>
          <div class="row row--center">
            <div class="cell cell--center cell--no-padding">
              <div class="box-lines-center">
                <div class="properties"><a class="properties-link" href="">All Properties</a> / <a class="properties-link properties-link--active" href="">Updated Properties</a></div>
                <a class="timeout-status" href="">Timeout Requested = 2s</a>
              </div>
            </div>
          </div>
          <div class="row row--right">
            <div class="cell cell--center cell--no-padding cell--top-border">
              <div class="box-lines-top"></div>
            </div>
            <div class="cell cell--side">
              <div class="box-lines-right"></div>
              <div class="box-lines-side box-lines-side--active">
                <h2 class="message-title">MyCustomTimeout</h2>
                <div class="timestamp">17/3/2025 21:17:15</div>
              </div>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="row">
            <div class="cell cell--side cell--left">
              <div class="box-lines-side">
                <h2 class="message-title">SagaMessage2</h2>
                <div class="timestamp">17/3/2025 21:17:16</div>
              </div>
            </div>
            <div class="cell cell--center cell--bottom-border">
              <h2 class="saga-status saga-status--inline">Saga Updated</h2>
              <div class="timestamp timestamp--inline">17/3/2025 21:17:16</div>
            </div>
          </div>
          <div class="row row--center">
            <div class="cell cell--center cell--no-padding">
              <div class="box-lines-center">
                <div class="properties"><a class="properties-link" href="">All Properties</a> / <a class="properties-link properties-link--active" href="">Updated Properties</a></div>
                <a class="timeout-status" href="">Timeout Requested = 2s</a>
              </div>
            </div>
          </div>
          <div class="row row--right">
            <div class="cell cell--center cell--no-padding cell--top-border">
              <div class="box-lines-top"></div>
            </div>
            <div class="cell cell--side">
              <div class="box-lines-right"></div>
              <div class="box-lines-side">
                <h2 class="message-title">MyCustomTimeout</h2>
                <div class="timestamp">17/3/2025 21:17:16</div>
              </div>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="row">
            <div class="cell cell--side cell--left">
              <div class="box-lines-side box-lines-side--active">
                <h2 class="message-title">MyCustomTimeout</h2>
                <div class="timestamp">17/3/2025 21:17:15</div>
              </div>
            </div>
            <div class="cell cell--center cell--bottom-border">
              <a class="timeout-status" href="">Timeout Invoked</a>
              <h2 class="saga-status saga-status--inline">Saga Updated</h2>
              <div class="timestamp timestamp--inline">17/3/2025 21:17:17</div>
            </div>
          </div>
          <div class="row row--center">
            <div class="cell cell--center">
              <div class="properties"><a class="properties-link" href="">All Properties</a> / <a class="properties-link properties-link--active" href="">Updated Properties</a></div>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="row">
            <div class="cell cell--side cell--left">
              <div class="box-lines-side">
                <h2 class="message-title">MyCustomTimeout</h2>
                <div class="timestamp">17/3/2025 21:17:16</div>
              </div>
            </div>
            <div class="cell cell--center cell--bottom-border">
              <a class="timeout-status" href="">Timeout Invoked</a>
              <h2 class="saga-status saga-status--inline">Saga Updated</h2>
              <div class="timestamp timestamp--inline">17/3/2025 21:17:18</div>
            </div>
          </div>
          <div class="row row--center">
            <div class="cell cell--center">
              <div class="properties"><a class="properties-link" href="">All Properties</a> / <a class="properties-link properties-link--active" href="">Updated Properties</a></div>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="row row--center">
            <div class="cell cell--center cell--inverted">
              <h2 class="saga-status">Saga Completed</h2>
              <div class="timestamp">17/3/2025 21:17:18</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout styles */
.header {
  padding: 0.25rem;
  border-bottom: solid 2px #ddd;
}
.body {
  display: flex;
  justify-content: center;
}
.container {
  padding: 0.25rem;
  /* background-color: aquamarine; */
  /* width: 66.6667%; */
}
.block {
  /* border: solid 1px orange; */
}
.row {
  display: flex;
  align-items: flex-end;
  /* background-color: pink; */
  /* border: solid 1px #e6e6e6; */
}
.row--center {
  justify-content: center;
}
.row--right {
  justify-content: right;
}
.cell {
  padding: 0.5rem;
}
.cell--side {
  width: 25%;
  padding: 0;
  /* background-color: lightblue; */
}
.cell--left {
  border-bottom: solid 2px #000000;
}
.cell--center {
  width: 50%;
  background-color: lightgray;
  border: 0;
}
.cell--inverted {
  background-color: #333333;
  color: #ffffff;
}
.cell--no-padding {
  padding: 0;
}
.cell--bottom-border {
  border-bottom: solid 2px #000000;
}
.cell--top-border {
  align-self: flex-start;
}
.box-lines-top {
  border-top: solid 2px #000000;
  margin-left: 1rem;
}
.box-lines-center {
  padding: 0.5rem;
  border-left: solid 2px #000000;
  margin-left: 1rem;
}
.box-lines-side {
  padding: 0.25rem 0.25rem 0;
  border: solid 2px #aaaaaa;
  background-color: #aaaaaa;
}
.box-lines-side--active {
  border: solid 2px #000000;
}
.box-lines-right {
  position: relative;
  min-height: 2.5rem;
  border: solid 2px #000000;
  border-left: 0;
  border-bottom: 0;
  margin-right: 50%;
}
.box-lines-right:after {
  position: absolute;
  display: block;
  content: "";
  border: solid 6px #000000;
  border-top-width: 10px;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom: 0;
  bottom: 0;
  margin-left: 100%;
  left: -5px;
}

/* Content styles */

/* * {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
} */

.main-title {
  margin: 0.3rem 0;
  padding-bottom: 0.5rem;
  border-bottom: solid 2px #00a3c4;
  font-size: 1.5rem;
}
.saga-status {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
}
.cell--inverted .saga-status {
  font-size: 0.9rem;
}
.saga-status--inline {
  display: inline-block;
}
.message-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 900;
}
.timestamp {
  font-size: 0.9rem;
}
.timestamp--inline {
  display: inline-block;
  margin-left: 0.5rem;
  font-size: 0.8rem;
}
.properties {
  font-size: 0.5rem;
  text-transform: uppercase;
}
.properties-link {
  padding: 0.2rem;
  text-decoration: underline;
}
.properties-link--active {
  font-weight: 900;
  color: #000000;
}
.timeout-status {
  display: block;
  margin-top: 0.7rem;
  font-size: 1rem;
  font-weight: 900;
}
</style>
