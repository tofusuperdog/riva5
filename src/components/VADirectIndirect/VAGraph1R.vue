<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">Graph1</div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex items-center justify-center pt-4">
        <div id="chartBSRange02" class="w-full max-w-[600px]"></div>
      </div>
      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? "View less" : "View more" }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 \w-full lg:w-[40%] flex items-center"
        v-show="showDetail"
      >
        {{ exporting }}<br />
        {{ importing }}<br />
        {{ sector }}<br />
        {{ yearStart }} - {{ yearEnd }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);

// ===== input from parent component =====
const exporting = props.inputData.exporting;
const importing = props.inputData.importing;
const sector = props.inputData.sector;
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);
</script>

<style lang="scss" scoped></style>
