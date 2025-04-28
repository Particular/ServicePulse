import { SagaMessageDataItem } from "@/stores/SagaDiagramStore";

const standardKeys = ["$type", "Id", "Originator", "OriginalMessageId"];

export const processValues = (stateAfterChange: string): SagaMessageDataItem[] => {
  try {
    const parsed = JSON.parse(stateAfterChange);
    return Object.entries(parsed)
      .filter(([key]) => !standardKeys.includes(key))
      .map(([key, value]) => ({
        key,
        value: value?.toString() ?? "",
      }));
  } catch (error) {
    console.error("Error processing JSON values:", error);
    return [];
  }
};

export const processArray = (stateAfterChange: string): SagaMessageDataItem[] => {
  const trimmed = stateAfterChange.replace(/^\[|\]$/g, "");
  return processValues(trimmed);
};
