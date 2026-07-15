<template>
  <div
    class="bg-[linear-gradient(to_top_left,_#1B81C1,_#1A425A)] h-40 relative"
  >
    <div
      class="flex fwhite justify-between items-center px-2 lg:px-6 pt-3 max-w-[1400px] mx-auto"
    >
      <div class="flex justify-between w-full">
        <div class="flex items-center">
          <div class="w-5 md:w-8 lg:w-10">
            <img :src="iconFIle" alt="" class="h-4 md:h-6 lg:h-8" />
          </div>
          <div class="text-[18px] font-semibold fwhite md:text-2xl lg:text-3xl">
            {{ localizedPageName }}
          </div>
        </div>
        <div class="flex gap-2" v-show="menu != 'Dashboard'">
          <q-btn
            outline
            style="transition: all 0.3s ease-in-out"
            :class="{ 'hover:bg-[#1b98e6c5]': true }"
            dense
            v-show="isTinaOpen"
            :disable="!isTinaLink"
            @click="goToTina()"
          >
            <template v-slot:default>
              <div class="flex items-center justify-center w-full">
                <img
                  src="/images/tinaIcon.svg"
                  alt="Share"
                  class="h-5 md:h-6 lg:h-7"
                />
                <span class="pr-2">TINA</span>
              </div>
            </template>
          </q-btn>
          <q-btn
            @click="isShareOpen = true"
            outline
            style="transition: all 0.3s ease-in-out"
            :class="{ 'hover:bg-[#1b98e6c5]': true }"
            dense
            :disable="!isShare"
          >
            <template v-slot:default>
              <div class="flex items-center justify-center w-full">
                <img
                  src="/images/shareIcon.svg"
                  alt="Share"
                  class="h-3 md:h-4 lg:h-5 md:pr-1 px-1"
                />
                <span class="gt-xs pr-1">{{ shareAction }}</span>
              </div>
            </template>
          </q-btn>
        </div>
        <div v-show="menu == 'Dashboard'">
          <div class="relative inline-block text-left">
            <q-btn
              outline
              :label="t('va.resources')"
              color="white"
              icon-right="arrow_drop_down"
              class="rounded px-4"
              @click="resourceOpen = !resourceOpen"
            />
            <q-menu transition-show="jump-down" transition-hide="jump-up">
              <q-list bordered class="bg-white w-[180px] text-gray-700">
                <!-- <q-item clickable v-ripple>
                  <div class="flex">
                    <div class="w-8">
                      <img src="/images/icon-user-guide.svg" class="w-5 h-5" />
                    </div>
                    <div>{{ t("va.userGuide") }}</div>
                  </div>
                </q-item> -->
                <!-- <q-item clickable v-ripple>
                  <div class="flex">
                    <div class="w-8">
                      <img src="/images/icon-demo-vdo.svg" class="w-5 h-5" />
                    </div>
                    <div>{{ t("va.demoVideos") }}</div>
                  </div>
                </q-item> -->
                <q-item clickable v-ripple>
                  <div class="flex" @click="goToTechnicalNotes()">
                    <div class="w-8">
                      <img src="/images/icon-tech-notes.svg" class="w-5 h-5" />
                    </div>
                    <div>{{ t("va.technicalNotes") }}</div>
                  </div>
                </q-item>
                <!-- <q-item clickable v-ripple>
                  <div class="flex">
                    <div class="w-8">
                      <img src="/images/icon-user-guide.svg" class="w-5 h-5" />
                    </div>
                    <div>{{ t("va.downloadData") }}</div>
                  </div>
                </q-item> -->
              </q-list>
            </q-menu>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="isShareOpen" persistent>
      <q-card class="max-w-[600px]">
        <div class="px-4 py-3">
          <div class="flex justify-between">
            <div class="flex pb-2">
              <div class="pt-1">
                <img src="/images/shareIconB.svg" alt="" class="h-6" />
              </div>
              <div class="text-xl pl-2 font-semibold">{{ sharePage }}</div>
            </div>
            <div @click="isShareOpen = false" class="cursor-pointer">
              <img src="/images/closeIcon.svg" alt="" />
            </div>
          </div>
          <div class="fsub">
            {{ shareCustomized }}
          </div>
          <div class="pt-2 fsub">{{ shareInput }}</div>
          <div class="flex gap-4 pt-3 justify-center">
            <div>
              <ShareNetwork
                network="facebook"
                :url="shareLink"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                quote="RIVA: Revolutionizing International Trade"
                hashtag="#RIVA"
              >
                <img src="/images/facebookIconColor.svg" alt="" class="h-15" />
              </ShareNetwork>
            </div>
            <div>
              <ShareNetwork
                network="linkedin"
                :url="shareLink"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                source="https://riva.negotiatetrade.org"
              >
                <img src="/images/linkedinIconColor.svg" alt="" class="h-15"
              /></ShareNetwork>
            </div>
            <div>
              <ShareNetwork
                network="twitter"
                :url="shareLink"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                hashtag="#RIVA"
              >
                <img src="/images/xIconColor.svg" alt="" class="h-15" />
              </ShareNetwork>
            </div>
          </div>
          <div class="flex items-center border-1 border-[#999999] gap-2 mt-3">
            <div class="p-2 fsub flex-1 truncate" :title="shareLink">
              {{ shareLink }}
            </div>
            <div
              class="mr-2 w-8 flex justify-center cursor-pointer"
              @click="copyToClipboard"
            >
              <img src="/images/copyIcon.svg" alt="" />
            </div>
          </div>
          <div class="pt-2"></div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { Notify } from "quasar";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
const props = defineProps({
  menu: String,
  isShare: Boolean,
  ShareText: Object,
});

const route = useRoute();
const { t } = useI18n({ useScope: "global" });
const localizedPageName = computed(() => {
  if (props.menu === "Dashboard") return t("va.menu");
  if (props.menu === "gvcoverview") return t("gvc.title");
  if (props.menu === "ParticipationInGVCs") return t("participation.title");
  if (props.menu === "BackwardLinkages") return t("backward.title");
  if (props.menu === "ForwardLinkages") return t("forward.title");
  if (props.menu === "CountryBriefs") return t("nav.briefs");
  return pageName.value;
});
const translationScope = computed(() =>
  props.menu === "ParticipationInGVCs" ? "participation" :
      props.menu === "gvcoverview" ? "gvc" :
      props.menu === "BackwardLinkages" ? "backward" :
        props.menu === "ForwardLinkages" ? "forward" :
          props.menu === "CountryBriefs" ? "economyBrief" : null,
);
const shareAction = computed(() => translationScope.value ? t(`${translationScope.value}.shareAction`) : "SHARE");
const sharePage = computed(() => translationScope.value ? t(`${translationScope.value}.sharePage`) : "Share this page");
const shareCustomized = computed(() => translationScope.value
  ? t(`${translationScope.value}.shareCustomized`, { page: localizedPageName.value })
  : `You can share this customized view of ${pageName.value}`,
);
const pageName = ref("");
const iconFIle = ref("");
const resourceOpen = ref(false);
const isShareOpen = ref(false);
const shareInput = ref("");
const shareLink = ref("");
const isTinaOpen = ref(false);
const isTinaLink = ref(false);

const goToUserGuide = () => {
  console.log("UserGuide");
};

const goToDemoVDO = () => {
  console.log("DemoVDO");
};

const goToTechnicalNotes = () => {
  window.open(
    "https://riva.negotiatetrade.org/riva_docs/va_note/",
    "_blank",
    "noopener,noreferrer",
  );
};

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    Notify.create({
      message: translationScope.value ? t(`${translationScope.value}.copied`) : "Copied to clipboard",
      color: "positive",
      position: "top",
      icon: "fa-solid fa-circle-check",
    });
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const goToTina = () => {
  window.open(
    `https://tina.trade/app/dashboard/${props.ShareText.exporting.iso}-${props.ShareText.importing.iso}?r=current-trade`,
    "_blank",
  );
};

watch(
  () => props.ShareText,
  () => {
    isTinaOpen.value = true;
    isTinaLink.value = "";
    if (props.isShare) {
      if (props.ShareText.yearStart && pageName.value == "GVC Overview") {
        shareInput.value =
          props.ShareText.exporting.name +
          " | " +
          props.ShareText.yearStart +
          " - " +
          props.ShareText.yearEnd;
        shareLink.value = `https://riva.negotiatetrade.org/#/gvcoverview/${props.ShareText.exporting.iso}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}`;
        isTinaOpen.value = false;
      } else if (
        pageName.value == "Backward Linkages" &&
        props.ShareText.sector
      ) {
        shareLink.value = `https://riva.negotiatetrade.org/#/backwardlinkages/${props.ShareText.exporting.iso}/${props.ShareText.importing.iso}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}/${props.ShareText.sector.sectorID}`;
        isTinaOpen.value = true;
        isTinaLink.value = true;
      } else if (
        pageName.value == "Backward Linkages" &&
        props.ShareText.source
      ) {
        shareLink.value = `https://riva.negotiatetrade.org/#/backwardlinkagessource/${props.ShareText.exporting.iso}/${props.ShareText.importing.iso}/${props.ShareText.source.iso}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}`;
        isTinaOpen.value = true;
        isTinaLink.value = true;
      } else if (
        pageName.value == "Forward Linkages" &&
        props.ShareText.sector
      ) {
        shareLink.value = `https://riva.negotiatetrade.org/#/forwardlinkages/${props.ShareText.exporting.iso}/${props.ShareText.sector.sectorID}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}`;
        isTinaOpen.value = false;
        isTinaLink.value = false;
      } else if (
        pageName.value == "Forward Linkages" &&
        props.ShareText.importing
      ) {
        shareLink.value = `https://riva.negotiatetrade.org/#/forwardlinkagesimport/${props.ShareText.exporting.iso}/${props.ShareText.importing.iso}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}`;
        isTinaOpen.value = true;
        isTinaLink.value = true;
      } else if (pageName.value == "Participation in GVCs") {
        shareLink.value = `https://riva.negotiatetrade.org/#/ParticipationInGVCs/${props.ShareText.exporting.iso}/${props.ShareText.importing.iso}/${props.ShareText.yearStart}/${props.ShareText.yearEnd}/${props.ShareText.sector.sectorID}`;
        isTinaOpen.value = true;
        isTinaLink.value = true;
      } else if (pageName.value == "Economy Briefs") {
        shareLink.value = `https://riva.negotiatetrade.org/#/countrybriefs/${props.ShareText.iso}`;
        console.log(shareLink.value);
        isTinaOpen.value = false;
      }
    }
  },
  { deep: true, immediate: true },
);
onMounted(() => {
  if (props.menu == "Dashboard") {
    pageName.value = "Menu";
    iconFIle.value = "/images/vaDashboard.svg";
  } else if (props.menu == "gvcoverview") {
    pageName.value = "GVC Overview";
    iconFIle.value = "/images/vaGVCRelationships.svg";
    isTinaOpen.value = false;
  } else if (props.menu == "BackwardLinkages") {
    pageName.value = "Backward Linkages";
    iconFIle.value = "/images/vaBackward.svg";
  } else if (props.menu == "StructureOfValueAdded") {
    pageName.value = "Structure of Value Added";
    iconFIle.value = "/images/vaStructureOfVA.svg";
    isTinaOpen.value = true;
  } else if (props.menu == "ParticipationInGVCs") {
    pageName.value = "Participation in GVCs";
    iconFIle.value = "/images/vaParticipationGVC.svg";
  } else if (props.menu == "ForwardLinkages") {
    pageName.value = "Forward Linkages";
    iconFIle.value = "/images/vaForward.svg";
  } else if (props.menu == "CountryBriefs") {
    isTinaOpen.value = false;
    pageName.value = "Economy Briefs";
    iconFIle.value = "/images/vaCountryBrief.svg";
  } else if (props.menu == "DirectIndirect") {
    pageName.value = "Direct & indirect linkages";
    iconFIle.value = "/images/vaDirect.svg";
  }
});
</script>

<style lang="scss" scoped></style>
