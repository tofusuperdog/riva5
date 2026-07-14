<template>
  <section class="ready-to-explore-section px-4 py-7 md:py-8">
    <div class="ready-to-explore-content mx-auto max-w-[1400px]">
      <div class="ready-to-explore-intro">
        <img
          src="/images/mainreadyicon.svg"
          alt=""
          class="ready-to-explore-icon"
        />
        <div>
          <h2 class="ready-to-explore-title">{{ t('home.readyTitle') }}</h2>
          <p class="ready-to-explore-description">
            {{ t('home.readyDescription') }}
          </p>
        </div>
      </div>

      <div class="ready-to-explore-actions">
        <button class="ready-to-explore-button ready-to-explore-button--primary" @click="goToVA">
          <span class="ready-to-explore-button-label">
            <img src="/images/vaLogo.svg" alt="" class="ready-to-explore-button-icon" />
            <span>{{ t('nav.valueChains') }}</span>
          </span>
          <span aria-hidden="true">→</span>
        </button>
        <button class="ready-to-explore-button ready-to-explore-button--secondary" @click="goToHealthSector">
          <span class="ready-to-explore-button-label">
            <span aria-hidden="true" class="ready-to-explore-button-icon ready-to-explore-button-icon--sectoral"></span>
            <span>{{ t('nav.sectoral') }}</span>
          </span>
          <span aria-hidden="true">→</span>
        </button>
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
.ready-to-explore-section {
  background: #fff;
}

.ready-to-explore-content,
.ready-to-explore-intro,
.ready-to-explore-actions,
.ready-to-explore-button {
  display: flex;
  align-items: center;
}

.ready-to-explore-button-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ready-to-explore-button-icon {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  object-fit: contain;
}

.ready-to-explore-button-icon--sectoral {
  background-color: currentColor;
  -webkit-mask: url("/images/sectoralanalysis.svg") center / contain no-repeat;
  mask: url("/images/sectoralanalysis.svg") center / contain no-repeat;
}

.ready-to-explore-content {
  justify-content: space-between;
  gap: 32px;
}

.ready-to-explore-intro {
  gap: 20px;
}

.ready-to-explore-icon {
  width: 90px;
  height: 90px;
  flex: 0 0 auto;
  object-fit: contain;
}

.ready-to-explore-title {
  color: #252525;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.15;
}

.ready-to-explore-description {
  max-width: 540px;
  margin-top: 6px;
  color: #666;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
}

.ready-to-explore-actions {
  flex: 0 0 auto;
  gap: 16px;
}

.ready-to-explore-button {
  min-width: 295px;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid #003e70;
  border-radius: 6px;
  padding: 19px 14px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.25;
}

.ready-to-explore-button--primary {
  border-color: #ffc400;
  background: #ffc400;
  color: #252525;
}

.ready-to-explore-button--secondary {
  background: #fff;
  color: #003e70;
}

.ready-to-explore-button:hover {
  filter: brightness(0.96);
}

@media (max-width: 1199px) {
  .ready-to-explore-content {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .ready-to-explore-actions {
    width: 100%;
    justify-content: center;
    gap: 12px;
  }

  .ready-to-explore-button {
    min-width: 252px;
    padding: 14px 12px;
    font-size: 16px;
  }

  .ready-to-explore-button-icon {
    width: 26px;
    height: 26px;
  }
}

@media (max-width: 767px) {
  .ready-to-explore-intro {
    align-items: flex-start;
    gap: 14px;
  }

  .ready-to-explore-icon {
    width: 62px;
    height: 62px;
  }

  .ready-to-explore-title {
    font-size: 28px;
  }

  .ready-to-explore-description {
    font-size: 16px;
  }

  .ready-to-explore-actions {
    width: 100%;
    flex-direction: column;
  }

  .ready-to-explore-button {
    width: 100%;
    min-width: 0;
    font-size: 16px;
  }
}
</style>
