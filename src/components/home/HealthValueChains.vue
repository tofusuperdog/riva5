<template>
  <section class="health-value-chains-section px-4 py-10 md:py-12">
    <div class="mx-auto max-w-[1300px]">
      <header class="health-value-chains-header text-center">
        <h2 class="health-value-chains-title">{{ t('home.health.title') }}</h2>
        <p class="health-value-chains-intro mx-auto mt-2">
          {{ t('home.health.intro') }}
        </p>
      </header>

      <div class="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(card, index) in cards"
          :key="card.title"
          class="health-value-chains-card"
        >
          <img :src="card.icon" alt="" class="health-value-chains-icon" />
          <div class="health-value-chains-card-copy">
            <h3 class="health-value-chains-card-title">{{ t(`home.health.cards[${index}][0]`) }}</h3>
            <p class="health-value-chains-card-description">
              {{ t(`home.health.cards[${index}][1]`) }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const cards = [
  {
    icon: "/images/healthicon1.svg",
    title: "GVC Position",
    description: "Access a country’s position in the global Health value chain.",
  },
  {
    icon: "/images/healthicon2.svg",
    title: "Chokepoints",
    description:
      "Identify critical points of vulnerability and supply chain risks.",
  },
  {
    icon: "/images/healthicon3.svg",
    title: "Bilateral Relationship",
    description:
      "Explore bilateral trade relationships in Health products and inputs.",
  },
  {
    icon: "/images/healthicon4.svg",
    title: "Product Detail",
    description: "Analyze detailed trade flows and product-level insights.",
  },
];
</script>

<style scoped>
.health-value-chains-section {
  background-color: #e5effe;
}

.health-value-chains-header {
  color: #003d70;
}

.health-value-chains-title {
  font-size: 36px;
  font-weight: 600;
  line-height: 1.2;
}

.health-value-chains-intro {
  width: min(100%, 760px);
  max-width: 760px;
  margin: 8px auto 0;
  color: #666;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.3;
  text-align: center;
}

.health-value-chains-card {
  min-height: 232px;
  border: 1px solid #d4d4d4;
  border-radius: 5px;
  padding: 32px 26px 24px;
  background: #fff;
  color: #003d70;
}

.health-value-chains-icon {
  display: block;
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.health-value-chains-card-title {
  margin-top: 12px;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.25;
}

.health-value-chains-card-description {
  margin-top: 18px;
  color: #666;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.3;
}

@media (max-width: 767px) {
  .health-value-chains-title {
    font-size: 28px;
  }

  .health-value-chains-intro,
  .health-value-chains-card-description {
    font-size: 16px;
  }

  .health-value-chains-card {
    display: flex;
    align-items: flex-start;
    min-height: 0;
    gap: 18px;
    padding: 22px 20px;
  }

  .health-value-chains-icon {
    flex: 0 0 48px;
    width: 48px;
    height: 48px;
  }

  .health-value-chains-card-copy {
    min-width: 0;
  }

  .health-value-chains-card-title {
    margin-top: 0;
  }

  .health-value-chains-card-description {
    margin-top: 8px;
  }
}
</style>
