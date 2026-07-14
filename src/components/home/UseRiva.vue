<template>
  <section class="use-riva-section px-4 py-8 md:py-9">
    <div class="mx-auto max-w-[1400px]">
      <h2 class="use-riva-title text-center font-semibold text-white">
        {{ t("home.useTitle") }}
      </h2>

      <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in cards" :key="card.title" class="use-riva-card">
          <img
            :src="card.image"
            :alt="card.title"
            class="aspect-[1.73/1] w-full object-cover"
          />
          <div class="p-3">
            <p class="text-[14px] text-[#FDC300]">{{ t("home.useTitle") }}</p>
            <h3
              class="use-riva-card-title mt-2 font-normal leading-[1.2] text-white"
            >
              {{ card.title }}
            </h3>
            <p class="mt-3 text-[14px] leading-[1.45] text-[#c7d5de]">
              {{ card.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const cards = [
  {
    image: "/images/rivaHelp1.webp",
    title: computed(() => t("home.cards[0][0]")),
    description: computed(() => t("home.cards[0][1]")),
  },
  {
    image: "/images/rivaHelp2.webp",
    title: computed(() => t("home.cards[1][0]")),
    description: computed(() => t("home.cards[1][1]")),
  },
  {
    image: "/images/rivaHelp3.webp",
    title: computed(() => t("home.cards[2][0]")),
    description: computed(() => t("home.cards[2][1]")),
  },
  {
    image: "/images/rivaHelp4.webp",
    title: computed(() => t("home.cards[3][0]")),
    description: computed(() => t("home.cards[3][1]")),
  },
];
</script>

<style scoped>
.use-riva-section {
  background: #08709f;
}

.use-riva-title {
  font-size: 30px !important;
  font-weight: 500;
  line-height: 1.2;
}

.use-riva-card {
  background: #002a45;
}

.use-riva-card-title {
  font-size: 18px !important;
  line-height: 1.25;
  padding-bottom: 10px !important;
}

@media (min-width: 768px) {
  .use-riva-title {
    font-size: 32px !important;
  }
}
</style>
