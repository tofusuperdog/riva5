<template>
  <div>
    <!-- For PC -->
    <div>
      <div class="footerBG text-white">
        <div class="bgDark1 row justify-between">
          <div style="padding-top: 3px" class="q-px-md">
            <img src="images/footerRIVA.svg" alt="" style="height: 50px" />
          </div>
          <div class="row justify-between q-px-md" style="width: 200px">
            <!-- Facebook Share -->
            <div style="padding-top: 7px">
              <ShareNetwork
                network="facebook"
                url="https://riva.negotiatetrade.org"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                quote="RIVA: Revolutionizing International Trade"
                hashtag="#RIVA"
              >
                <img
                  src="images/facebook.svg"
                  alt="Facebook Share"
                  style="height: 35px"
                  class="cursor-pointer"
                />
              </ShareNetwork>
            </div>
            <!-- Twitter Share -->
            <div style="padding-top: 7px">
              <ShareNetwork
                network="twitter"
                url="https://riva.negotiatetrade.org"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                hashtag="#RIVA"
              >
                <img
                  src="images/x.svg"
                  alt="Twitter Share"
                  style="height: 35px"
                  class="cursor-pointer"
                />
              </ShareNetwork>
            </div>
            <!-- LinkedIn Share -->
            <div style="padding-top: 7px">
              <ShareNetwork
                network="linkedin"
                url="https://riva.negotiatetrade.org"
                title="RIVA - A Revolutionary Platform"
                description="Discover the RIVA platform by the United Nations"
                source="https://riva.negotiatetrade.org"
              >
                <img
                  src="images/in.svg"
                  alt="LinkedIn Share"
                  style="height: 35px"
                  class="cursor-pointer"
                />
              </ShareNetwork>
            </div>
          </div>
          <div class="whiteLine"></div>

          <div class="row justify-between" style="width: 100%; height: 55px">
            <div class="row q-pt-sm q-px-md">
              <div class="cursor-pointer" @click="goToFealac()">
                <img src="images/fealac.svg" alt="" />
              </div>
              <div class="q-px-md">
                <img src="images/12x.png" alt="" style="height: 45px" />
              </div>
              <div><img src="images/adb.svg" alt="" /></div>
            </div>
            <div
              class="row text-white q-px-md"
              style="font-size: 20px; line-height: 55px"
            >
              <div class="cursor-pointer" @click="isShowAboutDia = true">
                About
              </div>
              <div style="width: 30px"></div>
              <div class="cursor-pointer" @click="isShowTermDia = true">
                Terms of use
              </div>
            </div>
          </div>
        </div>
        <div class="bgDark2 row">
          <div class="col-6 q-px-md">
            <div>ABOUT RIVA</div>
            <div style="font-size: 11px">
              RIVA is developed by the Trade, Investment and Innovation Division
              of the United Nations Economic and Social Commission for Asia and
              the Pacific, in collaboration with the Asian Development Bank,
              Economic Commission for Latin America and the Caribbean, Economic
              Commission for Africa, and Forum for East Asia-Latin America
              Cooperation. For questions, please contact us at
              <a
                href="mailto: escap-tiid@un.org"
                style="text-decoration: underline; color: white"
                >escap-tiid@un.org</a
              >
            </div>
          </div>
          <div class="col-6 q-px-md">
            <div class="font-footer">DISCLAIMER</div>
            <div style="font-size: 11px">
              ESCAP gratefully acknowledges use of data from the ADB MRIO
              database to analyze value chains, and databases of ILO, IMF, ITU,
              OECD, UNESCAP, UN Comtrade, UNCTAD and World Bank to analyze
              regional integration
            </div>
          </div>
        </div>
      </div>
      <q-dialog v-model="isShowAboutDia">
        <q-card class="showDia">
          <div class="titleDiaPC text-center q-py-sm">About</div>
          <div class="hrBlue"></div>
          <div class="q-pa-lg">
            RIVA Value Chain Analyzer, version 1.0, is an online tool developed
            by ESCAP, in collaboration with ECLAC, and sponsored by FEALAC. It
            has been designed to support policy makers, analysts and researchers
            to better understand their economy's integration in global value
            chains (GVCs). RIVA Value Chain Analyzer provides data and
            indicators based on estimated trade in value added flows between 72
            economies in 38 sectors for 2007, 2011 and 2017.
          </div>
        </q-card>
      </q-dialog>

      <q-dialog v-model="isShowTermDia">
        <q-card class="showDia">
          <div class="titleDiaPC text-center q-py-sm">Terms of use</div>
          <div class="hrBlue"></div>
          <div class="q-pa-lg">
            <div>
              All users may publish information taken directly or derived from
              the platform, on the condition that:
            </div>
            <div>
              <ul>
                <li>
                  The platform in acknowledged, cited as ESCAP RIVA, accessed
                  (month year), available at
                  <u class="cursor-pointer" @click="gotoRiva()"
                    >riva.negotiatetrade.org</u
                  >
                </li>
                <li>
                  Any conclusions or analyses based on the data and
                  visualizations provided are accompanied by a disclaimer
                  stating that they are the responsibility of the authors and do
                  not necessarily represent the opinion of the United Nations.
                </li>
                <li>
                  Any re-dissemination by third parties of the data based on
                  data downloads which goes beyond the purpose of publication of
                  analytical work must be approved by the United Nations
                  Secretariat prior to such re-dissemination.
                </li>
              </ul>
            </div>
            <div>Requests can be sent to:</div>
            <div>Trade, Investment and Innovation Division,</div>
            <div>United Nations ESCAP, Email: escap-tiid@un.org</div>
          </div>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const goToFealac = () => {
  window.open("https://www.fealac.org/new/m/index.do");
};

//Dialog about and term of use
const isShowAboutDia = ref(false);
const isShowTermDia = ref(false);
</script>

<style lang="scss" scoped>
.footerBG {
  background-image: url("https://riva.negotiatetrade.org/images/footerBg.jpg");
  width: 100%;
  height: 190px;
  background-size: cover;
}
.bgDark1 {
  background-color: rgba($color: #000000, $alpha: 0.75);
  height: 55px;
  margin: 0px;
  font-size: 0px;
}
.whiteLine {
  height: 3px;
  width: 100%;
  background-color: #c4c4c4;
  margin: 0px;
  font-size: 0px;
}
.bgDark2 {
  background-color: rgba($color: #000000, $alpha: 0.45);
  height: 75px;
  width: 100%;
  position: relative;
  top: 60px;
}
.showDia {
  width: 100%;
  max-width: 750px;

  border-radius: 5px;
}
.titleDiaPC {
  font-size: 32px;
}
.hrBlue {
  width: 95%;
  margin: auto;
  height: 2px;
  background-color: #0f0852;
}
</style>
