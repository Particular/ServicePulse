import MonitoringHistoryPeriod from "./MonitoringHistoryPeriod.vue";
import { vueRouter } from "storybook-vue3-router";
import { useRouter } from "vue-router";
import { useCookies } from "vue3-cookies";

const cookies = useCookies().cookies;

const storyRoutes = [
  {
    path: "/",
    name: "Root",
    component: MonitoringHistoryPeriod,
  },
  {
    path: "/monitoring",
    name: "monitoring",
    component: MonitoringHistoryPeriod,
  },
];

export default {
  component: MonitoringHistoryPeriod,
  title: "Monitoring/Filtering/HistoryPeriod",
  tags: ["autodocs"],
  decorators: [vueRouter(storyRoutes)],
  argTypes: {
    cookie: {
      description: "This object sets a boolean value to determine if a cookie should be removed or if a cookie value should set, and provides the cookie value",
    },
    path: {
      description: "Sets the fullPath property of the custom router object that is exposed to the Vue component that is used to get the route object from vue-route().",
    },
    query: {
      description: "This is the query object that represents the the 'history_period' query string in the path and is set to the query property of the custom router object that is exposed to the Vue component ",
    },
    "period-selected": {
      action: "period-selected",
      table: {
        type: {
          summary: "object",
        },
      },
      description: "This is the period object that has been selected or the default period when initializing the component",
    },
  },
  render: (args) => ({
    components: { MonitoringHistoryPeriod },
    setup() {
      if (args.cookie.set) {
        cookies.set(`history_period`, args.cookie.cVal);
      } else {
        cookies.remove(`history_period`);
      }

      const router = useRouter();

      router.currentRoute.value.fullPath = args.path || "/";
      router.currentRoute.value.query = args.query || {};

      return {
        router, // expose the custom router object to the Vue component
        args,
      };
    },
    template: `<MonitoringHistoryPeriod v-bind="args" @period-selected="args['period-selected']" />`,
  }),
};

export const NoCookieNoQueryString = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring",
    query: {},
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the default history period if there are no cookies saved or no 'history_period' query string in the url",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod1 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=1",
    query: {
      historyPeriod: 1,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 1",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod5 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=5",
    query: {
      historyPeriod: 5,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 5",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod10 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=10",
    query: {
      historyPeriod: 10,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 10",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod15 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=15",
    query: {
      historyPeriod: 15,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 15",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod30 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=30",
    query: {
      historyPeriod: 30,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 30",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod60 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=60",
    query: {
      historyPeriod: 60,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved, but the 'history_period' query string is set to 60",
      },
    },
  },
};

export const CookieSetTo10NoQueryString = {
  args: {
    cookie: { set: true, cVal: 10 },
    path: "/monitoring",
    query: {},
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there is a cookie saved with 'history_period' set to 10, but the 'history_period' query string is not set",
      },
    },
  },
};

export const CookieSetTo10QueryHistoryPeriod60 = {
  args: {
    cookie: { set: true, cVal: 10 },
    path: "/monitoring?historyPeriod=60",
    query: {
      historyPeriod: 60,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there is a cookie saved with 'history_period' set to 10, but the 'history_period' query string is set to 60",
      },
    },
  },
};

export const CookieSetTo10QueryHistoryPeriod45 = {
  args: {
    cookie: { set: true, cVal: 10 },
    path: "/monitoring?historyPeriod=45",
    query: {
      historyPeriod: 45,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there is a cookie saved with 'history_period' set to 10, but the 'history_period' query string is set incorrectly to 45",
      },
    },
  },
};

export const NoCookieQueryHistoryPeriod45 = {
  args: {
    cookie: { set: false, cVal: undefined },
    path: "/monitoring?historyPeriod=45",
    query: {
      historyPeriod: 45,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "This story shows the selected history period if there are no cookies saved and the 'history_period' query string is set incorrectly to 45",
      },
    },
  },
};
