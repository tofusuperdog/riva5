<template>
  <div class="q-pa-md bg-white" style="width: 100%">
    <div>
      <div class="row font-18" style="height: 65px">
        <!-- Menu #1 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          :class="{ textSelected: menuSelectedId == 1 }"
          @click="selectMenuId1()"
        >
          Integration<br />
          across years
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 1 }"></div>
        </div>

        <!-- Menu #2 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          @click="selectMenuId2()"
          :class="{ textSelected: menuSelectedId == 2 }"
        >
          Integration <br />across periods
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 2 }"></div>
        </div>

        <!-- menu #3 -->
        <div
          class="col-2 selectBoxDiv cursor-pointer"
          align="center"
          style="line-height: 58px"
          @click="selectMenuId3()"
          :class="{ textSelected: menuSelectedId == 3 }"
        >
          Data availability
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 3 }"></div>
        </div>

        <!-- menu #4 -->
        <div
          class="col-2 selectBoxDiv cursor-pointer"
          align="center"
          style="line-height: 58px"
          @click="selectMenuId4()"
          :class="{ textSelected: menuSelectedId == 4 }"
        >
          Weights
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 4 }"></div>
        </div>

        <div
          class="col-4 selectBoxDiv q-pr-md cursor-pointer"
          align="center"
          style="line-height: 65px"
          @click="goToURL()"
        >
          <u>Click here to see this group's availability matrix</u>
        </div>
      </div>
    </div>
    <div class="borderMainBox">
      <!-- Graph menu #1 -->
      <div v-show="menuSelectedId == 1">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select economies of interest</div>
            <div class="font-14">
              In parenthesis, each economy's symmetric

              {{ input.type.toLowerCase() }} integration index with this group
              in
              {{ input.year.max }}
            </div>
            <div class="q-pt-md">
              Click on each country to select/unselect it from the graph.
            </div>
            <div
              class="row q-py-sm cursor-pointer"
              @click="ecoIntegrationGroupToggleOnOff()"
            >
              <div
                class="checkBoxGroup"
                style="background-color: #f07435"
                v-show="ecoIntegrationGroupVisible"
              ></div>
              <div
                class="checkBoxGroup"
                v-show="!ecoIntegrationGroupVisible"
              ></div>
              <div class="q-pl-sm">
                Group average ({{ Number(ecoIntegrationAvg).toFixed(2) }})
              </div>
            </div>
            <div><hr /></div>
            <div class="row economicShowDiv content-start pt-2">
              <div class="col-6">
                <div
                  v-for="(item, index) in ecoIntegrationChartLeft"
                  :key="index"
                  class="col-12 row q-pb-sm font-12 cursor-pointer"
                  @click="ecoIntegrationToggleOnOffLeft(index)"
                >
                  <div
                    class="checkBox"
                    :style="{ backgroundColor: item.color }"
                    v-show="item.visible == true"
                  ></div>
                  <div
                    class="checkBox"
                    style="border: 1px solid #757575"
                    v-show="item.visible == false"
                  ></div>
                  <div class="q-pl-sm row">
                    <div
                      style="max-width: 100px; display: inline-block"
                      class="ellipsis"
                    >
                      {{ item.name }}
                    </div>
                    &nbsp;({{ Number(item.lastValue).toFixed(2) }})
                  </div>
                  <q-tooltip>
                    {{ item.name }} ({{
                      Number(item.lastValue).toFixed(2)
                    }})</q-tooltip
                  >
                </div>
              </div>
              <div class="col-6">
                <div
                  v-for="(item, index) in ecoIntegrationChartRight"
                  :key="index"
                  class="col-12 row q-pb-sm font-12 cursor-pointer"
                  @click="ecoIntegrationToggleOnOffRight(index)"
                >
                  <div
                    class="checkBox"
                    :style="{ backgroundColor: item.color }"
                    v-show="item.visible == true"
                  ></div>
                  <div
                    class="checkBox"
                    style="border: 1px solid #757575"
                    v-show="item.visible == false"
                  ></div>
                  <div class="q-pl-sm row">
                    <div
                      style="max-width: 100px; display: inline-block"
                      class="ellipsis"
                    >
                      {{ item.name }}
                    </div>
                    &nbsp;({{ Number(item.lastValue).toFixed(2) }})
                  </div>
                  <q-tooltip>
                    {{ item.name }} ({{
                      Number(item.lastValue).toFixed(2)
                    }})</q-tooltip
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did integration progress across years?
              </div>
            </div>
            <div v-if="ecoIntegrationChart.length >= 4">
              Since {{ input.year.min }}, {{ yourGroupName }}'s integration
              {{ ecoIntegrationPercentChange > 0 ? "increased" : "decreased" }}
              by
              {{ Math.abs(ecoIntegrationPercentChange) }}%. In
              {{ input.year.max }}, {{ ecoIntegrationSentenceHigh[0].name }} ({{
                Number(ecoIntegrationSentenceHigh[0].lastValue).toFixed(2)
              }}) and {{ ecoIntegrationSentenceHigh[1].name }} ({{
                Number(ecoIntegrationSentenceHigh[1].lastValue).toFixed(2)
              }}) were {{ yourGroupName }}'s most integrated economies.
              {{ ecoIntegrationSentenceLow[0].name }} ({{
                Number(ecoIntegrationSentenceLow[0].lastValue).toFixed(2)
              }}) and {{ ecoIntegrationSentenceLow[1].name }} ({{
                Number(ecoIntegrationSentenceLow[1].lastValue).toFixed(2)
              }}) were the least.
            </div>
            <div v-else>
              Since {{ input.year.min }}, {{ yourGroupName }}'s integration
              {{ ecoIntegrationPercentChange > 0 ? "increased" : "decreased" }}
              by
              {{ Math.abs(ecoIntegrationPercentChange) }}%. In
              {{ input.year.max }}menu2SetGroupVisible,
              {{ ecoIntegrationSentenceHigh[0].name }} ({{
                Number(ecoIntegrationSentenceHigh[0].lastValue).toFixed(2)
              }}) was {{ yourGroupName }}'s most integrated economies.
              {{ ecoIntegrationSentenceLow[0].name }} ({{
                Number(ecoIntegrationSentenceLow[0].lastValue).toFixed(2)
              }}) was the least.
            </div>
            <div
              id="lineChartByCountry"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- Graph menu #2 -->
      <div v-show="menuSelectedId == 2">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select economies of interest</div>
            <div class="font-14">
              In parenthesis, each economy's symmetric
              {{ input.type.toLowerCase() }} integration index progression with
              this group across periods.
            </div>
            <div class="q-pt-md">
              Click on each country to select/unselect it in the graph.
            </div>
            <div
              class="row q-py-sm cursor-pointer"
              @click="menu2SetGroupVisible()"
            >
              <div
                class="checkBoxGroup"
                style="background-color: #f07435"
                v-show="menu2GroupVisible"
              ></div>
              <div class="checkBoxGroup" v-show="!menu2GroupVisible"></div>
              <div class="q-pl-sm">
                Group average
                <span v-if="Number(menu2GroupDiffAvg) >= 0" class="positiveText"
                  >(+{{ Number(menu2GroupDiffAvg).toFixed(2) }})</span
                >
                <span v-else class="negativeText"
                  >(-{{ Number(menu2GroupDiffAvg).toFixed(2) }})</span
                >
              </div>
            </div>
            <div><hr /></div>
            <div class="row economicShowDiv content-start pt-2">
              <div class="col-6">
                <div
                  v-for="(item, index) in menu2RawLeft"
                  :key="index"
                  class="col-6 row q-pb-sm font-12 cursor-pointer"
                  @click="menu2SetVisibleLeft(index)"
                >
                  <div
                    class="checkBox"
                    style="background-color: #13405a"
                    v-show="item.visible == true"
                  ></div>
                  <div
                    class="checkBox"
                    style="border: 1px solid #757575"
                    v-show="item.visible == false"
                  ></div>

                  <div class="q-pl-sm row">
                    <div
                      style="max-width: 100px; display: inline-block"
                      class="ellipsis"
                    >
                      {{ item.name }}
                    </div>
                    &nbsp;
                    <span v-if="Number(item.diff) >= 0" class="positiveText"
                      >(+{{ Number(item.diff).toFixed(2) }})</span
                    >
                    <span v-else class="negativeText"
                      >(-{{ Number(item.diff).toFixed(2) }})</span
                    >
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div
                  v-for="(item, index) in menu2RawRight"
                  :key="index"
                  class="col-6 row q-pb-sm font-12 cursor-pointer"
                  @click="menu2SetVisibleRight(index)"
                >
                  <div
                    class="checkBox"
                    style="background-color: #13405a"
                    v-show="item.visible == true"
                  ></div>
                  <div
                    class="checkBox"
                    style="border: 1px solid #757575"
                    v-show="item.visible == false"
                  ></div>

                  <div class="q-pl-sm row">
                    <div
                      style="max-width: 100px; display: inline-block"
                      class="ellipsis"
                    >
                      {{ item.name }}
                    </div>
                    &nbsp;
                    <span v-if="Number(item.diff) >= 0" class="positiveText"
                      >(+{{ Number(item.diff).toFixed(2) }})</span
                    >
                    <span v-else class="negativeText"
                      >(-{{ Number(item.diff).toFixed(2) }})</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did your group's integration progress across periods?
              </div>
              <div>
                {{ menu2SubtitleSentence1 }} {{ menu2SubtitleSentence2 }}
              </div>
            </div>
            <div
              id="container2"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- Graph menu #3 -->
      <div v-show="menuSelectedId == 3">
        <div class="q-pa-md">
          <div class="font-24">
            How much data is available for each selected economy?
            <q-icon name="fas fa-question-circle" size="24px">
              <q-tooltip anchor="bottom middle" self="top middle">
                Data availability is calculated as the ratio<br />
                between the number of pairs with available <br />
                data and all the possible pair combinations.<br />
                The higher the data availability the more <br />
                reliable the economy's integration score with <br />
                the group is. Concomitantly, the more of the <br />
                overall integration index is driven by said <br />
                economy. <br />
                E.g., take a 3 country group (X, Y and Z). <br />
                X could be integrated with Y and Z as a reporter <br />
                (X-Y and X-Z - 2 pairs) and as a partner (Y-X <br />
                and Z-X - 2 pairs): 4 possible combinations for X.<br />
                If X has data available for the pairs (X-Y), (X-Z)<br />
                and (Y-X) data availability for X would be set at<br />
                75% (3/4).
              </q-tooltip>
            </q-icon>
          </div>

          <div>{{ dataAvailable.subTitle1 }} {{ dataAvailable.subTitle2 }}</div>

          <!-- <q-tooltip
            anchor="bottom middle"
            self="top middle"
            content-class="tooltipBox"
          >

          </q-tooltip> -->
        </div>
        <div
          id="container3"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>
      </div>
      <!-- graph menu#4 -->
      <div v-show="menuSelectedId == 4">
        <div class="q-pa-md">
          <div class="font-24">
            How much is each economy's contributing to this group's overall
            integration score?
            <q-icon name="fas fa-question-circle" size="24px">
              <q-tooltip anchor="bottom middle" self="top middle">
                All country pairs are weighted equally so single country
                weights<br />
                reflect data availability: i.e., weights are calculated as
                the<br />
                ratio of each country's data availability compared to all<br />
                available data. Full data availability produces equal
                weighting<br />
                across economies; the fewer data an economy has the less
                weight<br />
                in the group's integration score it has and vice-versa.
                <br />
                E.g., take a 3 country group (X, Y and Z), where data
                availability<br />
                (available pairs / possible pairs) for X is (3/4), for Y
                (1/4)<br />
                and and Z (1/4). Together X, Y and Z have 5 available pairs.
                X's<br />
                weight in the indicator would be (3/5) or 60%, whereas Y and
                Z<br />
                would have each (1/5) or 20%. This is because all data points<br />
                are weighted equally and X has 3 out of all 5 available data<br />
                points, whereas Y and Z have only 2.
              </q-tooltip>
            </q-icon>
          </div>
          <div>{{ weight.subTitle1 }}</div>
        </div>
        <div
          id="container4"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server.js";
import { LocalStorage, useQuasar } from "quasar";

import axios from "axios";
const { serverData } = serverSetup();
const $q = useQuasar();
const props = defineProps({
  dataGet: {
    type: Object,
    require: true,
  },
});
const input = ref({
  type: "",
  year: {
    min: 0,
    max: 0,
  },
});
const countryFullList = ref([]);
const menuSelectedId = ref(1);
const yourGroupName = ref("Your group");
const colorPattern = ref([
  "#04284D",
  "#8BC34A",
  "#9C27B0",
  "#3F51B5",
  "#E53935",

  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#E91E63",
  "#CDDC39",

  "#D32F2F",
  "#FFCA28",
  "#512DA8",
  "#FF7043",
  "#795548",

  "#9E9E9E",
  "#607D8B",
  "#FFEB3B",
  "#C2185B",
  "#7B1FA2",

  "#FFA726",
  "#303F9F",
  "#212121",
  "#D50000",
  "#0097A7",

  "#00796B",
  "#FFFF8D",
  "#A7FFEB",
  "#AFB42B",
  "#FBC02D",

  "#FFA000",
  "#F57C00",
  "#E64A19",
  "#5D4037",
  "#689F38",

  "#311B92",
  "#B71C1C",
  "#880E4F",
  "#F4FF81",
  "#616161",

  "#1A237E",
  "#263238",
  "#FFFF00",
  "#006064",
  "#E040FB",

  "#304FFE",
  "#84FFFF",
  "#827717",
  "#F57F17",
  "#FF6F00",

  "#E65100",
  "#BF360C",
  "#1976D2",
  "#3E2723",
  "#0D47A1",

  "#FF8A80",
  "#FF80AB",
  "#EA80FC",
  "#B388FF",
  "#8C9EFF",

  "#82B1FF",
  "#80D8FF",
  "#4A148C",
  "#33691E",
  "#B9F6CA",

  "#CCFF90",
  "#455A64",
  "#388E3C",
  "#FFE57F",
  "#FFD180",

  "#FF9E80",
  "#0091EA",
  "#CFD8DC",
  "#FF5252",
  "#FF4081",

  "#004D40",
  "#7C4DFF",
  "#448AFF",
  "#40C4FF",
  "#18FFFF",

  "#64FFDA",
  "#69F0AE",
  "#B2FF59",
  "#AA00FF",
  "#01579B",

  "#FFD740",
  "#FFAB40",
  "#FF6E40",
  "#BCAAA4",
  "#B0BEC5",

  "#0288D1",
  "#C51162",
  "#00C853",
  "#6200EA",
  "#1B5E20",

  "#D7CCC8",
  "#00B8D4",
  "#00BFA5",
  "#EEFF41",
  "#64DD17",
]);
const ecoIntegrationChart = ref([{ name: "" }, { name: "" }]);
const ecoIntegrationChartLeft = ref([{ name: "" }]);
const ecoIntegrationChartRight = ref([{ name: "" }]);
const ecoIntegrationChartGroup = ref([]);
const ecoIntegrationAvg = ref(0);
const ecoIntegrationPercentChange = ref(0);
const ecoIntegrationGroupVisible = ref(true);
const ecoIntegrationFinalChart = ref([]);
const ecoIntegrationTopFive = ref([]);
const ecoIntegrationSentenceHigh = ref([{ name: "" }, { name: "" }]);
const ecoIntegrationSentenceLow = ref([
  { name: "", lastValue: "" },
  { name: "", lastValue: "" },
]);
const integrationProgressChart = ref([{ name: "" }, { name: "" }]);
const menu2RawData = ref([]);
const menu2RawLeft = ref([]);
const menu2RawRight = ref([]);
const menu2SentenceHigh = ref([]);
const menu2SentenceLow = ref([]);
const menu2GroupDiffAvg = ref("");
const menu2SubtitleSentence1 = ref("");
const menu2SubtitleSentence2 = ref("");
const menu2YearSet1 = ref("");
const menu2YearSet2 = ref("");
const menu2ActiveEco = ref([]);
const menu2ChartEco = ref([]);
const menu2ChartSet1 = ref([]);
const menu2ChartSet2 = ref([]);
const menu2GroupVisible = ref(true);
const integrationProgressdiffValueArray = ref([]);

const dataAvailable = ref({
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
  subTitle2: "",
});

const weight = ref({
  equalWeight: 0.25,
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
});

onMounted(() => {
  $q.loading.show();
  input.value = props.dataGet.input;
  countryFullList.value = props.dataGet.countryFullList;
  loadEcoIntegration();
  loadDataFromDatabase();
  weightLoadData();
  checkYourName();
});

const checkYourName = () => {
  if (input.value.partner.length == 1) {
    yourGroupName.value = input.value.partner[0].label;
  }
};

const ecoIntegrationGroupToggleOnOff = () => {
  ecoIntegrationChartGroup.value["visible"] =
    !ecoIntegrationChartGroup.value["visible"];
  ecoIntegrationGroupVisible.value = ecoIntegrationChartGroup.value["visible"];
  mergeEcoIntegration();
};
const ecoIntegrationToggleOnOffLeft = (index) => {
  ecoIntegrationChart.value[index]["visible"] =
    !ecoIntegrationChart.value[index]["visible"];
  ecoIntegrationChart.value.push("xxx");
  ecoIntegrationChart.value.pop();
  mergeEcoIntegration();
};
const ecoIntegrationToggleOnOffRight = (index) => {
  let dataCount = Math.ceil(ecoIntegrationChart.value.length / 2);
  ecoIntegrationChart.value[dataCount + index]["visible"] =
    !ecoIntegrationChart.value[dataCount + index]["visible"];
  ecoIntegrationChart.value.push("xxx");
  ecoIntegrationChart.value.pop();
  mergeEcoIntegration();
};

const menu2SetVisibleLeft = (index) => {
  index += 1;

  menu2RawData.value[index].visible = !menu2RawData.value[index].visible;
  let temp1 = {
    color: "#F99704",
    data: [],
    data1: 12,
    data2: 12,
    diff: 33,
    name: "Group average",
    visible: true,
  };
  menu2RawData.value.push(temp1);
  menu2RawData.value.pop();
  menu2RefreshChart();
};

const menu2SetVisibleRight = (index) => {
  if (menu2RawData.value.length % 2 == 1) {
    index += Math.ceil(menu2RawData.value.length / 2);
  } else {
    console.log("test");
    index += Math.ceil(menu2RawData.value.length / 2) + 1;
  }

  menu2RawData.value[index].visible = !menu2RawData.value[index].visible;
  let temp1 = {
    color: "#F99704",
    data: [],
    data1: 12,
    data2: 12,
    diff: 33,
    name: "Group average",
    visible: true,
  };
  menu2RawData.value.push(temp1);
  menu2RawData.value.pop();
  menu2RefreshChart();
};

const weightLoadData = async () => {
  let data = {
    inputData: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };
  let url = serverData.value + "ri/intra_weight_by_country.php";
  let res = await axios.post(url, JSON.stringify(data));
  weight.value.rawData = res.data;

  weight.value.rawData.sort((a, b) => b.data - a.data);

  setDataforWeight();
};
const setDataforWeight = () => {
  let yourGroupName = "your group";
  if (input.value.partner.length == 1) {
    yourGroupName = input.value.partner[0].label;
  }
  weight.value.equalWeight = Number(
    (100 / weight.value.rawData.length).toFixed(2)
  );
  if (weight.value.rawData.length >= 4) {
    weight.value.subTitle1 = ` ${weight.value.rawData[0].name} (${Number(
      weight.value.rawData[0].data
    ).toFixed(2)}%) and ${weight.value.rawData[1].name} (${Number(
      weight.value.rawData[1].data
    ).toFixed(
      2
    )}%) were the most prominent economies in driving ${yourGroupName}'s integration score. In contrast, ${
      weight.value.rawData[weight.value.rawData.length - 1].name
    } (${Number(
      weight.value.rawData[weight.value.rawData.length - 1].data
    ).toFixed(2)}%) and ${
      weight.value.rawData[weight.value.rawData.length - 2].name
    } (${Number(
      weight.value.rawData[weight.value.rawData.length - 2].data
    ).toFixed(
      2
    )}%) were the least, Full data availability would yield an equal weighting average across economiesm each weighing ${
      weight.value.equalWeight
    }%`;
  } else {
    weight.value.subTitle1 = ` ${weight.value.rawData[0].name} (${Number(
      weight.value.rawData[0].data
    ).toFixed(
      2
    )}%) was the most prominent economies in driving ${yourGroupName}'s integration score. In contrast, ${
      weight.value.rawData[weight.value.rawData.length - 1].name
    } (${Number(
      weight.value.rawData[weight.value.rawData.length - 1].data
    ).toFixed(
      2
    )}%) was the least, Full data availability would yield an equal weighting average across economiesm each weighing ${
      weight.value.equalWeight
    }%`;
  }

  weight.value.cat = weight.value.rawData.map((x) => x.name);
  weight.value.chartData = weight.value.rawData.map((x) => x.data);

  plotChartDataWeight();
};

const plotChartDataWeight = () => {
  let equalWeight = weight.value.equalWeight;
  Highcharts.chart("container4", {
    chart: {
      type: "column",
      height: "500px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: weight.value.cat,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      // max: 1,
      title: {
        text: "",
      },
      plotLines: [
        {
          color: "red",
          width: 1,
          value: equalWeight,
          zIndex: 5,
          dashStyle: "longdashdot",
          label: {
            text: "Equal weight: " + equalWeight,
            align: "right",
          },
        },
      ],
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    legend: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    series: [
      {
        name: "weight",
        data: weight.value.chartData,
        color: "#2381B8",
      },
    ],
  });
};
const loadDataFromDatabase = async () => {
  let data = {
    inputData: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };
  let url = serverData.value + "ri/intra_data_avail_by_country.php";
  let res = await axios.post(url, JSON.stringify(data));
  dataAvailable.value.rawData = res.data;
  let avgGroup = Math.round(
    dataAvailable.value.rawData
      .map((x) => x.data)
      .reduce((pc, cc) => pc + cc, 0) / dataAvailable.value.rawData.length
  );
  let temp = {
    name: yourGroupName.value,
    data: avgGroup,
  };
  dataAvailable.value.rawData.push(temp);
  dataAvailable.value.rawData.sort((a, b) => b.data - a.data);
  setDataforDataAvail(avgGroup);
};

const setDataforDataAvail = (avgGroup) => {
  if (dataAvailable.value.rawData.length > 30) {
    let yourGroupIndex = dataAvailable.value.rawData.findIndex(
      (x) => x.name == yourGroupName.value
    );

    if (yourGroupIndex >= 14) {
      dataAvailable.value.rawData.splice(14, yourGroupIndex - 14);
    }
    if (dataAvailable.value.rawData.length >= 30) {
      dataAvailable.value.rawData.splice(
        15,
        dataAvailable.value.rawData.length - 30
      );
    }
  }

  dataAvailable.value.cat = dataAvailable.value.rawData.map((x) => x.name);
  dataAvailable.value.chartData = dataAvailable.value.rawData.map(
    (x) => x.data
  );
  dataAvailable.value.subTitle1 = `Integration scores for this group are based on ${avgGroup}% of all possible reporter-partner combinations.`;

  if (
    Number(dataAvailable.value.chartData[0]) ==
    Number(
      dataAvailable.value.chartData[dataAvailable.value.rawData.length - 2]
    )
  ) {
    dataAvailable.value.subTitle2 = "";
  } else {
    dataAvailable.value.subTitle2 = `${
      dataAvailable.value.rawData[0].name
    } (${Number(dataAvailable.value.chartData[0]).toFixed(2)}%)
      and ${dataAvailable.value.rawData[1].name} (${Number(
      dataAvailable.value.chartData[1]
    ).toFixed(2)}%) were the countries with the most complete data set, while ${
      dataAvailable.value.rawData[dataAvailable.value.rawData.length - 1].name
    } (${Number(
      dataAvailable.value.chartData[dataAvailable.value.rawData.length - 1]
    ).toFixed(2)}%) and ${
      dataAvailable.value.rawData[dataAvailable.value.rawData.length - 2].name
    } (${Number(
      dataAvailable.value.chartData[dataAvailable.value.rawData.length - 2]
    ).toFixed(2)}%) are the countries with the least.`;
  }

  plotChartDataAvail();
};
const plotChartDataAvail = () => {
  let gName = yourGroupName.value;
  Highcharts.chart("container3", {
    chart: {
      type: "column",
      height: "500px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: dataAvailable.value.cat,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == gName)
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "",
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
          ],
        },
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.0f}%</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    legend: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    series: [
      {
        name: "data availability",
        data: dataAvailable.value.chartData,
        color: "#2381B8",
      },
    ],
  });
};

const menu2SetGroupVisible = () => {
  menu2GroupVisible.value = !menu2GroupVisible.value;
  menu2RawData.value[0].visible = menu2GroupVisible.value;
  let temp1 = {
    color: "#F99704",
    data: [],
    data1: 12,
    data2: 12,
    diff: 33,
    name: "Group average",
    visible: true,
  };
  menu2RawData.value.push(temp1);
  menu2RawData.value.pop();
  menu2RefreshChart();
};

const menu2RefreshChart = () => {
  let menu2Left = [];
  let menu2Right = [];
  let menu2RawCount = Math.ceil((menu2RawData.value.length - 1) / 2);

  menu2RawData.value.forEach((item, index) => {
    if (index > 0 && index <= menu2RawCount) {
      menu2Left.push(item);
    } else if (index > 0) {
      menu2Right.push(item);
    }
  });
  menu2RawLeft.value = menu2Left;
  menu2RawRight.value = menu2Right;
  menu2ActiveEco.value = menu2RawData.value.filter((x) => x.visible == true);

  menu2ChartEco.value = menu2ActiveEco.value.map((x) => x.name);
  menu2ChartSet1.value = menu2ActiveEco.value.map((x) =>
    Number(Number(x.data1).toFixed(2))
  );
  menu2ChartSet2.value = menu2ActiveEco.value.map((x) =>
    Number(Number(x.data2).toFixed(2))
  );
  menu2PlotChart();
};
const menu2PlotChart = () => {
  let gName = yourGroupName.value;
  let gShowLabel = [...menu2ChartEco.value];

  if (gShowLabel[0] == "Group average") {
    gShowLabel[0] = "Your group";
  }

  let yAxisTitle = input.value.type + " integration";
  Highcharts.chart("container2", {
    chart: {
      type: "column",
      height: "550px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: menu2ChartEco.value,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Group average")
            return `<span style="color: #F99704; font-weight:bold;">Your group</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: yAxisTitle,
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
          ],
        },
      },
    },
    tooltip: {
      formatter: function () {
        let updown =
          this.points[1].y - this.points[0].y >= 0
            ? "increased by "
            : "decreased by ";
        let upDownSize = Number(
          Math.abs(this.points[1].y - this.points[0].y)
        ).toFixed(2);
        let upDownPercent = Number(
          (Number(upDownSize) / this.points[0].y) * 100
        ).toFixed(2);

        return (
          "<div class='font-16'><b>" +
          gShowLabel[this.x] +
          "</b></div><div>" +
          yAxisTitle +
          " index " +
          updown +
          upDownSize +
          " (" +
          upDownPercent +
          "%)</div>"
        );
      },

      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
        },
      },
    },
    series: [
      {
        name: menu2YearSet1.value,
        data: menu2ChartSet1.value,
        color: "#2381B8",
      },
      {
        name: menu2YearSet2.value,
        data: menu2ChartSet2.value,
        color: "#13405A",
      },
    ],
  });
};

const selectMenuId1 = () => {
  menuSelectedId.value = 1;
};
const selectMenuId2 = () => {
  menuSelectedId.value = 2;
};
const selectMenuId3 = () => {
  menuSelectedId.value = 3;
};
const selectMenuId4 = () => {
  menuSelectedId.value = 4;
};
const goToURL = () => {
  let dataGet = LocalStorage.getItem("dataAvail");
  let id = dataGet.key;
  window.open("#/ridataavail/" + id).focus;
};
const capitalize = (s) => {
  if (s.length == 0) {
    return "";
  } else {
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }
};
const loadEcoIntegration = async () => {
  let data = {
    inputData: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };

  let url = serverData.value + "ri/intra_eco_integration_by_country.php";
  let res = await axios.post(url, JSON.stringify(data));
  ecoIntegrationChart.value = res.data;
  ecoIntegrationChart.value.sort((a, b) =>
    Number(b.name) > Number(a.name) ? -1 : 1
  );
  let diffYear = input.value.year.max - input.value.year.min;
  let avgValue = [];

  for (let j = 0; j <= diffYear; j++) {
    avgValue[j] = 0;
  }

  for (let i = 0; i < ecoIntegrationChart.value.length; i++) {
    ecoIntegrationChart.value[i]["color"] = colorPattern.value[i];
    ecoIntegrationChart.value[i]["visible"] = false;
    for (let j = 0; j <= diffYear; j++) {
      avgValue[j] += Number(ecoIntegrationChart.value[i]["data"][j]);
    }
  }
  setTopFiveEcoIntegration();
  setSentenceInIntegrationAcrossYear();

  for (let j = 0; j <= diffYear; j++) {
    avgValue[j] = Number(
      (avgValue[j] / ecoIntegrationChart.value.length).toFixed(4)
    );
  }
  ecoIntegrationChartGroup.value = {
    name: "Group average",
    data: avgValue,
    lastValue: avgValue[diffYear],
    color: "#FF9616",
    visible: true,
    dashStyle: "dash",
  };

  ecoIntegrationAvg.value = ecoIntegrationChartGroup.value.lastValue;
  ecoIntegrationPercentChange.value = (
    ((avgValue[diffYear] - avgValue[0]) / avgValue[0]) *
    100
  ).toFixed(0);

  integrationProgressPrepareData();
  mergeEcoIntegration();
  $q.loading.hide();
};

const mergeEcoIntegration = () => {
  ecoIntegrationFinalChart.value = [];
  ecoIntegrationChart.value.forEach((x) => {
    ecoIntegrationFinalChart.value.push(x);
  });
  ecoIntegrationFinalChart.value.push(ecoIntegrationChartGroup.value);
  LineChartByCountry();
};

const LineChartByCountry = () => {
  let yAxisTitle = input.value.type + " integration";

  Highcharts.chart("lineChartByCountry", {
    chart: {
      height: 550,
    },
    title: {
      text: "",
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    yAxis: {
      // min: 0,

      title: {
        text: yAxisTitle,
      },
    },
    xAxis: {
      tickInterval: 1,
    },
    tooltip: {
      useHTML: true,
      headerFormat: "",
      pointFormatter: function () {
        return (
          "<div class='font-16'><b>" +
          this.series.name +
          " (" +
          this.x +
          ")" +
          "</b></div><div>" +
          yAxisTitle +
          " index: " +
          Number(this.y).toFixed(2) +
          "</div>"
        );
      },
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: input.value.year.min,
      },
    },
    credits: {
      enabled: false,
    },
    series: ecoIntegrationFinalChart.value,
    legend: { enabled: false },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  });
};

const setTopFiveEcoIntegration = () => {
  let ecoIntegrationSortValue = [...ecoIntegrationChart.value];
  ecoIntegrationSortValue.sort((a, b) => b.lastValue - a.lastValue);
  let noSelected = 5;
  ecoIntegrationSortValue.length >= 5
    ? (noSelected = 5)
    : (noSelected = ecoIntegrationSortValue.length);
  for (let i = 0; i < noSelected; i++) {
    let dataKeep = ecoIntegrationSortValue[i].name;
    ecoIntegrationTopFive.value.push(dataKeep);
  }
  for (let i = 0; i < ecoIntegrationChart.value.length; i++) {
    let checkTopFive = false;
    for (let j = 0; j < ecoIntegrationTopFive.value.length; j++) {
      if (ecoIntegrationChart.value[i].name == ecoIntegrationTopFive.value[j]) {
        checkTopFive = true;
      }
    }
    if (checkTopFive) {
      ecoIntegrationChart.value[i]["visible"] = true;
    }
  }
  let dataCountCol = Math.ceil(ecoIntegrationChart.value.length / 2);
  ecoIntegrationChartLeft.value = [];
  ecoIntegrationChartRight.value = [];
  ecoIntegrationChart.value.forEach((item, index) => {
    if (index < dataCountCol) {
      ecoIntegrationChartLeft.value.push(item);
    } else {
      ecoIntegrationChartRight.value.push(item);
    }
  });
};

const setSentenceInIntegrationAcrossYear = () => {
  ecoIntegrationSentenceHigh.value = [];
  let ecoIntegrationSortValue = [...ecoIntegrationChart.value];
  ecoIntegrationSortValue.sort((a, b) => b.lastValue - a.lastValue);

  ecoIntegrationSentenceHigh.value.push(ecoIntegrationSortValue[0]);
  if (ecoIntegrationChart.value.length >= 4) {
    ecoIntegrationSentenceHigh.value.push(ecoIntegrationSortValue[1]);
  }
  ecoIntegrationSentenceLow.value = [];
  ecoIntegrationSortValue.sort((a, b) => a.lastValue - b.lastValue);
  ecoIntegrationSentenceLow.value.push(ecoIntegrationSortValue[0]);
  if (ecoIntegrationChart.value.length >= 4) {
    ecoIntegrationSentenceLow.value.push(ecoIntegrationSortValue[1]);
  }
};

const integrationProgressPrepareData = () => {
  menu2SetAvgData();
  menu2MakeleftList();
  menu2FindGroupAvg();
  menu2Subtitle();
  menu2PrepareChart();
  menu2PlotChart();
  menu2RefreshChart();
};

const menu2SetAvgData = () => {
  menu2RawData.value = [];
  ecoIntegrationChart.value.forEach((item) => {
    //Find avg value in 2 series for economic (not include group)
    let diffYearByTwo = Math.floor(
      (input.value.year.max - input.value.year.min) / 2
    );

    let arr1 = item.data.slice(0, diffYearByTwo + 1);

    let avg1 = Number(arr1.reduce((pc, cc) => pc + cc, 0)) / arr1.length;
    let arr2 = item.data.slice(item.data.length - diffYearByTwo - 1);
    let avg2 = Number(arr2.reduce((pc, cc) => pc + cc, 0)) / arr2.length;
    let temp1 = {
      name: item.name,
      data: item.data,
      data1: Number(avg1).toFixed(4),
      data2: Number(avg2).toFixed(4),
      diff: Number(avg2 - avg1).toFixed(4),
    };

    menu2RawData.value.push(temp1);
  });
};

const menu2MakeleftList = () => {
  menu2RawData.value.sort((a, b) => b.diff - a.diff);
  menu2RawData.value.forEach((item, index) => {
    if (index <= 4) {
      menu2RawData.value[index].visible = true;
    } else {
      menu2RawData.value[index].visible = false;
    }
  });
  menu2SentenceHigh.value = [];
  menu2SentenceHigh.value[0] = menu2RawData.value[0];
  if (menu2RawData.value.length >= 4) {
    menu2SentenceHigh.value[1] = menu2RawData.value[1];
  }
  menu2RawData.value.sort((a, b) => a.diff - b.diff);
  menu2SentenceLow.value = [];
  menu2SentenceLow.value[0] = menu2RawData.value[0];
  if (menu2RawData.value.length >= 4) {
    menu2SentenceLow.value[1] = menu2RawData.value[1];
  }
  menu2RawData.value.sort((a, b) => (a.name > b.name ? 1 : -1));
  menu2RawData.value.forEach((item, index) => {
    menu2RawData.value[index].color = colorPattern.value[index];
  });
};

const menu2FindGroupAvg = () => {
  let diff1 =
    menu2RawData.value.reduce((total, item) => {
      return total + Number(item.data1);
    }, 0) / menu2RawData.value.length;
  let diff2 =
    menu2RawData.value.reduce((total, item) => {
      return total + Number(item.data2);
    }, 0) / menu2RawData.value.length;
  menu2GroupDiffAvg.value = diff2 - diff1;
  let temp1 = {
    color: "#F99704",
    data: [],
    data1: diff1,
    data2: diff2,
    diff: Number(diff2) - Number(diff1),
    name: "Group average",
    visible: true,
  };
  menu2RawData.value.unshift(temp1);
};

const menu2Subtitle = () => {
  let yourGroupName = "your group";
  if (input.value.partner.length == 1) {
    yourGroupName = input.value.partner[0].label;
  }
  let directionAvg;
  menu2RawData.value[0].diff >= 0
    ? (directionAvg = "increased by ")
    : (directionAvg = "decreased by ");
  menu2SubtitleSentence1.value =
    "From " +
    input.value.year.min +
    "-" +
    (input.value.year.min +
      Math.floor((input.value.year.max - input.value.year.min) / 2) -
      2000) +
    " to " +
    (input.value.year.max -
      Math.floor((input.value.year.max - input.value.year.min) / 2)) +
    "-" +
    (input.value.year.max - 2000) +
    " " +
    yourGroupName +
    "'s integration average " +
    directionAvg +
    Number(menu2RawData.value[0].diff).toFixed(2) +
    " from " +
    Number(menu2RawData.value[0].data1).toFixed(2) +
    " to " +
    Number(menu2RawData.value[0].data2).toFixed(2) +
    ".";

  if (menu2RawData.value.length >= 5) {
    menu2SubtitleSentence2.value =
      menu2SentenceHigh.value[0].name +
      " (" +
      Number(menu2SentenceHigh.value[0].diff).toFixed(2) +
      ") and " +
      menu2SentenceHigh.value[1].name +
      " (" +
      Number(menu2SentenceHigh.value[1].diff).toFixed(2) +
      ") progressed the most. " +
      menu2SentenceLow.value[0].name +
      " (" +
      Number(menu2SentenceLow.value[0].diff).toFixed(2) +
      ") and " +
      menu2SentenceLow.value[1].name +
      " (" +
      Number(menu2SentenceLow.value[1].diff).toFixed(2) +
      ") progressed the least.";
  } else {
    menu2SubtitleSentence2.value =
      menu2SentenceHigh.value[0].name +
      " (" +
      Number(menu2SentenceHigh.value[0].diff).toFixed(2) +
      ") progressed the most. " +
      menu2SentenceLow.value[0].name +
      " (" +
      Number(menu2SentenceLow.value[0].diff).toFixed(2) +
      ")" +
      " progressed the least.";
  }
};

const menu2PrepareChart = () => {
  menu2YearSet1.value =
    input.value.year.min +
    "-" +
    (input.value.year.min +
      Math.floor((input.value.year.max - input.value.year.min) / 2) -
      2000);

  menu2YearSet2.value =
    input.value.year.max -
    Math.floor((input.value.year.max - input.value.year.min) / 2) +
    "-" +
    (input.value.year.max - 2000);
};
</script>

<style lang="scss" scoped>
.positiveText {
  color: #2d9687;
}
.negativeText {
  color: #d85b63;
}
.colorBox {
  width: 16px;
  height: 16px;
  border: 1px solid #757575;
}
.selectBoxDiv {
  border: 1px solid #757575;
}
.textSelected {
  color: #2d9687;
  font-weight: bold;
}
.lineGreenSelectedBox {
  height: 7px;
  background-color: #2d9687;
}
.borderMainBox {
  border: 1px solid #757575;
  height: 650px;
  width: 100%;
}
.borderRight {
  border-right: 1px solid #c4c4c4;
  height: 650px;
}
.checkBox {
  width: 20px;
  height: 20px;
}
.checkBoxGroup {
  width: 20px;
  height: 20px;
  border: 1px solid #757575;
}
.economicShowDiv {
  height: 450px;
  overflow-y: auto;
}
</style>
