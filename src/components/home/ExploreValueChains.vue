<template>
  <section class="bg-white px-4 py-10 text-[#02253D] lg:py-12">
    <div class="mx-auto max-w-[1400px]">
      <h2 class="explore-title text-center font-semibold">
        {{ t('home.waysTitle') }}
      </h2>
      <p class="mt-2 text-center text-[16px] md:text-[20px] text-gray-500">
        {{ t('home.waysSubtitle') }}
      </p>

      <div
        class="mx-auto mt-4 grid max-w-[980px] gap-4 lg:gap-10 md:grid-cols-2"
      >
        <article
          class="explore-card explore-card--horizontal flex flex-row flex-nowrap items-start gap-5 p-5"
        >
          <div class="explore-icon">
            <img src="/images/vaLogoW.svg" alt="" class="value-chains-icon" />
          </div>
          <div class="explore-card-copy min-w-0">
            <h3 class="explore-card-title font-semibold text-[#004B87]">
              {{ t('nav.valueChains') }}
            </h3>
            <p class="mt-1 leading-5 text-[#333]">
              {{ t('home.valueDescription') }}
            </p>
            <button class="explore-button mt-4" @click="goToVA">
              {{ t('nav.valueChains') }} <span>→</span>
            </button>
          </div>
        </article>

        <article
          class="explore-card explore-card--horizontal flex flex-row flex-nowrap items-start gap-5 p-5"
        >
          <div class="explore-icon">
            <img
              src="/images/sectoralanalysis.svg"
              alt=""
              class="sectoral-icon"
            />
          </div>
          <div class="explore-card-copy min-w-0">
            <h3 class="explore-card-title font-semibold text-[#004B87]">
              {{ t('nav.sectoral') }}
            </h3>
            <p class="mt-1 text-sm leading-5 text-[#333]">
              {{ t('home.sectorDescription') }}
            </p>
            <button class="explore-button mt-4" @click="goToHealthSector">
              {{ t('nav.sectoral') }} <span>→</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const goToVA = () => router.push("/va");
const goToHealthSector = () => router.push("/sectoral-analysis/health");
</script>

<style scoped>
.explore-card {
  border: 1px solid #d1d5db;
  border-radius: 5px;
  background: #fff;
}
.explore-card--horizontal {
  flex-direction: row;
  flex-wrap: nowrap;
}
.explore-card-copy {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 131px;
}
.explore-card-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
}
.explore-card p {
  font-size: 14px;
  line-height: 19px;
}
.explore-title {
  font-size: 40px;
  font-weight: 600;
}
@media (max-width: 767px) {
  .explore-title {
    font-size: 24px;
    line-height: 1.25;
  }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .explore-title {
    font-size: 36px;
  }
}
.explore-icon {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  margin-top: 8px;
  border-radius: 9999px;
  background: #003f72;
}
.explore-icon img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}
.value-chains-icon {
  filter: brightness(0) invert(1);
}
.explore-button {
  align-self: flex-start;
  margin-top: auto !important;
  cursor: pointer;
  border: 1px solid #0070c9;
  border-radius: 3px;
  padding: 8px 8px;
  color: #0066b3;
  font-size: 14px;
  line-height: 1;
}
.explore-button:hover {
  background: #eef7ff;
}
.explore-button span {
  margin-left: 8px;
  font-size: 14px;
  vertical-align: -1px;
}
</style>
