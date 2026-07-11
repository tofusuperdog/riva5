<template>
  <div class="bgGreen font-16 q-pa-md q-px-xl" align="center">
    <div class="row items-center">
      <div align="left">
        <div class="font-30"><b>Economies</b></div>
        <div class="font-12">Select an economy</div>
      </div>
      <div class="q-pl-lg" style="width: 400px">
        <q-select
          class="inputSelectClass"
          input-style="color:white"
          v-model="selected"
          :options="countryOptions"
          @update:model-value="changeInput()"
          dark
        />
      </div>
    </div>
    <div class="font-24 q-pt-md" align="left">
      How is {{ selected.label }} Integrated with the rest of the group? By
      individual economies and dimensions<br />
    </div>
    <div class="row q-pt-md" style="height: 600px">
      <!-- left circle  -->
      <div class="col">
        <div id="leftContainer"></div>
        <div class="btnOutGreenLeft q-mt-lg" @click="linkToDimension()">
          Explore integration by dimension
        </div>
      </div>
      <div class="lineCenter"></div>
      <!-- right circle  -->
      <div class="col">
        <div id="rightContainer"></div>
        <div class="btnOutGreen q-mt-lg" @click="gotoEcoPartner()">
          Go to Economy-partner(s) integration section
          <div class="fontSubBtn">
            Explore country's integration with the rest of the group in more
            detail
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { serverSetup } from "../../pages/server.js";
import { LocalStorage } from "quasar";
import { useRouter } from "vue-router";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const { serverData } = serverSetup();
const router = useRouter();
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
const selected = ref("");
const countryOptions = ref([]);
const dimensionAll = ref([]);
const yourGroupName = ref("Your group");

const changeInput = async () => {
  await editName();
  loadChartLeft();
  loadChartRight();
};

const leftChart = ref({
  title: "",
  catName: "",
  series: [],
});

const rightChart = ref({
  title: "",
  catName: "",
  series: [],
});
const emit = defineEmits(["go-to-dimension"]);

onMounted(async () => {
  input.value = props.dataGet.input;
  countryFullList.value = props.dataGet.countryFullList;
  await loadDimension();
  checkYourName();
});

const linkToDimension = () => {
  emit("go-to-dimension");
};

const gotoEcoPartner = () => {
  let dataTemp = [];
  countryFullList.value.forEach((item) => {
    if (item.iso != selected.value.iso) {
      dataTemp.push(item);
    }
  });
  LocalStorage.clear();
  LocalStorage.set("partner", dataTemp);
  LocalStorage.set("reporter", selected.value);
  LocalStorage.set("year", input.value.year);
  let id = uuidv4();
  LocalStorage.set("keyId", id);
  router.push("/riecopartner/" + id);
};

const loadDimension = async () => {
  let data5 = {
    type: input.value.type,
  };
  let url2 = serverData.value + "ri/dimension_icon.php";
  let res2 = await axios.post(url2, JSON.stringify(data5));
  dimensionAll.value = res2.data;
};

const checkYourName = async () => {
  if (input.value.partner.length == 1) {
    yourGroupName.value = input.value.partner[0].label;
  }
  await loadData();
  await editName();
  loadChartLeft();
  loadChartRight();
};

const loadChartLeft = () => {
  Highcharts.chart("leftContainer", {
    chart: {
      type: "column",
      inverted: true,
      polar: true,
      backgroundColor: "#DFEEF480",
    },
    title: {
      text: leftChart.value.title,
    },
    tooltip: {
      outside: true,
    },
    pane: {
      startAngle: 0,
      endAngle: 270,

      innerSize: "15%",
    },
    xAxis: {
      tickInterval: 1,
      labels: {
        align: "right",
      },
      categories: leftChart.value.catName,
    },
    yAxis: {
      crosshair: {
        enabled: true,
        color: "#333",
      },

      min: 0,
      max: 1,
      endOnTick: true,
      showLastLabel: true,
    },

    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0,
        groupPadding: 0,
      },
    },
    colors: [
      "#64C1E8",
      "#D85B63",
      "#D680AD",
      "#88643A",
      "#C0BA80",
      "#FDC47D",
      "#EA3B46",
      "#2D9687",
    ],
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
    credits: {
      enabled: false,
    },
    series: [
      {
        name: "",
        data: leftChart.value.series,
        colorByPoint: true,
      },
    ],
  });
};

const loadChartRight = () => {
  Highcharts.chart("rightContainer", {
    chart: {
      type: "column",
      inverted: true,
      polar: true,
      backgroundColor: "#DFEEF480",
    },
    title: {
      text: rightChart.value.title,
    },
    tooltip: {
      outside: true,
    },
    pane: {
      startAngle: 0,
      endAngle: 270,

      innerSize: "15%",
    },
    xAxis: {
      tickInterval: 1,
      labels: {
        align: "right",
      },
      categories: rightChart.value.catName,
    },
    yAxis: {
      crosshair: {
        enabled: true,
        color: "#333",
      },

      min: 0,
      max: 1,
      endOnTick: true,
      showLastLabel: true,
    },

    plotOptions: {
      column: {
        borderWidth: 0,
        pointPadding: 0,
        groupPadding: 0,
      },
    },
    colors: [
      "#64C1E8",
      "#D85B63",
      "#D680AD",
      "#88643A",
      "#C0BA80",
      "#FDC47D",
      "#EA3B46",
      "#2D9687",
    ],
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
    credits: {
      enabled: false,
    },
    series: [
      {
        name: "",
        data: rightChart.value.series,
        colorByPoint: true,
      },
    ],
  });
};
const editName = async () => {
  let dataSend = {
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    inputData: input.value,
    selected: selected.value,
  };
  let url = serverData.value + "ri/intra_circlechart_top7country.php";
  let res = await axios.post(url, JSON.stringify(dataSend));
  let result = res.data;
  leftChart.value.catName = [];
  leftChart.value.series = [];
  result.sort((a, b) => b.y - a.y);
  result.forEach((x) => {
    if (x.name != selected.value.label) {
      leftChart.value.catName.push(
        x.name + " (" + x.y.toFixed(2).toString() + ")"
      );
      leftChart.value.series.push(x.y);
    }
  });

  if (countryOptions.value.length >= 8) {
    leftChart.value.title =
      "By top 7 key partner economics (" + input.value.year.max + ")";
  } else {
    let cNum = countryOptions.value.length - 1;
    leftChart.value.title =
      "By top " +
      cNum +
      " key partner economics (" +
      input.value.year.max +
      ")";
  }

  let dataSend2 = {
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
    inputData: input.value,
    selected: selected.value,
  };
  url = serverData.value + "ri/intra_circlechart_dimension.php";
  let res2 = await axios.post(url, JSON.stringify(dataSend2));
  let tempTable = res2.data;
  let chartB4sort = [{}];

  for (let i = 1; i <= 7; i++) {
    let eachDimension = tempTable.filter((dim) => dim.dimension == i);
    let avgDim = 0;
    if (eachDimension.length == 0) {
      avgDim = 0;
    } else {
      avgDim =
        eachDimension.reduce((a, b) => a + Number(b.score), 0) /
        eachDimension.length;
    }
    chartB4sort[i - 1] = {};
    chartB4sort[i - 1].y = Number(avgDim.toFixed(4));
    chartB4sort[i - 1].name = dimensionAll.value[i - 1].name;
  }

  chartB4sort.sort((a, b) => b.y - a.y);
  rightChart.value.catName = [];
  rightChart.value.series = [];
  chartB4sort.forEach((x) => {
    rightChart.value.catName.push(
      x.name + " (" + x.y.toFixed(2).toString() + ")"
    );
  });
  chartB4sort.forEach((x) => {
    rightChart.value.series.push(x);
  });
  rightChart.value.title = "By dimensions (" + input.value.year.max + ")";
};

const loadData = async () => {
  countryOptions.value = countryFullList.value;
  let data = {
    inputData: input.value,
    countryFullList: countryFullList.value,
    countryMap: countryFullList.value.map((x) => x.iso),
  };

  let url = serverData.value + "ri/intra_eco_integration_by_country.php";
  let res = await axios.post(url, JSON.stringify(data));
  let tempData = res.data;
  tempData.sort((a, b) => b.lastValue - a.lastValue);
  let selectedTemp = countryOptions.value.filter(
    (x) => x.label == tempData[0].name
  );
  selected.value = selectedTemp[0];
};
</script>

<style lang="scss" scoped>
.bgGreen {
  background: #ededed;
  height: 860px;
}
.lineCenter {
  margin-top: 5%;
  margin-bottom: 5%;
  width: 1px;
  background: #757575;
}
.percentBar {
  height: 30px;
  background: #c4c4c4;
}
.innerBar {
  height: 30px;
  background: #2d9687;
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
.inputSelectClass {
  background: #2d9687;
  padding-left: 10px;
  color: white;
  font-size: 20px;
}

#leftContainer,
#rightContainer {
  height: 600px;
  margin: 0 auto;
}
.fontSubBtn {
  font-size: 10px;
}
</style>
