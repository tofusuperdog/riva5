<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div><RIHeader :menu="6" /></div>
      <div
        class="q-pt-lg"
        style="font-size: 32px; font-weight: 600"
        align="center"
      >
        Data availability
      </div>
      <input-data
        :dataSend="dataGet"
        @start-btn="startBtn"
        @reset-start-btn="resetStartBtn"
      ></input-data>
      <div v-if="showTable">
        <div v-if="input.disaggregation == 'pair'">
          <pair-table
            :input="input"
            :report="report"
            :partner="partner"
          ></pair-table>
        </div>
        <div v-else-if="input.disaggregation == 'dimension'">
          <dimension-table
            :input="input"
            :report="report"
            :partner="partner"
          ></dimension-table>
        </div>
        <div v-else>
          <indicator-table :dataGet="dataIndi"></indicator-table>
        </div>
      </div>
      <footerMain />
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
import inputData from "../components/ri_dataavail/input_data.vue";
import pairTable from "../components/ri_dataavail/pair_tabledata.vue";
import dimensionTable from "../components/ri_dataavail/dimension_tabledata.vue";
import indicatorTable from "../components/ri_dataavail/indicator_tabledata.vue";
import { LocalStorage } from "quasar";
import { useRoute } from "vue-router";

const route = useRoute();

const showTable = ref(false);
const input = ref({});
const report = ref([]);
const partner = ref([]);
const dataGet = ref([]);
const dataIndi = ref({});

onBeforeMount(() => {
  dataGet.value = [];
  let keyLocal = [];
  keyLocal = LocalStorage.getItem("dataAvail");
  let keyId = route.params.key ? route.params.key : null;
  if (keyLocal != null) {
    if (keyId == keyLocal.key) {
      dataGet.value = LocalStorage.getItem("dataAvail");
    }
  }
});

const startBtn = (inputSend) => {
  input.value = inputSend.input;
  report.value = inputSend.report;
  partner.value = inputSend.partner;
  dataIndi.value = {
    input: input.value,
    report: report.value,
    partner: report.value,
  };
  showTable.value = true;
};
const resetStartBtn = () => {
  showTable.value = false;
};
</script>

<style lang="scss" scoped>
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  background-color: #fff;
}
</style>
