<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  id: string;
  value1: string;
  value2: string;
  width: string;
}>();

const model = defineModel<boolean | null>({ required: true });
const emit = defineEmits<{ toggle: [] }>();

const controlCss = computed(() => ({ "--width": props.width }));
const toggleValuesCss = computed(() => ({ "--value1": JSON.stringify(props.value1), "--value2": JSON.stringify(props.value2) }));
</script>

<template>
  <div class="onoffswitch" :style="controlCss">
    <input type="checkbox" :id="`onoffswitch${id}`" :name="`onoffswitch${id}`" class="onoffswitch-checkbox" @click="emit('toggle')" v-model="model" />
    <label class="onoffswitch-label" :for="`onoffswitch${id}`">
      <span class="onoffswitch-inner" :style="toggleValuesCss"></span>
      <span class="onoffswitch-switch"></span>
    </label>
  </div>
</template>

<style scoped>
.onoffswitch {
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  width: var(--width);
  display: flex;
}

.onoffswitch-checkbox {
  display: none;
}

.onoffswitch-label {
  border: 2px solid #929e9e;
  border-radius: 1.5em;
  cursor: pointer;
  display: block;
  overflow: hidden;
}

.onoffswitch-inner {
  display: block;
  margin-left: -100%;
  transition: margin 0.3s ease-in 0s;
  width: 200%;
}

.onoffswitch-inner:before,
.onoffswitch-inner:after {
  box-sizing: border-box;
  color: white;
  display: block;
  float: left;
  font-family: Trebuchet, Arial, sans-serif;
  font-size: 14px;
  font-weight: bold;
  height: 2.15em;
  line-height: 2.15em;
  padding: 0;
  width: 50%;
}

.onoffswitch-inner:before {
  background-color: #00a3c4;
  color: #ffffff;
  content: var(--value2);
  padding-left: 0.8em;
}

.onoffswitch-inner:after {
  background-color: #f2f6f7;
  color: #929e9e;
  content: var(--value1);
  padding-right: 0.8em;
  text-align: right;
}

.onoffswitch-switch {
  background: #ffffff;
  border: 2px solid #929e9e;
  border-radius: 1em;
  bottom: 0;
  display: block;
  margin: 0.42em;
  position: absolute;
  right: calc(100% - 2.5em);
  top: 0;
  transition: all 0.3s ease-in 0s;
  width: 1.6em;
  height: 1.6em;
}

.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
  margin-left: 0;
}

.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
  right: 0;
}
</style>
