<template>
  <div class="bg-[#021527]">
    <div class="bg-[#072743]">
      <div
        class="bg-[#072743] h-[45px] md:h-[60px] flex justify-between gap-6 items-center px-4 max-w-[1400px] mx-auto"
      >
        <div class="flex gap-2 md:gap-4 items-center">
          <div class="pt-1 cursor-pointer" @click="goToFealac">
            <img src="/images/fealacLogo.svg" alt="" class="h-7 md:h-9" />
          </div>
          <div class="pt-2">
            <img src="/images/eclacLogo.svg" alt="" class="h-7 md:h-9" />
          </div>
          <div class="pt-2">
            <img src="/images/adbLogo.svg" alt="" class="h-7 md:h-9" />
          </div>
        </div>
        <div class="fwhite cursor-pointer md:text-lg" @click="openTerms()">
          Term of use
        </div>
      </div>
    </div>
    <div
      class="bg-[#021527] px-4 py-2 flex flex-col md:flex-row justify-between lg:gap-32 md:gap-8 gap-2 max-w-[1400px] mx-auto"
    >
      <div class="fwhitesub order-2 md:order-1 md:flex-1">
        <div class="font-bold text-sm">DISCLAIMER:</div>
        <div class="text-xs">
          RIVA is powered by the Trade, Investment and Innovation Division of
          the United Nations Economic and Social Commission for Asia and the
          Pacific. For questions, please contact us at escap-tiid@un.org.
        </div>
      </div>
      <!-- <div class="fwhite order-1 py-1 md:order-2 max-w-[600px] md:flex-1">
        <div class="bg-[#222C3A] p-3 md:p-5 h-full flex items-center">
          <div class="flex items-center flex-row md:flex-col lg:flex-row">
            <div class="w-1/2 md:w-full lg:w-1/2">
              <div class="text-bold md:text-lg">Do you find RIVA useful?</div>
              <div class="text-xs pt-2 md:text-base">
                Share RIVA with your colleagues & friends through social media.
                Thank you!.
              </div>
            </div>
            <div class="flex gap-3 md:gap-5 pt-3 md:pt-4 justify-center flex-1">
              <div>
                <ShareNetwork
                  network="facebook"
                  url="https://riva.negotiatetrade.org"
                  title="RIVA - A Revolutionary Platform"
                  description="Discover the RIVA platform by the United Nations"
                  quote="RIVA: Revolutionizing International Trade"
                  hashtag="#RIVA"
                >
                  <img
                    src="/images/facebookIcon.svg"
                    alt=""
                    class="h-10 md:h-12"
                  />
                </ShareNetwork>
              </div>
              <div>
                <ShareNetwork
                  network="linkedin"
                  url="https://riva.negotiatetrade.org"
                  title="RIVA - A Revolutionary Platform"
                  description="Discover the RIVA platform by the United Nations"
                  source="https://riva.negotiatetrade.org"
                >
                  <img
                    src="/images/linkedinIcon.svg"
                    alt=""
                    class="h-10 md:h-12"
                /></ShareNetwork>
              </div>
              <div>
                <ShareNetwork
                  network="twitter"
                  url="https://riva.negotiatetrade.org"
                  title="RIVA - A Revolutionary Platform"
                  description="Discover the RIVA platform by the United Nations"
                  hashtag="#RIVA"
                >
                  <img src="/images/xIcon.svg" alt="" class="h-10 md:h-12" />
                </ShareNetwork>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <q-dialog v-model="isTermsOpen" persistent>
      <q-card class="fblack p-4 max-w-xl">
        <div class="flex justify-between items-center">
          <div class="text-xl text-bold flex items-center gap-2">
            <q-icon name="gavel" /> Terms of Use
          </div>
          <q-icon
            name="close"
            size="md"
            class="cursor-pointer"
            @click="isTermsOpen = false"
          />
        </div>

        <q-separator spaced />

        <div class="text-sm">
          <p class="mb-4">
            All users may publish information taken directly from, or derived
            from, the platform under the following conditions:
          </p>

          <ul class="list-disc pl-6 space-y-2">
            <li>
              The platform is acknowledged, cited as
              <strong>ESCAP RIVA</strong>, accessed (e.g., September 2025), and
              available at
              <a
                href="https://riva.negotiatetrade.org"
                target="_blank"
                class="text-primary underline"
              >
                riva.negotiatetrade.org </a
              >.
            </li>
            <li>
              Any conclusions or analyses based on the data and visualizations
              provided must be accompanied by a disclaimer stating that they are
              the responsibility of the authors and do not necessarily reflect
              the views of the United Nations.
            </li>
            <li>
              Any re-dissemination of the data by third parties — based on
              downloaded content — which goes beyond the scope of analytical
              publication must receive prior approval from the United Nations
              Secretariat.
            </li>
          </ul>

          <div class="mt-4 text-sm">
            <p class="mb-1 text-bold">Requests can be sent to:</p>
            <p>
              Trade, Investment and Innovation Division<br />

              United Nations ESCAP<br />
              Email:
              <a href="mailto:escap-tiid@un.org" class="text-primary underline"
                >escap-tiid@un.org</a
              >
            </p>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
const isTermsOpen = ref(false);

const openTerms = () => {
  isTermsOpen.value = true;
};
const goToFealac = () => {
  window.open("https://www.fealac.org/", "_blank");
};
</script>

<style lang="scss" scoped></style>
