<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { Modal } from "bootstrap";
import FAIcon from "@/components/FAIcon.vue";
import { faChevronLeft, faChevronRight, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { WizardImage, WizardPage } from "./types";

const props = defineProps<{
  title: string;
  pages: WizardPage[];
}>();

const emit = defineEmits<{ close: [] }>();
const modalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;
const lightboxCloseRef = ref<HTMLButtonElement | null>(null);
const lastFocusedElement = ref<HTMLElement | null>(null);

// page variables
const currentPageIndex = ref(0);
const currentPage = computed(() => props.pages[currentPageIndex.value]);
const isFirstPage = computed(() => currentPageIndex.value === 0);
const isLastPage = computed(() => currentPageIndex.value === props.pages.length - 1);
const totalPages = computed(() => props.pages.length);

// image variables
const isImageExpanded = ref(false);
const currentImageIndex = ref(0);
const pageImages = computed((): WizardImage[] => {
  const page = currentPage.value;
  if (page.images && page.images.length > 0) {
    return page.images.map(normalizeImage);
  }
  if (page.image) {
    return [normalizeImage(page.image)];
  }
  return [];
});
const currentImageData = computed(() => pageImages.value[currentImageIndex.value]);
const hasMultipleImages = computed(() => pageImages.value.length > 1);

function nextPage() {
  if (!isLastPage.value) {
    currentPageIndex.value++;
    currentImageIndex.value = 0;
  }
}

function previousPage() {
  if (!isFirstPage.value) {
    currentPageIndex.value--;
    currentImageIndex.value = 0;
  }
}

function goToPage(index: number) {
  if (index >= 0 && index < props.pages.length) {
    currentPageIndex.value = index;
  }
}

function nextImage() {
  if (currentImageIndex.value < pageImages.value.length - 1) {
    currentImageIndex.value++;
  }
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

function normalizeImage(img: string | WizardImage): WizardImage {
  return typeof img === "string" ? { src: img } : img;
}

function close() {
  modalInstance?.hide();
}

function handleHidden() {
  emit("close");
}

function handleKeydown(event: KeyboardEvent) {
  if (isImageExpanded.value && event.key === "Escape") {
    closeLightbox();
    return;
  }
  if (event.key === "ArrowRight" && !isLastPage.value) {
    nextPage();
  } else if (event.key === "ArrowLeft" && !isFirstPage.value) {
    previousPage();
  }
}

function openLightbox() {
  lastFocusedElement.value = document.activeElement as HTMLElement;
  isImageExpanded.value = true;
  nextTick(() => {
    lightboxCloseRef.value?.focus();
  });
}

function closeLightbox() {
  isImageExpanded.value = false;
  nextTick(() => {
    lastFocusedElement.value?.focus();
  });
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
            <div v-if="pageImages.length > 0" class="wizard-image text-center mb-4">
              <div class="image-carousel">
                <button v-if="hasMultipleImages" type="button" class="carousel-nav carousel-prev" :disabled="currentImageIndex === 0" @click="previousImage" aria-label="Previous image">
                  <FAIcon :icon="faChevronLeft" />
                </button>
                <figure class="image-figure">
                  <img
                    :src="currentImageData?.src"
                    :alt="currentImageData?.caption || currentPage.title"
                    class="img-fluid rounded clickable-image"
                    :style="currentImageData?.maxHeight ? { maxHeight: currentImageData.maxHeight } : {}"
                    @click="openLightbox"
                  />
                  <figcaption v-if="currentImageData?.caption" class="image-caption">{{ currentImageData.caption }}</figcaption>
                </figure>
                <button v-if="hasMultipleImages" type="button" class="carousel-nav carousel-next" :disabled="currentImageIndex === pageImages.length - 1" @click="nextImage" aria-label="Next image">
                  <FAIcon :icon="faChevronRight" />
                </button>
              </div>
              <div v-if="hasMultipleImages" class="image-indicators mt-2">
                <span v-for="(_, index) in pageImages" :key="index" class="image-dot" :class="{ active: index === currentImageIndex }" @click="currentImageIndex = index"></span>
              </div>
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

          <div class="page-counter text-muted small">Page {{ currentPageIndex + 1 }} of {{ totalPages }}</div>

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
    <div v-if="isImageExpanded && currentImageData" class="image-lightbox" role="dialog" aria-modal="true" aria-label="Expanded image" @click="closeLightbox">
      <div class="lightbox-content" @click.stop>
        <button ref="lightboxCloseRef" type="button" class="lightbox-close" @click="closeLightbox" aria-label="Close expanded image">&times;</button>
        <img :src="currentImageData.src" :alt="currentImageData.caption || currentPage.title" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import "@/components/platformcapabilities/styles/wizardModal.css";
</style>
