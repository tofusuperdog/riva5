<template>
  <div>
    <div id="lineChart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
// import { yearInputShow } from "../../pages/server.js";
import { serverSetup } from "../../pages/server.js";
import axios from "axios";

const { serverData } = serverSetup();
const props = defineProps({
  ci: {
    type: Array,
    required: true,
  },
  si: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  ecoName: {
    type: String,
    required: true,
  },
});
// const { yearInput } = yearInputShow();
const yearInput = ref({ min: 2010, max: 2020 });
const title = ref("");

const yearStart = ref("");
const yearEnd = ref("");

// ฟังก์ชัน debounce
const debounce = (fn, delay) => {
  let timeoutID;
  return function (...args) {
    if (timeoutID) clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const regenChart = () => {
  // console.log("regenChart called");

  if (props.ecoName.length > 0) {
    if (props.ecoName == "Asia-Pacific") {
      title.value = `How has ${props.ecoName}'s integration changed over the years?<br> Conventional and sustainable integration (${yearStart.value}-${yearEnd.value})`;
    } else {
      title.value = `How has ${props.ecoName}'s integration with Asia-Pacific changed over the years?<br> Conventional and sustainable integration (${yearStart.value}-${yearEnd.value})`;
    }
    Highcharts.chart("lineChart", {
      chart: {
        height: 750,
      },
      title: {
        text: title.value,
      },
      yAxis: {
        title: {
          text: "Integration index",
        },
      },
      xAxis: {
        accessibility: {
          rangeDescription:
            "Range: " + yearStart.value + " to " + yearEnd.value,
        },
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
          },
          label: {
            connectorAllowed: false,
          },
          pointStart: yearStart.value,
        },
      },
      credits: {
        enabled: false,
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
      series: [
        {
          name: "Sustainable integration",
          data: props.si,
          color: "#C55A0F",
        },
        {
          name: "Conventional  integration",
          data: props.ci,
          color: "#113F5A",
        },
      ],
    });
  }
};

const debouncedRegenChart = debounce(regenChart, 200);

onMounted(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = Number(result.data[0].yearStart);
  yearInput.value.max = Number(result.data[0].yearEnd);
  yearStart.value = yearInput.value.min;
  yearEnd.value = yearInput.value.max;
});

// ใช้ watch เฉพาะเมื่อ props ที่สำคัญมีการเปลี่ยนแปลง
watch(
  () => ({ ci: props.ci, si: props.si, ecoName: props.ecoName }),
  (newVal, oldVal) => {
    if (
      newVal.ci.length > 0 &&
      newVal.si.length > 0 &&
      newVal.ecoName.length > 0
    ) {
      // console.log("watch");
      debouncedRegenChart();
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="scss" scoped></style>
