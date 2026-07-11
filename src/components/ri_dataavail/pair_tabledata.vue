<template>
  <div class="bgGreay q-py-md q-px-xl">
    <div class="row justify-between">
      <div class="q-py-lg q-px-md" style="font-size: 26px" align="left">
        Data availability
      </div>
      <div class="row">
        <div class="row items-center">
          <div class="boxLegend scoreMore90"></div>
          <div class="q-pl-sm q-pr-lg">More than 90%</div>
        </div>
        <div class="row items-center">
          <div class="boxLegend scoreMore75"></div>
          <div class="q-pl-sm q-pr-lg">76%-90%</div>
        </div>
        <div class="row items-center">
          <div class="boxLegend scoreMore49"></div>
          <div class="q-pl-sm q-pr-lg">50%-75%</div>
        </div>
        <div class="row items-center">
          <div class="boxLegend scoreLess"></div>
          <div class="q-pl-sm q-pr-lg">Less than 50%</div>
        </div>
      </div>
    </div>
    <!-- table data  -->
    <div class="boxData q-pt-xl">
      <div class="showType">
        <div class="row no-wrap" align="center">
          <div class="diagBox" style="min-width: 140px; height: 90px">
            <div class="fontTable q-px-md q-py-sm" align="right">Partner</div>
            <div class="fontTable q-px-md q-py-sm" align="left">Reporter</div>
          </div>
          <div class="row no-wrap">
            <div
              class="headPartnerTable"
              v-for="(partnerCountry, j) in partnerCountryList"
              :key="j"
            >
              {{ partnerCountry.iso }}
              <q-tooltip>{{ partnerCountry.label }}</q-tooltip>
            </div>
          </div>
        </div>
        <table
          cellspacing="0"
          cellpadding="0"
          style="border-collapse: collapse; border-spacing: 0; border: none"
        >
          <tr v-for="(item, index) in tableData" :key="index">
            <td
              align="center"
              v-for="(result, index2) in item"
              :key="index2"
              v-show="index2 !== 1"
            >
              <div class="scoreBox scoreMore90" v-if="result > 90">
                {{ result.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreMore75" v-else-if="result > 75">
                {{ result.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreMore49" v-else-if="result > 49">
                {{ result.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreLess" v-else-if="result > 0">
                {{ result.toFixed(2) }}%
              </div>
              <div class="scoreBox noScore" v-else-if="result === 'NA'">
                &nbsp;
              </div>
              <div class="scoreBox noScore" v-else-if="result === '-'">-</div>
              <div v-else class="headReportTable">
                {{ result }}
                <q-tooltip>{{ item[1] }}</q-tooltip>
              </div>
            </td>
          </tr>
        </table>
      </div>
      <div class="q-pa-md"></div>
    </div>
    <div class="q-pa-md"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server";
import axios from "axios";

// Props
const props = defineProps(["input", "report", "partner"]);
const { serverData } = serverSetup();

// State variables
const tableData = ref([]);
const reportCountryList = ref([]);
const partnerCountryList = ref([]);

// Load data function
const loadData = async () => {
  partnerCountryList.value = props.partner;
  reportCountryList.value = props.report;

  const data = {
    report: reportCountryList.value.map((x) => x.iso),
    partner: partnerCountryList.value.map((x) => x.iso),
    dataBase: props.input.dataBase,
    integration: props.input.integration,
  };

  const url = serverData.value + "ri/data_pair_table.php";
  const result = await axios.post(url, JSON.stringify(data));

  const dataRaw = result.data;
  const tempTableData = [];

  reportCountryList.value.forEach((report) => {
    const row = [];
    row.push(report.iso);
    row.push(report.label);
    partnerCountryList.value.forEach((partner) => {
      const data = dataRaw.filter(
        (x) => x.report === report.iso && x.partner === partner.iso
      );

      if (report === partner) {
        row.push("NA");
      } else if (data.length === 0) {
        row.push("-");
      } else {
        row.push(Number(data[0].avg) * 100);
      }
    });
    tempTableData.push(row);
  });

  tableData.value = tempTableData;
};

// Load data on component mount
onMounted(async () => {
  await loadData();
});
</script>

<style lang="scss" scoped>
tr,
td {
  border: none !important;
}
.bgGreay {
  width: 100%;
  background: #ededed;
}
.fontW700 {
  font-weight: 700;
}
.boxLegend {
  width: 45px;
  height: 25px;
}
.boxData {
  margin: auto;
  border: 1px solid #757575;
}
.showType {
  width: 95%;
  max-height: 700px;
  margin: auto;
  overflow-y: auto;
}
/////// score
.scoreBox {
  min-width: 80px;
  height: 40px;
  line-height: 40px;
  width: 80px;
  background: #a9a9a9;
  font-size: 16px;
  color: white;
}
.scoreMore90 {
  border: 1px solid #e5e5e5;
  background: #6b8465;
}
.scoreMore75 {
  border: 1px solid #e5e5e5;
  background: #8ba889;
}
.scoreMore49 {
  border: 1px solid #e5e5e5;
  background: #cf9683;
}
.scoreLess {
  border: 1px solid #e5e5e5;
  background: #cf7956;
}
.noScore {
  border: 1px solid #e5e5e5;
  background: #8f8f8f;
}
.sameCountry {
  background: #a9a9a9;
}
//////
.fontTable {
  font-size: 18px;
  color: white;
}
.headPartnerTable {
  min-width: 80px;
  height: 90px;
  line-height: 90px;
  font-size: 18px;
  color: white;
  background: #757575;
  border: 1px solid white;
}
.headReportTable {
  min-width: 140px;
  font-size: 18px;
  height: 40px;
  line-height: 40px;
  color: white;
  background: #757575;
  border: 1px solid white;
  position: relative;
}
.subTable {
  width: 70px;
  color: #757575;
  background-color: #d2d1d1;
  border: 1px solid white;
  font-size: 18px;
  position: relative;
}

//// box line
.diagBox {
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' preserveAspectRatio='none' viewBox='0 0 100 100'><path d='M1 0 L0 1 L99 100 L100 99' fill='white' /></svg>");
  background-color: #757575;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%, auto;
  border: 1px solid white;
}
</style>
