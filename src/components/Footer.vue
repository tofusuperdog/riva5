<template>
  <div class="bg-[#021527]">
    <div class="bg-[#072743]">
      <div class="footer-partners-bar bg-[#072743] max-w-[1400px] mx-auto">
        <div class="footer-partners">
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
        <div class="footer-terms fwhite cursor-pointer md:text-lg" @click="openTerms()">
          {{ t('footer.terms') }}
        </div>
      </div>
    </div>
    <div
      class="bg-[#021527] px-4 py-2 flex flex-col md:flex-row justify-between lg:gap-32 md:gap-8 gap-2 max-w-[1400px] mx-auto"
    >
      <div class="fwhitesub order-2 md:order-1 md:flex-1">
        <div class="font-bold text-sm">{{ t('footer.disclaimerTitle') }}</div>
        <div class="text-xs">
          {{ t('footer.disclaimer', { email: 'escap-tiid@un.org' }) }}
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
            <q-icon name="gavel" /> {{ t('footer.terms') }}
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
            {{ t('footer.termsIntro') }}
          </p>

          <ul class="list-disc pl-6 space-y-2">
            <li>
              {{ t('footer.termsOne') }}
              <a
                href="https://riva.negotiatetrade.org"
                target="_blank"
                class="text-primary underline"
              >
                riva.negotiatetrade.org </a
              >.
            </li>
            <li>
              {{ t('footer.termsTwo') }}
            </li>
            <li>
              {{ t('footer.termsThree') }}
            </li>
          </ul>

          <div class="mt-4 text-sm">
            <p class="mb-1 text-bold">{{ t('footer.requests') }}</p>
            <p>
              {{ t('footer.division') }}<br />

              {{ t('footer.unEscap') }}<br />
              {{ t('footer.email') }}
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
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const isTermsOpen = ref(false);

const openTerms = () => {
  isTermsOpen.value = true;
};
const goToFealac = () => {
  window.open("https://www.fealac.org/", "_blank");
};
</script>

<style lang="scss" scoped>
.footer-partners-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  gap: 1.5rem;
  padding: 0 1rem;
}

.footer-partners {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-terms {
  transition: color 0.2s ease;
}

.footer-terms:hover {
  color: #fdc300;
}

@media (max-width: 767px) {
  .footer-partners-bar {
    display: block;
    height: auto;
    padding: 0;
  }

  .footer-partners {
    justify-content: center;
    gap: 1rem;
    min-height: 48px;
    padding: 0.45rem 1rem;
  }

  .footer-terms {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    background: #0b3656;
    padding: 0.55rem 1rem;
    color: #fff;
    font-size: 0.9375rem;
    font-weight: 600;
    text-align: center;
  }
}
</style>
