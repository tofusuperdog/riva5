<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4"
  >
    <div class="text-lg font-semibold fblack">{{ t('gvc.policyTitle') }}</div>
    <div class="fsub">
      <ul class="list-disc pl-6">
        <li>
          {{ t('gvc.policyOne') }}
        </li>
        <li>
          {{ t('gvc.policyTwo') }}
        </li>
        <li>
          {{ t('gvc.policyThree') }}
        </li>
        <li>
          {{ t('gvc.policyFour') }}
        </li>
        <li>
          {{ t('gvc.policyFive') }}
        </li>
        <li>
          {{ t('gvc.policySix') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'global' });
</script>

<style lang="scss" scoped></style>
