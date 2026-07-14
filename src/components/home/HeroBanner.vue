<template>
  <section
    ref="heroElement"
    :style="heroStyle"
    class="hero-banner h-[calc(100dvh-60px)] text-white"
  >
    <div
      class="hero-content relative mx-auto flex h-full w-full max-w-[1400px] items-end justify-end px-4 py-12 lg:px-8 lg:pb-16"
    >
      <div class="hero-copy max-w-[630px]">
        <h1 class="hero-title font-semibold leading-tight">
          {{ t('home.heroTitle') }}
        </h1>
        <p class="mt-4 max-w-[570px] text-sm leading-7 md:text-base">
          {{ t('home.heroDescription') }}
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <q-btn
            no-caps
            unelevated
            class="hero-primary"
            aria-label="Value Chains Analyzer"
            @click="goToVA"
          >
            <img src="/images/vaLogo.svg" alt="" class="hero-button-icon" />
            <span class="hero-button-copy">
              <span class="hero-button-title">{{ t('nav.valueChains') }}</span>
            </span>
          </q-btn>
          <q-btn
            no-caps
            outline
            class="hero-secondary"
            aria-label="Sectoral GVC Analysis"
            @click="goToHealthSector"
          >
            <img
              src="/images/sectoralanalysis.svg"
              alt=""
              class="hero-button-icon"
            />
            <span class="hero-button-copy">
              <span class="hero-button-title">{{ t('nav.sectoral') }}</span>
            </span>
          </q-btn>
        </div>
      </div>
      <div class="scroll-cue" aria-label="Scroll down to explore more content">
        <span>{{ t('home.scroll') }}</span>
        <q-icon name="keyboard_arrow_down" />
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const { proxy } = getCurrentInstance();
const heroElement = ref(null);
const parallaxOffset = ref(0);
const heroStyle = computed(() => ({
  backgroundPosition: `center calc(50% + ${parallaxOffset.value}px)`,
}));

const updateParallax = () => {
  if (window.innerWidth < 1024 || !heroElement.value) {
    parallaxOffset.value = 0;
    return;
  }

  const heroTop = heroElement.value.getBoundingClientRect().top;
  parallaxOffset.value = Math.max(-80, Math.min(80, -heroTop * 0.15));
};

onMounted(() => {
  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateParallax);
  window.removeEventListener("resize", updateParallax);
});

const goToVA = () => {
  proxy.$gtag.event("value_chain_analyzer_click", {
    button_name: "Value Chains Analyzer",
    page_title: "Welcome Page",
    page_path: "/",
  });
  router.push("/va");
};

const goToHealthSector = () => router.push("/sectoral-analysis/health");
</script>

<style scoped>
.hero-banner {
  background-image:
    linear-gradient(90deg, rgba(0, 25, 67, 0.32) 0%, rgba(0, 25, 67, 0.06) 65%),
    url("/images/indexBG.webp");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.hero-copy {
  padding: 1.5rem;
  background: linear-gradient(to bottom left, #1b81c1 0%, #1a425a 100%);
}

.scroll-cue {
  position: absolute;
  right: 1rem;
  bottom: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  letter-spacing: 0.04em;
}

.scroll-cue :deep(.q-icon) {
  font-size: 1.5rem;
  animation: scroll-bounce 1.6s ease-in-out infinite;
}

@keyframes scroll-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

.hero-title {
  font-size: 24px;
  font-weight: 600;
  white-space: pre-line;
}

@media (max-width: 767px) {
  .hero-banner {
    height: calc(100dvh - 120px);
  }

  .hero-content {
    padding-right: 0;
    padding-bottom: 0;
    padding-left: 0;
  }

  .hero-copy {
    width: 100%;
    max-width: none;
    padding: 1rem;
  }

  .hero-title {
    font-size: 19px;
    line-height: 1.1;
  }

  .hero-copy .mt-4 {
    margin-top: 0.75rem;
  }

  .hero-copy > .flex {
    justify-content: center;
  }

  .hero-copy > p {
    font-size: 13px;
    line-height: 1.45;
  }

  .scroll-cue {
    display: none;
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 26px;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .hero-banner {
    height: calc(100dvh - 120px);
  }

  .hero-content {
    padding-right: 0;
    padding-bottom: 0;
    padding-left: 0;
  }

  .hero-copy {
    width: 100%;
    max-width: none;
    padding: 1rem 2rem;
  }

  .hero-title {
    line-height: 1.1;
  }

  .hero-copy .mt-4 {
    margin-top: 0.75rem;
  }

  .hero-copy > p {
    line-height: 1.5;
  }

  .scroll-cue {
    display: none;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 43px !important;
    line-height: 1.125;
  }
  .hero-copy {
    width: 60%;
    max-width: none;
    padding: 2.5rem;
  }
  .scroll-cue {
    right: 2rem;
    bottom: 1.25rem;
  }
  .hero-primary,
  .hero-secondary {
    height: 60px !important;
    min-height: 60px !important;
    border-radius: 6px;
    padding: 0 12px;
  }
  .hero-primary :deep(.q-btn__content),
  .hero-secondary :deep(.q-btn__content) {
    justify-content: center;
  }
  .hero-button-icon {
    width: 32px;
    height: 32px;
    margin-right: 10px;
  }
}

.hero-primary,
.hero-secondary {
  width: min(100%, 310px);
  height: 60px;
  padding: 0 12px;
  border-radius: 6px;
  text-align: left;
}
.hero-primary :deep(.q-btn__content),
.hero-secondary :deep(.q-btn__content) {
  justify-content: center;
  flex-wrap: nowrap;
}
.hero-primary {
  background: #fdc300;
  color: #111827;
}
.hero-secondary {
  border-color: #fff;
  color: #fff;
}
.hero-button-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  object-fit: contain;
}
.hero-button-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 1.2;
}
.hero-button-title {
  font-size: 15px;
  font-weight: 700;
  white-space: normal;
}
</style>
