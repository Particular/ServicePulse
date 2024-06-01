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
    points.push(+value.toFixed(2));
  }
  return points;
};

export const generatedProcessingTimePoints = (historyPeriod: number, bottomValueRange: number = 30, topValueRange: number = 80, length: number = 60): number[] => {
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

export const oneEndpointWithMetricsPoints = (queueLength: number | number[], throughput: number | number[], retries: number | number[], processingTime: number | number[], criticalTime: number | number[]): Endpoint[] => {
  return [
    <Endpoint>{
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
    },
  ];
};
