<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">Top economies across periods</div>
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
          id="chartFSRange04"
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
        class="p-4 pt-4 \w-full lg:w-[40%] flex items-center"
        v-show="showDetail && !isLoading"
      >
        <div v-for="r in desData" :key="r.econname" class="mb-4">
          <div class="flex items-center gap-2">
            <img :src="r.img" alt="" class="h-6 w-10" />
            <div :style="{ color: r.color }" class="text-lg font-semibold">
              {{ r.econname }}
            </div>
          </div>

          <div>{{ r.des }}</div>
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

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const sector = ref(props.inputData.sector);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);

const isLoading = ref(true);

// ===== Data for calculation =====
const ecoList = ref([]);
const categories = ref([]);
const totalF = ref([]);
const seriesMain = ref([]);
const desData = ref([]);

const colorList = [
  "#36CAD2",
  "#FAAC36",
  "#D04F7A",
  "#2E9588",
  "#FF9AE0",
  "#9C9C9C",
];

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

const isoToName = (iso) => {
  let dataSelected = ecoList.value.find((item) => item.iso == iso);
  if (dataSelected) {
    return {
      name: dataSelected.economic,
      iso: dataSelected.iso,
      area: dataSelected.area,
    };
  } else {
    return 0;
  }
};

const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} billion`;
  return `$${n.toFixed(1)} million`;
};

const round1 = (n) => Number(Number(n).toFixed(1));

function sumValueByISO(data) {
  const map = new Map();

  for (const d of data) {
    const iso = d.iso;
    const val = Number(d.value) || 0;

    if (!map.has(iso)) {
      map.set(iso, {
        iso,
        name: d.name, // เก็บชื่อแรกที่เจอ (หรือเปลี่ยนตามต้องการ)

        valueSum: 0,
      });
    }

    const rec = map.get(iso);
    rec.valueSum += val;
  }

  // แปลง Map -> Array
  return Array.from(
    Array.from(map.values()).map((r) => ({
      ...r,
      valueSum: round1(r.valueSum), // ปัดให้เหลือ 1 ตำแหน่งเป็น Number
    })),
  );
}
//===== Load Data===

const loadEconomyList = async () => {
  const { data: economyList } = await axios.get(
    `${serverData.value}va/get_eco_not_group.php`,
  );
  ecoList.value = economyList;
};

const loadData = async () => {
  isLoading.value = true;
  categories.value = [...build2Range(yearStart, yearEnd)];
  let yearP = buildYearRange(yearStart, yearEnd);

  let payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: buildYearRange(yearStart, yearEnd),
  };

  let raw = await axios.post(
    `${serverData.value}va/forward_sector.php`,
    JSON.stringify(payload),
  );
  let rawData = raw.data;

  //หา Total Forward
  let totalFtemp = [];
  yearP.forEach((year) => {
    let selectData = rawData.filter((d) => d.year == year)[0].totalvalue;
    totalFtemp.push(Number(selectData));
  });

  let y1End = categories.value[0].y1[categories.value[0].y1.length - 1];
  let y1Index = yearP.findIndex((x) => x == y1End);
  let totalFtemp1 = +totalFtemp
    .slice(0, y1Index + 1)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
  let y2Start = categories.value[0].y2[0];
  let y2Index = yearP.findIndex((x) => x == y2Start);
  let totalFtemp2 = +totalFtemp
    .slice(y2Index, totalFtemp.length)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
  totalF.value = [totalFtemp1, totalFtemp2];

  //Clean rawdata
  let rawFilter = rawData.filter((x) => Number(x.value) > 0);
  let rawAll = rawFilter
    .map((d) => {
      if (d.imp_country == "RoW") {
        return {
          name: "Rest of the World",
          iso: "RoW",
          area: "Rest of the World",
          year: d.year,
          value: Number(d.value),
          total: Number(d.totalvalue),
        };
      }
      return {
        name: isoToName(d.imp_country).name,
        iso: isoToName(d.imp_country).iso,
        area: isoToName(d.imp_country).area,
        year: d.year,
        value: Number(d.value),
        total: Number(d.totalvalue),
      };
    })
    .filter((item) => item.name);

  //แยกข้อมูลออกมาเป็นสองส่วน
  let rawAll1 = sumValueByISO(rawAll.filter((x) => x.year <= y1End));
  let rawAll2 = sumValueByISO(rawAll.filter((x) => x.year >= y2Start));

  //Find top5
  let rawWithoutROW = rawAll.filter((x) => x.iso != "RoW");
  let top5 = rawWithoutROW
    .filter((x) => x.year == yearEnd)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((x) => x.iso);

  // สร้าง SeriesMain
  seriesMain.value = [];
  let sumValue1 = 0;
  let sumShare1 = 0;
  let sumValue2 = 0;
  let sumShare2 = 0;
  top5.forEach((isoTop, i) => {
    let selectData1 = rawAll1.filter((d) => d.iso == isoTop);
    let selectData2 = rawAll2.filter((d) => d.iso == isoTop);
    sumValue1 += selectData1[0].valueSum;
    sumShare1 += (selectData1[0].valueSum / totalFtemp1) * 100;
    sumValue2 += selectData2[0].valueSum;
    sumShare2 += (selectData2[0].valueSum / totalFtemp2) * 100;

    seriesMain.value.push({
      name: isoToName(isoTop).name,
      data: [
        {
          y: round1((selectData1[0].valueSum / totalFtemp1) * 100),
          value: selectData1[0].valueSum,
        },
        {
          y: round1((selectData2[0].valueSum / totalFtemp2) * 100),
          value: selectData2[0].valueSum,
        },
      ],
      color: colorList[i],
    });
    if (i == 4) {
      seriesMain.value.push({
        name: "Others",
        data: [
          {
            y: round1(100 - sumShare1),
            value: round1(totalFtemp1 - sumValue1),
          },
          {
            y: round1(100 - sumShare2),
            value: round1(totalFtemp2 - sumValue2),
          },
        ],
        color: colorList[5],
      });
    }
  });
  isLoading.value = false;
  genDes(top5);
  plotGraph();
  //Find RawDataFinal

  // console.log(sumValueByISO(rawAll1));
  // console.log("yearP", yearP);
  // console.log("categories", categories.value);
  // console.log("rawAll", rawAll);
  // console.log("rawAll1", rawAll1);
  // console.log("rawAll2", rawAll2);
  // console.log("totalF", totalF.value);
  // console.log("top5", top5);
  // console.log("seriesMain", seriesMain.value);
};

const genDes = (top5) => {
  desData.value = [];
  for (let i = 0; i < 5; i++) {
    let lasty = seriesMain.value[i].data[seriesMain.value[i].data.length - 1].y;
    let firsty = seriesMain.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = "unchanged";
    if (diff < 0) {
      textdiff = "down by " + Math.abs(diff).toFixed(1) + "%";
    } else if (diff > 0) {
      textdiff = "up by " + Math.abs(diff).toFixed(1) + "%";
    }

    desData.value.push({
      econname: seriesMain.value[i].name,
      color: colorList[i],
      img: `/images/flags/${top5[i]}.png`,
      des: `During ${categories.value[0].label2}, ${lasty}% of ${exporting.value.name}'s forward linkages in exports of ${sector.value.sectorShortName} went to ${seriesMain.value[i].name}, ${textdiff} percentage points compared to the ${categories.value[0].label1} period.`,
    });
  }
};

const plotGraph = () => {
  let title = `How has the destination of ${
    exporting.value.name
  }'s ${sector.value.sectorShortName.toLowerCase()} forward linkages shifted overtime?`;
  let categoriesData = [categories.value[0].label1, categories.value[0].label2];
  let series = seriesMain.value;

  Highcharts.chart("chartFSRange04", {
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

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge),
);

onMounted(async () => {
  await loadEconomyList();
  await loadData();
});
</script>

<style lang="scss" scoped></style>
