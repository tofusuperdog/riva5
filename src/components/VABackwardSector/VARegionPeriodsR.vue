<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">{{ t("backward.charts.sourceRegionPeriods") }}</div>
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
              {{ t("backward.charts.noTrade") }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5 text-center">
              {{ t("backward.charts.tryDifferent") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="w-full min-h-[400px] flex items-center justify-center"
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
              {{ t("backward.charts.preparing") }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              {{ t("backward.charts.rendering") }}
            </div>
            <div class="text-xs text-gray-500 mt-3">
              {{ t("backward.charts.patience") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading && isAvail">
      <!-- chart -->
      <div
        class="w-full lg:w-[60%] flex justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSRange02"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>

      <!-- detail cards -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t("backward.charts.viewLess") : t("backward.charts.viewMore") }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <div class="p-4 pt-4 w-full lg:w-[40%] fsub" v-show="showDetail">
        <div v-for="r in regionCards" :key="r.key" class="mb-4">
          <div class="flex items-center gap-2">
            <img :src="r.icon" />
            <div :style="{ color: r.color }" class="text-lg font-semibold">
              {{ r.title }}
            </div>
          </div>
          <div class="cursor-pointer text-[#0672CB]" @click="openBreakdown(r)">
            <u>{{ t("backward.charts.breakdown") }}</u>
          </div>
          <div>{{ r.desc }}</div>
        </div>
      </div>
    </div>

    <!-- breakdown dialog -->
    <q-dialog v-model="dlg.open" @show="drawBreakdown">
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div class="text-center text-[22px] font-semibold fblack">
            {{ dlg.title }}
          </div>
          <div
            id="chartBSRange02-breakdown"
            style="height: 420px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('backward.charts.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { locale, t } = useI18n({ useScope: "global" });
const $q = useQuasar();

const showDetail = ref($q.screen.gt.sm);
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

/* ===== inputs ===== */
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const sector = ref(props.inputData.sector);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

const isLoading = ref(true);
const isAvail = ref(true);

const backTotal = ref([]);

/* ===== series (region) สำหรับกราฟหลัก ===== */
const seriesData = ref([]);
const dataBreakdown = ref([]);

/* ===== card meta ===== */
const regionCards = ref([
  {
    id: 0,
    key: "Asia-Pacific",
    title: t("backward.charts.regionAsia"),
    color: "#1E88E5",
    icon: "images/asia.svg",
    desc: "",
  },
  {
    id: 1,
    key: "Europe",
    title: t("backward.charts.regionEurope"),
    color: "#FB8C00",
    icon: "images/europe.svg",
    desc: "",
  },
  {
    id: 2,
    key: "North America",
    title: t("backward.charts.regionNorthAmerica"),
    color: "#2E7D32",
    icon: "images/northamerica.svg",
    desc: "",
  },
  {
    id: 3,
    key: "Latin America",
    title: t("backward.charts.regionLatinAmerica"),
    color: "#8E24AA",
    icon: "images/latinamerica.svg",
    desc: "",
  },
  {
    id: 4,
    key: "Rest of the World",
    title: t("backward.charts.regionRestWorld"),
    color: "#EC69B3",
    icon: "images/row.svg",
    desc: "",
  },
]);

const regionList = [
  "Asia-Pacific",
  "Europe",
  "North America",
  "Latin America",
  "Rest of the World",
];
const regionLabel = {
  "Asia-Pacific": t("backward.charts.regionAsia"),
  Europe: t("backward.charts.regionEurope"),
  "North America": t("backward.charts.regionNorthAmerica"),
  "Latin America": t("backward.charts.regionLatinAmerica"),
  "Rest of the World": t("backward.charts.regionRestWorld"),
};

const colors = ["#1F77B4", "#FF813D", "#2CA02C", "#9467BD", "#E377C2"];

/* ===== breakdown dialog (2 แท่งเช่นกัน) ===== */
const dlg = ref({ open: false, title: "", id: "" });

function openBreakdown(card) {
  dlg.value = { open: true, title: card.title, id: card.id };
}

//**** Data for calculation */
const yearPeriods = ref([]);

// สร้าง year list
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

//สร้าง Share Number
const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

// สร้าง year list ที่แบ่งเป็นสองช่วง
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

//คำนวน Back Total
const calBackTotal = (arr = []) => {
  const len = arr.length;
  if (len === 0) return [0, 0];
  if (len === 2) return [arr[0], arr[1]];

  const mid = Math.floor(len / 2);
  const sum = (xs) => xs.reduce((a, b) => a + b, 0);

  // ถ้าเป็นคี่ ให้ฝั่งซ้ายกินถึง mid (รวมตัวกลาง) ส่วนขวาเริ่มที่ mid (รวมตัวกลาง)
  const leftEnd = len % 2 ? mid + 1 : mid;

  const left = sum(arr.slice(0, leftEnd));
  const right = sum(arr.slice(mid));

  return [left, right];
};

//สร้างข้อมูลสำหรับกราฟ
const genDataGraph = (i, rawDataSet1, rawDataSet2) => {
  let rName = regionList[i];
  let dataSet1 = rawDataSet1.filter((d) => d.area == rName);
  let sumY = Number(
    dataSet1.reduce((a, b) => a + Number(b.value), 0).toFixed(1)
  );
  let shareY = shareNum(sumY / backTotal.value[0]);

  let dataSet2 = rawDataSet2.filter((d) => d.area == rName);
  let sumY2 = Number(
    dataSet2.reduce((a, b) => a + Number(b.value), 0).toFixed(1)
  );
  let shareY2 = shareNum(sumY2 / backTotal.value[1]);
  return [
    { y: shareY, value: sumY, year: yearPeriods.value[0].label1 },
    { y: shareY2, value: sumY2, year: yearPeriods.value[0].label2 },
  ];
};

//รวมข้อมูลรายประเทศ
const sumDataByEco = (data1, data2) => {
  // helper: สรุปผลตาม key (ประเทศ/sector) และรวม value
  const summarize = (arr) =>
    Object.values(
      arr.reduce((acc, curr) => {
        const iso = curr.source_country; // รหัสประเทศ (ถ้าต้องใช้)
        const eco = curr.economic; // ชื่อที่จะใช้เป็น "name"
        const val = Number(curr.value) || 0;

        if (!acc[eco]) acc[eco] = { iso, eco, totalValue: 0 };
        acc[eco].totalValue += val;
        return acc;
      }, {})
    );

  let rawSumData1 = summarize(data1);
  let rawSumData2 = summarize(data2);

  const dataFinal1 = rawSumData1.map((d) => {
    // เดิมใช้ d.name -> ไม่มี ต้องใช้ d.eco
    const match = rawSumData2.filter((x) => x.eco === d.eco);
    const datay2 =
      match.length === 0
        ? { y: 0, value: 0, year: yearPeriods.value[0].label2 }
        : {
            y: shareNum(match[0].totalValue / backTotal.value[1]),
            value: match[0].totalValue,
            year: yearPeriods.value[0].label2,
          };

    return {
      name: translateEconomy({ iso: d.iso, name: d.eco }, locale.value), // ชื่อ series
      data: [
        {
          y: shareNum(d.totalValue / backTotal.value[0]),
          value: d.totalValue,
          year: yearPeriods.value[0].label1,
        },
        datay2,
      ],
    };
  });

  return dataFinal1;
};

const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)

function formatMainValue(vMillion) {
  const v = Number(vMillion || 0);
  if (v < 1000) return `${v.toFixed(1)} ${t("backward.charts.million")}`;
  return `${toB(v).toFixed(1)} ${t("backward.charts.billion")}`;
}

const loadData = async () => {
  isLoading.value = true;
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: buildYearRange(yearStart.value, yearEnd.value),
  };

  let res = await axios.post(
    `${serverData.value}va/back_source.php`,
    JSON.stringify(payload)
  );

  let raw = res.data.filter((x) => Number(x.value) > 0);

  if (raw.length === 0) {
    isAvail.value = false;
    isLoading.value = false;
    return;
  } else {
    isAvail.value = true;
  }

  //แบ่งปีเป็น 2 ช่วง
  yearPeriods.value = build2Range(yearStart.value, yearEnd.value);

  //เตรียมข้อมูลดิบเป็นสองช่วง
  let rawDataSet1 = res.data.filter(
    (d) =>
      Number(d.year) <=
        yearPeriods.value[0].y1[yearPeriods.value[0].y1.length - 1] &&
      d.value != "0.00"
  );
  let rawDataSet2 = res.data.filter(
    (d) => Number(d.year) >= yearPeriods.value[0].y2[0] && d.value != "0.00"
  );

  //คำนวน Backward Total
  let res2 = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload)
  );
  let backTotalList = res2.data
    .filter((d) => d.var === "Backward_linkages")
    .map((d) => Number(d.value));

  backTotal.value = calBackTotal(backTotalList);

  seriesData.value = [];
  regionList.forEach((d, i) => {
    let dataInput = {
      name: regionLabel[d],
      color: colors[i],
      data: genDataGraph(i, rawDataSet1, rawDataSet2),
    };
    seriesData.value.push(dataInput);
  });

  //เตรียมข้อมูลสำหรับกราฟ Breakdown

  dataBreakdown.value = [];
  regionList.forEach((d, i) => {
    let inputData1 = rawDataSet1.filter((d1) => d1.area == d);
    let inputData2 = rawDataSet2.filter((d1) => d1.area == d);
    let sumTemp = sumDataByEco(inputData1, inputData2);
    dataBreakdown.value.push(sumTemp);
    sumTemp.sort((a, b) => b.data[1].y - a.data[1].y);

    let lastY = seriesData.value[i].data[1].y;
    let firstY = seriesData.value[i].data[0].y;

    let textdiff = t("backward.charts.unchanged");
    if (lastY < firstY) {
      textdiff = t("backward.charts.downBy", { value: Math.abs(lastY - firstY).toFixed(1) });
    } else if (lastY > firstY) {
      textdiff = t("backward.charts.upBy", { value: Math.abs(lastY - firstY).toFixed(1) });
    }

    let textMax = "";
    if (i != 4) {
      textMax = t("backward.charts.regionalTop", { source: sumTemp[0].name, share: sumTemp[0].data[1].y, year: yearEnd.value });
    }

    regionCards.value[i].desc = `${t("backward.charts.regionPeriodDescription", { current: yearPeriods.value[0].label2, share: lastY, exporting: exporting.value.name, sector: sector.value.sectorShortName, region: regionCards.value[i].title, change: textdiff, previous: yearPeriods.value[0].label1 })} ${textMax}`;
  });

  isLoading.value = false;
  drawChart();
};

const fmt = {
  pct: (n) => Highcharts.numberFormat(n, 1) + "%",
  mil: (n) => "$" + Highcharts.numberFormat(n, 1) + " " + t("backward.charts.million"),
};

const drawChart = () => {
  let series = seriesData.value;
  let categories = [yearPeriods.value[0].label1, yearPeriods.value[0].label2];

  // ช่วย format ตัวเลข

  const title = t("backward.charts.regionsTitle", { exporting: exporting.value.name, sector: sector.value.sectorShortName, importing: importing.value.name });

  const subTitle = t("backward.charts.totalPeriods", { firstValue: formatMainValue(backTotal.value[0]), firstPeriod: yearPeriods.value[0].label1, secondValue: formatMainValue(backTotal.value[1]), secondPeriod: yearPeriods.value[0].label2 });
  Highcharts.chart(chartBSRange02, {
    chart: { type: "column", spacing: [16, 24, 16, 24] },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    subtitle: {
      text: subTitle,
      style: { fontSize: "14px", color: "#666" },
    },
    xAxis: {
      categories,
      tickWidth: 0,
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: t("backward.charts.percentBackward") },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineDashStyle: "ShortDot",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    plotOptions: {
      column: {
        stacking: "percent",
        borderWidth: 0,
        pointPadding: 0,
        groupPadding: 0.08,
      },
      series: {
        dataLabels: { enabled: false },
        states: { inactive: { opacity: 0.6 } },
      },
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      formatter: function () {
        // this.point, this.series, this.x (category)
        const p = this.point;
        return `
          <div >
            <b>${this.series.name}</b><br/>
            <span>${t("backward.charts.year")}: </span>${p.year || this.x}<br/>
            <span>${t("backward.charts.share")}: </span>${fmt.pct(p.y)} ${t("backward.charts.ofBackward")}<br/>
            <span>${t("backward.charts.value")}: </span>${fmt.mil(p.value)}
          </div>
        `;
      },
    },
    series,
    credits: { enabled: false },
  });
};

const drawBreakdown = () => {
  let categories = [yearPeriods.value[0].label1, yearPeriods.value[0].label2];

  let seires = dataBreakdown.value[dlg.value.id];
  Highcharts.chart("chartBSRange02-breakdown", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: { text: null },
    xAxis: { categories, tickLength: 0 },
    yAxis: {
      min: 0,
      title: { text: t("backward.charts.percentBackward") },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      maxHeight: 120,
      navigation: { enabled: true, arrowSize: 12 },
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      formatter: function () {
        // this.point, this.series, this.x (category)
        const p = this.point;
        return `
          <div >
            <b>${this.series.name}</b><br/>
            <span>${t("backward.charts.year")}: </span>${p.year || this.x}<br/>
            <span>${t("backward.charts.share")}: </span>${fmt.pct(p.y)} ${t("backward.charts.ofBackward")}<br/>
            <span>${t("backward.charts.value")}: </span>${fmt.mil(p.value)}

          </div>
        `;
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    credits: { enabled: false },
    series: seires,
  });
};

onMounted(loadData);
</script>

<style scoped>
.fsub {
  color: #666;
}
.fblack {
  color: #222;
}
</style>
