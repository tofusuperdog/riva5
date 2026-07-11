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
          Integration<br />across years
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 1 }"></div>
        </div>

        <!-- Menu #2 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          @click="selectMenuId2()"
          :class="{ textSelected: menuSelectedId == 2 }"
        >
          Integration<br />
          across periods
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
          <u>Click here to see this group's availablity matrix</u>
        </div>
      </div>
    </div>
    <div class="borderMainBox">
      <!-- menu#1 -->
      <div v-show="menuSelectedId == 1">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select dimensions of interest</div>
            <div class="q-pt-md">
              In parenthesis, each dimension's symmetric
              {{ input.type }} integration index with the group in
              {{ input.year.max }}
            </div>
            <div class="q-pt-md">
              Click on each dimension to select/unselect it from the graph.
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
            <div class="row pt-2">
              <div
                v-for="(item, index) in ecoIntegrationChart"
                :key="index"
                class="col-12 row q-pb-md font-12"
              >
                <div
                  @click="ecoIntegrationToggleOnOff(index)"
                  class="cursor-pointer row"
                  style="width: 340px"
                  v-if="item.lastValue >= 0"
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
                    <div style="max-width: 250px; display: inline-block">
                      {{ capitalize(item.name) }} ({{
                        Number(item.lastValue).toFixed(2)
                      }})
                    </div>
                  </div>
                </div>
                <div v-else class="row">
                  <div
                    class="checkBox"
                    :style="{ backgroundColor: 'grey' }"
                    v-show="item.visible == true"
                  ></div>
                  <div class="q-pl-sm row">
                    <div style="max-width: 250px; display: inline-block">
                      {{ capitalize(item.name) }} (No data available)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did Integration progress across years?
              </div>
            </div>
            <div>
              Since {{ input.year.min }}, your group's Integration
              {{ ecoIntegrationPercentChange > 0 ? "increased" : "decreased" }}
              by
              {{ Math.abs(ecoIntegrationPercentChange) }}%. In
              {{ input.year.max }}, your group was most integrated in
              {{ ecoIntegrationChartSort[0].name }} ({{
                Number(ecoIntegrationChartSort[0].lastValue).toFixed(2)
              }}) and {{ ecoIntegrationChartSort[1].name }} ({{
                Number(ecoIntegrationChartSort[1].lastValue).toFixed(2)
              }}) and least in
              {{
                ecoIntegrationChartSort[ecoIntegrationChartSort.length - 1].name
              }}
              ({{
                Number(
                  ecoIntegrationChartSort[ecoIntegrationChartSort.length - 1]
                    .lastValue
                ).toFixed(2)
              }}) and
              {{
                ecoIntegrationChartSort[ecoIntegrationChartSort.length - 2].name
              }}
              ({{
                Number(
                  ecoIntegrationChartSort[ecoIntegrationChartSort.length - 2]
                    .lastValue
                ).toFixed(2)
              }}).
            </div>

            <div
              id="lineChartByDimension"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- menu#2 -->
      <div v-show="menuSelectedId == 2">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select dimensions of interest</div>
            <div class="q-pt-md">
              In parenthesis, each economy's symmetric sustainable integration
              index progression with the partner group across periods.
            </div>
            <div class="q-pt-md">
              Click on each dimension to select/unselect it from the graph.
            </div>
            <div
              class="row q-py-sm cursor-pointer"
              @click="integrationProgressToggleGroupOnOff()"
            >
              <div
                class="checkBoxGroup"
                style="background-color: #f07435"
                v-show="integrationProgressChartGroupVisible"
              ></div>
              <div
                class="checkBoxGroup"
                v-show="!integrationProgressChartGroupVisible"
              ></div>
              <div class="q-pl-sm">
                Group average ({{ Number(ecoIntegrationAvg).toFixed(2) }})
              </div>
            </div>
            <div><hr /></div>
            <div class="row pt-2" style="width: 100%">
              <div
                v-for="(item, index) in intergrationProgressList"
                :key="index"
                class="col-12 row q-pb-md font-12 cursor-pointer b"
                @click="integrationProgressToggleOnOff(index)"
              >
                <div
                  class="checkBox"
                  style="background-color: #2d9687"
                  v-show="item.visible == true"
                ></div>
                <div
                  class="checkBox"
                  style="border: 1px solid #757575"
                  v-show="item.visible == false"
                ></div>

                <div class="q-pl-sm row">
                  <div style="max-width: 350px; display: inline-block">
                    {{ capitalize(item.name) }}
                    <span
                      v-if="
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ) >= 0
                      "
                      class="positiveText"
                      >(+{{
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ).toFixed(2)
                      }})</span
                    >
                    <span
                      class="negativeText"
                      v-else-if="
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ) < 0
                      "
                      >(-{{
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ).toFixed(2)
                      }})</span
                    >
                    <span v-else>(No data available) </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did integration progress across periods?
              </div>
              <div>
                {{ integrationProgressSubTitleText }}
                {{ integrationProgressSubTitleTextLine2 }}
                {{ integrationProgressSubTitleTextLine3 }}
              </div>
            </div>
            <div
              id="container2x"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- menu#3 -->
      <div v-show="menuSelectedId == 3">
        <div class="q-pa-md">
          <div class="font-24">
            How much data is available for each of the dimensions considered?
            <q-icon name="fas fa-question-circle" size="24px">
              <q-tooltip anchor="bottom middle" self="top middle">
                Data availability for each dimension is calculated as the
                ratio<br />
                between the number of pairs with available data and all the<br />
                possible relevant pair combinations. The higher the data<br />
                availability the more accurate the dimension score is.<br />
                Concomitantly, the more prominent this dimension will be in<br />
                driving dimension and overall integration scores. <br />
                E.g., take any dimension D and a 3 country group (X, Y and Z).
                <br />
                In dimension D, there are 6 possible unique pairs:(X-Y), (X-Z),
                <br />
                (Y-X), (Y-Z), (Z-X), (Z-Y). If data is available for 3 of these
                <br />
                pairs, data availability for dimension D will be set at 50%
                (3/6).
              </q-tooltip>
            </q-icon>
          </div>
          <div>{{ dataAvailable.subTitle1 }} {{ dataAvailable.subTitle2 }}</div>
        </div>
        <div
          id="container3x"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>
      </div>
      <!-- Menu#4 -->
      <div v-show="menuSelectedId == 4">
        <div class="q-pa-md">
          <div class="font-24">
            How much is each dimensions contributing to the overall integration
            index?
            <q-icon name="fas fa-question-circle" size="24px">
              <q-tooltip anchor="bottom middle" self="top middle">
                All country pairs are weighted equally. Within a single pair,<br />
                all available dimensions are weighted equally. As such,
                dimension<br />
                weights largely reflect data availability, albeit not perfectly.
                <br />To learn more about dimensions weights please visit our<br />
                Technical note (upper-right corner).
              </q-tooltip>
            </q-icon>
          </div>
          <div>{{ weight.subTitle1 }}</div>
          <div>{{ weight.subTitle2 }}</div>
        </div>
        <div
          id="container4x"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server.js";
import { LocalStorage } from "quasar";

import axios from "axios";
const { serverData } = serverSetup();
const props = defineProps({
  dataGet: {
    type: Object,
    require: true,
  },
});

const menuSelectedId = ref(1);
const dimensionAll = ref([]);
const yourGroupName = ref("");

const input = ref({
  type: "",
  year: {
    min: 0,
    max: 0,
  },
});
const countryFullList = ref([]);
const ecoIntegrationAvg = ref(0);
const ecoIntegrationChart = ref([]);
const ecoIntegrationGroupVisible = ref(true);
const ecoIntegrationChartGroup = ref([]);
const ecoIntegrationChartSort = ref([{ name: "" }, { name: "" }]);
const ecoIntegrationPercentChange = ref(0);
const ecoIntegrationFinalChart = ref([]);

const integrationProgressChartGroupVisible = ref(true);
const integrationProgressChartSeries1 = ref([]);
const integrationProgressChartSeries2 = ref([]);
const intergrationProgressList = ref([]);

const integrationProgressPlotChartGroup = ref([]);
const integrationProgressYearStart = ref("");
const integrationProgressYearEnd = ref("");
const integrationProgressSubTitleText = ref("");
const integrationProgressSubTitleTextLine2 = ref("");
const integrationProgressSubTitleTextLine3 = ref("");
const integrationProgressdiffValueArray = ref([]);
const integrationProgressPlotChartCat = ref([]);
const integrationProgressPlotChartSeries1 = ref([]);
const integrationProgressPlotChartSeries2 = ref([]);

const dataAvailable = ref({
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
  subTitle2: "",
});
const weight = ref({
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
  subTitle2: "",
  equalWeigth: 100,
});
const colorPattern = ref([
  "#64C1E8",
  "#D85B63",
  "#D680AD",
  "#88643A",
  "#C0BA80",
  "#FDC47D",
  "#EA3B46",
]);

onMounted(async () => {
  input.value = props.dataGet.input;
  countryFullList.value = props.dataGet.countryFullList;

  let dataSend = {
    type: input.value.type,
  };
  let url2 = serverData.value + "ri/dimension_icon.php";
  let res2 = await axios.post(url2, JSON.stringify(dataSend));
  dimensionAll.value = res2.data;

  checkYourName();
  loadEcoIntegration();
  loadDataFromDatabase();
  weightLoadData();
});

const checkYourName = () => {
  if (input.value.partner.length == 1) {
    yourGroupName.value = input.value.partner[0].label;
  }
};

const loadEcoIntegration = async () => {
  ecoIntegrationChart.value = [];
  let data = {
    inputData: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };
  let url = serverData.value + "ri/intra_index_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(data));
  let tableTemp = res.data;
  for (let i = 0; i < dimensionAll.value.length; i++) {
    let dataBeforePush = {
      name: dimensionAll.value[i].name,
      data: [],
      lastValue: 0,
    };
    for (let j = input.value.year.min; j <= input.value.year.max; j++) {
      let tempData = tableTemp.filter(
        (x) => x.dimension == i + 1 && x.year == j
      );
      let avgData =
        tempData.reduce((total, item) => {
          return total + Number(item.score);
        }, 0) / tempData.length;
      dataBeforePush.data.push(Number(avgData.toFixed(4)));
    }
    dataBeforePush.lastValue =
      dataBeforePush.data[dataBeforePush.data.length - 1];
    ecoIntegrationChart.value.push(dataBeforePush);
  }

  ecoIntegrationChartSort.value = [];
  ecoIntegrationChart.value.forEach((item) => {
    let temp = {
      name: item.name,
      lastValue: item.lastValue,
    };
    ecoIntegrationChartSort.value.push(temp);
  });
  ecoIntegrationChartSort.value = ecoIntegrationChartSort.value.filter(
    (x) => x.lastValue >= 0
  );
  ecoIntegrationChartSort.value.sort((a, b) => b.lastValue - a.lastValue);

  let diffYear = input.value.year.max - input.value.year.min;

  for (let i = 0; i < ecoIntegrationChart.value.length; i++) {
    ecoIntegrationChart.value[i]["color"] = colorPattern.value[i];
    ecoIntegrationChart.value[i]["visible"] = true;
  }

  let url3 = serverData.value + "ri/intra_index_by_dimension_avgall.php";
  let res3 = await axios.post(url3, JSON.stringify(data));
  let avgValue = res3.data;
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
};

const loadDataFromDatabase = async () => {
  let data = {
    input: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };
  let url = serverData.value + "ri/intra_data_avail_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(data));

  let dataChart = [];

  for (let k = 0; k < dimensionAll.value.length; k++) {
    let temp = {
      name: dimensionAll.value[k].name,
      data: 0,
    };
    dataChart.push(temp);
  }

  for (let i = 0; i < countryFullList.value.length; i++) {
    for (let j = 0; j < countryFullList.value.length; j++) {
      let tempPairCountry = res.data.filter(
        (x) =>
          x.reporting == countryFullList.value[i].iso &&
          x.partner == countryFullList.value[j].iso
      );
      if (tempPairCountry.length >= 4) {
        for (let k = 0; k < tempPairCountry.length; k++) {
          dataChart[Number(tempPairCountry[k].dim) - 1].data += 1;
        }
      }
    }
  }

  for (let i = 0; i < dataChart.length; i++) {
    dataChart[i].data *= 100;
    dataChart[i].data /=
      (countryFullList.value.length - 1) * countryFullList.value.length;
    dataChart[i].data = Number(dataChart[i].data.toFixed(4));
  }

  for (let i = 0; i < dataChart.length; i++) {
    dataAvailable.value.rawData.push(dataChart[i]);
  }

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
  dataAvailable.value.cat = dataAvailable.value.rawData.map((x) => x.name);
  dataAvailable.value.chartData = dataAvailable.value.rawData.map(
    (x) => x.data
  );
  dataAvailable.value.subTitle1 = `Integration scores for this group are based on From ${Number(
    avgGroup
  ).toFixed(0)}% for all possible reporter-partner combinations.`;

  dataAvailable.value.subTitle2 = `${capitalize(
    dataAvailable.value.rawData[0].name
  )} (${Number(dataAvailable.value.chartData[0]).toFixed(2)}%)
      and ${dataAvailable.value.rawData[1].name.toLowerCase()} (${Number(
    dataAvailable.value.chartData[1]
  ).toFixed(
    2
  )}%) were the dimensions with the most complete data set, while ${dataAvailable.value.rawData[
    dataAvailable.value.rawData.length - 1
  ].name.toLowerCase()} (${Number(
    dataAvailable.value.chartData[dataAvailable.value.rawData.length - 1]
  ).toFixed(2)}%) and ${dataAvailable.value.rawData[
    dataAvailable.value.rawData.length - 2
  ].name.toLowerCase()} (${Number(
    dataAvailable.value.chartData[dataAvailable.value.rawData.length - 2]
  ).toFixed(2)}%) were the least.`;
  plotChartDataAvail();
};

const plotChartDataAvail = () => {
  Highcharts.chart("container3x", {
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
          if (this.value == yourGroupName.value)
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
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

const weightLoadData = async () => {
  let data = {
    input: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };

  let url = serverData.value + "ri/intra_data_avail_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(data));

  let dataChart = [];
  for (let k = 0; k < dimensionAll.value.length; k++) {
    let temp = {
      name: dimensionAll.value[k].name,
      data: 0,
    };
    dataChart.push(temp);
  }
  let count = 0;

  for (let i = 0; i < countryFullList.value.length; i++) {
    for (let j = 0; j < countryFullList.value.length; j++) {
      let tempPairCountry = res.data.filter(
        (x) =>
          x.reporting == countryFullList.value[i].iso &&
          x.partner == countryFullList.value[j].iso
      );

      if (tempPairCountry.length >= 4) {
        count++;
        let tempWeight = 100 / tempPairCountry.length;
        for (let k = 0; k < tempPairCountry.length; k++) {
          dataChart[Number(tempPairCountry[k].dim) - 1].data += tempWeight;
        }
      }
    }
  }

  for (let i = 0; i < dataChart.length; i++) {
    dataChart[i].data /= count;
    dataChart[i].data = Number(dataChart[i].data.toFixed(1));
  }

  weight.value.rawData = [];
  for (let i = 0; i < dataChart.length; i++) {
    weight.value.rawData[i] = dataChart[i];
  }
  weight.value.rawData.sort((a, b) => b.data - a.data);
  setDataforWeight();
};

const setDataforWeight = () => {
  weight.value.cat = weight.value.rawData.map((x) => x.name);
  weight.value.chartData = weight.value.rawData.map((x) => x.data);
  weight.value.equalWeigth = Number(
    (weight.value.equalWeigth / weight.value.chartData.length).toFixed(2)
  );
  weight.value.subTitle1 = `${capitalize(
    weight.value.rawData[0].name
  )} (${Number(weight.value.chartData[0]).toFixed(2)}%)
      and ${weight.value.rawData[1].name.toLowerCase()} (${Number(
    weight.value.chartData[1]
  ).toFixed(
    2
  )}%) were the most prominent dimensions in driving the group's integration score. In contrast, ${weight.value.rawData[
    weight.value.rawData.length - 1
  ].name.toLowerCase()} (${Number(
    weight.value.chartData[weight.value.rawData.length - 1]
  ).toFixed(2)}%) and ${weight.value.rawData[
    weight.value.rawData.length - 2
  ].name.toLowerCase()} (${Number(
    weight.value.chartData[weight.value.rawData.length - 2]
  ).toFixed(
    2
  )}%) were the least. Full data availability would yield an equal weighting average across dimension, each with weighing ${
    weight.value.equalWeigth
  }%.`;
  plotChartDataWeight();
};

const plotChartDataWeight = () => {
  let EQweight = weight.value.equalWeigth;
  Highcharts.chart("container4x", {
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

      title: {
        text: "",
      },
      plotLines: [
        {
          color: "red",
          width: 1,
          value: EQweight,
          zIndex: 5,
          dashStyle: "longdashdot",
          label: {
            text: "Equal weight:" + EQweight,
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

const ecoIntegrationGroupToggleOnOff = () => {
  ecoIntegrationChartGroup.value["visible"] =
    !ecoIntegrationChartGroup.value["visible"];
  ecoIntegrationGroupVisible.value = ecoIntegrationChartGroup.value["visible"];
  mergeEcoIntegration();
};

const ecoIntegrationToggleOnOff = (index) => {
  ecoIntegrationChart.value[index]["visible"] =
    !ecoIntegrationChart.value[index]["visible"];
  ecoIntegrationChart.value.push("xxx");
  ecoIntegrationChart.value.pop();
  mergeEcoIntegration();
};

const mergeEcoIntegration = () => {
  ecoIntegrationFinalChart.value = [];
  ecoIntegrationChart.value.forEach((x) => {
    ecoIntegrationFinalChart.value.push(x);
  });
  ecoIntegrationFinalChart.value.push(ecoIntegrationChartGroup.value);

  ecoIntegrationFinalChart.value.forEach((item, index) => {
    if (item.name == "Trade and investment") {
      ecoIntegrationFinalChart.value[index].color = "#64C1E8";
    } else if (item.name == "Financial") {
      ecoIntegrationFinalChart.value[index].color = "#D85B63";
    } else if (item.name == "Regional value chain") {
      ecoIntegrationFinalChart.value[index].color = "#D680AD";
    } else if (item.name == "Infrastructure") {
      ecoIntegrationFinalChart.value[index].color = "#88643A";
    } else if (item.name == "Movement of people") {
      ecoIntegrationFinalChart.value[index].color = "#C0BA80";
    } else if (item.name == "Regulatory cooperation") {
      ecoIntegrationFinalChart.value[index].color = "#FDC47D";
    } else if (item.name == "Digital economy") {
      ecoIntegrationFinalChart.value[index].color = "#EA3B46";
    } else if (item.name == "Group average") {
      ecoIntegrationFinalChart.value[index].color = "#FF9616";
    }
  });
  LineChartByCountry();
};

const LineChartByCountry = () => {
  let yAxisTitle = input.value.type + " Integration";
  Highcharts.chart("lineChartByDimension", {
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
      useHTML: true,
      headerFormat: "",
      pointFormatter: function () {
        return (
          "<div class='font-16'><b>" +
          this.series.name +
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
const integrationProgressPrepareData = () => {
  integrationProgressMakeEcoList();
  integrationProgressMakeAvg();
  integrationProgressMakeAvgGroup();
  integrationProgressLegendChartName();
  intergrationProgressSubTitle();
  integrationProgressMergeData();
};

const integrationProgressMakeEcoList = () => {
  intergrationProgressList.value = [];
  ecoIntegrationChart.value.forEach((item) => {
    let temp = [];

    temp = {
      name: item.name,
      lastValue: item.lastValue,
      visible: true,
    };

    intergrationProgressList.value.push(temp);
  });
};

const integrationProgressMakeAvg = () => {
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
      color: "#2381B8",
      data: Number(avg1).toFixed(2),
    };
    let temp2 = {
      name: item.name,
      color: "#13405A8",
      data: Number(avg2).toFixed(2),
    };
    integrationProgressChartSeries1.value.push(temp1);

    integrationProgressChartSeries2.value.push(temp2);
  });
  integrationProgressChartSeries1.value =
    integrationProgressChartSeries1.value.map((x) => Number(x.data));
  integrationProgressChartSeries2.value =
    integrationProgressChartSeries2.value.map((x) => Number(x.data));
};

const integrationProgressMakeAvgGroup = () => {
  integrationProgressPlotChartGroup.value = [];

  let diffYearByTwo = Math.floor(
    (input.value.year.max - input.value.year.min) / 2
  );
  let arrGroup1 = ecoIntegrationChartGroup.value.data.slice(
    0,
    diffYearByTwo + 1
  );
  let arrGroup2 = ecoIntegrationChartGroup.value.data.slice(
    ecoIntegrationChartGroup.value.data.length - diffYearByTwo - 1
  );
  let avgGroup1 =
    Number(arrGroup1.reduce((pc, cc) => pc + cc, 0)) / arrGroup1.length;
  let avgGroup2 =
    Number(arrGroup2.reduce((pc, cc) => pc + cc, 0)) / arrGroup2.length;
  integrationProgressPlotChartGroup.value.push(Number(avgGroup1.toFixed(2)));
  integrationProgressPlotChartGroup.value.push(Number(avgGroup2.toFixed(2)));
};

const integrationProgressLegendChartName = () => {
  let diffYear = Math.floor((input.value.year.max - input.value.year.min) / 2);
  integrationProgressYearStart.value =
    input.value.year.min + "-" + (input.value.year.min + diffYear);
  integrationProgressYearEnd.value =
    input.value.year.max - diffYear + "-" + input.value.year.max;
};

const intergrationProgressSubTitle = () => {
  let diffGroup =
    integrationProgressPlotChartGroup.value[1] -
    integrationProgressPlotChartGroup.value[0];

  integrationProgressSubTitleText.value = `From ${
    integrationProgressYearStart.value
  } to ${integrationProgressYearEnd.value}
      ,your group’s integration average ${
        diffGroup > 0 ? "increased" : "decreased"
      } ${Math.abs(diffGroup).toFixed(2)} from  ${
    integrationProgressPlotChartGroup.value[0]
  } to ${integrationProgressPlotChartGroup.value[1]}.`;

  let counter = 0;
  intergrationProgressList.value.forEach((item) => {
    let temp = {
      name: item.name,
      diffData: Number(
        (
          integrationProgressChartSeries2.value[counter] -
          integrationProgressChartSeries1.value[counter]
        ).toFixed(2)
      ),
    };

    integrationProgressdiffValueArray.value.push(temp);
    counter++;
  });
  integrationProgressdiffValueArray.value.sort(
    (a, b) => b.diffData - a.diffData
  );

  integrationProgressSubTitleTextLine2.value = `${capitalize(
    integrationProgressdiffValueArray.value[0].name
  )}
      (${Number(integrationProgressdiffValueArray.value[0].diffData).toFixed(
        2
      )}) and ${integrationProgressdiffValueArray.value[1].name.toLowerCase()}
      (${Number(integrationProgressdiffValueArray.value[1].diffData).toFixed(
        2
      )}) progressed the most.`;

  integrationProgressSubTitleTextLine3.value = `${capitalize(
    integrationProgressdiffValueArray.value[
      integrationProgressdiffValueArray.value.length - 1
    ].name
  )} (${Number(
    integrationProgressdiffValueArray.value[
      integrationProgressdiffValueArray.value.length - 1
    ].diffData
  ).toFixed(2)}) and ${integrationProgressdiffValueArray.value[
    integrationProgressdiffValueArray.value.length - 2
  ].name.toLowerCase()} (${Number(
    integrationProgressdiffValueArray.value[
      integrationProgressdiffValueArray.value.length - 2
    ].diffData
  ).toFixed(2)}) progressed the least.`;
};

const integrationProgressMergeData = () => {
  integrationProgressPlotChartCat.value = [];
  integrationProgressPlotChartSeries1.value = [];
  integrationProgressPlotChartSeries2.value = [];

  if (integrationProgressChartGroupVisible.value) {
    integrationProgressPlotChartCat.value.push(yourGroupName.value);
    integrationProgressPlotChartSeries1.value.push(
      integrationProgressPlotChartGroup.value[0]
    );
    integrationProgressPlotChartSeries2.value.push(
      integrationProgressPlotChartGroup.value[1]
    );
  }

  let countInter = 0;
  intergrationProgressList.value.forEach((item) => {
    if (item.visible) {
      integrationProgressPlotChartCat.value.push(item.name);
      integrationProgressPlotChartSeries1.value.push(
        integrationProgressChartSeries1.value[countInter]
      );
      integrationProgressPlotChartSeries2.value.push(
        integrationProgressChartSeries2.value[countInter]
      );
    }
    countInter++;
  });
  loadIntegrationPeriodsChart();
};

const loadIntegrationPeriodsChart = () => {
  if (integrationProgressPlotChartCat.value[0] == "") {
    integrationProgressPlotChartCat.value[0] = "Your group";
  }
  let yAxisTitle = input.value.type + " integration";
  Highcharts.chart("container2x", {
    chart: {
      type: "column",
      height: "530px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: integrationProgressPlotChartCat.value,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == yourGroupName.value)
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
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
            //"viewData",
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
          integrationProgressPlotChartCat.value[this.x] +
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
    legend: {
      align: "right",
      verticalAlign: "top",
      y: 50,
      layout: "vertical",
      floating: true,
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
        name: integrationProgressYearStart.value,
        data: integrationProgressPlotChartSeries1.value,
        color: "#2381B8",
      },
      {
        name: integrationProgressYearEnd.value,
        data: integrationProgressPlotChartSeries2.value,
        color: "#13405A",
      },
    ],
  });
};

const integrationProgressToggleGroupOnOff = () => {
  integrationProgressChartGroupVisible.value =
    !integrationProgressChartGroupVisible.value;
  integrationProgressMergeData();
};

const integrationProgressToggleOnOff = (index) => {
  intergrationProgressList.value[index]["visible"] =
    !intergrationProgressList.value[index]["visible"];
  integrationProgressMergeData();
};

const capitalize = (s) => {
  if (s.length == 0) {
    return "";
  } else {
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }
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
</style>
