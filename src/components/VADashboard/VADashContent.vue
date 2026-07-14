<template>
  <div class="max-w-[1200px] w-[95%] mx-auto mt-[-100px] relative z-100">
    <div class="rounded-sm p-4" style="background: linear-gradient(-45deg, #113347 0%, #185172 57%, #133448 100%)">
      <div class="flex gap-2 p-6 lg:px-16 gt-xs">
        <div class="w-30"><img src="/images/vaLogoW.svg" alt="" /></div>
        <div class="fwhite flex-1">
          <div class="md:text-2xl lg:text-4xl font-semibold">{{ t("va.title") }}</div>
          <div class="md:text-base lg:text-lg">{{ t("va.intro") }}</div>
        </div>
      </div>
      <div class="lt-sm">
        <div class="flex gap-2 p-2 items-center">
          <div class="w-10"><img src="/images/vaLogoW.svg" alt="" /></div>
          <div class="text-xl font-semibold fwhite">{{ t("va.title") }}</div>
        </div>
        <div class="fwhite">{{ t("va.intro") }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pt-4 items-stretch">
      <div v-for="item in contentList" :key="item.title" class="h-full">
        <div class="border border-[#dbdbdb] p-4 h-full flex flex-col justify-between" :class="item.disabled ? 'opacity-80' : ''">
          <div class="font-semibold text-[#005DAA] md:text-lg">{{ item.title }}</div>
          <div class="fsub pb-3">{{ item.content }}</div>
          <div>
            <button
              type="button"
              class="h-10 px-4 rounded-sm inline-flex items-center transition duration-300 ease-in-out"
              :class="item.disabled ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed' : 'bg-[#FDC300] fblack cursor-pointer hover:scale-105'"
              :disabled="item.disabled"
              :title="item.disabled ? t('va.comingSoon') : ''"
              @click="!item.disabled && item.action()"
            >
              <img :src="item.icon" alt="" class="h-5 mr-2" />
              <span>{{ item.label }}</span>
              <span v-if="item.disabled" class="ml-2 text-xs rounded px-2 py-0.5 bg-white/70 text-[#6B7280]">{{ t("va.comingSoon") }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const router = useRouter();
const { t } = useI18n({ useScope: "global" });

const contentList = computed(() => [
  { title: t("va.cards.gvc.title"), content: t("va.cards.gvc.content"), label: t("nav.gvcOverview"), icon: "/images/vaGVCRelationshipsB.svg", action: () => router.push("/gvcoverview") },
  { title: t("va.cards.participation.title"), content: t("va.cards.participation.content"), label: t("nav.participation"), icon: "/images/vaParticipationGVCB.svg", action: () => router.push("/participationingvcs") },
  { title: t("va.cards.backward.title"), content: t("va.cards.backward.content"), label: t("nav.backward"), icon: "/images/vaBackwardB.svg", action: () => router.push("/backwardlinkages") },
  { title: t("va.cards.forward.title"), content: t("va.cards.forward.content"), label: t("nav.forward"), icon: "/images/vaForwardB.svg", action: () => router.push("/forwardlinkages") },
  { title: t("va.cards.briefs.title"), content: t("va.cards.briefs.content"), label: t("nav.briefs"), icon: "/images/vaCountryBriefB.svg", action: () => router.push("/countrybriefs") },
]);
</script>

<style lang="scss" scoped></style>
