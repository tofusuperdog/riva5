<template>
  <div class="bgGrey font-16 q-pt-md" align="center">
    <div class="" style="width: 90%; margin: auto">
      <div class="q-py-xl row items-center">
        <div class="font-12" align="left">
          <div class="font-30"><b>Dimension</b></div>
          <div class="">Select a specific dimension</div>
        </div>
        <div class="" style="width: 550px">
          <q-select
            class="inputSelectClass"
            dark
            dense
            v-model="selected"
            :style="{ background: colorSelected }"
            :options="dimensionOptions"
            @update:model-value="changeDimension()"
          />
        </div>
      </div>
      <div class="q-pt-sm">
        <q-card flat class="cardStyle">
          <q-tabs
            v-model="tab"
            class="textGrey"
            active-color="secondary"
            indicator-color="secondary"
            align="justify"
            narrow-indicator
            no-caps
            @click="changeTab()"
          >
            <q-tab name="economy" label="By economy" />
            <q-tab name="index" label="By indicator (and economy)" />
            <q-tab name="data" label="Indicator data availability" />
            <q-tab name="weight" label="Indicator weights in dimension" />

            <div
              class="font-12 cursor-pointer q-px-md"
              align="right"
              @click="goToURL()"
            >
              <u>Click here to see this group’s availability matrix</u>
            </div>
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated style="background: #ededed">
            <q-tab-panel name="economy">
              <div v-if="showAvail">
                <div class="q-px-xl" align="left">
                  <div class="font-24 q-pt-md">
                    Which economies are performing best in
                    {{ selected.toLowerCase() }} integration?
                  </div>
                  <div>
                    This graph is sorted by countries' indicator progression
                    between {{ firstHalfPeriod }} and {{ secondHalfPeriod }}.
                  </div>
                </div>
                <div class="economyOverflow">
                  <div id="chartEconomy"></div>
                </div>
              </div>
              <div v-else>
                <div class="noDataAvail">No data available</div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="index">
              <div v-if="showAvail">
                <div class="q-px-xl" align="left">
                  <div class="font-24">
                    Which indicators are driving the group’s
                    {{ selected.toLowerCase() }} integration score?
                  </div>
                  <p class="font-16">
                    From {{ firstHalfPeriod }} to {{ secondHalfPeriod }},
                    integration in the {{ selected.toLowerCase() }} dimension
                    for your group
                    {{
                      indexChart.series[1].data[0] -
                        indexChart.series[0].data[0] >
                      0
                        ? "increased"
                        : "decreased"
                    }}
                    {{
                      Math.abs(
                        indexChart.series[1].data[0] -
                          indexChart.series[0].data[0]
                      ).toFixed(2)
                    }}
                    from
                    {{ Number(indexChart.series[0].data[0]).toFixed(2) }} to
                    {{ Number(indexChart.series[1].data[0]).toFixed(2) }}.
                    {{ indexChart.catName[0] }} (
                    {{
                      indexChart.series[1].data[0] -
                        indexChart.series[0].data[0] >
                      0
                        ? "+"
                        : "-"
                    }}{{
                      Math.abs(
                        indexChart.series[1].data[0] -
                          indexChart.series[0].data[0]
                      ).toFixed(2)
                    }}
                    ) progressed the most.
                    {{
                      indexChart.catName[indexChart.series[0].data.length - 1]
                    }}
                    (
                    {{
                      indexChart.catName[indexChart.series[1].data.length - 1] -
                        indexChart.catName[
                          indexChart.series[0].data.length - 1
                        ] >
                      0
                        ? "+"
                        : "-"
                    }}{{
                      Math.abs(
                        indexChart.series[1].data[
                          indexChart.series[1].data.length - 1
                        ] -
                          indexChart.series[0].data[
                            indexChart.series[0].data.length - 1
                          ]
                      ).toFixed(2)
                    }}
                    ) progressed the least.
                  </p>
                  <span class="font-14">
                    Click on any indicator to breakdown performance by
                    individual economies.
                  </span>
                </div>
                <div class="economyOverflow2">
                  <div id="chartIndex"></div>
                  <table-tab
                    :dimension="dimensionIndex"
                    :type="input.type"
                    style="position: relative; top: -40px; margin-bottom: -30px"
                  />
                </div>
              </div>
              <div v-else>
                <div class="noDataAvail">No data available</div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="data">
              <div v-if="showAvail">
                <div class="q-px-xl" align="left">
                  <div class="font-24">
                    How much data is available for each indicator in
                    {{ selected.toLowerCase() }}?
                    <q-icon name="fas fa-question-circle" size="24px">
                      <q-tooltip>
                        Data availability for each indicator is calculated<br />
                        as the ratio between the number of pairs with<br />
                        available data and all the possible relevant pair<br />
                        combinations. The higher the data availability<br />
                        the more accurate the indicator score is.<br />
                        Concomitantly, the more prominent this<br />
                        indicator will be in driving dimension and<br />
                        overall integration scores.<br /><br />

                        E.g., take any indicator A and a 3 country group<br />
                        (X, Y and Z). For indicator A, there are 6 <br />
                        possible unique pairs: (X-Y), (X-Z), (Y-X), (Y-Z),<br />
                        (Z-X), (Z-Y). If data is available for 3 of these<br />
                        pairs, data availability for indicator A will be set<br />
                        at 50% (3/6)
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <p class="font-16">
                    {{ dataChart.catName[0] }} has the most data available ({{
                      Number(dataChart.series[0].data[0]).toFixed(2)
                    }}%), while
                    {{
                      dataChart.catNameLower[
                        dataChart.series[0].data.length - 1
                      ]
                    }}
                    has the least ({{
                      Number(
                        dataChart.series[0].data[
                          dataChart.series[0].data.length - 1
                        ]
                      ).toFixed(2)
                    }}%). <br />
                  </p>
                </div>
                <div id="chartData"></div>
              </div>
              <div v-else>
                <div class="noDataAvail">No data available</div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="weight">
              <div v-if="showAvail">
                <div class="q-px-xl" align="left">
                  <div class="font-24">
                    How much is each indicator contributing to this group's
                    {{ selected.toLowerCase() }} score?
                    <q-icon name="fas fa-question-circle" size="24px">
                      <q-tooltip>
                        Within a dimension and a particular pair,<br />
                        all available indicators are weighted equally.<br />
                        As such, indicator weights largely reflect data<br />
                        availability, albeit not perfectly. To learn more<br />
                        about indicator weights please visit our<br />
                        Technical note (upper-right corner).
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <p class="font-16">
                    {{ weightChart.catName[0] }} ({{
                      Number(weightChart.series[0].data[0]).toFixed(2)
                    }}) was the most prominent indicator in the
                    {{ selected.toLowerCase() }}
                    dimension, while
                    {{
                      weightChart.catNameLower[
                        weightChart.series[0].data.length - 1
                      ]
                    }}
                    ({{
                      Number(
                        weightChart.series[0].data[
                          weightChart.series[0].data.length - 1
                        ]
                      ).toFixed(2)
                    }}) were the least.
                  </p>
                </div>
                <div id="chartWeight"></div>
              </div>
              <div v-else>
                <div class="noDataAvail">No data available</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
    <div class="col-12" align="center">
      <div class="btnOutGreenLeft q-mt-lg" @click="linkToEco()">
        Explore integration by economy
      </div>
    </div>
    <div v-show="showIndicatorChart" class="fullscreen bgDrop">
      <div class="fixed-center cardIndicator q-pa-md">
        <div class="row items-center q-pb-none">
          <div
            class="inputSelectClass text-h6"
            :style="{ background: colorSelected }"
          >
            {{ selected }}
          </div>
          <q-space />
          <q-btn
            icon="close"
            size="lg"
            flat
            round
            dense
            @click="showIndicatorChart = false"
          />
        </div>
        <div class="q-py-md" align="left">
          <div class="font-24">{{ indicatorName }}</div>
          <div class="font-14">
            This graph is sorted by the different value between
            {{ firstHalfPeriod }} and {{ secondHalfPeriod }}.
          </div>
        </div>

        <div class="chartincard"><div id="chartIndicator"></div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server.js";
import tableTab from "../ri_tableintab.vue";
const { serverData } = serverSetup();
import axios from "axios";
import { LocalStorage } from "quasar";
import { useQuasar } from "quasar";

const props = defineProps({
  dataGet: {
    type: Object,
    require: true,
  },
});
const $q = useQuasar();
const emit = defineEmits(["go-to-eco"]);
const tab = ref("economy");

const input = ref({
  type: "",
  year: {
    min: 0,
    max: 0,
  },
});
const countryFullList = ref([]);
const yourGroupName = ref("");
const firstHalfPeriod = ref("");
const secondHalfPeriod = ref("");
const allDimensionData = ref([]);
const dimensionOptions = ref([]);
const selected = ref("");
const colorSelected = ref("");
const dimensionIndex = ref(0);

const indicatorStr = ref([]);
const indexChart = ref({
  catName: [],
  series: [
    {
      name: "",
      color: "#2381B8",
      data: [],
    },
    {
      name: "",
      color: "#13405A",
      data: [],
    },
  ],
});
const weightDataTemp = ref([]);
const dataChart = ref({
  catName: [],
  catNameLower: [],
  series: [
    {
      name: "data available",
      color: "#2381B8",
      data: [],
    },
  ],
});
const showAvail = ref(true);
const weightChart = ref({
  equalWeight: 1,
  catName: [],
  catNameLower: [],
  series: [
    {
      name: "weight",
      color: "#2381B8",
      data: [],
    },
  ],
});
const economyChart = ref({
  catName: [],
  series: [
    {
      name: "",
      color: "#2381B8",
      data: [],
    },
    {
      name: "",
      color: "#13405A",
      data: [],
    },
  ],
});

const indicatorName = ref("");
const indicatorChart = ref({
  catName: [],
  series: [
    {
      name: "",
      color: "#2381B8",
      data: [],
    },
    {
      name: "",
      color: "#13405A",
      data: [],
    },
  ],
});

const showIndicatorChart = ref(false);

onMounted(() => {
  input.value = props.dataGet.input;
  countryFullList.value = props.dataGet.countryFullList;
  checkYourName();
});

const linkToEco = () => {
  emit("go-to-eco");
};
const goToURL = () => {
  let dataGet = LocalStorage.getItem("dataAvail");
  let id = dataGet.key;
  window.open("#/ridataavail/" + id).focus;
};

const checkYourName = () => {
  if (input.value.partner.length == 1) {
    yourGroupName.value = input.value.partner[0].label;
  }
  loadData();
};
const loadData = async () => {
  if (input.value.year.min == input.value.year.max - 1) {
    firstHalfPeriod.value = input.value.year.min;
    secondHalfPeriod.value = input.value.year.max;
  } else {
    let diffYear = Math.floor(
      (input.value.year.max - input.value.year.min) / 2
    );
    firstHalfPeriod.value =
      input.value.year.min + "-" + (input.value.year.min + diffYear);
    secondHalfPeriod.value =
      input.value.year.max - diffYear + "-" + input.value.year.max;
  }
  allDimensionData.value = [];
  let data = {
    type: input.value.type,
  };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(data));
  allDimensionData.value = res.data;
  allDimensionData.value.forEach((x) => {
    dimensionOptions.value.push(x.name);
  });
  selected.value = dimensionOptions.value[0];
  changeDimension();
};

const changeDimension = () => {
  for (let i = 0; i < allDimensionData.value.length; i++) {
    if (selected.value == allDimensionData.value[i].name) {
      colorSelected.value = allDimensionData.value[i].color;
      dimensionIndex.value = i + 1;
    }
  }
  loadAllChart();
};

const loadAllChart = async () => {
  await setIndexChart();
  await setDataChart();
  await setWeightChart();
  await setEconomyChart();

  changeTab();
};

const setIndexChart = async () => {
  indicatorStr.value =
    allDimensionData.value[dimensionIndex.value - 1].indicator;
  let dataTemp = {
    input: input.value,
    data: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    index: dimensionIndex.value,
    indicator: indicatorStr.value,
  };
  let url = serverData.value + "ri/intra_index_dimensiontab.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  result.sort((a, b) => b.dif - a.dif);
  indexChart.value.series[0].data = [];
  indexChart.value.series[1].data = [];
  indexChart.value.series[0].name = firstHalfPeriod.value;
  indexChart.value.series[1].name = secondHalfPeriod.value;
  for (let k = 0; k < result.length; k++) {
    indexChart.value.series[0].data[k] = result[k].data[0];
    indexChart.value.series[1].data[k] = result[k].data[1];
    indexChart.value.catName[k] = result[k].catName;
  }
};

const setDataChart = async () => {
  let dataTemp = {
    input: input.value,
    data: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    dimension: dimensionIndex.value,
  };

  let url = serverData.value + "ri/intra_data_dimensiontab.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  let tableTemp = [];
  let totalIndex = indicatorStr.value.length;
  weightDataTemp.value = [];

  for (let i = 1; i <= totalIndex; i++) {
    let indexCount =
      (result.filter((x) => Number(x.indicator) == i).length /
        (countryFullList.value.length * (countryFullList.value.length - 1))) *
      100;
    // console.log(indexCount);
    let tPush = {
      data: indexCount,
      catName: indicatorStr.value[i - 1],
    };
    tableTemp.push(tPush);

    let weightCount =
      result.filter((x) => Number(x.indicator) == i).length / result.length;
    let wPush = {
      data: weightCount,
      catName: indicatorStr.value[i - 1],
    };
    weightDataTemp.value.push(wPush);
  }

  tableTemp.sort((a, b) => b.data - a.data);
  // console.log(result);
  dataChart.value.catName = tableTemp.map((x) => x.catName);
  dataChart.value.catNameLower = tableTemp.map((x) => {
    return x.catName.charAt(0).toLowerCase() + x.catName.substring(1);
  });
  dataChart.value.series[0].data = tableTemp.map((x) => x.data);
  let checkAvailable = dataChart.value.series[0].data.filter((x) => x > 0);
  if (checkAvailable.length == 0) {
    showAvail.value = false;
  } else {
    showAvail.value = true;
  }
};

const setWeightChart = () => {
  weightDataTemp.value.sort((a, b) => b.data - a.data);
  weightChart.value.series[0].data = [];
  weightChart.value.catName = weightDataTemp.value.map((x) => x.catName);
  weightChart.value.catNameLower = weightDataTemp.value.map((x) => {
    return x.catName.charAt(0).toLowerCase() + x.catName.substring(1);
  });
  weightChart.value.series[0].data = weightDataTemp.value.map((x) => x.data);
  weightChart.value.equalWeight = (
    1 / weightChart.value.series[0].data.length
  ).toFixed(2);
};

const setEconomyChart = async () => {
  let dataTemp = {
    input: input.value,
    data: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    dimension: selected.value,
    index: dimensionIndex.value,
  };

  let url = serverData.value + "ri/intra_economychart_datatab_dimension.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  result.sort((a, b) => b.dif - a.dif);

  economyChart.value.series[0].data = [];
  economyChart.value.series[1].data = [];
  economyChart.value.series[0].name = firstHalfPeriod.value;
  economyChart.value.series[1].name = secondHalfPeriod.value;
  for (let k = 0; k < result.length; k++) {
    economyChart.value.series[0].data[k] = Number(
      Number(result[k].data[0]).toFixed(2)
    );
    economyChart.value.series[1].data[k] = Number(
      Number(result[k].data[1]).toFixed(2)
    );
    economyChart.value.catName[k] = result[k].country;
  }
};

const changeTab = () => {
  if (tab.value == "index") {
    loadIndexChart();
  } else if (tab.value == "data") {
    loadDataChart();
  } else if (tab.value == "weight") {
    loadWeightChart();
  } else {
    loadEconomyChart();
  }
};

const loadIndexChart = () => {
  Highcharts.chart("chartIndex", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 380,

      height: 400,
      events: {
        load: function () {
          var axis = this.xAxis[0];
          var ticks = axis.ticks;
          var points = this.series[0].points;
          points.forEach(function (point, i) {
            if (ticks[i]) {
              var label = ticks[i].label.element;
              label.onclick = function (ev) {
                indicatorName.value = ev.target.innerHTML.replace(
                  /<[^>]*>?/gm,
                  ""
                );
                setIndicatorChart();
              };
            }
          });
        },
      },
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: indexChart.value.catName,
      labels: {
        // align: "left",
        // x: -220,
        align: "center",
        style: {
          cursor: "pointer",
        },
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
        text: "",
      },
      gridLineWidth: 0,
      minorGridLineWidth: 0,
    },
    tooltip: {
      shared: true,
      formatter: function () {
        let points = this.points;
        let pointsLength = points.length;
        let tooltipMarkup = pointsLength
          ? '<span style="font-size: 14px"><b>' +
            points[0].key +
            "</b></span><br/>"
          : "";
        let difData = Number((this.points[1].y - this.points[0].y).toFixed(2));
        let percentDif;
        if (this.points[0].y != 0) {
          percentDif = Number(
            ((this.points[1].y - this.points[0].y) / this.points[0].y) * 100
          ).toFixed(2);
        } else {
          percentDif = "0.00";
        }
        let textDif = difData < 0 ? "decreased" : "increased";
        tooltipMarkup +=
          "Average index " +
          textDif +
          " by " +
          Math.abs(difData).toFixed(2) +
          " ( " +
          Math.abs(percentDif).toFixed(2) +
          "% )";

        return tooltipMarkup;
      },
    },
    plotOptions: {
      bar: {
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
          // format: "{y} %",
        },
      },
      series: {
        pointPadding: 0,
        borderWidth: 0,
        cursor: "pointer",
        events: {
          click: function (ev) {
            if (ev.point.category !== yourGroupName.value) {
              indicatorName.value = ev.point.category;
              setIndicatorChart();
            }
          },
          legendItemClick: function (e) {
            e.preventDefault();
          },
        },
      },
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      y: 50,
      layout: "vertical",
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
    // legend: { enabled: false },
    credits: { enabled: false },
    series: indexChart.value.series,
  });
};

const setIndicatorChart = async () => {
  let yearMin = input.value.year.min;
  let yearMax = input.value.year.max;
  // console.log(yearMin, yearMax);
  let diffYear = Math.floor((input.value.year.max - input.value.year.min) / 2);
  let indexI = 0;
  for (let i = 0; i < indicatorStr.value.length; i++) {
    if (indicatorName.value == indicatorStr.value[i]) {
      indexI = i + 1;
    }
  }

  let sendData = {
    inputData: input.value,
    data: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    dimension: dimensionIndex.value,
    index: indexI,
  };
  let url = serverData.value + "ri/intra_indicatorchart_datatab_dimension.php";
  let res = await axios.post(url, JSON.stringify(sendData));
  let tempTable = res.data;
  let result = [];
  indicatorChart.value.series[0].name = firstHalfPeriod.value;
  indicatorChart.value.series[1].name = secondHalfPeriod.value;
  for (let j = 0; j < sendData.countryMap.length; j++) {
    let eachCountry = tempTable.filter(
      (country) =>
        country.reporter == sendData.countryMap[j] ||
        country.partner == sendData.countryMap[j]
    );
    if (eachCountry.length != 0) {
      let firstHalf = eachCountry.filter((x) => x.year <= yearMin + diffYear);
      let secondHalf = eachCountry.filter((x) => x.year >= yearMax - diffYear);
      let firstScore =
        firstHalf.reduce((a, b) => a + Number(b.score), 0) / firstHalf.length;
      let secondScore =
        secondHalf.reduce((a, b) => a + Number(b.score), 0) / secondHalf.length;

      let tempPush = {
        country: countryFullList.value[j].label,
        data: [],
        dif: Number(secondScore - firstScore),
      };
      tempPush.data[0] = Number(firstScore);
      tempPush.data[1] = Number(secondScore);
      result.push(tempPush);
    }
  }
  result.sort((a, b) => b.dif - a.dif);
  for (let k in result) {
    indicatorChart.value.series[0].data[k] = result[k].data[0];
    indicatorChart.value.series[1].data[k] = result[k].data[1];
    indicatorChart.value.catName[k] = result[k].country;
  }
  loadIndicatorChart();
  showIndicatorChart.value = true;
};

const loadIndicatorChart = () => {
  Highcharts.chart("chartIndicator", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 160,
      height:
        indicatorChart.value.catName.length > 9
          ? indicatorChart.value.catName.length * 60
          : 580,
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: indicatorChart.value.catName,
      labels: {
        align: "right",
      },
    },
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: "",
      },
      gridLineWidth: 0,
      minorGridLineWidth: 0,
    },
    tooltip: {
      shared: true,
      formatter: function () {
        let points = this.points;
        let pointsLength = points.length;
        let tooltipMarkup = pointsLength
          ? '<span style="font-size: 14px"><b>' +
            points[0].key +
            "</b></span><br/>"
          : "";
        let difData = Number((this.points[1].y - this.points[0].y).toFixed(2));
        let percentDif = Number(
          ((this.points[1].y - this.points[0].y) / this.points[0].y) * 100
        ).toFixed(2);
        let textDif = difData < 0 ? "decreased" : "increased";
        tooltipMarkup +=
          "Average index " +
          textDif +
          " by " +
          Math.abs(difData).toFixed(2) +
          " ( " +
          Math.abs(percentDif).toFixed(2) +
          "% )";

        return tooltipMarkup;
      },
    },
    plotOptions: {
      bar: {
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
      series: {
        pointPadding: 0,
        borderWidth: 0,
        events: {
          legendItemClick: function (e) {
            e.preventDefault();
          },
        },
      },
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      y: 50,
      layout: "vertical",
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
    credits: { enabled: false },
    series: indicatorChart.value.series,
  });
};
const loadDataChart = () => {
  Highcharts.chart("chartData", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 230,
      marginRight: 50,
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: dataChart.value.catName,
      labels: {
        align: "center",
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: "",
      },
      labels: {
        format: "{value} %",
      },
      gridLineWidth: 0,
    },
    tooltip: {
      valueDecimals: 2,
      valueSuffix: "%",
    },
    plotOptions: {
      bar: {
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2) + "%";
          },
        },
      },
      series: {
        pointWidth: 50,
        pointPadding: 0,
        borderWidth: 0,
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
    legend: { enabled: false },
    credits: { enabled: false },
    series: dataChart.value.series,
  });
};

const loadWeightChart = () => {
  Highcharts.chart("chartWeight", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 230,
      marginRight: 50,
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: weightChart.value.catName,
      labels: {
        align: "center",
      },
    },
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: "",
      },
      labels: {},
      gridLineWidth: 0,
      plotLines: [
        {
          color: "#FF0000",
          dashStyle: "dash",
          zIndex: 5,
          width: 2,
          value: weightChart.value.equalWeight,
          label: {
            text: "Equal weighting: " + weightChart.value.equalWeight,
            rotation: 360,
          },
        },
      ],
    },
    tooltip: {
      valueDecimals: 2,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
      series: {
        pointWidth: 50,
        pointPadding: 0,
        borderWidth: 0,
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
    legend: { enabled: false },
    credits: { enabled: false },
    series: weightChart.value.series,
  });
};

const loadEconomyChart = () => {
  Highcharts.chart("chartEconomy", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 180,
      height:
        countryFullList.value.length > 9
          ? countryFullList.value.length * 60
          : 540,
    },

    title: {
      text: "",
    },
    xAxis: {
      categories: economyChart.value.catName,
      labels: {
        align: "right",

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
        text: "",
      },
      gridLineWidth: 0,
      minorGridLineWidth: 0,
    },
    tooltip: {
      shared: true,
      formatter: function () {
        // console.log(this);
        let points = this.points;
        let pointsLength = points.length;
        let tooltipMarkup = pointsLength
          ? '<span style="font-size: 14px"><b>' +
            points[0].key +
            "</b></span><br/>"
          : "";

        let difData = Number((this.points[1].y - this.points[0].y).toFixed(2));
        let percentDif;
        if (this.points[0].y != 0) {
          percentDif = Number(
            ((this.points[1].y - this.points[0].y) / this.points[0].y) * 100
          ).toFixed(2);
        } else {
          percentDif = "0.00";
        }
        let textDif = difData < 0 ? "decreased" : "increased";
        tooltipMarkup +=
          "Average index " +
          textDif +
          " by " +
          Math.abs(difData).toFixed(2) +
          " ( " +
          Math.abs(percentDif).toFixed(2) +
          "% )";

        return tooltipMarkup;
      },
    },
    plotOptions: {
      bar: {
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
        },
      },
      series: {
        pointPadding: 0,
        borderWidth: 0,
        events: {
          legendItemClick: function (e) {
            e.preventDefault();
          },
        },
      },
    },
    legend: {
      align: "right",
      y: 50,
      verticalAlign: "top",
      layout: "vertical",
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
    credits: { enabled: false },
    series: economyChart.value.series,
  });
};
</script>

<style lang="scss" scoped>
.bgGrey {
  background: #ededed;
  height: 1060px;
}
.textGrey {
  color: #757575;
}
.inputSelectClass {
  background: #2d9687;
  padding-left: 14px;
  width: 400px;
  color: white;
  height: 40px;
  line-height: 40px;
  font-size: 24px;
}
.cardStyle {
  background: #ededed;
  border: 1px solid #757575;
  height: 750px;
}
//////////
.cardIndicator {
  max-width: 1200px;
  max-height: 800px;
  width: 1200px;
  height: 750px;
  background: #f7f7f7;
  z-index: 999999;
}
.chartincard {
  width: 100%;
  height: 580px;
  background: #c4c4c4;
  overflow-y: auto;
}
.bgDrop {
  background-color: rgba($color: #000000, $alpha: 0.6);
}
.economyOverflow {
  width: 100%;
  height: 540px;
  overflow-y: auto;
}
.economyOverflow2 {
  width: 100%;
  height: 520px;
  overflow-y: auto;
}
////
#chartIndicator {
  min-height: 580px;
  width: 100%;
}
#chartEconomy {
  min-height: 540px;
  width: 100%;
}
#chartIndex {
  height: 460px;
  width: 100%;
}
#chartData,
#chartWeight {
  height: 510px;
  width: 100%;
}
.noDataAvail {
  font-size: 32px;
  padding-top: 250px;
}

.btnOutGreen {
  cursor: pointer;
  width: 340px;
  height: 60px;
  line-height: 25px;
  border: 3px solid #2d9687;
  border-radius: 5px;
}
.btnOutGreenLeft {
  cursor: pointer;
  width: 340px;
  height: 60px;
  line-height: 55px;
  border: 3px solid #2d9687;
  border-radius: 5px;
}

.fontSubBtn {
  font-size: 10px;
}
.font-30 {
  font-size: 30px;
}
</style>
