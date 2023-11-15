import EndpointGraph from "./EndpointGraph.vue";
import { expect } from "@storybook/jest";
export default {
  component: EndpointGraph,
  title: "Monitoring/EndpointList/Graph",
  tags: ["autodocs"],
  //👇 Our events will be mapped in Storybook UI
  argTypes: {},
};

//stories

export const Default = {
  args: {},
};

export const QueueLength = {
  args: {
    type: "queue-length",
  },
  play: async ({ canvasElement }) => {    
    const firstPathstyle = getComputedStyle(canvasElement.getElementsByTagName("path")[0]);
    await expect(firstPathstyle.fill).toBe("rgb(234, 221, 206)");    
  },
};
export const Throughput = {
  args: {
    type: "throughput",
  },
};
export const Retries = {
  args: {
    type: "retries",
  },
};
export const ProcessingTime = {
  args: {
    type: "processing-time",
  },
};
export const CriticalTime = {
  args: {
    type: "critical-time",
  },
};
