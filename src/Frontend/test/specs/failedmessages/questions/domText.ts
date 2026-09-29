export function normalise(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function labelledValue(spans: string[], label: string): string {
  const span = spans.find((candidate) => candidate.startsWith(label));
  return span ? normalise(span.slice(label.length)) : "";
}

export function isBold(element: HTMLElement | null): boolean {
  if (!element) {
    return false;
  }
  const fontWeight = getComputedStyle(element).fontWeight;
  const numericWeight = Number.parseInt(fontWeight, 10);
  return fontWeight === "bold" || fontWeight === "bolder" || (!Number.isNaN(numericWeight) && numericWeight >= 600);
}
