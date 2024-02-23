<script setup>
import { computed, onMounted, provide, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const state = reactive({
  tabs: [],
});

const activeTab = computed({
  get() {
    return route?.query?.tab ?? state.tabs[0].id;
  },
  set(newValue) {
    router.replace({ query: { ...route.query, tab: newValue } });
  },
});

function selectTab(tabId) {
  activeTab.value = tabId;
}

function addTab(tabId, header) {
  state.tabs.push({ id: tabId, header });
}

function updateTab(tabId, header) {
  state.tabs.find((t) => t.id === tabId).header = header;
}

provide("addTab", addTab);
provide("updateTab", updateTab);
provide("activeTab", activeTab);

onMounted(() => {
  selectTab(state.tabs[0].id);
});
</script>

<template>
  <div class="tabs">
    <h5 v-for="tab in state.tabs" :key="tab.id" :class="{ active: tab.id === activeTab }">
      <a @click.prevent="selectTab(tab.id)" class="cursorpointer ng-binding" v-html="tab.header" />
    </h5>
  </div>
  <slot />
</template>
