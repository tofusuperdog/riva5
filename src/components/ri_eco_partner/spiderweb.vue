<template>
  <div class="bgGrey font-16 q-pt-md" align="center">
    <div style="width: 90%; margin: auto">
      <div class="row items-center">
        <div align="left">
          <div class="font-30" v-show="input.resultBy == 'Reporter'">
            <b>Partner economy</b>
          </div>
          <div class="font-30" v-show="input.resultBy != 'Reporter'">
            <b>Reporting economy</b>
          </div>
          <div class="font-12" v-show="input.resultBy == 'Reporter'">
            Select a partner economy
          </div>
          <div class="font-12" v-show="input.resultBy != 'Reporter'">
            Select a reporting economy
          </div>
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
      <div class="font-24" align="left" v-show="input.resultBy == 'Reporter'">
        How is {{ yourGroupName }} integrated with {{ selected.label }} across
        different dimensions?
      </div>
      <div class="font-24" align="left" v-show="input.resultBy != 'Reporter'">
        How is {{ selected.label }} integrated with
        {{
          input.partner.length > 1
            ? " the partner group"
            : input.partner[0].label
        }}
        across different dimensions?
      </div>
      <!-- spider web chart -->
      <div v-show="dimShow.length > 2" id="spiderWeb"></div>
      <div
        v-show="dimShow.length <= 2"
        class="q-py-md"
        id="dimensionChart"
      ></div>
      <div class="q-pb-xl" v-if="noteForNoData != ''">
        {{ noteForNoData }}
      </div>
      <div class="font-24" align="left" v-show="input.resultBy == 'Reporter'">
        How is {{ yourGroupName }} integrated with {{ selected.label }} on each
        dimension across different indicators?
      </div>
      <div class="font-24" align="left" v-show="input.resultBy != 'Reporter'">
        How is {{ selected.label }} integrated with {{ yourGroupName }} across
        different indicators?
      </div>
      <div class="row q-pt-md justify-between">
        <div
          class="non-selectable"
          v-for="(item, index) in dimShow"
          :key="index"
          style="width: 14.286%; height: 60px"
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
        <div id="barChart" class=""></div>
        <div class="q-pb-md font-14">{{ noIndicatorAvail }}</div>

        <table-tab
          :dimension="dimShow[selectDimension].index"
          :type="input.type"
          class=""
        />
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
const selected = ref({});
const noteForNoData = ref("");
const tempDimChart = ref([]);
const yourGroupName = ref("the reporting group");
const firstHalfLastPeriod = ref(0);
const secondHalfStartPeriod = ref(0);
const firstHalfPeriod = ref("");
const secondHalfPeriod = ref("");
const countryOptions = ref([]);
const selectDimension = ref(0);
const indicatorData = ref([]);
const dimShow = ref([{ index: 1 }]);

const dimensionChart = ref({
  catName: [],
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

watch(
  () => props.dataSend,
  async (newValue) => {
    if (newValue) {
      data.value = props.dataSend.data;
      input.value = props.dataSend.input;
      report.value = props.dataSend.report;
      await loadData();
      setDimensionChart();
    }
  }
);

const loadData = async () => {
  countryOptions.value = data.value;
  selected.value = countryOptions.value[0];

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
  let dataInput = {
    type: input.value.type,
  };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(dataInput));
  indicatorData.value = res.data;
  let count = 1;
  indicatorData.value.forEach((x) => (x.index = count++));

  let datax = {
    input: input.value,
    countryPartnerList: data.value,
    countryReportList: report.value,
    reportMap: report.value.map((x) => x.iso),
    partnerMap: data.value.map((x) => x.iso),
  };

  let urlx = serverData.value + "ri/econ_intra_eco_integration_by_country.php";
  let resx = await axios.post(urlx, JSON.stringify(datax));

  let tempData = resx.data;
  tempData.sort((a, b) => b.lastValue - a.lastValue);
  let selectedTemp = countryOptions.value.filter(
    (x) => x.label == tempData[0].name
  );

  selected.value = selectedTemp[0];

  setDimensionChart();
};

const setDimensionChart = async () => {
  let dataTemp = {
    inputData: input.value,
    reporter: report.value.map((x) => x.iso),
    selected: selected.value.iso,
  };
  let url = serverData.value + "ri/econ_spider_chart.php";
  let res = await axios.post(url, JSON.stringify(dataTemp));
  let result = res.data;

  dimShow.value = [];
  let chartTemp = [];
  for (let i = 0; i < indicatorData.value.length; i++) {
    let tempData = result.filter(
      (x) => x.dimension == indicatorData.value[i].index
    );
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
    dimensionChart.value.series[0].data[i] = chartTemp[i].data[0];
    dimensionChart.value.series[1].data[i] = chartTemp[i].data[1];
  }
  dimensionChart.value.series[0].name = firstHalfPeriod.value;
  dimensionChart.value.series[1].name = secondHalfPeriod.value;

  if (dimShow.value.length > 2) {
    loadSpiderChart();
  } else {
    loadDimensionChart();
  }
  pickDimension(0);

  noteForNoData.value = "";
  let dataIndexGet = dimShow.value.map((x) => x.index);

  let dataAll = [1, 2, 3, 4, 5, 6, 7];
  let dataIndexLack = dataAll.filter((x) => !dataIndexGet.includes(x));

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
  Highcharts.chart("spiderWeb", {
    chart: {
      polar: true,
      backgroundColor: "#EDEDED",
    },
    title: {
      text: "",
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
      valueDecimals: 2,
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      layout: "vertical",
      y: 50,
    },

    series: dimensionChart.value.series,

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
        '<td style="padding:0"><b>{point.y.2f}</b></td></tr>',
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

const pickDimension = (index) => {
  selectDimension.value = index;
  setBarChart();
};

const setBarChart = async () => {
  let dim = dimShow.value[selectDimension.value].index;
  let dataTemp = {
    inputData: input.value,
    reporter: report.value.map((x) => x.iso),
    selected: selected.value.iso,
    dimension: dim,
  };

  let url2 = serverData.value + "ri/econ_spider_indicator.php";
  let res2 = await axios.post(url2, JSON.stringify(dataTemp));
  let fullDataIndicator = res2.data;

  let tempChart = [];
  for (
    let i = 0;
    i < indicatorData.value[selectDimension.value].indicator.length;
    i++
  ) {
    let EachIndicator = fullDataIndicator.filter((x) => x.indicator == i + 1);
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
  barChart.value.series[0].data = tempChart.map((x) => x.data[0]);
  barChart.value.series[1].data = tempChart.map((x) => x.data[1]);
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
  height: 1480px;
}
.listDimension {
  cursor: pointer;
  font-size: 12px;
  height: 60px;
  line-height: 60px;
  width: 97%;
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
  height: 650px;
  padding-bottom: 20px;
  border: 2px solid #2d9687;
  // overflow-y: auto;
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
