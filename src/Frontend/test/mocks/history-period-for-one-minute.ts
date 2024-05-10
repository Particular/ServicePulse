import { Endpoint } from "@/resources/MonitoringEndpoint";

export const historyPeriodForOneMinute: Endpoint[] = [
  {
    name: "A happy endpoint",
    isStale: false,
    errorCount: 411,
    serviceControlId: "voluptatibus",
    isScMonitoringDisconnected: false,
    endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
    metrics: {
      processingTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
      },
      criticalTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
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
        points: [],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
  },
  {
    name: "A.C.Sales",
    isStale: false,
    endpointInstanceIds: ["6b40b6b994899339d03772d23d5c5f19"],
    metrics: {
      processingTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
      },
      criticalTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
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
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        ],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
    errorCount: 0,
    serviceControlId: "",
    isScMonitoringDisconnected: false,
  },
  {
    name: "A.C.ClientUI",
    isStale: false,
    endpointInstanceIds: ["cce2f6add5189ee34de8af0e2cc9da34"],
    metrics: {
      processingTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
      },
      criticalTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
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
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        ],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
    errorCount: 0,
    serviceControlId: "",
    isScMonitoringDisconnected: false,
  },
  {
    name: "A.C.Billing",
    isStale: false,
    endpointInstanceIds: ["af940336eb7c92f0687af81fe94a0673"],
    metrics: {
      processingTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
      },
      criticalTime: {
        average: 0.0,
        points: [],
        timeAxisValues: [],
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
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
        ],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
    errorCount: 0,
    serviceControlId: "",
    isScMonitoringDisconnected: false,
  },
];
