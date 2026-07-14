<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("participation.grossAndValueTradeBalance") }}
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
              {{ t("participation.noTrade") }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5 text-center">
              {{ t("backward.charts.tryDifferent") }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-if="isAvail">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex items-center justify-center pt-4">
        <div id="chartPartRange03" class="w-full max-w-[600px]"></div>
      </div>

      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t("participation.viewLess") : t("participation.viewMore") }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <!-- รายละเอียด -->
      <div class="p-4 pt-4 w-full lg:w-[40%]" v-show="showDetail">
        <div class="font-semibold text-[#1E88E5]">{{ t("participation.grossTradeBalance") }}</div>
        <div class="fsub">{{ desGTB }}</div>

        <div class="pt-4 font-semibold text-[#2E7D6E]">
          {{ t("participation.valueAddedTradeBalance") }}
        </div>
        <div class="fsub">{{ desVATB }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

/* ----------------------------- Setup ----------------------------- */
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });
const $q = useQuasar();

const showDetail = ref($q.screen.gt.sm);

/* ---------------------- Reactive inputs (props) ------------------- */
const exporting = computed(() => props.inputData?.exporting ?? null);
const importing = computed(() => props.inputData?.importing ?? null);
const sector = computed(() => props.inputData?.sector ?? null);
const yearStart = computed(() => Number(props.inputData?.yearStart) || null);
const yearEnd = computed(() => Number(props.inputData?.yearEnd) || null);

/* ----------------------------- State ------------------------------ */
const rowsRaw = ref([]); // ข้อมูลดิบจาก API
let chart = null; // Highcharts instance
const desGTB = ref("");
const desVATB = ref("");
const isAvail = ref(true);

/* ---------------------------- Helpers ----------------------------- */
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const pct1 = (x) => Number((Number(x) || 0) * 100); // 0-1 -> %
const r1 = (n) => Number((n ?? 0).toFixed(1)); // 1 decimal

function destroyChart() {
  if (chart) {
    try {
      chart.destroy();
    } catch (e) {}
    chart = null;
  }
}

// หา record ตามปี + key
const findVal = (rows, y, key) =>
  Number(
    rows.find((r) => String(r.year) === String(y) && r.variable === key)
      ?.value ?? 0,
  );

/* --------------------- Derived (from rowsRaw) --------------------- */
const dataGraph = computed(() => {
  if (!rowsRaw.value?.length || !yearStart.value || !yearEnd.value) return [];
  const years = buildYearRange(yearStart.value, yearEnd.value);

  return years.map((y) => ({
    year: y,
    va_balance: r1(
      pct1(findVal(rowsRaw.value, y, "value_added_trade_balance")),
    ),
    gross_balance: r1(pct1(findVal(rowsRaw.value, y, "gross_trade_balance"))),
  }));
});

const latest = computed(() => dataGraph.value.at(-1) || null);

/* ----------------------- Text format functions -------------------- */
function formatGrossBalanceText(year, value, reporter, partner) {
  const absVal = Math.abs(Number(value) || 0).toFixed(1);

  // NOTE: โครงประโยคเดิมของคุณใช้ "partner" เป็น subject
  if (value < 0) {
    return t("participation.grossImportsExceeded", { year, partner, reporter, share: absVal });
  } else if (value > 0) {
    return t("participation.grossExportsExceeded", { year, partner, reporter, share: absVal });
  } else {
    return t("participation.grossEqual", { year, partner, reporter });
  }
}

function formatValueAddedBalanceText(year, value, reporter, partner) {
  const absVal = Math.abs(Number(value) || 0).toFixed(1);

  // NOTE: แก้ข้อความเดิมที่ hardcode "Australia" -> ใช้ reporter/partner ให้ถูก
  // และรักษา pattern คล้ายเดิมที่สุด
  if (value > 0) {
    return t("participation.vaHigher", { year, partner, reporter, share: absVal });
  } else if (value < 0) {
    return t("participation.vaLower", { year, partner, reporter, share: absVal });
  } else {
    return t("participation.vaEqual", { year, partner, reporter });
  }
}

/* ----------------------------- API ------------------------------- */
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  // guard
  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !yearStart.value ||
    !yearEnd.value
  ) {
    isAvail.value = false;
    rowsRaw.value = [];
    desGTB.value = "";
    desVATB.value = "";
    destroyChart();
    return;
  }

  const payload = {
    exp_country: importing.value.iso,
    imp_country: exporting.value.iso,
    exp_sector: sector.value?.sectorID ?? null,
    year: buildYearRange(yearStart.value, yearEnd.value),
  };

  try {
    const { data } = await axios.post(
      `${serverData.value}/va/str_gross_value_added.php`,
      JSON.stringify(payload),
    );

    // race guard
    if (myReq !== requestId) return;

    const arr = Array.isArray(data) ? data : [];
    if (arr.filter((x) => Number(x.value) !== 0).length === 0) {
      isAvail.value = false;
      rowsRaw.value = [];
      desGTB.value = "";
      desVATB.value = "";
      destroyChart();
      return;
    }

    isAvail.value = true;
    rowsRaw.value = arr;

    // descriptions (latest year)
    if (latest.value) {
      desGTB.value = formatGrossBalanceText(
        latest.value.year,
        latest.value.gross_balance,
        importing.value.name,
        exporting.value.name,
      );

      desVATB.value = formatValueAddedBalanceText(
        latest.value.year,
        latest.value.va_balance,
        importing.value.name,
        exporting.value.name,
      );
    } else {
      desGTB.value = "";
      desVATB.value = "";
    }

    await drawOrUpdateChart();
  } catch (err) {
    console.error(err);
    isAvail.value = false;
    rowsRaw.value = [];
    desGTB.value = "";
    desVATB.value = "";
    destroyChart();
  }
}

/* --------------------------- Charting ---------------------------- */
async function drawOrUpdateChart() {
  await nextTick(); // container อยู่หลัง v-if="isAvail"
  if (!isAvail.value) return;

  const cats = dataGraph.value.map((d) => String(d.year));
  const vaSeries = dataGraph.value.map((d) => d.va_balance);
  const grossSeries = dataGraph.value.map((d) => d.gross_balance);

  const title = t("participation.balanceTrendTitle", {
    exporting: exporting.value.name,
    importing: importing.value.name,
    sector: String(sector.value?.sectorShortName ?? "").toLowerCase(),
  });

  const options = {
    chart: { type: "spline", backgroundColor: "#fff" },
    title: {
      text: title,
      align: "left",
      margin: 20,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: { categories: cats, tickLength: 0, lineColor: "#e5e5e5" },
    yAxis: {
      title: { text: t("participation.percentBilateral") },

      gridLineColor: "#eee",
      labels: {
        formatter() {
          return this.value;
        },
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { color: "#444" },
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,
      backgroundColor: "#fff",
      shadow: true,
      padding: 8,
      formatter() {
        return `
          <div>
            <div style="font-weight:700">${this.series.name}</div>
            <div>${t("participation.year")}:&nbsp;${this.category ?? this.x}</div>
            <div>${t("participation.share")}:&nbsp; ${Number(this.y).toFixed(
              1,
            )}% ${t("participation.ofBilateral")}</div>
          </div>`;
      },
    },
    plotOptions: {
      series: {
        marker: { enabled: true, symbol: "square", radius: 4, lineWidth: 0 },
        lineWidth: 3,
        states: { hover: { lineWidth: 3 } },
      },
    },
    credits: { enabled: false },
    series: [
      { name: t("participation.valueAddedTradeBalance"), data: vaSeries, color: "#2E7D6E" },
      { name: t("participation.grossTradeBalance"), data: grossSeries, color: "#1E88E5" },
    ],
  };

  if (chart) {
    chart.setTitle(options.title);
    chart.xAxis[0].setCategories(cats, false);

    while (chart.series.length) chart.series[0].remove(false);
    chart.addSeries(options.series[0], false);
    chart.addSeries(options.series[1], false);

    chart.redraw();
  } else {
    chart = Highcharts.chart("chartPartRange03", options);
  }
}

/* --------------------------- Watchers ---------------------------- */
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v),
);

// ✅ Watch เฉพาะ key ที่จำเป็น + immediate โหลดครั้งแรก (และไม่มี onMounted แล้ว)
watch(
  () => [
    exporting.value?.iso,
    importing.value?.iso,
    sector.value?.sectorID,
    yearStart.value,
    yearEnd.value,
  ],
  async () => {
    await loadData();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped></style>
