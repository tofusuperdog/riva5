<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div class="row">
        <div class="q-pa-md">
          <img src="images/unescaplogo.svg" alt="" style="height: 60px" />
        </div>
        <div style="padding-top: 25px">
          <img
            src="images/home.png"
            alt=""
            class="cursor-pointer"
            @click="goToHome()"
          />
        </div>
      </div>
      <div class="row">
        <div style="width: 170px; padding: 10px">
          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToIntro()"
          >
            Introduction
          </div>

          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToUserGuide()"
          >
            User Guide
          </div>
          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="isDemoDia = true"
          >
            Demo Videos
          </div>
          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToNote()"
          >
            Technical Notes
          </div>
        </div>
        <div class="col">
          <div style="font-size: 42px" class="text-center">
            Regional Integration Analyzer
          </div>
          <div class="text-center" style="font-size: 20px">
            Explore international integration for Asia-Pacific economies based
            on
          </div>
          <div class="text-center" style="font-size: 20px">
            ESCAP's Digital and Sustainable Regional Integration Index
            (DigiSRII) 2.0.
          </div>
        </div>
        <div style="width: 170px; padding: 10px">
          <div class="menuBtn2 q-my-sm"></div>
          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToCountryBrief()"
          >
            Country Briefs
          </div>

          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToData()"
          >
            Data Availability
          </div>
          <div
            class="menuBtn q-pa-sm borderWhite q-my-sm cursor-pointer"
            @click="goToDownload"
          >
            Download Data
          </div>
        </div>
      </div>
    </div>
    <hr style="margin: 0px" />
    <!-- DigiSRII index structure -->
    <div
      style="
        font-size: 20px;
        text-decoration: underline;
        height: 50px;
        line-height: 50px;
        background-color: #04284d;
      "
      class="text-center cursor-pointer text-white"
      v-if="!showStructure"
      @click="showStructure = true"
    >
      Click here to reveal DigiSRII index structure
    </div>
    <div v-else style="background-color: #04284d">
      <div class="q-pa-md text-right">
        <q-icon
          name="fa-solid fa-xmark"
          size="24px"
          class="cursor-pointer"
          @click="showStructure = false"
        />
      </div>
      <div class="text-center q-pb-lg">
        <img src="images/structure.svg" alt="" />
      </div>
    </div>
    <div class="row" style="height: 85px; background-color: #404040">
      <div
        class="col-3 borderwhite cursor-pointer text-white"
        :style="menu == 0 ? 'background-color:#2D9687' : ''"
        align="center"
        @click="gotoOverview()"
      >
        <div class="row" style="width: 320px">
          <div class="flex w-[35px]" style="line-height: 85px">
            <img src="images/icon00.svg" alt="" />
          </div>
          <div align="left">
            <div class="font-16 q-pt-sm">Integration overview</div>
            <div class="font-12">
              Select an economy or a pre-selected group to quickly<br />
              analyse integration with Asia and the Pacific
            </div>
          </div>
        </div>
      </div>
      <div
        class="col-3 borderwhite cursor-pointer text-white"
        :style="menu == 1 ? 'background-color:#2D9687' : ''"
        align="center"
        @click="gotoIntra()"
      >
        <div class="row" style="width: 320px">
          <div class="q-pa-sm">
            <img src="images/icon01.svg" alt="" />
          </div>
          <div align="left">
            <div class="font-16 q-pt-sm">Intra-group integration</div>
            <div class="font-12">
              Select a group of economies to<br />
              assess intra-group integration
            </div>
          </div>
        </div>
      </div>
      <div
        class="col-3 borderwhite cursor-pointer text-white"
        :style="menu == 2 ? 'background-color:#2D9687' : ''"
        align="center"
        @click="gotoPartner()"
      >
        <div class="row" style="width: 350px">
          <div class="q-pa-md">
            <img src="images/icon02.svg" alt="" />
          </div>
          <div align="left">
            <div class="font-16 q-pt-sm">Economy-partner(s) integration</div>
            <div class="font-12">
              Select one or more economies to examine<br />
              integration with other economies
            </div>
          </div>
        </div>
      </div>
      <div
        class="col-3 borderwhite cursor-pointer text-white"
        :style="menu == 3 ? 'background-color:#2D9687' : ''"
        align="center"
        @click="gotoBuildYourOwn()"
      >
        <div class="row" style="width: 350px">
          <div class="q-pa-md">
            <img src="images/icon03.svg" alt="" />
          </div>
          <div align="left">
            <div class="font-16 q-pt-sm">Build your own</div>
            <div class="font-12">
              Select specific dimensions and any combination<br />
              of economies to build your own integration index
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Demo vdo -->
    <q-dialog v-model="isDemoDia" persistent>
      <q-card class="demoDiv q-pa-md">
        <div class="row justify-between">
          <div></div>
          <div class="text-center" style="font-size: 24px">Demo Videos</div>
          <div>
            <q-icon
              name="fa-solid fa-xmark"
              size="24px"
              class="cursor-pointer"
              @click="isDemoDia = false"
            />
          </div>
        </div>
        <div class="row justify-center q-pt-md">
          <div style="width: 325px"></div>
          <div style="width: 600px">
            <div class="text-center">Introduction, key concepts and tools</div>
            <div class="bracket"></div>
          </div>
        </div>

        <div class="row justify-center q-pt-md">
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster1.jpg">
              <source :src="vdoDemo(1)" type="video/mp4" />
            </video>
            <div class="text-center">(0/5) Promotional Video</div>
          </div>
          <div style="width: 50px"></div>
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster2.jpg">
              <source :src="vdoDemo(2)" type="video/mp4" />
            </video>
            <div class="text-center">(0/1) Introduction</div>
          </div>
          <div style="width: 50px"></div>
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster3.jpg">
              <source :src="vdoDemo(3)" type="video/mp4" />
            </video>
            <div class="text-center">(2/5) Exploring Navigation Options</div>
          </div>
        </div>
        <div class="row justify-center q-pt-md">
          <div style="width: 925px">
            <div class="text-center">Section by section demonstrations</div>
            <div class="bracket"></div>
          </div>
        </div>
        <div class="row justify-center q-pt-md">
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster4.jpg">
              <source :src="vdoDemo(4)" type="video/mp4" />
            </video>
            <div class="text-center">(3/5) Intra-group section</div>
          </div>
          <div style="width: 50px"></div>
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster5.jpg">
              <source :src="vdoDemo(5)" type="video/mp4" />
            </video>
            <div class="text-center">(4/5) Economy-partner section</div>
          </div>
          <div style="width: 50px"></div>
          <div style="width: 275px">
            <video controls style="width: 100%" poster="images/poster6.jpg">
              <source :src="vdoDemo(6)" type="video/mp4" />
            </video>
            <div class="text-center">(5/5) Build you own</div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { serverSetup } from "../pages/server.js";
import { ref } from "vue";

const { serverData } = serverSetup();
const props = defineProps({
  menu: {
    type: Number,
    required: true,
  },
});
const router = useRouter();
const showStructure = ref(false);
const isDemoDia = ref(false);

const goToHome = () => {
  router.push("/");
};
const goToIntro = () => {
  window.open(serverData.value + "ri_intro", "_blank");
};
const goToUserGuide = () => {
  window.open(serverData.value + "ri_userguide", "_blank");
};
const goToNote = () => {
  window.open(serverData.value + "ri_note", "_blank");
};
const gotoOverview = () => {
  router.push("/rioverview");
};
const gotoIntra = () => {
  router.push("/riintragroup");
};
const goToDownload = () => {
  router.push("/ridownload");
};
const goToData = () => {
  router.push("/ridataavail");
};
const goToCountryBrief = () => {
  router.push("/ricountrybrief");
};
const gotoPartner = () => {
  router.push("/riecopartner");
};
const gotoBuildYourOwn = () => {
  router.push("/ribuildyourown");
};
const vdoDemo = (vdoID) => {
  return serverData.value + "ri_demo/" + vdoID + ".webm";
};
</script>

<style lang="scss" scoped>
// .mainApp {
//   width: 100%;
//   max-width: 1400px;
//   margin: auto;
//   background-color: #04284d;
//   color: white;
// }
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  color: white;
  background-image: url("https://riva.negotiatetrade.org/images/rabg.jpg");
  background-size: cover;
}
.menuBtn {
  width: 150px;
  height: 35px;
  text-align: center;
  border-radius: 3px;
  background-color: rgba($color: #747474, $alpha: 0.6);
  color: white;
}
.menuBtn:hover {
  background-color: rgba($color: #747474, $alpha: 0.9);
}
.menuBtn2 {
  width: 150px;
  height: 35px;
}
.borderWhite {
  border: 1px solid white;
}
.font-16 {
  font-size: 16px;
  color: white;
}
.font-12 {
  font-size: 12px;
  color: white;
}
.borderwhite {
  border: 1px solid white;
  height: 85px;
}
.demoDiv {
  width: 100%;
  max-width: 1000px;
  height: 560px;
}
.bracket {
  width: 100%;
  height: 10px;
  border-left: 1px solid black;
  border-right: 1px solid black;
  border-top: 1px solid black;
}
</style>
