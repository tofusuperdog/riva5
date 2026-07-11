<template>
  <div class="bgGrey font-16 q-pt-md" align="center">
    <div style="width: 90%; margin: auto">
      <div class="row items-center">
        <div align="left">
          <div class="font-30"><b>Partner economy</b></div>
          <div class="font-12">Select a partner economy</div>
        </div>
        <div class="" style="width: 600px">
          <q-select
            class="inputSelectClass"
            dark
            dense
            v-model="selected"
            :options="countryOptions"
            @update:model-value="setDimensionChart()"
          />
        </div>
      </div>
      <div class="font-24" align="left">
        How is {{ yourGroupName }} integrated with {{ selected.label }} across
        different dimensions?
      </div>
      <!-- spider web chart -->
      <div v-show="dimShow.length > 2" id="spiderWeb"></div>
      <div
        v-show="dimShow.length <= 2"
        class="q-py-md"
        id="dimensionChart"
      ></div>
      <div class="q-pb-xl" v-if="noteForNoData != ''">{{ noteForNoData }}</div>
      <!-- ---------  -->
      <div class="font-24" align="left">
        How is {{ yourGroupName }} integrated with {{ selected.label }} on each
        dimension across different indicators?
      </div>
      <div class="row justify-between q-pt-md">
        <div
          class="non-selectable"
          v-for="(item, index) in dimShow"
          :key="index"
          style="width: 14.285%; height: 60px"
        >
          <div
            v-if="index == selectDimension"
            class="listDimension isPick"
            align="center"
            :style="{ background: dimShow[index].color }"
          >
            {{ item.name }}
          </div>
          <div
            v-else
            class="listDimension"
            align="center"
            @click="pickDimension(index)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div class="showBar q-pt-md" align="center">
        <div id="barChart"></div>
        <div class="q-pb-md font-14">{{ noIndicatorAvail }}</div>
        <table-tab :dimension="dimPick[selectDimension]" :type="input.type" />
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
const data = ref([]);
const input = ref({
  partner: [{ disable: false, label: "", value: "" }],
  reporting: [{ disable: false, label: "", value: "" }],
  year: {
    min: 2000,
    max: 2001,
  },
  type: "Sustainable",
  disaggregation: "dimension",
  resultBy: "Reporter",
});
const report = ref([]);
const noIndicatorAvail = ref("");
const noteForNoData = ref("");
const selected = ref({});
const dimPick = ref([]);
const tempDimChart = ref([]);
const yourGroupName = ref("the reporting group");
const firstHalfLastPeriod = ref(0);
const secondHalfStartPeriod = ref(0);
const firstHalfPeriod = ref("");
const secondHalfPeriod = ref("");
const countryOptions = ref([]);
const selectDimension = ref(0);
const indicatorData = ref([]); // all dimension picked
const dimShow = ref([]);

const dimensionChart = ref({
  catName: [], // 7 types of dimension
  series: [
    {
      name: "",
      data: [],
      color: "#2381B8",
      type: "line",
      dashStyle: "Dash",
    },
    {
      name: "",
      data: [],
      color: "#13405A",
    },
  ],
});

const barChart = ref({
  catName: [], // xAxis of bar chart
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

watch(
  () => props.dataSend,
  async (newValue) => {
    if (newValue) {
      data.value = props.dataSend.data;
      input.value = props.dataSend.input;
      report.value = props.dataSend.report;
      loadData();
    }
  }
);

const loadData = async () => {
  countryOptions.value = data.value;

  let dim = [];
  for (let i = 0; i < input.value.dimensionPicked.length; i++) {
    if (input.value.dimensionPicked[i].picked) dim.push(i + 1);
  }
  dimPick.value = dim;
  // check reporting group
  if (input.value.reporting.length == 1) {
    yourGroupName.value = input.value.reporting[0].label;
  }
  //set name series
  if (input.value.year.min == input.value.year.max - 1) {
    firstHalfPeriod.value = input.value.year.min;
    secondHalfPeriod.value = input.value.year.max;
    firstHalfLastPeriod.value = input.value.year.min;
    secondHalfStartPeriod.value = input.value.year.max;
  } else {
    let diffYear = Math.floor(
      (input.value.year.max - input.value.year.min) / 2
    );
    firstHalfPeriod.value =
      input.value.year.min + "-" + (input.value.year.min + diffYear);
    secondHalfPeriod.value =
      input.value.year.max - diffYear + "-" + input.value.year.max;
    firstHalfLastPeriod.value = input.value.year.min + diffYear;
    secondHalfStartPeriod.value = input.value.year.max - diffYear;
  }
  // set indicator
  indicatorData.value = [];
  let i = 1;
  input.value.dimensionPicked.forEach((x) => {
    let temp = x;
    temp.index = i++;

    if (x.picked == true) indicatorData.value.push(temp);
  });

  let datax = {
    input: input.value,
    countryPartnerList: data.value,
    countryReportList: report.value,
    reportMap: report.value.map((x) => x.iso),
    partnerMap: data.value.map((x) => x.iso),
    dimMap: dim,
  };
  let dimPass = dim.length / 2;
  let urlx = serverData.value + "ri/build_linechart_bycountry.php";
  let resx = await axios.post(urlx, JSON.stringify(datax));

  let tempLastYear = [];
  datax.reportMap.forEach((reporter) => {
    let resultReportList = resx.data.filter(
      (result) => result.reporter == reporter
    );

    datax.partnerMap.forEach((partner) => {
      let resultReportPartnerList = resultReportList.filter(
        (result2) => result2.partner == partner
      );
      for (
        let i = Number(datax.input.year.max);
        i <= Number(datax.input.year.max);
        i++
      ) {
        if (resultReportPartnerList.length != 0) {
          let resultByYear = resultReportPartnerList.filter(
            (resultYear) => resultYear.year == i
          );
          if (resultByYear.length >= dimPass) {
            let avgScore =
              resultByYear.reduce((sum, a) => sum + Number(a.score), 0) /
              resultByYear.length;
            let dataTemp3 = {
              reporter: reporter,
              partner: partner,
              score: avgScore,
              year: i,
            };
            tempLastYear.push(dataTemp3);
          }
        } else {
        }
      }
    });
  });

  let dataLastYear = [];
  datax.countryPartnerList.forEach((partner) => {
    let data4 = {
      name: partner.label,
      data: [],
      lastValue: 0,
    };
    for (
      let cYear = Number(datax.input.year.min);
      cYear <= Number(datax.input.year.max);
      cYear++
    ) {
      let resultAvgPartner = tempLastYear.filter((result2) => {
        return result2.partner == partner.iso && Number(result2.year) == cYear;
      });

      let finalAvgScore = Number(
        resultAvgPartner.reduce((sum, a) => sum + a.score, 0) /
          resultAvgPartner.length
      );

      data4.data.push(Number(finalAvgScore.toFixed(4)));
    }
    data4.lastValue = data4.data[data4.data.length - 1];
    dataLastYear.push(data4);
  });
  let tempData = dataLastYear;
  tempData.sort((a, b) => b.lastValue - a.lastValue);
  let selectedTemp = countryOptions.value.filter(
    (x) => x.label == tempData[0].name
  );

  selected.value = selectedTemp[0];

  setDimensionChart();
};
const setDimensionChart = async () => {
  let dataTemp = {
    input: input.value,
    reporter: report.value.map((x) => x.iso),
    dim: dimPick.value,
    selected: selected.value.iso,
  };
  let url = serverData.value + "ri/build_spider_chart.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;
  dimShow.value = [];
  let chartTemp = [];
  for (let i = 0; i < dimPick.value.length; i++) {
    let tempData = result.filter((x) => x.dimension == dimPick.value[i]);
    if (tempData.length != 0) {
      let temp1 = tempData.filter((y) => y.year <= firstHalfLastPeriod.value);
      let avg1 = temp1.reduce((a, b) => a + Number(b.score), 0) / temp1.length;
      let temp2 = tempData.filter((y) => y.year >= secondHalfStartPeriod.value);
      let avg2 = temp2.reduce((a, b) => a + Number(b.score), 0) / temp2.length;
      dimShow.value.push(indicatorData.value[i]);
      let tempPush = {
        data: [avg1, avg2],
        catName: indicatorData.value[i].name,
      };
      chartTemp.push(tempPush);
    }
  }

  dimensionChart.value.catName = [];
  dimensionChart.value.series[0].data = [];
  dimensionChart.value.series[1].data = [];
  for (let i in chartTemp) {
    dimensionChart.value.catName[i] = chartTemp[i].catName;
    dimensionChart.value.series[0].data[i] = Number(
      chartTemp[i].data[0].toFixed(2)
    );
    dimensionChart.value.series[1].data[i] = Number(
      chartTemp[i].data[1].toFixed(2)
    );
  }
  if (dimShow.value.length > 2) {
    loadSpiderChart();
  } else {
    loadDimensionChart();
  }
  pickDimension(0);
  noteForNoData.value = "";
  let dataIndexGet = dimShow.value.map((x) => x.index);

  let dataIndexLack = dimPick.value.filter((x) => !dataIndexGet.includes(x));
  if (dataIndexLack.length > 0) {
    dataIndexLack.forEach((item, index) => {
      if (index == 0) {
        noteForNoData.value =
          "No data available for " +
          indicatorData.value[dataIndexLack[0] - 1].name.toLowerCase();
      } else if (index == dataIndexLack.length - 1) {
        noteForNoData.value +=
          " and " + indicatorData.value[item].name.toLowerCase();
      } else {
        noteForNoData.value +=
          ", " + indicatorData.value[item].name.toLowerCase();
      }
    });
    if (dataIndexLack.length == 1) {
      noteForNoData.value += " dimension";
    } else {
      noteForNoData.value += " dimensions";
    }
  }
};

const loadSpiderChart = () => {
  dimensionChart.value.series[0].name =
    input.value.year.min + "-" + firstHalfLastPeriod.value;
  dimensionChart.value.series[1].name =
    secondHalfStartPeriod.value + "-" + input.value.year.max;
  Highcharts.chart("spiderWeb", {
    chart: {
      polar: true,
      backgroundColor: "#EDEDED",
    },
    title: {
      text: "",
    },
    pane: {
      // size: "80%",
    },
    xAxis: {
      categories: dimensionChart.value.catName,
      tickmarkPlacement: "on",
      lineWidth: 0,
      gridLineColor: "#C4C4C4",
    },

    yAxis: {
      gridLineInterpolation: "polygon",
      lineWidth: 0,
      min: 0,
      max: 1,
      gridLineColor: "#C4C4C4",
    },

    tooltip: {
      shared: true,
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      layout: "vertical",
      y: 50,
    },

    series: dimensionChart.value.series,
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 600,
          },
          chartOptions: {
            legend: {
              align: "center",
              verticalAlign: "bottom",
              layout: "horizontal",
            },
            pane: {
              size: "70%",
            },
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
    credits: { enabled: false },
  });
};

const loadDimensionChart = () => {
  dimensionChart.value.series[0] = {
    name: firstHalfPeriod.value,
    color: "#2381B8",
    data: dimensionChart.value.series[0].data,
  };
  dimensionChart.value.series[1] = {
    name: secondHalfPeriod.value,
    color: "#13405A",
    data: dimensionChart.value.series[1].data,
  };
  Highcharts.chart("dimensionChart", {
    chart: {
      type: "column",
      backgroundColor: "#EDEDED",
      marginRight: 200,
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: dimensionChart.value.catName,
    },
    yAxis: {
      min: 0,
      title: {
        text: "",
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "top",
      floating: true,
      borderWidth: 0,
      y: 50,
    },
    series: dimensionChart.value.series,
    credits: { enabled: false },
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
  });
};

const pickDimension = (x) => {
  selectDimension.value = x;
  setBarChart();
};

const setBarChart = async () => {
  let dim = dimShow.value[selectDimension.value].index;
  let dataTemp = {
    input: input.value,
    reporter: report.value.map((x) => x.iso),
    dim: dim,
    selected: selected.value.iso,
  };

  let url2 = serverData.value + "ri/build_spider_indicator.php";
  let res2 = await axios.post(url2, JSON.stringify(dataTemp));
  let allIndicatorData = res2.data;
  let tempChart = [];
  for (
    let i = 0;
    i < dimShow.value[selectDimension.value].indicator.length;
    i++
  ) {
    let EachIndicator = allIndicatorData.filter((x) => x.indicator == i + 1);
    let avg1 = 0,
      avg2 = 0;
    if (EachIndicator.length > 0) {
      let data1 = EachIndicator.filter(
        (y) => y.year <= firstHalfLastPeriod.value
      );
      let data2 = EachIndicator.filter(
        (y) => y.year >= secondHalfStartPeriod.value
      );
      avg1 = data1.reduce((a, b) => a + Number(b.score), 0) / data1.length;
      avg2 = data2.reduce((a, b) => a + Number(b.score), 0) / data2.length;
    }
    let tempP = {
      catName: dimShow.value[selectDimension.value].indicator[i],
      data: [avg1, avg2],
    };
    if (EachIndicator.length != 0) {
      tempChart.push(tempP);
    }
  }
  barChart.value.catName = tempChart.map((x) => x.catName);
  barChart.value.series[0].data = tempChart.map((x) =>
    Number(x.data[0].toFixed(2))
  );
  barChart.value.series[1].data = tempChart.map((x) =>
    Number(x.data[1].toFixed(2))
  );
  barChart.value.series[0].name = firstHalfPeriod.value;
  barChart.value.series[1].name = secondHalfPeriod.value;

  loadBarChart();
  noIndicatorAvail.value = "";
  let indicatorFull = indicatorData.value[selectDimension.value].indicator;
  let dataIndexLack = indicatorFull.filter(
    (x) => !barChart.value.catName.includes(x)
  );
  if (dataIndexLack.length > 0) {
    dataIndexLack.forEach((item, index) => {
      if (index == 0) {
        noIndicatorAvail.value = "No data available for " + dataIndexLack[0];
      } else if (index == dataIndexLack.length - 1) {
        noIndicatorAvail.value += " and " + dataIndexLack[index];
      } else {
        noIndicatorAvail.value += ", " + dataIndexLack[index];
      }
    });
    if (dataIndexLack.length == 1) {
      noIndicatorAvail.value += " indicator";
    } else {
      noIndicatorAvail.value += " indicators";
    }
  }
};

const loadBarChart = () => {
  Highcharts.chart("barChart", {
    chart: {
      type: "bar",
      backgroundColor: "#DAE7E5",
      marginLeft: 220,
    },

    title: {
      text: "",
    },
    xAxis: {
      labels: {
        align: "center",
      },
      categories: barChart.value.catName,
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
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          align: "right",
          enabled: true,
          borderWidth: 0,
          inside: true,
          // format: "{y} %",
        },
      },
      series: {
        pointPadding: 0,
        borderWidth: 0,
      },
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      layout: "vertical",
      y: 50,
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
    series: barChart.value.series,
  });
};
</script>

<style lang="scss" scoped>
.bgGrey {
  width: 100%;
  background: #ededed;
  height: 1570px;
}
.listDimension {
  cursor: pointer;
  font-size: 12px;
  height: 60px;
  line-height: 60px;
  width: 99%;
  border: solid #2d9687;
  border-width: 2px 2px 0px 2px;
}
.isPick {
  height: 100%;
  width: 97%;
  background: #2d9687;
  color: #ffffff;
}
.showBar {
  background: #dae7e5;
  width: 99.5%;
  height: 640px;
  border: 2px solid #2d9687;
}
.legendBox {
  width: 24px;
  height: 16px;
  background: #eb1e63;
}
.inputSelectClass {
  background: #2d9687;
  padding-left: 10px;
  color: white;
  width: 500px;
  height: 40px;
  font-size: 24px;
}
#dimensionChart {
  height: 600px;
  width: 60%;
}
#spiderWeb {
  height: 600px;
}
#barChart {
  height: 360px;
  width: 95%;
}
</style>
