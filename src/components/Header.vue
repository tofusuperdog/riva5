<template>
  <header class="site-header sticky top-0 z-50 bg-[#02253D] text-white shadow-sm">
    <div class="mx-auto flex h-15 w-full max-w-[1400px] items-center px-4">
      <q-btn flat round dense icon="menu" class="header-menu-button lt-lg shrink-0" aria-label="Open menu" @click="menuOpen = true" />

      <div class="flex shrink-0 items-center">
        <button
          type="button"
          class="flex cursor-pointer items-center"
          aria-label="Go to home"
          @click="goToHome"
        >
          <img src="/images/escap.svg" alt="ESCAP" class="h-8 sm:h-12 lg:h-13" />
          <span class="mx-1.5 h-6 border-l-2 border-white sm:mx-2 sm:h-9"></span>
          <img src="/images/rivaWhiteLogo2.svg" alt="RIVA" class="h-8 sm:h-12 lg:h-13" />
        </button>
      </div>

      <nav class="gt-lg desktop-nav-force flex flex-1 items-center justify-center gap-12 text-sm" aria-label="Main navigation">
        <button :class="['nav-link', { 'nav-link--active': currentRoute.path === '/' }]" @click="goToHome">{{ t('nav.home') }}</button>

        <q-btn flat dense no-caps :class="['nav-button', { 'nav-button--active': isValueChainsRoute }]" :label="t('nav.valueChains')" icon-right="expand_more">
          <q-menu class="min-w-[250px]">
            <q-list padding>
              <q-item v-for="item in valueChainsMenu" :key="item.name" v-close-popup clickable @click="item.action">
                <q-item-section avatar><img :src="item.icon" alt="" class="h-5" /></q-item-section>
                <q-item-section>{{ t(item.labelKey) }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat dense no-caps :class="['nav-button', { 'nav-button--active': currentRoute.path.startsWith('/sectoral-analysis') }]" :label="t('nav.sectoral')" icon-right="expand_more">
          <q-menu class="min-w-[180px]">
            <q-list padding>
              <q-item v-close-popup clickable @click="goToHealthSector">
                <q-item-section avatar><img src="/images/heart.svg" alt="" class="menu-icon" /></q-item-section>
                <q-item-section>{{ t('nav.health') }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <button :class="['nav-link', { 'nav-link--active': currentRoute.path === '/about' }]" @click="goToAbout">{{ t('nav.about') }}</button>
      </nav>

      <q-btn flat dense no-caps class="gt-lg desktop-language-force nav-button" aria-label="Select language">
        <img :src="languageFlags[selectedLanguage]" alt="" class="mr-2 h-4 w-5 rounded-sm object-cover" />
        <span>{{ selectedLanguage }}</span>
        <q-icon name="expand_more" class="ml-1" />
        <q-menu>
          <q-list padding class="min-w-[150px]">
            <q-item v-for="language in languages" :key="language" v-close-popup clickable @click="selectLanguage(language)">
              <q-item-section avatar><img :src="languageFlags[language]" alt="" class="h-4 w-5 rounded-sm object-cover" /></q-item-section>
              <q-item-section>{{ language }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <div class="lt-lg ml-auto shrink-0">
        <q-btn flat dense no-caps class="gt-xs nav-button" aria-label="Select language">
          <img :src="languageFlags[selectedLanguage]" alt="" class="mr-2 h-4 w-5 rounded-sm object-cover" />
          <span>{{ selectedLanguage }}</span>
          <q-icon name="expand_more" class="ml-1" />
          <q-menu>
            <q-list padding class="min-w-[150px]">
              <q-item v-for="language in languages" :key="`compact-language-${language}`" v-close-popup clickable @click="selectLanguage(language)">
                <q-item-section avatar><img :src="languageFlags[language]" alt="" class="h-4 w-5 rounded-sm object-cover" /></q-item-section>
                <q-item-section>{{ language }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round dense class="lt-sm" aria-label="Select language">
          <img :src="languageFlags[selectedLanguage]" :alt="`${selectedLanguage} flag`" class="h-4 w-5 rounded-sm object-cover" />
          <q-menu>
            <q-list padding class="min-w-[150px]">
              <q-item v-for="language in languages" :key="`mobile-language-${language}`" v-close-popup clickable @click="selectLanguage(language)">
                <q-item-section avatar><img :src="languageFlags[language]" alt="" class="h-4 w-5 rounded-sm object-cover" /></q-item-section>
                <q-item-section>{{ language }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <q-dialog v-model="menuOpen" position="left" full-height>
      <q-card class="h-full w-[min(360px,90vw)]">
        <q-card-section class="flex items-center justify-between bg-[#02253D] text-white">
          <img src="/images/rivaWhiteLogo.svg" alt="RIVA" class="h-9" />
          <q-btn flat round dense icon="close" aria-label="Close menu" @click="menuOpen = false" />
        </q-card-section>
        <q-list separator>
          <q-item clickable :class="{ 'mobile-nav-item--active': isActive('/') }" @click="goToHome"><q-item-section>{{ t('nav.home') }}</q-item-section></q-item>
          <q-expansion-item :label="t('nav.valueChains')" expand-separator default-opened :header-class="{ 'mobile-nav-item--active': isValueChainsRoute }">
            <q-item v-for="item in valueChainsMenu" :key="`mobile-${item.name}`" clickable class="pl-8" :class="{ 'mobile-nav-item--active': isActive(item.path) }" @click="item.action">
              <q-item-section avatar><img :src="item.icon" alt="" class="h-5" /></q-item-section>
              <q-item-section>{{ t(item.labelKey) }}</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item :label="t('nav.sectoral')" expand-separator :header-class="{ 'mobile-nav-item--active': currentRoute.path.startsWith('/sectoral-analysis') }">
            <q-item clickable class="pl-8" :class="{ 'mobile-nav-item--active': isActive('/sectoral-analysis/health') }" @click="goToHealthSector">
              <q-item-section avatar><img src="/images/heart.svg" alt="" class="menu-icon" /></q-item-section>
              <q-item-section>{{ t('nav.health') }}</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item clickable :class="{ 'mobile-nav-item--active': isActive('/about') }" @click="goToAbout"><q-item-section>{{ t('nav.about') }}</q-item-section></q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </header>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const currentRoute = useRoute();
const { locale, t } = useI18n({ useScope: "global" });
const menuOpen = ref(false);
const languageLocales = { English: "en-US", Chinese: "zh-CN", Russian: "ru-RU", French: "fr-FR" };
const selectedLanguage = computed(() => Object.keys(languageLocales).find((language) => languageLocales[language] === locale.value) || "English");
const languages = ["English", "Chinese", "Russian", "French"];
const languageFlags = {
  English: "/images/flags/GBR.png",
  Chinese: "/images/flags/CHN.png",
  Russian: "/images/flags/RUS.png",
  French: "/images/flags/FRA.png",
};

const selectLanguage = (language) => {
  locale.value = languageLocales[language];
  localStorage.setItem("riva-locale", locale.value);
};

const navigate = (path) => {
  router.push(path);
  menuOpen.value = false;
};

const goToHome = () => navigate("/");
const goToAbout = () => navigate("/about");
const goToHealthSector = () => navigate("/sectoral-analysis/health");
const isActive = (path) => {
  const currentPath = currentRoute.path;
  const isRouteBranch =
    currentPath === path || currentPath.startsWith(`${path}/`);

  if (path === "/backwardlinkages") {
    return (
      isRouteBranch ||
      currentPath === "/backwardlinkagessource" ||
      currentPath.startsWith("/backwardlinkagessource/")
    );
  }

  if (path === "/forwardlinkages") {
    return (
      isRouteBranch ||
      currentPath === "/forwardlinkagesimport" ||
      currentPath.startsWith("/forwardlinkagesimport/")
    );
  }

  return isRouteBranch;
};

const valueChainsMenu = [
  { name: "dashboard", labelKey: "nav.overview", icon: "/images/vaDashboardB.svg", path: "/va", action: () => navigate("/va") },
  { name: "gvc", labelKey: "nav.gvcOverview", icon: "/images/vaGVCRelationshipsB.svg", path: "/gvcoverview", action: () => navigate("/gvcoverview") },
  { name: "participation", labelKey: "nav.participation", icon: "/images/vaParticipationGVCB.svg", path: "/participationingvcs", action: () => navigate("/participationingvcs") },
  { name: "backward", labelKey: "nav.backward", icon: "/images/vaBackwardB.svg", path: "/backwardlinkages", action: () => navigate("/backwardlinkages") },
  { name: "forward", labelKey: "nav.forward", icon: "/images/vaForwardB.svg", path: "/forwardlinkages", action: () => navigate("/forwardlinkages") },
  { name: "briefs", labelKey: "nav.briefs", icon: "/images/vaCountryBriefB.svg", path: "/countrybriefs", action: () => navigate("/countrybriefs") },
];

const isValueChainsRoute = computed(() =>
  valueChainsMenu.some((item) => isActive(item.path)),
);
</script>

<style scoped>
.nav-link { padding: 0.25rem 0 0.125rem; color: white; cursor: pointer; }
.nav-link:hover { color: #fdc300; }
.nav-link--active { border-bottom: 2px solid #fdc300; }
.nav-button { color: white; cursor: pointer; font-size: 0.875rem; }
.nav-button:hover { color: #fdc300; }
.nav-button--active { border-bottom: 2px solid #fdc300; }
.menu-icon { height: 1.25rem; width: 1.25rem; filter: grayscale(1) brightness(0.46); object-fit: contain; }
.mobile-nav-item--active { background: #e8f4fb; color: #0b5d8e; font-weight: 600; border-left: 4px solid #fdc300; }
.header-menu-button { margin-right: 0.5rem; transform: scale(1.2); }

.site-header { position: sticky; top: 0; }

@media (min-width: 1440px) {
  .desktop-nav-force { display: flex !important; }
  .desktop-language-force { display: inline-flex !important; }
}
</style>
