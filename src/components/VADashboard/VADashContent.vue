<template>
  <div class="max-w-[1200px] w-[95%] mx-auto mt-[-100px] relative z-100">
    <div
      class="rounded-sm p-4"
      style="
        background: linear-gradient(
          -45deg,
          #113347 0%,
          #185172 57%,
          #133448 100%
        );
      "
    >
      <div class="flex gap-2 p-6 lg:px-16 gt-xs">
        <div class="w-30">
          <img src="/images/vaLogoW.svg" alt="" />
        </div>
        <div class="fwhite flex-1">
          <div class="md:text-2xl lg:text-4xl font-semibold">
            Value Chains Analyzer
          </div>
          <div class="md:text-base lg:text-lg">
            Gain insight into your economy's participation in global value
            chains (GVCs). Uncover the sources of intermediate inputs and
            destinations of domestic value-added.
          </div>
        </div>
      </div>
      <div class="lt-sm">
        <div class="flex gap-2 p-2 items-center">
          <div class="w-10">
            <img src="/images/vaLogoW.svg" alt="" />
          </div>
          <div class="text-xl font-semibold fwhite">Value Chains Analyzer</div>
        </div>
        <div class="fwhite">
          Gain insight into your economy's participation in global value chains
          (GVCs). Uncover the sources of intermediate inputs and destinations of
          domestic value-added.
        </div>
      </div>
    </div>
    <div>
      <div
        class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pt-4 items-stretch"
      >
        <div v-for="item in contentList" :key="item.title" class="h-full">
          <div
            class="border border-[#dbdbdb] p-4 h-full flex flex-col justify-between"
            :class="item.disabled ? 'opacity-80' : ''"
          >
            <div class="font-semibold text-[#005DAA] md:text-lg">
              {{ item.title }}
            </div>
            <div class="fsub pb-3">{{ item.content }}</div>

            <div>
              <button
                type="button"
                class="h-10 px-4 rounded-sm inline-flex items-center transition duration-300 ease-in-out"
                :class="
                  item.disabled
                    ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#FDC300] fblack cursor-pointer hover:scale-105'
                "
                :disabled="item.disabled"
                :title="item.disabled ? 'Coming soon' : ''"
                @click="!item.disabled && item.actiion()"
              >
                <img :src="item.icon" alt="" class="h-5 mr-2" />
                <span>{{ item.label }}</span>
                <span
                  v-if="item.disabled"
                  class="ml-2 text-xs rounded px-2 py-0.5 bg-white/70 text-[#6B7280]"
                >
                  Coming soon
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const route = useRouter();

const contentList = ref([
  {
    title: "How is your economy connected through value-chains?",
    content:
      "Explore key trade and production linkages to get an overview of how your economy participates in global value chains.",
    label: "GVC overview",
    icon: "/images/vaGVCRelationshipsB.svg",
    actiion: () => goToGVCRelationships(),
  },
  {
    title:
      "How does your economy's value-added structure connect with the rest of the world?",
    content: "Measure your economy's overall integration into GVCs.",
    label: "Participation in GVCs",
    icon: "/images/vaParticipationGVCB.svg",
    actiion: () => goToParticipationInGVCs(),
  },

  {
    title: "Where do imported inputs used in your eonomy’s exports come from?",
    content:
      "Explore your eonomy's reliance on upstream partners in global value chains.",
    label: "Backward linkages",
    icon: "/images/vaBackwardB.svg",
    actiion: () => goToBackwardLinkages(),
  },
  {
    title:
      "Where does your economy contribute the most towards exports elsewhere?",
    content:
      "Follow your value-added as it becomes part of other economies' exports or supply chains.",
    label: "Forward linkages",
    icon: "/images/vaForwardB.svg",
    actiion: () => goToForwardLinkages(),
  },

  // ❌ ปิดใช้งานไว้ก่อน
  // {
  //   title: "How does your economy's value reach a specific importing economy?",
  //   content:
  //     "See how domestic value-added reaches final destinations both through direct exports and via third economies.",
  //   label: "Direct and indirect linkages",
  //   icon: "/images/vaDirectB.svg",
  //   actiion: () => goToDirectIndirect(),
  //   disabled: true,
  // },
  // ❌ ปิดใช้งานไว้ก่อน
  {
    title:
      "How does your economy perform in regional integration and value chains?",
    content:
      "Get a snapshot of your economy's performance in GVCs and integration, with charts, comparisons, and summaries.",
    label: "Economy Briefs",
    icon: "/images/vaCountryBriefB.svg",
    actiion: () => goToCountryBriefs(),
    // disabled: true,
  },
]);

const goToGVCRelationships = () => {
  route.push("/gvcoverview");
};
const goToStructureOfValueAdded = () => {
  route.push("/structureofvalueadded");
};

const goToParticipationInGVCs = () => {
  route.push("/participationingvcs");
};
const goToDirectIndirect = () => {
  route.push("/directindirect");
};
const goToBackwardLinkages = () => {
  route.push("/backwardlinkages");
};
const goToForwardLinkages = () => {
  route.push("/forwardlinkages");
};
const goToCountryBriefs = () => {
  route.push("/countrybriefs");
};
</script>

<style lang="scss" scoped></style>
