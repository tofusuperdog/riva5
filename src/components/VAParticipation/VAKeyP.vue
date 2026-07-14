<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-md md:text-lg font-semibold fblack">
      {{ t("participation.policyTitle") }}
    </div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          {{ t("participation.policyOne") }}
        </li>
        <li>
          {{ t("participation.policyTwo") }}
        </li>
        <li>
          {{ t("participation.policyThree") }}
        </li>
      </ul>
    </div>
    <div class="flex justify-center pt-2">
      <div class="aspect-[758/536] w-full max-w-[758px]">
        <img
          :src="flowchartSrc"
          :alt="t('participation.policyTitle')"
          class="h-full w-full object-contain"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { locale, t } = useI18n({ useScope: "global" });

const flowchartSrc = computed(() => {
  const flowcharts = {
    "zh-CN": "/images/flowchart-cn.webp",
    "ru-RU": "/images/flowchart-ru.webp",
    "fr-FR": "/images/flowchart-fr.webp",
  };

  return flowcharts[locale.value] || "/images/flowchart.svg";
});
</script>

<style lang="scss" scoped></style>
