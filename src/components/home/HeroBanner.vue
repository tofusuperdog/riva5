<template>
  <div class="relative">
    <div class="lt-lg">
      <img
        src="/images/indexBG.webp"
        alt=""
        class="w-screen object-cover"
        style="height: calc(80vh - 60px)"
      />
    </div>
    <div class="gt-md">
      <img
        src="/images/indexBG.webp"
        alt=""
        class="w-screen object-cover"
        style="height: calc(100vh - 60px)"
      />
    </div>
    <div
      class="w-full lg:w-[50%] bg-[linear-gradient(to_bottom_right,_#1B81C1,_#1A425A)] text-white p-3 md:p-6 lg:p-12 absolute bottom-0 right-0"
    >
      <div class="text-xl md:text-2xl font-semibold fwhite">
        ANALYZE REGIONAL INTEGRATION.
      </div>
      <div class="text-xl md:text-2xl font-semibold fwhite">
        UNTANGLE VALUE CHAINS.
      </div>
      <div class="max-w-[700px] pt-2 fwhite">
        RIVA helps you explore regional integration and value chains
        participation by offering data-driven tools to compare economies,
        customize indicators, and visualize linkages across Asia and the
        Pacific. Untangle complex trade and investment relationships for better
        policy-making.
      </div>
      <div class="flex pt-4 gap-3 justify-center max-w-[800px]">
        <!-- Disabled: REGIONAL INTEGRATION ANALYZER -->
        <div
          class="flex bg-[#FDC300] py-3 px-2 cursor-pointer transform hover:scale-102 transition duration-300 ease-in-out w-[350px] rounded-md"
          @click="goToRA()"
        >
          <div class="pt-1">
            <img src="/images/riLogo.svg" alt="RI Logo" class="grayscale" />
          </div>
          <div class="pl-2 text-[#333333]">
            <div class="font-semibold">REGIONAL INTEGRATION ANALYZER</div>
            <div class="text-xs">Understand how economies are connected</div>
          </div>
        </div>

        <div
          class="flex bg-[#FDC300] py-3 px-2 cursor-pointer transform hover:scale-102 transition duration-300 ease-in-out w-[350px] rounded-md"
          @click="goToVA()"
        >
          <div class="pt-1"><img src="/images/vaLogo.svg" alt="VA Logo" /></div>
          <div class="pl-2 text-[#333333]">
            <div class="font-semibold">VALUE CHAINS ANALYZER</div>
            <div class="text-xs">
              Explore how value added flows across borders
            </div>
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

const goToRA = () => {
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
