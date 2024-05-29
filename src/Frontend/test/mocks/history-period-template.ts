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
    points.push(value);
  }
  return points;
};

export const generatedProcessingTimePoints = (historyPeriod: number, bottomValueRange: number = 30, topValueRange: number = 80, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

const generatedCriticalTimePoints = (historyPeriod: number, bottomValueRange: number = 135, topValueRange: number = 225, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

const generatedRetriesPoints = (historyPeriod: number, bottomValueRange: number = 0, topValueRange: number = 15, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

const generatedThroughputPoints = (historyPeriod: number, bottomValueRange: number = 1, topValueRange: number = 10, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
};

const generatedQueueLengthPoints = (historyPeriod: number, bottomValueRange: number = 1, topValueRange: number = 15, length: number = 60): number[] => {
  return linearCongruentialGenerator(historyPeriod, bottomValueRange, topValueRange, length);
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
        points: [...generatedQueueLengthPoints(historyPeriod)],
      },
    },
    disconnectedCount: 0,
    connectedCount: 1,
  };
};
