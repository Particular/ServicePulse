import D3Graph from "./D3Graph.vue";
/*import { expect } from "@storybook/jest";*/
export default {
  component: D3Graph,
  title: "Monitoring/EndpointList/D3Graph",
  tags: ["autodocs"],
  //👇 Our events will be mapped in Storybook UI
  argTypes: {},
};

//stories

export const QueueLength = {
  args: {
    plotdata: {
      average: 2.3,
      points: [0.0, 4.0, 0.0, 3.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 6.0, 1.0, 1.0, 1.0, 1.0, 1.0, 5.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    },
    minimumyaxis: 10,
    avglabelcolor: "#EA7E00",
    isdurationgraph: false,
    metricsuffix: "MSGS",
    type: "queue-length",
  },
};

export const Throughput = {
  args: {
    plotdata: {
      average: 1.5,
      points: [0.0, 0.0, 0.0, 3.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    },
    minimumyaxis: 10,
    avglabelcolor: "#176397",
    isdurationgraph: false,
    metricsuffix: "MSGS/S",
    type: "throughput",
  },
};

export const Retries = {
  args: {
    plotdata: {
      average: 1.5,
      points: [0.0, 0.0, 0.0, 3.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    },
    minimumyaxis: 10,
    avglabelcolor: "#CC1252",
    isdurationgraph: false,
    metricsuffix: "MSGS/S",
    type: "retries",
  },
};

export const ProcessingTime = {
  args: {
    plotdata: {
      average: 300.55,
      points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      timeAxisValues: [
        "2023-11-21T06:08:00Z",
        "2023-11-21T06:08:05Z",
        "2023-11-21T06:08:10Z",
        "2023-11-21T06:08:15Z",
        "2023-11-21T06:08:20Z",
        "2023-11-21T06:08:25Z",
        "2023-11-21T06:08:30Z",
        "2023-11-21T06:08:35Z",
        "2023-11-21T06:08:40Z",
        "2023-11-21T06:08:45Z",
        "2023-11-21T06:08:50Z",
        "2023-11-21T06:08:55Z",
        "2023-11-21T06:09:00Z",
        "2023-11-21T06:09:05Z",
        "2023-11-21T06:09:10Z",
        "2023-11-21T06:09:15Z",
        "2023-11-21T06:09:20Z",
        "2023-11-21T06:09:25Z",
        "2023-11-21T06:09:30Z",
        "2023-11-21T06:09:35Z",
        "2023-11-21T06:09:40Z",
        "2023-11-21T06:09:45Z",
        "2023-11-21T06:09:50Z",
        "2023-11-21T06:09:55Z",
        "2023-11-21T06:10:00Z",
        "2023-11-21T06:10:05Z",
        "2023-11-21T06:10:10Z",
        "2023-11-21T06:10:15Z",
        "2023-11-21T06:10:20Z",
        "2023-11-21T06:10:25Z",
        "2023-11-21T06:10:30Z",
        "2023-11-21T06:10:35Z",
        "2023-11-21T06:10:40Z",
        "2023-11-21T06:10:45Z",
        "2023-11-21T06:10:50Z",
        "2023-11-21T06:10:55Z",
        "2023-11-21T06:11:00Z",
        "2023-11-21T06:11:05Z",
        "2023-11-21T06:11:10Z",
        "2023-11-21T06:11:15Z",
        "2023-11-21T06:11:20Z",
        "2023-11-21T06:11:25Z",
        "2023-11-21T06:11:30Z",
        "2023-11-21T06:11:35Z",
        "2023-11-21T06:11:40Z",
        "2023-11-21T06:11:45Z",
        "2023-11-21T06:11:50Z",
        "2023-11-21T06:11:55Z",
        "2023-11-21T06:12:00Z",
        "2023-11-21T06:12:05Z",
        "2023-11-21T06:12:10Z",
        "2023-11-21T06:12:15Z",
        "2023-11-21T06:12:20Z",
        "2023-11-21T06:12:25Z",
        "2023-11-21T06:12:30Z",
        "2023-11-21T06:12:35Z",
        "2023-11-21T06:12:40Z",
        "2023-11-21T06:12:45Z",
        "2023-11-21T06:12:50Z",
        "2023-11-21T06:12:55Z",
      ],
    },
    minimumyaxis: 10,
    avglabelcolor: "#258135",
    isdurationgraph: true,
    type: "processing-time",
  },
};

export const CriticalTime = {
  args: {
    plotdata: {
      average: 300.55,
      points: [10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 600, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      timeAxisValues: [
        "2023-11-21T06:08:00Z",
        "2023-11-21T06:08:05Z",
        "2023-11-21T06:08:10Z",
        "2023-11-21T06:08:15Z",
        "2023-11-21T06:08:20Z",
        "2023-11-21T06:08:25Z",
        "2023-11-21T06:08:30Z",
        "2023-11-21T06:08:35Z",
        "2023-11-21T06:08:40Z",
        "2023-11-21T06:08:45Z",
        "2023-11-21T06:08:50Z",
        "2023-11-21T06:08:55Z",
        "2023-11-21T06:09:00Z",
        "2023-11-21T06:09:05Z",
        "2023-11-21T06:09:10Z",
        "2023-11-21T06:09:15Z",
        "2023-11-21T06:09:20Z",
        "2023-11-21T06:09:25Z",
        "2023-11-21T06:09:30Z",
        "2023-11-21T06:09:35Z",
        "2023-11-21T06:09:40Z",
        "2023-11-21T06:09:45Z",
        "2023-11-21T06:09:50Z",
        "2023-11-21T06:09:55Z",
        "2023-11-21T06:10:00Z",
        "2023-11-21T06:10:05Z",
        "2023-11-21T06:10:10Z",
        "2023-11-21T06:10:15Z",
        "2023-11-21T06:10:20Z",
        "2023-11-21T06:10:25Z",
        "2023-11-21T06:10:30Z",
        "2023-11-21T06:10:35Z",
        "2023-11-21T06:10:40Z",
        "2023-11-21T06:10:45Z",
        "2023-11-21T06:10:50Z",
        "2023-11-21T06:10:55Z",
        "2023-11-21T06:11:00Z",
        "2023-11-21T06:11:05Z",
        "2023-11-21T06:11:10Z",
        "2023-11-21T06:11:15Z",
        "2023-11-21T06:11:20Z",
        "2023-11-21T06:11:25Z",
        "2023-11-21T06:11:30Z",
        "2023-11-21T06:11:35Z",
        "2023-11-21T06:11:40Z",
        "2023-11-21T06:11:45Z",
        "2023-11-21T06:11:50Z",
        "2023-11-21T06:11:55Z",
        "2023-11-21T06:12:00Z",
        "2023-11-21T06:12:05Z",
        "2023-11-21T06:12:10Z",
        "2023-11-21T06:12:15Z",
        "2023-11-21T06:12:20Z",
        "2023-11-21T06:12:25Z",
        "2023-11-21T06:12:30Z",
        "2023-11-21T06:12:35Z",
        "2023-11-21T06:12:40Z",
        "2023-11-21T06:12:45Z",
        "2023-11-21T06:12:50Z",
        "2023-11-21T06:12:55Z",
      ],
    },
    minimumyaxis: 10,
    avglabelcolor: "#2700CB",
    isdurationgraph: true,
    type: "critical-time",
  },
};

export const NoDataPoints = {
  args: {
    plotdata: {
      average: 0.0,
      points: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    minimumyaxis: 10,
    avglabelcolor: "#EA7E00",
    isdurationgraph: false,
    metricsuffix: "MSGS",
    type: "queue-length",
  },
};
