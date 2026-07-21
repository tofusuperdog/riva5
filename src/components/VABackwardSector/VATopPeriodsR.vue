<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">
      {{ t("backward.charts.topSourcePeriods") }}
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
      <!-- Chart -->
      <div
        class="w-full lg:w-[60%] flex justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSRange04"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>

      <!-- Toggle -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t("backward.charts.viewLess") : t("backward.charts.viewMore") }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <!-- Descriptions -->
      <div class="p-4 pt-4 w-full lg:w-[40%] fsub" v-show="showDetail">
        <div v-for="d in descCards" :key="d.key" class="mb-4">
          <div class="flex items-center gap-2">
            <img :src="d.flag" class="h-6 w-10" alt="" />
            <div class="text-lg font-semibold" :style="{ color: d.color }">
              {{ d.name }}
            </div>
          </div>
          <div class="pt-1">{{ d.text }}</div>
        </div>
      </div>
    </div>

    <!-- (Optional) breakdown dialog สามารถเพิ่มภายหลังได้ -->
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

/* inputs */
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const sector = ref(props.inputData.sector);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

const isLoading = ref(true);
const isAvail = ref(true);
const backTotal = ref([]);

/* colors (6 ตัวสุดท้ายคือ Others) */
const palette = [
  "#36CAD2",
  "#FAAC36",
  "#D04F7A",
  "#2E9588",
  "#A02B93",
  "#B0B0B0",
];

/* helpers */
const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
const pct1 = (n) => (Number(n || 0) * 100).toFixed(1);
const money1 = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ${t("backward.charts.million")}`;

function buildTwoPeriods(startYear, endYear) {
  startYear = Number(startYear);
  endYear = Number(endYear);

  if (endYear <= startYear) {
    const period = { label: String(startYear), y1: startYear, y2: startYear };
    return [period, { ...period }];
  }

  const makeLbl = (a, b) => (a === b ? String(a) : `${a}-${b}`);
  const gap = endYear - startYear;

  // Two adjacent years are two individual periods for comparison.
  if (gap === 1) {
    return [
      { y1: startYear, y2: startYear, label: String(startYear) },
      { y1: endYear, y2: endYear, label: String(endYear) },
    ];
  }

  // gap >= 2: แบ่งเป็น 2 ช่วงโดยให้ "ปีตรงกลาง" ซ้ำ (overlap)
  // ตัวอย่าง 2015..2019 => mid = 2017 => 2015-2017 และ 2017-2019
  const mid = Math.floor((startYear + endYear) / 2);

  const p1 = { y1: startYear, y2: mid };
  const p2 = { y1: mid, y2: endYear };

  return [
    { ...p1, label: makeLbl(p1.y1, p1.y2) },
    { ...p2, label: makeLbl(p2.y1, p2.y2) },
  ];
}

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

const toB = (m) => Number((Number(m) / 1000).toFixed(1)); // million -> billion (1 dec)

function formatMainValue(vMillion) {
  const v = Number(vMillion || 0);
  if (v < 1000) return `${v.toFixed(1)} ${t("backward.charts.million")}`;
  return `${toB(v).toFixed(1)} ${t("backward.charts.billion")}`;
}

function summarize(rows, p) {
  const inP = rows.filter((r) => +r.year >= p.y1 && +r.year <= p.y2);
  const shareSum = inP.reduce((a, b) => a + (parseFloat(b.share) || 0), 0);
  const valueSum = inP.reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
  const years = Math.max(1, p.y2 - p.y1 + 1);
  return {
    sharePct: +((shareSum / years) * 100).toFixed(1),
    valueSum: +valueSum.toFixed(1),
  };
}

/* state */
const periods = ref([]);
const series = ref([]); // Highcharts series
const descCards = ref([]); // descriptions (with flags)

/* ===== โหลดและประกอบข้อมูล ===== */
async function loadData() {
  isLoading.value = true;
  periods.value = buildTwoPeriods(yearStart.value, yearEnd.value);

  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: range(yearStart.value, yearEnd.value),
  };

  // ดึงทั้งหมดไว้ใน rawAll (มี RoW ด้วย)
  let { data: rawAll } = await axios.post(
    `${serverData.value}va/back_source.php`,
    JSON.stringify(payload)
  );

  rawAll = rawAll.filter((x) => Number(x.value) > 0);

  if (rawAll.length === 0) {
    isAvail.value = false;
    isLoading.value = false;
    return;
  } else {
    isAvail.value = true;
  }

  // ===== เลือก Top 5 จาก “ประเทศจริง ๆ” (ไม่รวม RoW) ตาม value ของช่วง ‘หลัง’
  const lastP = periods.value[1];

  const poolForRanking = (rawAll || []).filter(
    (r) => r.source_country !== "RoW"
  );

  // group เพื่อใช้สรุป
  const groupByIso = (rows) => {
    const m = {};
    for (const r of rows) {
      const k = r.source_country;
      (m[k] ??= { iso: k, name: r.economic || k, rows: [] }).rows.push(r);
    }
    return m;
  };

  const groupedForRanking = groupByIso(poolForRanking);

  const ranked = Object.values(groupedForRanking)
    .map((cty) => ({ ...cty, last: summarize(cty.rows, lastP) }))
    .sort((a, b) => b.last.valueSum - a.last.valueSum);

  const top5 = ranked.slice(0, 5);
  const topISO = top5.map((d) => d.iso);

  // ===== เตรียมซีรีส์ 5 ประเทศ (ใช้ข้อมูลที่ไม่มี RoW)
  series.value = top5.map((cty, i) => {
    const a = summarize(cty.rows, periods.value[0]);
    const b = summarize(cty.rows, periods.value[1]);
    return {
      type: "column",
      name: translateEconomy({ iso: cty.iso, name: cty.name }, locale.value),
      color: palette[i],
      data: [
        { y: a.sharePct, value: a.valueSum, period: periods.value[0].label },
        { y: b.sharePct, value: b.valueSum, period: periods.value[1].label },
      ],
    };
  });

  // ===== Others = ทุกประเทศที่ “ไม่ใช่” Top 5 + รวม RoW ด้วย
  const othersRows = (rawAll || []).filter(
    (r) => !topISO.includes(r.source_country)
  );
  const othersA = summarize(othersRows, periods.value[0]);
  const othersB = summarize(othersRows, periods.value[1]);

  series.value.push({
    type: "column",
    name: t("backward.charts.others"),
    color: palette[5],
    data: [
      {
        y: othersA.sharePct,
        value: othersA.valueSum,
        period: periods.value[0].label,
      },
      {
        y: othersB.sharePct,
        value: othersB.valueSum,
        period: periods.value[1].label,
      },
    ],
  });

  //คำนวน Backward Total
  let res2 = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload)
  );
  let backTotalList = res2.data
    .filter((d) => d.var === "Backward_linkages")
    .map((d) => Number(d.value));

  backTotal.value = calBackTotal(backTotalList);

  // ===== การ์ดคำอธิบาย (เฉพาะ Top 5 เท่านั้น — ไม่รวม Others)
  descCards.value = top5.map((cty, i) => {
    const prev = summarize(cty.rows, periods.value[0]).sharePct;
    const curr = summarize(cty.rows, periods.value[1]).sharePct;
    const diff = +(curr - prev).toFixed(1);
    const change = diff > 0
      ? t("backward.charts.upBy", { value: Math.abs(diff).toFixed(1) })
      : diff < 0
        ? t("backward.charts.downBy", { value: Math.abs(diff).toFixed(1) })
        : t("backward.charts.unchanged");
    const translatedName = translateEconomy({ iso: cty.iso, name: cty.name }, locale.value);
    return {
      key: cty.iso,
      name: translatedName,
      flag: `/images/flags/${cty.iso}.png`,
      color: palette[i],
      text: t("backward.charts.topPeriodDescription", { current: periods.value[1].label, exporting: exporting.value.name, source: translatedName, share: curr.toFixed(1), change, previous: periods.value[0].label }),
    };
  });
  isLoading.value = false;
  drawChart();
}

/* ===== วาดกราฟ ===== */
function drawChart() {
  const categories = periods.value.map((p) => p.label);
  const subTitle = t("backward.charts.totalPeriods", { firstValue: formatMainValue(backTotal.value[0]), firstPeriod: categories[0], secondValue: formatMainValue(backTotal.value[1]), secondPeriod: categories[1] });

  Highcharts.chart("chartBSRange04", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: t("backward.charts.periodTitle", { exporting: exporting.value.name, sector: sector.value.sectorShortName, importing: importing.value.name }),
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    subtitle: {
      text: subTitle,
      style: { fontSize: "14px", color: "#666" },
    },

    xAxis: { categories, tickLength: 0 },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: t("backward.charts.percentBackward") },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>${t("backward.charts.year")}: ${p.period}</div>
            <div>${t("backward.charts.share")}: ${Number(p.y).toFixed(1)}% ${t("backward.charts.ofBackward")}</div>
            <div>${t("backward.charts.value")}: ${money1(p.value)}</div>
          </div>`;
      },
    },
    credits: { enabled: false },
    series: series.value,
  });
}

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
