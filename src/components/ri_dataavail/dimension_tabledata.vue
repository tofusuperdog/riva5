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
          <tr v-for="(data, index) in tableData" :key="index">
            <td :rowspan="dimTotal" v-if="index % 7 === 0">
              <div class="reportDiv">
                {{ data[0] }}
                <q-tooltip>{{
                  reportCountryList[Math.floor(index / 7)].label
                }}</q-tooltip>
              </div>
            </td>
            <td>
              <div class="subTable">
                Dim. {{ data[1] }}
                <q-tooltip>{{ dimList.value[data[1] - 1].label }}</q-tooltip>
              </div>
            </td>
            <td
              class="scoreBox"
              v-for="(score, indexscore) in data"
              v-show="indexscore >= 2"
              :key="indexscore"
            >
              <div class="scoreBox scoreMore90" v-if="score > 90">
                {{ score.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreMore75" v-else-if="score > 75">
                {{ score.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreMore49" v-else-if="score > 49">
                {{ score.toFixed(2) }}%
              </div>
              <div class="scoreBox scoreLess" v-else-if="score > 0">
                {{ score.toFixed(2) }}%
              </div>
              <div class="scoreBox noScore" v-else-if="score === 'NA'">
                &nbsp;
              </div>
              <div class="scoreBox noScore" v-else-if="score === '-'">-</div>
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

// Define props
const props = defineProps({
  input: Object,
  report: Array,
  partner: Array,
});

const { serverData } = serverSetup();

// State variables
const tableData = ref([]);
const reportCountryList = ref([]);
const partnerCountryList = ref([]);
const dimList = ref([]);
const dimTotal = 7; // Assuming this is a constant based on your data

// Load data function
const loadData = async () => {
  tableData.value = [];
  partnerCountryList.value = props.partner;
  reportCountryList.value = props.report;

  // API call data
  const data = {
    report: reportCountryList.value.map((x) => x.iso),
    partner: partnerCountryList.value.map((x) => x.iso),
    dataBase: props.input.dataBase,
    compareType: props.input.compareType,
    integration: props.input.integration,
  };

  // API calls

  const url = serverData.value + "ri/data_dimension_table.php";
  const result = await axios.post(url, JSON.stringify(data));

  const url2 = serverData.value + "ri/data_indicator_list.php";
  const result2 = await axios.post(url2, JSON.stringify(data));

  dimList.value = result2.data;

  reportCountryList.value.forEach((report) => {
    for (let dimCount = 1; dimCount <= dimTotal; dimCount++) {
      const row = [];

      row.push(report.iso);
      row.push(dimCount);
      partnerCountryList.value.forEach((partner) => {
        const data = result.data.filter(
          (x) =>
            x.report === report.iso &&
            x.partner === partner.iso &&
            Number(x.dim) === dimCount
        );
        if (report === partner) {
          row.push("NA");
        } else if (data.length === 0) {
          row.push("-");
        } else {
          row.push(Number(data[0].coverage) * 100);
        }
      });
      tableData.value.push(row);
    }
  });
};

// Load data on component mount
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
tr,
td {
  border: none !important;
}
.reportDiv {
  min-width: 70px;
  width: 70px;
  height: 210px;
  font-size: 18px;
  line-height: 210px;
  text-align: center;
  color: white;
  background: #757575;
  border: 1px solid white;
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
  height: 700px;
  margin: auto;
  overflow: auto;
}
/////// score
.scoreBox {
  min-width: 80px;
  text-align: center;
  height: 30px;
  line-height: 30px;
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
  min-width: 70px;
  width: 70px;
  font-size: 18px;
  color: white;
  background: #757575;
  border: 1px solid white;
  position: relative;
}
.subTable {
  width: 70px;
  min-width: 70px;
  color: #757575;
  background-color: #d2d1d1;
  border: 1px solid white;
  font-size: 18px;
  text-align: center;
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
