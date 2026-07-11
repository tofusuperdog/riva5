<template>
  <div>
    <VAHeader :menu="pageName" class="fixed top-0 left-0 w-full" />
    <VATitle :menu="pageName" class="mt-15" />
    <VADashContent class="mt-15" />
    <FooterMain class="mt-5" />
  </div>
</template>

<script setup>
import VAHeader from "../components/VAHeader.vue";
import VATitle from "../components/VATitle.vue";
import VADashContent from "../components/VADashboard/VADashContent.vue";
import FooterMain from "../components/Footer.vue";

import { ref } from "vue";

const pageName = ref("Dashboard");
</script>

<style lang="scss" scoped></style>
