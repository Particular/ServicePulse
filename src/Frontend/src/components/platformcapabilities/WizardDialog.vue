<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";
import FAIcon from "@/components/FAIcon.vue";
import { faChevronLeft, faChevronRight, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export interface WizardPage {
  title: string;
  content: string;
  image?: string;
  learnMoreUrl?: string;
  learnMoreText?: string;
}

const props = defineProps<{
  title: string;
  pages: WizardPage[];
}>();

const emit = defineEmits<{ close: [] }>();

const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const currentPageIndex = ref(0);
const isImageExpanded = ref(false);

const currentPage = computed(() => props.pages[currentPageIndex.value]);
const isFirstPage = computed(() => currentPageIndex.value === 0);
const isLastPage = computed(() => currentPageIndex.value === props.pages.length - 1);
const totalPages = computed(() => props.pages.length);

function nextPage() {
  if (!isLastPage.value) {
    currentPageIndex.value++;
  }
}

function previousPage() {
  if (!isFirstPage.value) {
    currentPageIndex.value--;
  }
}

function goToPage(index: number) {
  if (index >= 0 && index < props.pages.length) {
    currentPageIndex.value = index;
  }
}

function close() {
  modalInstance?.hide();
}

function handleHidden() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowRight" && !isLastPage.value) {
    nextPage();
  } else if (event.key === "ArrowLeft" && !isFirstPage.value) {
    previousPage();
  }
}

onMounted(() => {
  if (modalRef.value) {
    modalInstance = new Modal(modalRef.value, {
      backdrop: true,
      keyboard: true,
    });
    modalRef.value.addEventListener("hidden.bs.modal", handleHidden);
    modalInstance.show();
  }
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (modalRef.value) {
    modalRef.value.removeEventListener("hidden.bs.modal", handleHidden);
  }
  modalInstance?.dispose();
});
</script>

<template>
  <div ref="modalRef" class="modal fade" tabindex="-1" role="dialog" :aria-label="title">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content wizard-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="wizard-page-content">
            <h4 class="page-title mb-3">{{ currentPage.title }}</h4>
            <div class="page-content" v-html="currentPage.content"></div>
            <div v-if="currentPage.image" class="wizard-image text-center mb-4">
              <img :src="currentPage.image" :alt="currentPage.title" class="img-fluid rounded clickable-image" @click="isImageExpanded = true" />
            </div>
            <a v-if="currentPage.learnMoreUrl" :href="currentPage.learnMoreUrl" target="_blank" rel="noopener noreferrer" class="learn-more-link mt-3 d-inline-flex align-items-center gap-2">
              {{ currentPage.learnMoreText || "Learn more in the documentation" }}
              <FAIcon :icon="faExternalLinkAlt" class="small" />
            </a>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-between align-items-center">
          <div class="page-indicators d-flex gap-2">
            <button v-for="(_, index) in pages" :key="index" type="button" class="page-dot" :class="{ active: index === currentPageIndex, visited: index < currentPageIndex }" @click="goToPage(index)" :aria-label="`Go to page ${index + 1}`"></button>
          </div>

          <div class="page-counter text-muted small">Step {{ currentPageIndex + 1 }} of {{ totalPages }}</div>

          <div class="navigation-buttons d-flex gap-2">
            <button v-if="!isFirstPage" type="button" class="btn btn-outline-secondary" @click="previousPage">
              <FAIcon :icon="faChevronLeft" class="me-1" />
              Back
            </button>

            <button v-if="!isLastPage" type="button" class="btn btn-primary" @click="nextPage">
              Next
              <FAIcon :icon="faChevronRight" class="ms-1" />
            </button>

            <button v-if="isLastPage" type="button" class="btn btn-primary" @click="close">Got it!</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="isImageExpanded && currentPage.image" class="image-lightbox" @click="isImageExpanded = false">
      <div class="lightbox-content" @click.stop>
        <button type="button" class="lightbox-close" @click="isImageExpanded = false" aria-label="Close">&times;</button>
        <img :src="currentPage.image" :alt="currentPage.title" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.wizard-content {
  border-radius: 12px;
  overflow: hidden;
}

.wizard-image img {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clickable-image {
  cursor: zoom-in;
  transition: transform 0.2s ease;
}

.clickable-image:hover {
  transform: scale(1.02);
}

.image-lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: zoom-out;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  cursor: default;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.lightbox-close:hover {
  color: #ccc;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.page-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #555;
}

.page-content :deep(p) {
  margin-bottom: 0.75rem;
}

.page-content :deep(ul) {
  margin: 0.75rem 0;
  padding-left: 1.25rem;
}

.page-content :deep(li) {
  margin-bottom: 0.5rem;
}

.page-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #d63384;
}

.page-content :deep(strong) {
  color: #333;
}

.learn-more-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.learn-more-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.page-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.page-dot:hover {
  background-color: #bbb;
}

.page-dot.visited {
  background-color: #007bff;
  opacity: 0.5;
}

.page-dot.active {
  background-color: #007bff;
  opacity: 1;
  transform: scale(1.2);
}

.modal-footer {
  background-color: #f8f9fa;
}
</style>
