<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import * as diff from "diff";
import DiffMaximizeIcon from "@/assets/diff-maximize.svg";
import DiffCloseIcon from "@/assets/diff-close.svg";

// Types needed for the diff viewer
interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
}

interface LineInformation {
  left: DiffInformation;
  right: DiffInformation;
}

interface DiffInformation {
  value: string;
  lineNumber?: number;
  type: DiffType;
}

enum DiffType {
  DEFAULT = 0,
  ADDED = 1,
  REMOVED = 2,
}

// Types for rendered diff items
interface FoldItem {
  type: "fold";
  count: number;
  blockNumber: number;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

interface LineItem {
  type: "line";
  lineInfo: LineInformation;
  index: number;
}

type DiffItem = FoldItem | LineItem;

interface Props {
  oldValue: string;
  newValue: string;
  splitView?: boolean;
  hideLineNumbers?: boolean;
  showDiffOnly?: boolean;
  extraLinesSurroundingDiff?: number;
  leftTitle?: string;
  rightTitle?: string;
  compareMethod?: "diffChars" | "diffWords" | "diffWordsWithSpace" | "diffLines" | "diffTrimmedLines" | "diffSentences" | "diffCss";
  showMaximizeIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  splitView: true,
  hideLineNumbers: false,
  showDiffOnly: false,
  extraLinesSurroundingDiff: 3,
  leftTitle: "Previous",
  rightTitle: "Current",
  compareMethod: "diffLines",
  showMaximizeIcon: false,
});

// Component state
const lineInformation = ref<LineInformation[]>([]);
const diffLines = ref<number[]>([]);
const expandedBlocks = ref<number[]>([]);
const showMaximizeModal = ref(false);
const showMaximizeButton = ref(false);

// Compute diff when inputs change
const computeDiff = (): void => {
  const { oldValue, newValue, compareMethod } = props;

  // Skip processing if values are identical
  if (oldValue === newValue) {
    const lines = newValue.split("\n");
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    const result: LineInformation[] = [];
    let lineNumber = 1;

    lines.forEach((line) => {
      result.push({
        left: { value: line, lineNumber: lineNumber, type: DiffType.DEFAULT },
        right: { value: line, lineNumber: lineNumber++, type: DiffType.DEFAULT },
      });
    });

    lineInformation.value = result;
    diffLines.value = [];
    return;
  }

  // Generate diff based on selected method
  let diffOutput: DiffChange[];
  switch (compareMethod) {
    case "diffChars":
      diffOutput = diff.diffChars(oldValue, newValue);
      break;
    case "diffWords":
      diffOutput = diff.diffWords(oldValue, newValue);
      break;
    case "diffWordsWithSpace":
      diffOutput = diff.diffWordsWithSpace(oldValue, newValue);
      break;
    case "diffTrimmedLines":
      diffOutput = diff.diffTrimmedLines(oldValue, newValue);
      break;
    case "diffSentences":
      diffOutput = diff.diffSentences(oldValue, newValue);
      break;
    case "diffCss":
      diffOutput = diff.diffCss(oldValue, newValue);
      break;
    case "diffLines":
    default:
      diffOutput = diff.diffLines(oldValue, newValue);
      break;
  }

  // Process the diff output into line information
  const result: LineInformation[] = [];
  const diffLinesArray: number[] = [];
  let leftLineNumber = 1;
  let rightLineNumber = 1;
  let counter = 0;

  diffOutput.forEach((part) => {
    const lines = part.value.split("\n");
    // Remove empty line at the end if it exists
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }

    if (!part.added && !part.removed) {
      // Unchanged lines
      lines.forEach((line) => {
        result.push({
          left: { value: line, lineNumber: leftLineNumber++, type: DiffType.DEFAULT },
          right: { value: line, lineNumber: rightLineNumber++, type: DiffType.DEFAULT },
        });
        counter++;
      });
    } else if (part.removed) {
      // Removed lines (left side)
      lines.forEach((line) => {
        diffLinesArray.push(counter);
        result.push({
          left: { value: line, lineNumber: leftLineNumber++, type: DiffType.REMOVED },
          right: { value: "", type: DiffType.DEFAULT },
        });
        counter++;
      });
    } else if (part.added) {
      // Added lines (right side)
      lines.forEach((line) => {
        diffLinesArray.push(counter);
        result.push({
          left: { value: "", type: DiffType.DEFAULT },
          right: { value: line, lineNumber: rightLineNumber++, type: DiffType.ADDED },
        });
        counter++;
      });
    }
  });

  lineInformation.value = result;
  diffLines.value = diffLinesArray;

  // Reset expanded blocks when diff changes
  expandedBlocks.value = [];
};

// Toggle a code fold block
const onBlockExpand = (id: number): void => {
  if (!expandedBlocks.value.includes(id)) {
    expandedBlocks.value.push(id);
  }
};

// Render the diff with code folding for unchanged lines
const renderDiff = computed<DiffItem[]>(() => {
  if (!lineInformation.value.length) return [];

  const { showDiffOnly, extraLinesSurroundingDiff } = props;
  const extraLines = extraLinesSurroundingDiff < 0 ? 0 : extraLinesSurroundingDiff;

  let skippedLines: number[] = [];
  const result: DiffItem[] = [];

  // Create a mutable copy of diffLines for manipulation in the loop
  const currentDiffLines = [...diffLines.value];

  lineInformation.value.forEach((line, i) => {
    const diffBlockStart = currentDiffLines[0];
    const currentPosition = diffBlockStart !== undefined ? diffBlockStart - i : undefined;

    // Check if this line should be shown or folded
    if (showDiffOnly) {
      // At boundary of diff section, process any accumulated skipped lines
      if (currentPosition === -extraLines) {
        skippedLines = [];
        currentDiffLines.shift();
      }

      // If this is a default line far from changes and not in an expanded block, accumulate it
      if (line.left.type === DiffType.DEFAULT && ((currentPosition !== undefined && currentPosition > extraLines) || typeof diffBlockStart === "undefined") && !expandedBlocks.value.includes(diffBlockStart)) {
        skippedLines.push(i + 1);

        // If we're at the end and have accumulated skipped lines, render the fold indicator
        if (i === lineInformation.value.length - 1 && skippedLines.length > 1) {
          result.push({
            type: "fold",
            count: skippedLines.length,
            blockNumber: diffBlockStart,
            leftLineNumber: line.left.lineNumber,
            rightLineNumber: line.right.lineNumber,
          });
        }
        return;
      }
    }

    // If we have accumulated skipped lines and this line should be shown, display the fold indicator
    if (currentPosition === extraLines && skippedLines.length > 0) {
      const count = skippedLines.length;
      skippedLines = [];

      result.push({
        type: "fold",
        count,
        blockNumber: diffBlockStart,
        leftLineNumber: line.left.lineNumber,
        rightLineNumber: line.right.lineNumber,
      });
    }

    // Add the actual line content
    result.push({
      type: "line",
      lineInfo: line,
      index: i,
    });
  });

  return result;
});

// Compute the diff on initial load and when inputs change
watch(
  () => [props.oldValue, props.newValue, props.compareMethod, props.showDiffOnly, props.extraLinesSurroundingDiff],
  () => {
    computeDiff();
  },
  { immediate: true }
);

// Handle maximize functionality
const toggleMaximizeModal = () => {
  showMaximizeModal.value = !showMaximizeModal.value;
};

// Handle ESC key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showMaximizeModal.value) {
    showMaximizeModal.value = false;
  }
};

// Handle mouse enter/leave for showing maximize button
const onDiffMouseEnter = () => {
  if (props.showMaximizeIcon) {
    showMaximizeButton.value = true;
  }
};

const onDiffMouseLeave = () => {
  showMaximizeButton.value = false;
};

// Ensure modal resizes with window and setup keyboard events
onMounted(() => {
  if (props.showMaximizeIcon) {
    // Add keyboard event listener for ESC key
    window.addEventListener("keydown", handleKeyDown);
  }
});

// Clean up event listeners when component is destroyed
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="diff-viewer" @mouseenter="onDiffMouseEnter" @mouseleave="onDiffMouseLeave">
    <div class="diff-container" :class="{ 'split-view': splitView }">
      <!-- Headers -->
      <div v-if="leftTitle || rightTitle" class="diff-headers">
        <div class="diff-header">{{ leftTitle }}</div>
        <div v-if="splitView" class="diff-header">{{ rightTitle }}</div>
      </div>

      <!-- Maximize Button -->
      <button v-if="showMaximizeIcon && showMaximizeButton" @click="toggleMaximizeModal" class="maximize-button" title="Maximize diff view">
        <img :src="DiffMaximizeIcon" alt="Maximize" width="14" height="14" />
      </button>

      <!-- Diff content -->
      <div class="diff-content">
        <!-- Left side (old) -->
        <div v-if="splitView" class="diff-column">
          <div class="diff-lines">
            <template v-for="(item, itemIndex) in renderDiff" :key="`diff-left-${itemIndex}`">
              <!-- Code fold indicator -->
              <div v-if="item.type === 'fold'" class="diff-fold">
                <button @click="onBlockExpand(item.blockNumber)" class="diff-fold-button">
                  {{ `⟨ Expand ${item.count} lines... ⟩` }}
                </button>
              </div>

              <!-- Regular line content -->
              <div v-else-if="item.type === 'line'" :class="['diff-line', { 'diff-line-removed': item.lineInfo.left.type === DiffType.REMOVED }]">
                <span v-if="!hideLineNumbers" class="diff-line-number">{{ item.lineInfo.left.lineNumber }}</span>
                <span class="diff-line-content">{{ item.lineInfo.left.value }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Right side (new) -->
        <div class="diff-column">
          <div class="diff-lines">
            <template v-for="(item, itemIndex) in renderDiff" :key="`diff-right-${itemIndex}`">
              <!-- Code fold indicator -->
              <div v-if="item.type === 'fold'" class="diff-fold">
                <button @click="onBlockExpand(item.blockNumber)" class="diff-fold-button">
                  {{ `⟨ Expand ${item.count} lines... ⟩` }}
                </button>
              </div>

              <!-- Regular line content -->
              <div v-else-if="item.type === 'line'" :class="['diff-line', { 'diff-line-added': item.lineInfo.right.type === DiffType.ADDED }]">
                <span v-if="!hideLineNumbers" class="diff-line-number">{{ item.lineInfo.right.lineNumber }}</span>
                <span class="diff-line-content">{{ item.lineInfo.right.value }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Maximize Modal -->
    <div v-if="showMaximizeModal" class="maximize-modal">
      <div class="maximize-modal-content">
        <div class="maximize-modal-toolbar">
          <span class="maximize-modal-title">{{ leftTitle }} vs {{ rightTitle }}</span>
          <button @click="toggleMaximizeModal" class="maximize-modal-close" title="Close">
            <img :src="DiffCloseIcon" alt="Close" width="16" height="16" />
          </button>
        </div>
        <div class="maximize-modal-body">
          <div class="diff-container" :class="{ 'split-view': splitView }">
            <!-- Headers in Modal -->
            <div v-if="leftTitle || rightTitle" class="diff-headers">
              <div class="diff-header">{{ leftTitle }}</div>
              <div v-if="splitView" class="diff-header">{{ rightTitle }}</div>
            </div>

            <!-- Diff content in Modal -->
            <div class="diff-content">
              <!-- Left side (old) in Modal -->
              <div v-if="splitView" class="diff-column">
                <div class="diff-lines">
                  <template v-for="(item, itemIndex) in renderDiff" :key="`modal-diff-left-${itemIndex}`">
                    <!-- Code fold indicator -->
                    <div v-if="item.type === 'fold'" class="diff-fold">
                      <button @click="onBlockExpand(item.blockNumber)" class="diff-fold-button">
                        {{ `⟨ Expand ${item.count} lines... ⟩` }}
                      </button>
                    </div>

                    <!-- Regular line content -->
                    <div v-else-if="item.type === 'line'" :class="['diff-line', { 'diff-line-removed': item.lineInfo.left.type === DiffType.REMOVED }]">
                      <span v-if="!hideLineNumbers" class="diff-line-number">{{ item.lineInfo.left.lineNumber }}</span>
                      <span class="diff-line-content">{{ item.lineInfo.left.value }}</span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Right side (new) in Modal -->
              <div class="diff-column">
                <div class="diff-lines">
                  <template v-for="(item, itemIndex) in renderDiff" :key="`modal-diff-right-${itemIndex}`">
                    <!-- Code fold indicator -->
                    <div v-if="item.type === 'fold'" class="diff-fold">
                      <button @click="onBlockExpand(item.blockNumber)" class="diff-fold-button">
                        {{ `⟨ Expand ${item.count} lines... ⟩` }}
                      </button>
                    </div>

                    <!-- Regular line content -->
                    <div v-else-if="item.type === 'line'" :class="['diff-line', { 'diff-line-added': item.lineInfo.right.type === DiffType.ADDED }]">
                      <span v-if="!hideLineNumbers" class="diff-line-number">{{ item.lineInfo.right.lineNumber }}</span>
                      <span class="diff-line-content">{{ item.lineInfo.right.value }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diff-viewer {
  width: 100%;
  overflow: hidden;
  font-family: monospace;
  font-size: 0.75rem;
  position: relative;
}

.diff-container {
  width: 100%;
}

.diff-headers {
  display: flex;
  border-bottom: 1px solid #ddd;
  background-color: #f1f1f1;
}

.diff-header {
  flex: 1;
  padding: 6px 10px;
  font-weight: bold;
  font-size: 0.8rem;
  text-align: center;
}

.diff-content {
  display: flex;
}

.diff-column {
  flex: 1;
  overflow: visible;
}

.split-view .diff-column:first-child {
  border-right: 1px solid #ddd;
}

.diff-lines {
  padding: 5px 0;
}

.diff-line {
  padding: 0 5px;
  white-space: pre-wrap;
  word-break: break-all;
  display: flex;
}

.diff-line-number {
  min-width: 40px;
  color: #999;
  text-align: right;
  padding-right: 10px;
  user-select: none;
}

.diff-line-content {
  flex: 1;
}

.diff-line-added {
  background-color: #e6ffed;
  color: #28a745;
}

.diff-line-removed {
  background-color: #ffeef0;
  color: #d73a49;
}

/* Code fold styling */
.diff-fold {
  text-align: center;
  padding: 2px 0;
}

.diff-fold-button {
  background: none;
  border: none;
  color: #0366d6;
  padding: 2px 8px;
  font-size: 0.7rem;
  cursor: pointer;
  font-family: monospace;
}

.diff-fold-button:hover {
  text-decoration: underline;
}

/* Maximize button styles */
.maximize-button {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.maximize-button:hover {
  opacity: 1;
}

/* Modal styles */
.maximize-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.maximize-modal-content {
  background-color: white;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.maximize-modal-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
}

.maximize-modal-title {
  font-weight: bold;
  font-size: 16px;
}

.maximize-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.maximize-modal-close:hover {
  color: #000;
}

.maximize-modal-body {
  flex: 1;
  overflow: auto;
  padding: 0;
}

.maximize-modal-body .diff-container {
  height: 100%;
}

.maximize-modal-body .diff-content {
  max-height: calc(100% - 35px);
  overflow: auto;
}
</style>
