import EndpointList from "./EndpointList.vue";
import { vueRouter } from "storybook-vue3-router";
import { useRouter } from "vue-router";

const storyRoutes = [
  {
    path: "/",
    name: "Root",
    component: EndpointList,
  },
  {
    path: "/monitoring",
    name: "monitoring",
    component: EndpointList,
  },
];

export default {
  component: EndpointList,
  title: "Monitoring/EndpointList/Endpoint List",
  tags: ["autodocs"],
  decorators: [vueRouter(storyRoutes)],
  //👇 Our events will be mapped in Storybook UI
  argTypes: {},
  render: (args) => ({
    components: { EndpointList },
    setup() {
      const router = useRouter();

      router.currentRoute.value.fullPath = args.path || "/";
      router.currentRoute.value.query = args.query || {};

      return {
        router, // expose the custom router object to the Vue component
        args,
      };
    },
  }),
};

//stories

export const Default = {
  args: {
    supportsEndpointCount: false,
    hasData: true,
    endpoints: [],
  },
};

export const WithNoData = {
  args: {
    supportsEndpointCount: false,
    hasData: false,
    endpoints: [],
  },
};

export const WithNoConnectivity = {
  args: {
    supportsEndpointCount: false,
    hasData: true,
    endpoints: [],
  },
};

export const WithEndpoints = {
  args: {
    supportsEndpointCount: false,
    hasData: false,
    endpoints: [
      {
        name: "ClientUI",
        isStale: false,
        endpointInstanceIds: ["0314ba0489b592ac2bd9259940a9ead9"],
        metrics: {
          processingTime: {
            average: 0.0,
            points: [],
          },
          criticalTime: {
            average: 0.0,
            points: [],
          },
          retries: {
            average: 0.0,
            points: [],
          },
          throughput: {
            average: 0.0,
            points: [],
          },
          queueLength: {
            average: 0.0,
            points: [
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ],
          },
        },
        disconnectedCount: 0,
        connectedCount: 1,
      },
      {
        name: "Sales",
        isStale: false,
        endpointInstanceIds: ["2a81d6b89d3a3438a1ec98a438343a9a"],
        metrics: {
          processingTime: {
            average: 0.0,
            points: [],
          },
          criticalTime: {
            average: 0.0,
            points: [],
          },
          retries: {
            average: 0.0,
            points: [],
          },
          throughput: {
            average: 0.0,
            points: [],
          },
          queueLength: {
            average: 0.0,
            points: [
              0.0, 0.0, 0.0, 3.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
              1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,
            ],
          },
        },
        disconnectedCount: 0,
        connectedCount: 1,
      },
      {
        name: "Billing",
        isStale: false,
        endpointInstanceIds: ["7ec7a9e3ebecc772a7efc24456d25091"],
        metrics: {
          processingTime: {
            average: 0.0,
            points: [],
          },
          criticalTime: {
            average: 0.0,
            points: [],
          },
          retries: {
            average: 0.0,
            points: [],
          },
          throughput: {
            average: 0.0,
            points: [],
          },
          queueLength: {
            average: 0.0,
            points: [
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ],
          },
        },
        disconnectedCount: 0,
        connectedCount: 1,
      },
      {
        name: "Shipping",
        isStale: false,
        endpointInstanceIds: ["b3cfc6e22903d1e64bc4a82802fcea8b"],
        metrics: {
          processingTime: {
            average: 0.0,
            points: [],
          },
          criticalTime: {
            average: 0.0,
            points: [],
          },
          retries: {
            average: 0.0,
            points: [],
          },
          throughput: {
            average: 0.0,
            points: [],
          },
          queueLength: {
            average: 0.0,
            points: [
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
              0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ],
          },
        },
        disconnectedCount: 0,
        connectedCount: 1,
      },
    ],
  },
};
