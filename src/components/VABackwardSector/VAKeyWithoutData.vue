<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-md md:text-lg font-semibold fblack">
      {{ t("backward.policyTitle") }}
    </div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          {{ t("backward.policyQuestionOne") }}
        </li>
        <li>{{ t("backward.policyQuestionTwo") }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped></style>
