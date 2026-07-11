<template>
  <div class="bgGreay q-py-md q-px-xl">
    <div class="row justify-between">
      <div class="q-py-lg q-px-md" style="font-size: 26px" align="left">
        Data availability
      </div>
    </div>
    <!-- table data  -->
    <div class="boxData q-pt-xl">
      <div class="showType">
        <div class="row no-wrap" align="center">
          <div class="diagBox" style="min-width: 210px; height: 90px">
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
            <td :rowspan="incTotal" v-if="index % incTotal === 0">
              <div
                class="reportDiv"
                :style="{
                  height: 40 * incTotal + 'px',
                  'line-height': 40 * incTotal + 'px',
                }"
              >
                {{ data[0]?.label }}
                <q-tooltip>{{ data[0]?.tooltip }}</q-tooltip>
              </div>
            </td>
            <td
              :rowspan="dimList[data[1].label - 1]?.indicator.length"
              v-if="dimStepNo[data[1].label - 1] === index % incTotal"
            >
              <div
                class="reportDiv"
                :style="{
                  height:
                    40 * (dimList[data[1].label - 1]?.indicator.length || 0) +
                    'px',
                  'line-height':
                    40 * (dimList[data[1].label - 1]?.indicator.length || 0) +
                    'px',
                }"
              >
                Dim. {{ data[1].label }}
                <q-tooltip>{{ data[1].tooltip }}</q-tooltip>
              </div>
            </td>
            <td>
              <div class="reportDiv">
                {{ data[2]?.label }}
                <q-tooltip>{{ data[2]?.tooltip }}</q-tooltip>
              </div>
            </td>
            <td
              class="boxborder"
              v-for="(data2, index2) in data"
              :key="index2"
              v-show="index2 > 2"
            >
              <div class="scoreBox scoreMore90" v-if="data2 === 1">
                {{ data2 }}
              </div>
              <div class="scoreBox scoreLess" v-if="data2 === 0">
                {{ data2 }}
              </div>
              <div class="scoreBox noScore" v-if="data2 === 9"></div>
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
import axios from "axios";
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server";

const { serverData } = serverSetup();
const props = defineProps({
  dataGet: Object,
});

const input = ref({
  compareType: "group",
  dataBase: "digi",
  disaggregation: "indicator",
  economy: [],
  integration: "conventional",
  partner: [],
  reporting: [],
});

const partner = ref([]);
const report = ref([]);

const tableData = ref([]);
const reportCountryList = ref([]);
const partnerCountryList = ref([]);
const dimList = ref([]);
const dimStepNo = ref([]);
const incTotal = ref(0);

onMounted(() => {
  partner.value = props.dataGet.partner;
  input.value = props.dataGet.input;
  report.value = props.dataGet.report;
  loadData();
});

// Load data function
const loadData = async () => {
  partnerCountryList.value = partner.value;
  reportCountryList.value = report.value;

  const data = {
    report: reportCountryList.value.map((x) => x.iso),
    partner: partnerCountryList.value.map((x) => x.iso),
    dataBase: input.value.dataBase,
    disaggregation: input.value.disaggregation,
    integration: input.value.integration,
  };

  const riApi = serverData.value + "ri/";

  try {
    // Fetch data
    const result = await axios.post(
      `${riApi}data_indicator_table.php`,
      JSON.stringify(data)
    );
    const result2 = await axios.post(
      `${riApi}data_indicator_list.php`,
      JSON.stringify(data)
    );

    dimList.value = result2.data;
    dimStepNo.value = [0];

    dimList.value.forEach((x) => {
      incTotal.value += x.indicator.length;
      dimStepNo.value.push(incTotal.value);
    });

    dimStepNo.value.pop();

    reportCountryList.value.forEach((report) => {
      dimList.value.forEach((dim, index1) => {
        dim.indicator.forEach((indicator, index2) => {
          const row = [];
          const tempReport = {
            label: report.iso,
            tooltip: report.label,
          };
          row.push(tempReport);
          const tempDim = {
            label: index1 + 1,
            tooltip: dim.label,
          };
          row.push(tempDim);
          const tempInc = {
            label: "Ind. " + (index2 + 1),
            tooltip: indicator,
          };
          row.push(tempInc);

          partnerCountryList.value.forEach((partner) => {
            const filteredData = result.data.filter(
              (x) =>
                x.report === report.iso &&
                x.partner === partner.iso &&
                Number(x.dimension) === index1 + 1 &&
                Number(x.indicator) === index2 + 1
            );

            let score;
            if (report.iso !== partner.iso) {
              score =
                filteredData.length === 1 && filteredData[0].avail == 1 ? 1 : 0;
            } else {
              score = 9;
            }

            row.push(score);
          });

          tableData.value.push(row);
        });
      });
    });
  } catch (error) {
    console.error("Error loading data:", error);
  }
};
</script>

<style lang="scss" scoped>
tr,
td {
  border: none !important;
}
.boxborder {
  min-width: 80px;
  width: 80px;
  border: 1px solid grey;
  text-align: center;
}
.reportDiv {
  min-width: 70px;
  width: 70px;
  height: 40px;
  font-size: 18px;
  line-height: 40px;
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
  overflow-y: auto;
}
/////// score
.scoreBox {
  height: 40px;
  line-height: 40px;
  width: 80px;
  background: #a9a9a9;
  font-size: 16px;
  color: white;
  border: 1px solid white;
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

  font-size: 18px;
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
