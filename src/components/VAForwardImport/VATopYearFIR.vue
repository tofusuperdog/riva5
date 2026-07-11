<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top five exporting sectors in {{ exporting.name }} to
      {{ importing.name }} across years
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div
      v-if="isLoading"
      class="w-full min-h-[500px] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="max-w-[520px] w-[92%] px-6 py-6 text-center">
        <div class="flex items-start justify-center gap-3 text-gray-700">
          <!-- SVG Spinner -->
          <svg
            class="animate-spin h-5 w-5 mt-0.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
            ></path>
          </svg>

          <div class="text-left">
            <div class="text-base font-semibold">
              Preparing the visualization
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              Rendering the chart and finalizing the display.
            </div>
            <div class="text-xs text-gray-500 mt-3">
              Thank you for your patience.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex justify-center pt-4">
        <div
          id="chartFISRange01"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>
      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? "View less" : "View more" }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 w-full lg:w-[40%] flex items-center"
        v-show="showDetail"
      >
        <div v-for="d in desData" :key="d.sectorName">
          <div class="flex pt-2">
            <div><img :src="d.img" alt="" class="h-7" /></div>
            <div class="text-lg font-semibold pl-2" :style="{ color: d.color }">
              {{ d.sectorName }}
            </div>
          </div>
          <div class="fsub">{{ d.des }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);
const yearList = ref([]);
const isLoading = ref(true);

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);

// data for calculation
const colorList = ["#9467BD", "#1F77B4", "#2CA02C", "#E377C2", "#FF7F0E"];

//Result
const sectorList = ref([]);
const totalFList = ref([]);
const seriesMain = ref([]);
const desData = ref([]);

// === Helper ===
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} billion`;
  return `$${n.toFixed(1)} million`;
};

const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

const sectorIDToData = (id) => {
  let selectData = sectorList.value.find((item) => item.catID == id);
  return selectData;
};

//Load data
const loadSectorList = async () => {
  const { data: sectorData } = await axios.get(
    `${serverData.value}va/get_sector.php`,
  );
  sectorList.value = sectorData;
};

const loadData = async () => {
  isLoading.value = true;
  yearList.value = buildYearRange(yearStart, yearEnd);

  //Load main data
  let payLoad = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    year: yearList.value,
  };

  const { data: raw } = await axios.post(
    `${serverData.value}va/forward_import.php`,
    JSON.stringify(payLoad),
  );

  let rawData = raw;
  //หาค่า Total Forward
  totalFList.value = rawData
    .filter((d) => d.exp_sector == 0)
    .sort((a, b) => a.year - b.year)
    .map((d) => Number(d.value));

  //จัดการข้อมูลส่วนรายละเอียด
  rawData = rawData.filter((d) => d.exp_sector != 0);
  let rawFinal = rawData.map((d) => {
    let tf = totalFList.value[yearList.value.indexOf(Number(d.year))];
    let sectorID = d.exp_sector;
    let sectorName = sectorIDToData(sectorID).shortname;
    let sectorGroup = sectorIDToData(sectorID).sectiongroup;
    let value = Number(d.value);
    let share = shareNum(value / tf);
    let year = Number(d.year);
    return {
      year,
      sectorID,
      sectorName,
      sectorGroup,
      value,
      share,
    };
  });

  //Find Top5
  let top5 = rawFinal
    .filter((d) => d.year == yearEnd)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  let top5ID = top5.map((d) => d.sectorID);

  let rawTop5 = rawFinal.filter((d) => top5ID.includes(d.sectorID));

  seriesMain.value = [];
  top5.forEach((topSector, i) => {
    let dataTemp = [];
    yearList.value.forEach((year) => {
      let selectData = rawTop5.filter(
        (d) => d.sectorID == topSector.sectorID && d.year == year,
      )[0];

      dataTemp.push({
        y: shareNum(
          selectData.value / totalFList.value[yearList.value.indexOf(year)],
        ),
        value: selectData.value,
      });
    });
    seriesMain.value.push({
      name: topSector.sectorName,
      data: dataTemp,
      color: colorList[i],
    });
  });
  isLoading.value = false;
  desGen(top5, top5ID);
  plotGraph(top5);
  // console.clear();
  // console.log(seriesMain.value);
  // console.log("top5", top5);
  // console.log("rawTop5", rawTop5);
  // console.log("totalFList", totalFList.value);
  // console.log("sectorList", sectorList.value);
  // console.log("yearList", yearList.value);
  // console.log("rawData", rawData);
  // console.log("rawFinal", rawFinal);
};

const plotGraph = (top5) => {
  let title = `Which exporting sectors in ${exporting.value.name} contribute the most to the production of further exports in ${importing.value.name}?`;
  let categoriesData = yearList.value.map((d) => d.toString());
  let series = seriesMain.value;

  Highcharts.chart("chartFISRange01", {
    chart: {
      type: "spline",
    },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    yAxis: {
      title: {
        text: "Percent of Forward Linkages",
      },
      labels: {
        format: "{value}%",
      },
      min: 0,
    },
    xAxis: { categories: categoriesData, tickLength: 0 },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      formatter() {
        const i = this.point.index ?? this.point.x ?? 0;
        const year = categoriesData[i]; // ปีจากแกน X
        const sector = this.series.name; // ประเภทอุปกรณ์จาก series
        const value = this.point.value; // ค่าจาก series
        const share = this.point.y; // ค่าจาก series
        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${sector}</div>
            <div>Year: ${year}</div>
            <div>Share: ${share.toFixed(1)}% of forward linkages</div>
            <div>Value: ${moneyShort(value)}</div>
          </div>
        `;
      },
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { fontSize: "12px" },
    },

    series: series,
    credits: { enabled: false },
  });
};

const desGen = (top5, top5ID) => {
  for (let i = 0; i < 5; i++) {
    let scid = top5[i].sectorID;
    let lasty = seriesMain.value[i].data[seriesMain.value[i].data.length - 1].y;
    let firsty = seriesMain.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = "unchanged";
    if (diff < 0) {
      textdiff = "down by " + Math.abs(diff).toFixed(1) + " percentage points";
    } else if (diff > 0) {
      textdiff = "up by " + Math.abs(diff).toFixed(1) + " percentage points";
    }
    desData.value.push({
      sectorName: seriesMain.value[i].name,
      img: `/images/sector/${i + 1}/${scid}.svg`,
      color: colorList[i],
      des: `${seriesMain.value[i].name} exports represent ${lasty}% of ${exporting.value.name}'s domestic value added used for further export production in ${importing.value.name}, ${textdiff} since  ${yearStart}.`,
    });
  }
  // console.clear();
  // console.log(desData.value);
};
// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge),
);

onMounted(async () => {
  await loadSectorList();
  await loadData();
});
</script>

<style lang="scss" scoped></style>
