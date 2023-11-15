import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";

export default {
    component: EndpointListSortableColumn,
    title: "Sortable column",
     tags: ["autodocs"],
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
      default:'Endpoint name',
      unit: '',
    },
  };

  export const WithUnit = {
    args: {
      default:'Throughput',
      unit: '(MSG)',
    },
  };