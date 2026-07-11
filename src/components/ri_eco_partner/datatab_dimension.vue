<template>
  <div class="bgGrey font-16 q-pt-md" align="center">
    <div style="width: 90%; margin: auto">
      <div class="q-py-xl row items-center">
        <div class="font-12" align="left">
          <div class="font-30"><b>Dimension</b></div>
          <div class="">Select a dimension to see detail</div>
        </div>
        <div class="" style="width: 450px">
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
            class="text-grey"
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
              align="center"
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
                  <div class="font-24 q-py-md">
                    Which partner economies are performing best in
                    {{ selected.toLowerCase() }} integration?
                  </div>
                  <div>
                    From top to bottom in descending order of % score
                    progression between periods.
                  </div>
                </div>
                <div class="economyOverflow">
                  <div id="z"></div>
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
                    Which indicators are driving
                    {{
                      input.reporting.length > 1
                        ? "the reporting economies"
                        : input.reporting[0].label
                    }}
                    {{ selected.toLowerCase() }} integration score with
                    {{
                      input.partner.length > 1
                        ? "this group of partner economies"
                        : input.partner[0].label
                    }}?
                  </div>
                  <p class="font-16">
                    From {{ firstHalfPeriod }} to {{ secondHalfPeriod }}, your
                    reporter group's integration with your partner group in
                    {{ selected }} dimension
                    {{
                      indexChart.series[1].data[0] -
                        indexChart.series[0].data[0] >
                      0
                        ? "increased"
                        : "decreased"
                    }}
                    by
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
                    ({{
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
                    }}) progressed the least.
                  </p>
                  <span class="font-14">
                    Click on any indicator to breakdown performance by
                    individual economies.
                  </span>
                </div>
                <div class="economyOverflow2">
                  <div id="chartIndex"></div>
                  <div v-if="indexNoDataText != ''" class="q-py-md">
                    {{ indexNoDataText }}
                  </div>
                  <table-tab :dimension="dimensionIndex" :type="input.type" />
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
                        combinations.<br /><br />

                        E.g., take any indicator A, and a group where X<br />
                        is the reporting economy and Y and Z are the<br />
                        partner economies. For indicator A, there are 2<br />
                        possible unique pairs: (X-Y), (X-Z). If data is<br />
                        available for 1 of these pairs, data availability<br />
                        for indicator A will be set at 50% (1/2)
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
                    How much is each indicator contributing to
                    {{ yourGroupName }}'s {{ selected.toLowerCase() }} score?
                    <q-icon name="fas fa-question-circle" size="24px">
                      <q-tooltip>
                        Within a dimension and a particular pair, all<br />
                        available indicators are weighted equally.<br />
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
                    }}%) was the most prominent indicator in the
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
                    }}%) were the least.
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
    <!-- chart indicator  -->
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
import { ref, watch } from "vue";
import { LocalStorage } from "quasar";
import { serverSetup } from "../../pages/server";
import tableTab from "../ri_tableintab.vue";
import axios from "axios";
const { serverData } = serverSetup();
const props = defineProps({
  dataSend: Object,
});

const input = ref({
  disaggregation: "dimension",
  partner: [],
  reporting: [],
  type: "Sustainable",
});

const data = ref([]);

const report = ref([]);
const showAvail = ref(true);
const selected = ref("");
const tab = ref("economy");
const colorSelected = ref("");
const yourGroupName = ref("Your group");
const dimensionOptions = ref([]);
const allDimensionData = ref([]);
const firstHalfPeriod = ref("");
const secondHalfPeriod = ref("");

// Other variables
const dimensionIndex = ref(1);
const countAllPair = ref(0);
const weightDataTemp = ref([]);
const showIndicatorChart = ref(false);
const indicatorName = ref("");
const indicatorIndex = ref(0);
const indicatorStr = ref([]);

// Chart data
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

const indexNoDataText = ref("");
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

watch(
  () => props.dataSend,
  (newValue) => {
    if (newValue) {
      data.value = props.dataSend.data;
      input.value = props.dataSend.input;
      report.value = props.dataSend.report;
      checkYourName();
    }
  }
);

const checkYourName = () => {
  yourGroupName.value = input.value.reporting.label;
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
  let dataInput = {
    type: input.value.type,
  };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(dataInput));

  allDimensionData.value = res.data;
  allDimensionData.value.forEach((x) => {
    dimensionOptions.value.push(x.name);
  });
  countAllPair.value = 0;
  report.value.forEach((report) => {
    data.value.forEach((partner) => {
      if (report.iso != partner.iso) {
        countAllPair.value++;
      }
    });
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
      marginBottom: 30,
      height: 380,
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
        cursor: "pointer",
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

  let diffYear = Math.floor((input.value.year.max - input.value.year.min) / 2);
  let indexI = 0;
  for (let i = 0; i < indicatorStr.value.length; i++) {
    if (indicatorName.value == indicatorStr.value[i]) {
      indexI = i + 1;
    }
  }
  let sendData = {
    input: input.value,
    partnerMap: data.value.map((x) => x.iso),
    reportMap: report.value.map((x) => x.iso),
    dimension: dimensionIndex.value,
    index: indexI,
  };

  let url = serverData.value + "ri/econ_indicatorchart_datatab_dimension.php";
  let res = await axios.post(url, JSON.stringify(sendData));
  let tempTable = res.data;
  let result = [];
  indicatorChart.value.series[0].name = firstHalfPeriod.value;
  indicatorChart.value.series[1].name = secondHalfPeriod.value;

  for (let j = 0; j < sendData.partnerMap.length; j++) {
    let eachCountry = tempTable.filter(
      (country) =>
        country.reporter == sendData.partnerMap[j] ||
        country.partner == sendData.partnerMap[j]
    );

    if (eachCountry.length != 0) {
      let firstHalf = eachCountry.filter((x) => x.year <= yearMin + diffYear);
      let secondHalf = eachCountry.filter((x) => x.year >= yearMax - diffYear);
      let firstScore =
        firstHalf.reduce((a, b) => a + Number(b.score), 0) / firstHalf.length;
      let secondScore =
        secondHalf.reduce((a, b) => a + Number(b.score), 0) / secondHalf.length;
      let tempPush = {
        country: data.value[j].label,
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
      valueSuffix: " %",
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
            //"viewData",
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
        // align: "left",
        // x: -220,
        align: "center",
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: "",
      },
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
            //"viewData",
          ],
        },
      },
    },
    legend: { enabled: false },
    credits: { enabled: false },
    series: weightChart.value.series,
  });
};

const goToURL = () => {
  let dataGet = LocalStorage.getItem("dataAvail");
  let id = dataGet.key;
  window.open("#/ridataavail/" + id).focus;
};
const loadEconomyChart = () => {
  Highcharts.chart("z", {
    chart: {
      type: "bar",
      backgroundColor: "#EDEDED",
      marginLeft: 180,
      height: data.value.length > 9 ? data.value.length * 60 : 540,
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
          // format: "{y} %",
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
            //"viewData",
          ],
        },
      },
    },
    credits: { enabled: false },
    series: economyChart.value.series,
  });
};

const setIndexChart = async () => {
  indicatorStr.value =
    allDimensionData.value[dimensionIndex.value - 1].indicator;
  let dataTemp = {
    input: input.value,
    partnerMap: data.value.map((x) => x.iso),
    reportMap: report.value.map((x) => x.iso),
    index: dimensionIndex.value,
    indicator: indicatorStr.value,
  };
  let url = serverData.value + "ri/econ_index_dimensiontab.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  let resultNoData = result
    .filter((x) => x.data[0] == 0 && x.data[0] == 0)
    .map((x) => x.catName);
  indexNoDataText.value = "";
  if (resultNoData.length > 0) {
    indexNoDataText.value = "No available for ";
    for (let iLoop = 0; iLoop < resultNoData.length - 1; iLoop++) {
      indexNoDataText.value += resultNoData[iLoop];
    }
    if (resultNoData.length == 1) {
      indexNoDataText.value += resultNoData[0];
    } else {
      indexNoDataText.value += "and " + resultNoData[0];
    }
  }
  result = result.filter((x) => x.data[0] != 0 || x.data[0] != 0);
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
    partnerMap: data.value.map((x) => x.iso),
    reportMap: report.value.map((x) => x.iso),
    dimension: dimensionIndex.value,
  };
  let url = serverData.value + "ri/econ_data_dimensiontab.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  let tableTemp = [];
  let totalIndex = indicatorStr.value.length;
  weightDataTemp.value = [];
  for (let i = 1; i <= totalIndex; i++) {
    let indexCount =
      (result.filter((x) => Number(x.indicator) == i).length /
        countAllPair.value) *
      100;

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
  weightChart.value.series[0].data = weightDataTemp.value.map(
    (x) => Number(x.data) * 100
  );

  weightChart.value.equalWeight = (
    100 / weightChart.value.series[0].data.length
  ).toFixed(2);
};

const setEconomyChart = async () => {
  let dataTemp = {
    input: input.value,
    partner: data.value,
    partnerMap: data.value.map((x) => x.iso),
    reportMap: report.value.map((x) => x.iso),
    dimension: selected.value,
    index: dimensionIndex.value,
  };
  let url = serverData.value + "ri/econ_economychart_datatab_dimension.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  result.sort((a, b) => b.dif - a.dif);

  economyChart.value.series[0].data = [];
  economyChart.value.series[1].data = [];
  // @ Youy group
  economyChart.value.series[0].name = firstHalfPeriod.value;
  economyChart.value.series[1].name = secondHalfPeriod.value;

  for (let k = 0; k < result.length; k++) {
    economyChart.value.series[0].data[k] = Number(
      Number(result[k].data[0]).toFixed(4)
    );
    economyChart.value.series[1].data[k] = Number(
      Number(result[k].data[1]).toFixed(4)
    );
    economyChart.value.catName[k] = result[k].country;
  }
};
</script>

<style lang="scss" scoped>
.economyOverflow2 {
  width: 100%;
  height: 520px;
  overflow-y: auto;
}
.bgGrey {
  background: #ededed;
  height: 980px;
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
////////////
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
/////
#chartIndicator {
  min-height: 580px;
  width: 100%;
}
#chartEconomy {
  min-height: 540px;
  width: 100%;
}
#chartIndex {
  height: 420px;
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
</style>
