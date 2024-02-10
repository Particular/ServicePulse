import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";

export default {
  component: EndpointListSortableColumn,
  title: "Monitoring/EndpointList/Sortable Column",
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div style="position: fixed;top: 0; left: 0; bottom: 0; right: 0;display: flex; alignItems:center; justifyContent:center;"><story/></div>' })],
  render: (args) => ({
    components: { EndpointListSortableColumn },
    setup() {
      return { args };
    },
    template: `
        <EndpointListSortableColumn v-bind="args">
          {{args.default}}
          <template #unit>
            {{args.unit}}
          </template>
        </EndpointListSortableColumn>
      `,
  }),
};

export const WithoutUnit = {
  args: {
    default: "Endpoint name",
    unit: "",
  },
};

export const WithUnit = {
  args: {
    default: "Throughput",
    unit: "(MSG)",
  },
};
