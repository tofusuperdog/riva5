<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-md md:text-lg font-semibold fblack">
      {{ t('forward.sectorPolicyTitle') }}
    </div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          {{ t('forward.sectorPolicyOne', { economy: t('forward.exportingEconomy') }) }}
        </li>
        <li>{{ t('forward.compareRegion') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style lang="scss" scoped></style>
