import Message, { MessageStatus, MessageIntent } from "@/resources/Message";
import { NServiceBusHeaders } from "@/resources/Header";
import { formatTypeName, dotNetTimespanToMilliseconds } from "@/composables/formatUtils";
import dayjs from "@/utils/dayjs";

export interface TimelineBar {
  id: string;
  messageId: string;
  typeName: string;
  fullTypeName: string;
  endpointName: string;
  /** When the message was sent (time_sent) */
  sentMs: number;
  /** When processing started (processed_at - processing_time) */
  processingStartMs: number;
  /** When processing completed (processed_at) */
  processedAtMs: number;
  /** Delivery time: network transit + queue wait (sentMs → processingStartMs) */
  deliveryMs: number;
  /** Handler execution time */
  processingMs: number;
  /** Critical time: full lifecycle (sentMs → processedAtMs) */
  criticalMs: number;
  isFailed: boolean;
  isSelected: boolean;
  intent: MessageIntent;
  /** message_id of the message whose handler sent this one */
  relatedToMessageId?: string;
}

export interface TimelineRow {
  barId: string;
  typeName: string;
  endpointName: string;
  rowIndex: number;
  depth: number;
  /** Whether this row is the last child of its parent */
  isLastChild: boolean;
  /** For each ancestor depth 0..depth-2: true if a vertical pass-through line should be drawn (ancestor is not last child) */
  continuations: boolean[];
}

export interface TimelineModel {
  bars: TimelineBar[];
  rows: TimelineRow[];
  minTime: number;
  maxTime: number;
}

export interface TimeTick {
  timeMs: number;
  label: string;
  /** Second line for wall clock ticks (time portion) */
  label2?: string;
}

export const ROW_HEIGHT = 40;
export const ROW_PADDING = 8;
export const BAR_HEIGHT = 24;
export const MIN_LABEL_WIDTH = 120;
export const AXIS_HEIGHT = 30;
export const BOTTOM_AXIS_HEIGHT = 40;
export const MIN_BAR_WIDTH = 4;
export const CHART_PADDING = 20;
export const DELIVERY_LINE_HEIGHT = 2;

export function createTimelineModel(messages: Message[], selectedId?: string): TimelineModel {
  const bars: TimelineBar[] = [];

  for (const message of messages) {
    const endpointName = message.receiving_endpoint?.name;
    if (!endpointName) continue;

    const sentMs = new Date(message.time_sent).getTime();
    const processedAtMs = new Date(message.processed_at).getTime();
    const processingMs = dotNetTimespanToMilliseconds(message.processing_time);
    const processingStartMs = processedAtMs - processingMs;
    const deliveryMs = processingStartMs - sentMs;
    const criticalMs = processedAtMs - sentMs;

    const isFailed = message.status === MessageStatus.Failed || message.status === MessageStatus.RepeatedFailure || message.status === MessageStatus.ArchivedFailure;
    const relatedToMessageId = message.headers?.find((h) => h.key === NServiceBusHeaders.RelatedTo)?.value;

    bars.push({
      id: message.id,
      messageId: message.message_id,
      typeName: formatTypeName(message.message_type),
      fullTypeName: message.message_type,
      endpointName,
      sentMs,
      processingStartMs,
      processedAtMs,
      deliveryMs,
      processingMs,
      criticalMs,
      isFailed,
      isSelected: message.id === selectedId,
      intent: message.message_intent,
      relatedToMessageId,
    });
  }

  // Build tree: parent messageId → children (sorted by sentMs)
  const barsByMessageId = new Map(bars.map((b) => [b.messageId, b]));
  const childrenOf = new Map<string, TimelineBar[]>();
  const roots: TimelineBar[] = [];

  for (const bar of bars) {
    if (bar.relatedToMessageId && barsByMessageId.has(bar.relatedToMessageId)) {
      const siblings = childrenOf.get(bar.relatedToMessageId) ?? [];
      siblings.push(bar);
      childrenOf.set(bar.relatedToMessageId, siblings);
    } else {
      roots.push(bar);
    }
  }

  // Sort roots and each child group by sentMs
  roots.sort((a, b) => a.sentMs - b.sentMs);
  for (const children of childrenOf.values()) {
    children.sort((a, b) => a.sentMs - b.sentMs);
  }

  // DFS to build rows with tree guide data
  const rows: TimelineRow[] = [];
  function traverse(bar: TimelineBar, depth: number, continuations: boolean[], isLast: boolean) {
    rows.push({ barId: bar.id, typeName: bar.typeName, endpointName: bar.endpointName, rowIndex: rows.length, depth, isLastChild: isLast, continuations: [...continuations] });
    const children = childrenOf.get(bar.messageId) ?? [];
    const nextContinuations = [...continuations, !isLast];
    for (let i = 0; i < children.length; i++) {
      traverse(children[i], depth + 1, nextContinuations, i === children.length - 1);
    }
  }
  for (let i = 0; i < roots.length; i++) {
    traverse(roots[i], 0, [], i === roots.length - 1);
  }

  const allTimes = bars.flatMap((b) => [b.sentMs, b.processedAtMs]);
  const minTime = allTimes.length ? Math.min(...allTimes) : 0;
  const maxTime = allTimes.length ? Math.max(...allTimes) : 0;

  return { bars, rows, minTime, maxTime };
}

export function timeToX(timeMs: number, minTime: number, maxTime: number, chartWidth: number): number {
  const range = maxTime - minTime;
  if (range <= 0) return CHART_PADDING;
  return CHART_PADDING + ((timeMs - minTime) / range) * (chartWidth - 2 * CHART_PADDING);
}

export function rowToY(rowIndex: number): number {
  return AXIS_HEIGHT + rowIndex * ROW_HEIGHT + ROW_PADDING;
}

export function generateTimeTicks(minTime: number, maxTime: number, maxTicks = 8): TimeTick[] {
  const range = maxTime - minTime;
  if (range <= 0) return [];

  const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 1800000, 3600000];

  let interval = intervals[intervals.length - 1];
  for (const candidate of intervals) {
    if (range / candidate <= maxTicks) {
      interval = candidate;
      break;
    }
  }

  const ticks: TimeTick[] = [];
  const firstTick = Math.ceil(minTime / interval) * interval;

  for (let t = firstTick; t <= maxTime; t += interval) {
    ticks.push({
      timeMs: t,
      label: formatTickLabel(t, minTime, range),
    });
  }

  return ticks;
}

export function generateWallClockTicks(minTime: number, maxTime: number, useUtc: boolean, maxTicks = 8): TimeTick[] {
  const range = maxTime - minTime;
  if (range <= 0) return [];

  const intervals = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 1800000, 3600000];

  let interval = intervals[intervals.length - 1];
  for (const candidate of intervals) {
    if (range / candidate <= maxTicks) {
      interval = candidate;
      break;
    }
  }

  const ticks: TimeTick[] = [];
  const firstTick = Math.ceil(minTime / interval) * interval;

  for (let t = firstTick; t <= maxTime; t += interval) {
    const d = useUtc ? dayjs.utc(t) : dayjs(t);
    ticks.push({ timeMs: t, label: d.format("YYYY-MM-DD"), label2: d.format("HH:mm:ss.SSS") });
  }

  return ticks;
}

function formatTickLabel(timeMs: number, minTime: number, range: number): string {
  const elapsed = timeMs - minTime;
  if (range < 1000) {
    return `${elapsed.toFixed(0)}ms`;
  }
  if (range < 60000) {
    const s = elapsed / 1000;
    return `${s.toFixed(3)}s`;
  }
  if (range < 3600000) {
    const totalSec = Math.floor(elapsed / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
  const totalSec = Math.floor(elapsed / 1000);
  const h = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return `${h}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const INDENT_PX = 16;

export function measureLabelWidth(rows: TimelineRow[]): number {
  if (!rows.length) return MIN_LABEL_WIDTH;
  const measureCtx = document.createElement("canvas").getContext("2d");
  if (!measureCtx) return MIN_LABEL_WIDTH;

  let maxWidth = 0;
  for (const row of rows) {
    const indent = row.depth * INDENT_PX;
    measureCtx.font = "bold 11px sans-serif";
    const typeW = measureCtx.measureText(row.typeName).width;
    measureCtx.font = "11px sans-serif";
    const endpointW = measureCtx.measureText(row.endpointName).width;
    // Use the wider of typeName vs endpointName (they stack vertically)
    maxWidth = Math.max(maxWidth, indent + Math.max(typeW, endpointW));
  }
  // padding(8+8) + separator margin(4)
  return Math.max(Math.ceil(maxWidth + 20), MIN_LABEL_WIDTH);
}

export function formatTimeForDisplay(timeMs: number, useUtc: boolean): string {
  const d = dayjs(timeMs);
  return useUtc ? d.utc().format("HH:mm:ss.SSS") : d.format("HH:mm:ss.SSS");
}

export function formatDateTimeForDisplay(timeMs: number, useUtc: boolean): string {
  if (!timeMs) return "";
  const d = dayjs(timeMs);
  return useUtc ? d.utc().format("YYYY-MM-DD HH:mm:ss.SSS") : d.format("YYYY-MM-DD HH:mm:ss.SSS");
}

export function formatDurationForDisplay(ms: number): string {
  if (ms < 1) return "<1 ms";
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)} min`;
  return `${(ms / 3600000).toFixed(1)} hr`;
}
