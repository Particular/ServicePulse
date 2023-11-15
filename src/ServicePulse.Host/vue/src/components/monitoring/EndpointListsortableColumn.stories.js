import EndpointListSortableColumn from "./EndpointListSortableColumn.vue";

export default {
  component: EndpointListSortableColumn,
  title: "Sortable Column",
  tags: ["autodocs"],
  //👇 Our events will be mapped in Storybook UI
  argTypes: {},
};

//stories
export const WithoutUnit = {
    args: {      
    },
    render: (args) => ({
      components: {EndpointListSortableColumn},
      setup() {
        //👇 The args will now be passed down to the template
        return { args };
      },
      template: '<endpoint-list-sortable-column v-bind="args">Endpointname</endpoint-list-sortable-column>',
    }),
  };

  export const WithUnit = {
    args: {      
    },
    render: (args) => ({
      components: {EndpointListSortableColumn},
      setup() {
        //👇 The args will now be passed down to the template
        return { args };
      },
      template: '<endpoint-list-sortable-column v-bind="args">Throughput<template #unit>msg</template></endpoint-list-sortable-column>',
    }),
  };