import { Endpoint } from "@/resources/MonitoringEndpoint";

const linearCongruentialGenerator = (seed: number, bottomValueRange: number, topValueRange: number, length: number): number[] => {
  const modulus = 13367; // Prime number (0 < modulus)
  const multiplier = 6863; // Prime number (0 < multiplier < modulus)
  const increment = 12689; // Prime number (0 <= increment < modulus)
  const points: number[] = [];

  for (let i = 1; i < length; i++) {
    seed = (seed * multiplier + increment) % modulus; // Linear congruential generator algorithm
    const normalizeSeed = seed / modulus; // Normalize seed to be in the range 0 <= seed < 1
    const value = bottomValueRange + normalizeSeed * (topValueRange - bottomValueRange); // Normalize seed to be in the range bottomValueRange <= seed < topValueRange
    //points.push(value);
    points.push(+value.toFixed(2));
  }
  return points;
};

export const generatedProcessingTimePoints = (historyPeriod: number, bottomValueRange: number = 30, topValueRange: number = 80, length: number = 60): number[] => {
  //const processingTimePoints = linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
  //console.log("processingTimePoints", processingTimePoints[processingTimePoints.length - 1]);
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

export const generatedCriticalTimePoints = (historyPeriod: number, bottomValueRange: number = 135, topValueRange: number = 225, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

export const generatedRetriesPoints = (historyPeriod: number, bottomValueRange: number = 0, topValueRange: number = 15, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

export const generatedThroughputPoints = (historyPeriod: number, bottomValueRange: number = 1, topValueRange: number = 10, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

export const generatedQueueLengthPoints = (historyPeriod: number, bottomValueRange: number = 1, topValueRange: number = 15, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

const createOneEndpointWithUpdatedMetricsPoints = (queueLength: number | number[], throughput: number | number[], retries: number | number[], processingTime: number | number[], criticalTime: number | number[]): Endpoint => {
  return <Endpoint>{
    name: "Endpoint1",
    isStale: false,
    errorCount: 411,
    serviceControlId: "voluptatibus",
    isScMonitoringDisconnected: false,
    endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
    metrics: {
      queueLength: {
        average: queueLength,
        points: [queueLength],
      },
      throughput: {
        average: throughput,
        points: [throughput],
      },
      retries: {
        average: retries,
        points: [retries],
      },
      processingTime: {
        average: processingTime,
        points: [processingTime],
        timeAxisValues: [],
      },
      criticalTime: {
        average: criticalTime,
        points: [criticalTime],
        timeAxisValues: [],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
  };
};

export const oneEndpointWithSparklineForOneMinute = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(14, 9.28, 13.8, 76, 217)];
};

export const oneEndpointWithSparklineForFiveMinutes = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(2.96, 2.26, 2.1, 36, 147)];
};

export const oneEndpointWithSparklineForTenMinutes = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(10, 6.98, 9.97, 63, 194)];
};

export const oneEndpointWithSparklineForFifteenMinutes = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(3.65, 2.7, 2.84, 39, 152)];
};

export const oneEndpointWithSparklineForThirtyMinutes = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(12, 7.87, 11.45, 68, 203)];
};

export const oneEndpointWithSparklineForSixtyMinutes = (): Endpoint[] => {
  return [createOneEndpointWithUpdatedMetricsPoints(13, 8.37, 11.61, 72, 206)];
};

export const historyPeriodForOneMinute = (): Endpoint[] => {
  return [
    <Endpoint>{
      name: "A happy endpoint",
      isStale: false,
      errorCount: 411,
      serviceControlId: "voluptatibus",
      isScMonitoringDisconnected: false,
      endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
      metrics: {
        processingTime: {
          average: 0.0,
          points: [...generatedProcessingTimePoints(1)],
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
    <Endpoint>{
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          ],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
      errorCount: 0,
      serviceControlId: "",
      isScMonitoringDisconnected: false,
    },
    <Endpoint>{
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          ],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
      errorCount: 0,
      serviceControlId: "",
      isScMonitoringDisconnected: false,
    },
    <Endpoint>{
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
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
};

export const historyPeriodFor = (historyPeriod: number): Endpoint[] => {
  const offset = [1, 2, 3, 4];
  return [
    <Endpoint>{
      name: "Endpoint1",
      isStale: false,
      errorCount: 411,
      serviceControlId: "voluptatibus",
      isScMonitoringDisconnected: false,
      endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
      metrics: {
        processingTime: {
          average: 0.0,
          points: [...generatedProcessingTimePoints(historyPeriod + offset[0])],
          timeAxisValues: [],
        },
        criticalTime: {
          average: 0.0,
          points: [...generatedCriticalTimePoints(historyPeriod + offset[0])],
          timeAxisValues: [],
        },
        retries: {
          average: 0.0,
          points: [...generatedRetriesPoints(historyPeriod + offset[0])],
        },
        throughput: {
          average: 0.0,
          points: [...generatedThroughputPoints(historyPeriod + offset[0])],
        },
        queueLength: {
          average: 0.0,
          points: [...generatedQueueLengthPoints(historyPeriod + offset[0])],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
    },
    <Endpoint>{
      name: "Endpoint2",
      isStale: false,
      endpointInstanceIds: ["6b40b6b994899339d03772d23d5c5f19"],
      metrics: {
        processingTime: {
          average: 0.0,
          points: [...generatedProcessingTimePoints(historyPeriod + offset[1])],
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          ],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
      errorCount: 0,
      serviceControlId: "",
      isScMonitoringDisconnected: false,
    },
    <Endpoint>{
      name: "Endpoint3",
      isStale: false,
      endpointInstanceIds: ["cce2f6add5189ee34de8af0e2cc9da34"],
      metrics: {
        processingTime: {
          average: 0.0,
          points: [...generatedProcessingTimePoints(historyPeriod + offset[2])],
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
          ],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
      errorCount: 0,
      serviceControlId: "",
      isScMonitoringDisconnected: false,
    },
    <Endpoint>{
      name: "Endpoint4",
      isStale: false,
      endpointInstanceIds: ["af940336eb7c92f0687af81fe94a0673"],
      metrics: {
        processingTime: {
          average: 0.0,
          points: [...generatedProcessingTimePoints(historyPeriod + offset[3])],
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
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
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
};

export const oneEndpointWithHistoryPeriodForOneMinute = (): Endpoint[] => {
  return [
    <Endpoint>{
      name: "Endpoint1",
      isStale: false,
      errorCount: 411,
      serviceControlId: "voluptatibus",
      isScMonitoringDisconnected: false,
      endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
      metrics: {
        processingTime: {
          average: 55.2,
          points: [76],
          timeAxisValues: [],
        },
        criticalTime: {
          average: 180,
          points: [217],
          timeAxisValues: [],
        },
        retries: {
          average: 7,
          points: [13.8],
        },
        throughput: {
          average: 5.5,
          points: [9.28],
        },
        queueLength: {
          average: 7,
          points: [14],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
    },
  ];
};

export const oneEndpointWithHistoryPeriodForFiveMinutes = (): Endpoint[] => {
  return [
    <Endpoint>{
      name: "Endpoint1",
      isStale: false,
      errorCount: 411,
      serviceControlId: "voluptatibus",
      isScMonitoringDisconnected: false,
      endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
      metrics: {
        processingTime: {
          average: 55.2,
          points: [71],
          timeAxisValues: [],
        },
        criticalTime: {
          average: 180,
          points: [203],
          timeAxisValues: [],
        },
        retries: {
          average: 7,
          points: [11.8],
        },
        throughput: {
          average: 5.5,
          points: [12.28],
        },
        queueLength: {
          average: 7,
          points: [11],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
    },
  ];
};

export const oneEndpointWithHistoryPeriodForTenMinutes = (): Endpoint[] => {
  return [
    <Endpoint>{
      name: "Endpoint1",
      isStale: false,
      errorCount: 411,
      serviceControlId: "voluptatibus",
      isScMonitoringDisconnected: false,
      endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
      metrics: {
        processingTime: {
          average: 55.2,
          points: [74],
          timeAxisValues: [],
        },
        criticalTime: {
          average: 180,
          points: [207],
          timeAxisValues: [],
        },
        retries: {
          average: 7,
          points: [10.8],
        },
        throughput: {
          average: 5.5,
          points: [9.28],
        },
        queueLength: {
          average: 7,
          points: [8],
        },
      },
      disconnectedCount: 0,
      connectedCount: 1,
    },
  ];
};

export const oneEndpointWithHistoryPeriodFor = (historyPeriod: number): Endpoint => {
  return <Endpoint>{
    name: "Endpoint1",
    isStale: false,
    errorCount: 411,
    serviceControlId: "voluptatibus",
    isScMonitoringDisconnected: false,
    endpointInstanceIds: ["c62841c1e8abe36415eb7ec412cedf58"],
    metrics: {
      processingTime: {
        average: 55.2,
        points: [...generatedProcessingTimePoints(historyPeriod)],
        timeAxisValues: [],
      },
      criticalTime: {
        average: 180,
        points: [...generatedCriticalTimePoints(historyPeriod)],
        timeAxisValues: [],
      },
      retries: {
        average: 7,
        points: [...generatedRetriesPoints(historyPeriod)],
      },
      throughput: {
        average: 5.5,
        points: [...generatedThroughputPoints(historyPeriod)],
      },
      queueLength: {
        average: 7,
        //points: [...generatedQueueLengthPoints(historyPeriod)],
        points: [...generatedQueueLengthPoints(historyPeriod)],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
  };
};
