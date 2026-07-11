<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      Top exporting sector across periods
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div
      v-if="!isAvail"
      class="w-full min-h-[400px] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="max-w-[520px] w-[92%] px-6 py-6 text-center">
        <div class="flex items-start justify-center gap-3 text-gray-700">
          <div class="text-left">
            <div class="text-center q-mb-sm">
              <q-icon name="fa-solid fa-circle-info" size="lg" />
            </div>
            <div class="text-base font-semibold">
              No trade occurred under the selected settings
            </div>
            <div class="text-sm text-gray-600 mt-0.5 text-center">
              Try a different year range or economy selection.
            </div>
          </div>
        </div>
      </div>
    </div>
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

    <div class="flex flex-col lg:flex-row" v-show="!isLoading && isAvail">
      <!-- กราฟหลัก -->
      <div
        class="w-full lg:w-[60%] flex items-center justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSRangeBSR02"
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
        <div>
          <div v-for="d in desData" :key="d.sectorName">
            <div class="flex pt-2">
              <div><img :src="d.img" alt="" class="h-7" /></div>
              <div
                class="text-lg font-semibold pl-2"
                :style="{ color: d.color }"
              >
                {{ d.sectorName }}
              </div>
            </div>
            <div class="fsub">{{ d.des }}</div>
          </div>
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
const importing = ref(props.inputData.importing);
const source = ref(props.inputData.source);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

const isLoading = ref(true);
const isAvail = ref(true);

// ===== Data Variables =====
const colorCode = [
  "#9467BD", // ม่วงเข้ม
  "#1F77B4", // ฟ้า
  "#2CA02C", // เขียว
  "#FF813D", // ส้ม
  "#FF9AE0", // ชมพู

  "#D62728", // แดงสด
  "#17BECF", // ฟ้าอมเขียว (cyan)
  "#8C564B", // น้ำตาล
  "#BCBD22", // เขียวมะกอกสด
  "#7F7F7F", // เทาเข้ม (กลางๆ ไว้ตัด)
];
const sectorList = ref([]);
const totalBack = ref([]);

const yearRange = ref([]);
const yearEnd1 = ref(0);
const yearStart2 = ref(0);
const label1 = ref("");
const label2 = ref("");
const rawData = ref([]);

const top5SectorID = ref([]);
const top5SectorName = ref([]);
const series = ref([]);
const desData = ref([]);

// *******Helper*********

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const sectorIDToName = (id) => {
  let res = sectorList.value.filter((d) => Number(d.catID) == Number(id));
  return res[0].shortname;
};

const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

const loadSector = async () => {
  let res = await axios.get(`${serverData.value}va/get_sector.php`);
  sectorList.value = res.data;
};

const money = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} million`;

function aggregateBySector(rawData) {
  const result = {};

  rawData.forEach((d) => {
    const sector = d.exp_sector;
    const value = Number(d.value) || 0;

    if (!result[sector]) {
      result[sector] = { exp_sector: sector, totalValue: 0 };
    }

    result[sector].totalValue += value;
  });

  // แปลงกลับเป็น array
  return Object.values(result);
}

const genSeries = (sectorID, index, sumData1, sumData2) => {
  let data1 = sumData1.filter((d) => Number(d.exp_sector) == Number(sectorID));
  let result1 = { y: 0, value: 0, period: label1.value, year: label1.value };
  if (data1.length != 0) {
    result1 = {
      y: shareNum(Number(data1[0].totalValue) / totalBack.value[0]),
      value: Number(data1[0].totalValue.toFixed(1)),
      period: label1.value,
      year: label1.value,
    };
  }

  let data2 = sumData2.filter((d) => Number(d.exp_sector) == Number(sectorID));
  let result2 = { y: 0, value: 0, period: label2.value, year: label2.value };
  if (data2.length != 0) {
    result2 = {
      y: shareNum(Number(data2[0].totalValue) / totalBack.value[1]),
      value: Number(data2[0].totalValue.toFixed(1)),
      period: label2.value,
      year: label2.value,
    };
  }

  return {
    name: sectorIDToName(sectorID),
    color: colorCode[index],
    data: [result1, result2],
  };
};

function joinWithAnd(items) {
  const arr = (items || []).map((s) => String(s).trim()).filter(Boolean);
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
}

const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)

function formatMainValue(vMillion) {
  const v = Number(vMillion || 0);
  if (v < 1000) return `${v.toFixed(1)} million`;
  return `${toB(v).toFixed(1)} billion`;
}
const loadData = async () => {
  isLoading.value = true;
  yearRange.value = buildYearRange(yearStart.value, yearEnd.value);
  let payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    source_country: source.value.iso,
    year: yearRange.value,
  };

  let { data: raw } = await axios.post(
    `${serverData.value}va/back_sector.php`,
    JSON.stringify(payload)
  );

  raw = raw.filter((x) => Number(x.value) > 0);
  if (raw.length === 0) {
    isAvail.value = false;
    isLoading.value = false;
    return;
  } else {
    isAvail.value = true;
  }

  // หาผลรวมของ Total Backward
  let totalBackTemp = raw
    .filter((d) => Number(d.exp_sector) == 0)
    .sort((a, b) => Number(a.year) - Number(b.year))
    .map((d) => Number(d.value));

  let mid1 = 0;
  let mid2 = 0;
  if (totalBackTemp.length % 2 == 0) {
    mid1 = totalBackTemp.length / 2 - 1;
    mid2 = totalBackTemp.length / 2;
  } else {
    mid1 = Math.floor(totalBackTemp.length / 2);
    mid2 = mid1;
  }
  let sumTototal1 = 0;
  for (let i = 0; i <= mid1; i++) {
    sumTototal1 += totalBackTemp[i];
  }
  let sumTototal2 = 0;
  for (let i = mid2; i < totalBackTemp.length; i++) {
    sumTototal2 += totalBackTemp[i];
  }
  totalBack.value = [
    Number(sumTototal1.toFixed(2)),
    Number(sumTototal2.toFixed(2)),
  ];

  rawData.value = raw.filter((d) => Number(d.exp_sector) != 0);

  // set ช่วงเวลาของปี
  let midYear = Math.floor(
    (Number(yearEnd.value) + Number(yearStart.value)) / 2
  );

  if (yearRange.value.length % 2 == 0) {
    yearEnd1.value = midYear;
    yearStart2.value = midYear + 1;
  } else {
    yearEnd1.value = midYear;
    yearStart2.value = midYear;
  }

  label1.value = `${yearStart.value} - ${yearEnd1.value}`;
  label2.value = `${yearStart2.value} - ${yearEnd.value}`;

  //หา top 5 sector ในแต่ละช่วง
  let rawData2 = rawData.value.filter(
    (d) => Number(d.year) >= yearStart2.value
  );
  let sumData2 = aggregateBySector(rawData2)
    .sort((a, b) => Number(b.totalValue) - Number(a.totalValue))
    .slice(0, 5);

  let rawData1 = rawData.value.filter((d) => Number(d.year) <= yearEnd1.value);
  let sumData1 = aggregateBySector(rawData1)
    .sort((a, b) => Number(b.totalValue) - Number(a.totalValue))
    .slice(0, 5);

  let indexList1 = sumData2.map((d) => d.exp_sector);
  let indexList2 = sumData1.map((d) => d.exp_sector);
  top5SectorID.value = indexList2.map((d) => Number(d));
  top5SectorName.value = indexList2.map((d) => sectorIDToName(d));
  let indexList = [...new Set([...indexList1, ...indexList2])];

  series.value = [];
  indexList.forEach((d, i) => {
    series.value.push(genSeries(Number(d), i, sumData1, sumData2));
  });

  let sectorReplaceID = indexList.slice(5);
  let sectorReplaceName = sectorReplaceID.map((d) => sectorIDToName(d));
  let sectorReplaceText = joinWithAnd(sectorReplaceName);

  desData.value = [];
  indexList.forEach((d, i) => {
    if (i < 5) {
      let lasty = series.value[i].data[1].y;
      let firsty = series.value[i].data[0].y;
      let textLast = "";
      let diff = lasty - firsty;
      if (firsty == 0) {
        textLast = `.`;
      } else {
        if (diff < 0) {
          textLast =
            ", down by " +
            Math.abs(diff).toFixed(1) +
            " percentage points compared to " +
            label1.value +
            ".";
        } else if (diff > 0) {
          textLast =
            ", up by " +
            Math.abs(diff).toFixed(1) +
            " percentage points compared to " +
            label1.value +
            ".";
        } else {
          textLast = "unchanged compared to " + label1.value + ".";
        }
      }

      let des = `During ${label2.value}, ${lasty}% of ${
        source.value.name
      }'s value-added content embedded in ${
        exporting.value.name
      }'s exports to ${
        importing.value.name
      } was exported via the ${sectorIDToName(Number(d))}${textLast}`;
      desData.value.push({
        sectorName: sectorIDToName(Number(d)),
        img: `/images/sector/${i + 1}/${d}.svg`,
        color: colorCode[i],
        des,
      });
    }
  });

  isLoading.value = false;

  drawChart();
};

const drawChart = () => {
  let title = `In which exporting sectors is ${source.value.name}'s value added content most embedded in ${exporting.value.name}'s exports to ${importing.value.name}?`;
  let subTitle = `Total backward linkages amounted to USD ${formatMainValue(
    totalBack.value[0]
  )} in ${label1.value} and USD ${formatMainValue(totalBack.value[1])} in ${
    label2.value
  }.`;
  let categories = [label1.value, label2.value];
  Highcharts.chart("chartBSRangeBSR02", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    subtitle: {
      text: subTitle,
      style: { fontSize: "14px", color: "#666" },
    },
    xAxis: { categories, tickLength: 0 },
    yAxis: {
      min: 0,
      title: { text: "Percent of Backward Linkages" },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      stackLabels: {
        enabled: true, // ✅ เปิดการแสดงผลรวมบนแต่ละแท่ง
        formatter: function () {
          // this.total = ผลรวมของ stack ในหมวดนั้น (เช่น 100)
          return Highcharts.numberFormat(this.total, 1) + "%";
        },
        style: {
          fontWeight: "600",
          color: "#333",
          textOutline: "none",
        },
      },
      gridLineColor: "#eee",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    plotOptions: {
      column: { stacking: "normal", borderWidth: 0 },
      series: { animation: { duration: 300 } },
    },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        return `
          <div style="min-width:220px">
            <div style="font-weight:700;">${this.series.name}</div>
            <div>Year: ${p.year}</div>
            <div>Share:&nbsp; ${Number(p.y).toFixed(
              1
            )}% of backward linkages</div>
            <div>Value:&nbsp; ${money(p.value)}</div>
          </div>`;
      },
    },
    credits: { enabled: false },
    series: series.value,
  });
};

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);

onMounted(async () => {
  await loadSector();
  await loadData();
});
</script>

<style lang="scss" scoped></style>
