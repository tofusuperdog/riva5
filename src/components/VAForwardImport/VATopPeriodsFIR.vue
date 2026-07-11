<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top five exporting sectors in {{ exporting.name }} to
      {{ importing.name }} across periods
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
          id="chartFISRange02"
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

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);
const periodList = ref([]);

// data for calculation
const colorList = ["#9467BD", "#1F77B4", "#2CA02C", "#E377C2", "#FF7F0E"];

//Result
const isLoading = ref(true);
const sectorList = ref([]);
const totalFList = ref([]);
const seriesMain = ref([]);
const desData = ref([]);

// === Helper ===
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const build2Range = (s, e) => {
  let start = Number(s);
  let end = Number(e);

  const len = end - start + 1;
  // เคสเหมือนของเดิม: ต่างกัน 1 ปี -> แยกซ้ายขวาเป็นคนละปี
  if (len === 2) {
    return [{ label1: start, label2: end, y1: [start], y2: [end] }];
  }

  // คำนวณจุดแบ่ง
  const mid = start + Math.floor(len / 2);
  const isEven = len % 2 === 0;
  const leftEnd = isEven ? mid - 1 : mid;
  const rightStart = isEven ? mid : mid;

  const label1 = leftEnd === start ? String(start) : `${start}-${leftEnd}`;
  const label2 = rightStart === end ? String(end) : `${rightStart}-${end}`;

  const y1 = buildYearRange(start, leftEnd);
  const y2 = buildYearRange(rightStart, end);

  return [{ label1, label2, y1, y2 }];
};

const num1point = (n) => Number(n.toFixed(1));
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
  periodList.value = build2Range(yearStart, yearEnd);
  let y1End = periodList.value[0].y1[periodList.value[0].y1.length - 1];
  let y2Start = periodList.value[0].y2[0];

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

  totalFList.value = [
    num1point(
      totalFList.value
        .slice(0, yearList.value.indexOf(y1End) + 1)
        .reduce((a, b) => a + b),
    ),
    num1point(
      totalFList.value
        .slice(yearList.value.indexOf(y2Start))
        .reduce((a, b) => a + b),
    ),
  ];

  //จัดการข้อมูลส่วนรายละเอียด
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

  rawFinal = rawFinal.filter((d) => d.sectorID != 0);
  let top5 = rawFinal
    .filter((d) => d.year == yearEnd)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((d) => d.sectorID);
  rawFinal = rawFinal.filter((d) => top5.includes(d.sectorID));
  let rawFinal1 = rawFinal.filter((d) => d.year <= y1End);
  let rawFinal2 = rawFinal.filter((d) => d.year >= y2Start);

  seriesMain.value = [];
  top5.forEach((sectorID, i) => {
    let name = sectorIDToData(sectorID).shortname;

    let V1 = num1point(
      rawFinal1
        .filter((d) => d.sectorID == sectorID)
        .reduce((pv, cv) => pv + cv.value, 0),
    );
    let Y1 = shareNum(V1 / totalFList.value[0]);

    let V2 = num1point(
      rawFinal2
        .filter((d) => d.sectorID == sectorID)
        .reduce((pv, cv) => pv + cv.value, 0),
    );
    let Y2 = shareNum(V2 / totalFList.value[1]);
    seriesMain.value.push({
      name,
      data: [
        {
          y: Y1,
          value: V1,
        },
        {
          y: Y2,
          value: V2,
        },
      ],
      color: colorList[i],
    });
    // console.log(sectorID, selectData1V, selectData2V);
  });

  // console.clear();
  // console.log(top5);

  // console.log(y1End);
  // console.log("periodList", periodList.value);
  // console.log("totalFList", totalFList.value);
  // console.log("sectorList", sectorList.value);
  // console.log("yearList", yearList.value);
  // console.log("rawFinal", rawFinal);
  // console.log("rawData", rawData);
  // console.log("rawFinal1", rawFinal1);
  // console.log("rawFinal2", rawFinal2);
  // console.log(seriesMain.value);
  isLoading.value = false;
  plotGraph();
  desGen(top5);
};

const plotGraph = () => {
  let title = `Which exporting sectors in ${exporting.value.name} contribute most to ${importing.value.name}'s export production over periods?`;
  let series = seriesMain.value;
  let categoriesData = [periodList.value[0].label1, periodList.value[0].label2];
  Highcharts.chart("chartFISRange02", {
    chart: {
      type: "column",
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
      max: 100,
    },
    xAxis: {
      categories: categoriesData,
      tickLength: 0,
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,

      formatter() {
        return `<div style="font-weight:700">${this.series.name}</div>
        <div>Year: ${this.key}</div>
        <div>Share: ${this.y.toFixed(1)}% of forward linkages</div>
        <div>Value: ${moneyShort(this.point.value)}</div>
        `;
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    series: series,
    credits: { enabled: false },
  });
};

const desGen = (top5) => {
  for (let i = 0; i < 5; i++) {
    let lasty = seriesMain.value[i].data[1].y;
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
      color: colorList[i],
      img: `/images/sector/${i + 1}/${top5[i]}.svg`,
      des: `During ${periodList.value[0].label2}, ${seriesMain.value[i].name} represent ${lasty}% of ${exporting.value.name}'s value added used for further export production in ${importing.value.name}, ${textdiff} compared to the ${periodList.value[0].label1} period.`,
    });
  }
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
