<template>
  <div class="relative z-900">
    <!-- Top bar -->
    <div class="bg-[#02253D] h-15 relative border-b border-gray-200">
      <div
        class="flex justify-between fwhite items-center lg:px-6 max-w-[1440px] mx-auto h-full"
      >
        <div class="flex items-center lg:mt-[-2px]">
          <div @click="goToHome" class="px-1 cursor-pointer">
            <img
              src="/images/escap.svg"
              alt="ESCAP Logo"
              class="h-12 md:h-13 lg:h-13"
            />
          </div>
          <div class="border-l-2 border-white h-9 w-2"></div>
          <div @click="goToHome" class="cursor-pointer">
            <img
              src="/images/rivaWhiteLogo2.svg"
              alt="RIVA Logo"
              class="h-12 md:h-13 lg:h-13"
            />
          </div>
        </div>

        <!-- Desktop menu -->
        <div class="flex justify-start flex-1 gt-md px-2">
          <div
            v-for="item in menuItems"
            :key="item.name"
            class="p-2 rounded-md mx-4"
            :class="[
              menu === item.name
                ? 'bg-[rgba(134,199,240,0.37)]'
                : 'hover:text-amber-300',
              item.disabled
                ? 'opacity-50 cursor-not-allowed pointer-events-none'
                : 'cursor-pointer',
            ]"
            @click="!item.disabled && item.action()"
            :aria-disabled="item.disabled || null"
            :title="item.disabled ? 'Coming soon' : null"
          >
            {{ item.label }}
          </div>
        </div>

        <!-- Burger button (mobile) -->
        <div class="lt-lg pr-2">
          <q-icon
            name="fa-solid fa-bars"
            size="md"
            class="cursor-pointer"
            @click="menuOpen = !menuOpen"
          />
        </div>
      </div>

      <!-- Side menu (mobile) -->
      <transition name="fade">
        <div
          v-if="menuOpen"
          class="absolute top-0 left-0 w-full h-screen bg-[#F8F8F8] text-white z-500 shadow-lg"
        >
          <div
            class="px-2 flex justify-between items-center border-b border-gray-200 h-15"
            style="
              background: linear-gradient(-45deg, #1b81c1 0%, #1a425a 100%);
            "
          >
            <span class="font-bold">
              <img src="/images/rivaWhiteLogo.svg" class="h-8 md:h-9 lg:h-11" />
            </span>
            <q-icon
              name="close"
              class="cursor-pointer"
              @click="menuOpen = false"
              size="sm"
            />
          </div>

          <div class="fblack">
            <div
              v-for="item in menuItems"
              :key="`mobile-${item.name}`"
              class="text-lg px-4 py-3 border-b border-gray-200"
              :class="[
                menu === item.name ? 'bg-[#B8E3FF]' : '',
                item.disabled
                  ? 'opacity-50 cursor-not-allowed pointer-events-none'
                  : 'cursor-pointer',
              ]"
              @click="!item.disabled && (item.action(), (menuOpen = false))"
              :aria-disabled="item.disabled || null"
              :title="item.disabled ? 'Coming soon' : null"
            >
              <div class="flex">
                <div class="pt-1 w-7">
                  <img :src="item.icon" :alt="item.label" class="h-[19px]" />
                </div>
                <div>{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const route = useRouter();
const props = defineProps({
  menu: String,
});

/* ---------- navigation helpers ---------- */
const menuOpen = ref(false);

const goToHome = () => {
  route.push("/");
  menuOpen.value = false;
};
const goToDashboard = () => route.push("/va");
const goToGVCRelationships = () => route.push("/gvcoverview");
const goToParticipationInGVCs = () => route.push("/participationingvcs");
const goToBackwardLinkages = () => route.push("/backwardlinkages");
const goToForwardLinkages = () => route.push("/forwardlinkages");
const goToDirectLinkages = () => route.push("/directindirect");
const goToCountryBriefs = () => route.push("/countrybriefs");

/* ---------- menu model (desktop + mobile share the same) ---------- */
/*  ใส่ disabled: true กับเมนูที่ยังไม่เปิดใช้ */
const menuItems = [
  {
    name: "Dashboard",
    label: "Menu",
    icon: "/images/vaDashboardB.svg",
    disabled: false,
    action: () => goToDashboard(),
  },
  {
    name: "gvcoverview",
    label: "GVC overview",
    icon: "/images/vaGVCRelationshipsB.svg",
    disabled: false,
    action: () => goToGVCRelationships(),
  },
  {
    name: "ParticipationInGVCs",
    label: "Participation in GVCs",
    icon: "/images/vaParticipationGVCB.svg",
    disabled: false,
    action: () => goToParticipationInGVCs(),
  },
  {
    name: "BackwardLinkages",
    label: "Backward linkages",
    icon: "/images/vaBackwardB.svg",
    disabled: false,
    action: () => goToBackwardLinkages(),
  },
  {
    name: "ForwardLinkages",
    label: "Forward linkages",
    icon: "/images/vaForwardB.svg",
    disabled: false,
    action: () => goToForwardLinkages(),
  },
  // {
  //   /* 🔒 ปิดใช้ชั่วคราว */
  //   name: "DirectIndirect",
  //   label: "Direct and indirect linkages",
  //   icon: "/images/vaDirectB.svg",
  //   disabled: true,
  //   action: () => goToDirectLinkages(),
  // },
  {
    /* 🔒 ปิดใช้ชั่วคราว */
    name: "CountryBriefs",
    label: "Economy Briefs",
    icon: "/images/vaCountryBriefB.svg",
    // disabled: true,
    action: () => goToCountryBriefs(),
  },
];
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
