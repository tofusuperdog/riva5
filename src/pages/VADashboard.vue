<template>
  <div>
    <HeaderMain class="!z-[1000]" />
    <VATitle :menu="pageName" />
    <VADashContent class="mt-15" />
    <FooterMain class="mt-5" />
  </div>
</template>

<script setup>
import HeaderMain from "../components/Header.vue";
import VATitle from "../components/VATitle.vue";
import VADashContent from "../components/VADashboard/VADashContent.vue";
import FooterMain from "../components/Footer.vue";

import { ref } from "vue";

const pageName = ref("Dashboard");
</script>

<style lang="scss" scoped></style>
