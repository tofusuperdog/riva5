<template>
  <div class="py-8 lg:py-16 px-4">
    <div
      class="text-xl md:text-2xl lg:text-4xl font-semibold text-center fblack"
    >
      Ready to explore the data?
    </div>
    <div class="fsub text-center pt-2 md:text-lg">
      Choose a tool to start uncovering regional connections and value chains
      insights.
    </div>
    <div class="flex pt-4 gap-3 justify-center max-w-[800px] mx-auto">
      <div
        class="flex border-2 border-[#005DAA] py-3 px-2 cursor-pointer transform hover:scale-102 transition duration-300 ease-in-out w-[330px] rounded-md"
        @click="goToRI()"
      >
        <div class="pt-1">
          <img src="/images/riLogoBlue.svg" alt="RI Logo" />
        </div>
        <div class="pl-1 text-[#005DAA]">
          <div class="font-semibold">REGIONAL INTEGRATION ANALYZER</div>
          <div class="text-xs">Understand how economies are connected</div>
        </div>
      </div>

      <div
        class="flex border-2 border-[#005DAA] py-3 px-2 cursor-pointer transform hover:scale-102 transition duration-300 ease-in-out w-[330px] rounded-md"
        @click="goToVA()"
      >
        <div class="pt-1">
          <img src="/images/vaLogoBlue.svg" alt="VA Logo" />
        </div>
        <div class="pl-1 text-[#005DAA]">
          <div class="font-semibold">VALUE CHAINS ANALYZER</div>
          <div class="text-xs">
            Explore how value added flows across borders
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getCurrentInstance } from "vue";
import { useRegionalIntegrationNavigation } from "../../composables/useRegionalIntegrationNavigation";
const route = useRouter();
const { proxy } = getCurrentInstance();
const { goToRegionalIntegration } = useRegionalIntegrationNavigation();

const goToVA = () => {
  proxy.$gtag.event("value_chain_analyzer_click", {
    // พารามิเตอร์เพิ่มเติม (ถ้าจำเป็น)
    button_name: "Value Chain Analyzer",
    page_title: "Welcome Page",
    page_path: "/",
  });
  route.push("/va");
};

const goToRI = () => {
  proxy.$gtag.event("regfional_integration_analyzer_click", {
    // พารามิเตอร์เพิ่มเติม (ถ้าจำเป็น)
    button_name: "Regional Integration Analyzer",
    page_title: "Welcome Page",
    page_path: "/",
  });
  goToRegionalIntegration();
};
</script>

<style lang="scss" scoped></style>
