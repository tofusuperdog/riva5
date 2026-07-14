<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">{{ t("participation.valueAddedBreakdown") }}</div>
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
        <div
          id="chartPartRange01"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
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

      <!-- รายละเอียด (Descriptions) -->
      <div class="p-4 pt-4 w-full lg:w-[40%]" v-show="showDetail">
        <div class="space-y-5">
          <div v-for="item in descItems" :key="item.key" class="leading-snug">
            <div class="font-semibold" :style="{ color: item.color }">
              ({{ item.code }}) {{ item.title }}
            </div>
            <div class="fsub">{{ item.text }}</div>
          </div>
        </div>
      </div>
      <!-- /Descriptions -->
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted,
  watch,
  computed,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

/* ----------------------------- constants ----------------------------- */
const VAR_MAP = [
  {
    key: "Intermediate_directly_consumed",
    labelKey: "dvaIntermediate",
    color: "#26C6DA",
    code: "1.1",
  },
  {
    key: "Final_directly_consumed",
    labelKey: "dvaFinal",
    color: "#1E88E5",
    code: "1.2",
  },
  {
    key: "Forward_linkages2",
    labelKey: "dvaBack",
    color: "#FF8A65",
    code: "1.3",
  },
  {
    key: "Forward_linkages",
    labelKey: "dvaThird",
    color: "#EC407A",
    code: "1.4",
  },
  {
    key: "Backward_linkages",
    labelKey: "fva",
    color: "#26A69A",
    code: "1.5",
  },
  {
    key: "Double_counted_exports",
    labelKey: "doubleCounted",
    color: "#8E24AA",
    code: "1.6",
  },
];

/* ----------------------------- setup ----------------------------- */
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });
const $q = useQuasar();

const showDetail = ref($q.screen.gt.sm);
let chart = null; // Highcharts instance
const descItems = ref([]);
const isAvail = ref(true);

/* ----------------------------- reactive inputs ----------------------------- */
const exporting = computed(() => props.inputData?.exporting ?? null);
const importing = computed(() => props.inputData?.importing ?? null);
const sector = computed(() => props.inputData?.sector ?? null);
const yearStart = computed(() => Number(props.inputData?.yearStart) || null);
const yearEnd = computed(() => Number(props.inputData?.yearEnd) || null);

/* ----------------------------- helpers ----------------------------- */
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const toPct = (share) => Number(share || 0) * 100;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;
const fmtMil = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ${t("participation.million")}`;

const safeSectorName = computed(
  () => sector.value?.sectorShortName ?? t("participation.allSectors")
);
const lowerSector = computed(() => safeSectorName.value.toLowerCase());

const titleText = computed(() => {
  const exp = exporting.value?.name ?? t("participation.exporter");
  const imp = importing.value?.name ?? t("participation.partnerEconomy");
  return t("participation.productionYearsTitle", { exporting: exp, sector: safeSectorName.value, importing: imp });
});

function destroyChart() {
  if (chart) {
    try {
      chart.destroy();
    } catch (e) {
      // ignore
    }
    chart = null;
  }
}

/** rows -> { years, series } (point: {y, share, value, year}) */
function normalizeForChart(rows = []) {
  const years = [...new Set(rows.map((d) => Number(d.year)))].sort(
    (a, b) => a - b
  );

  const series = VAR_MAP.map((cfg) => ({
    name: t(`participation.${cfg.labelKey}`),
    color: cfg.color,
    data: years.map((y) => {
      const r = rows.find((x) => Number(x.year) === y && x.var === cfg.key);
      if (!r) return { y: 0, share: 0, value: 0, year: y };
      const sharePct = toPct(r.share);
      return {
        y: Number(sharePct.toFixed(2)),
        share: sharePct,
        value: Number(r.value || 0), // million
        year: y,
      };
    }),
  }));

  return { years, series };
}

async function upsertChart({ years, series }) {
  // เพราะ container อยู่หลัง v-if="isAvail" และ Highcharts ต้องการ DOM ที่พร้อม
  await nextTick();

  if (!isAvail.value) return;

  if (!chart) {
    chart = Highcharts.chart("chartPartRange01", {
      chart: { type: "column", backgroundColor: "#fff", height: 600 },
      title: {
        text: titleText.value,
        style: { fontSize: "24px", fontWeight: 600, color: "#333" },
      },

      caption: {
        text: t("participation.percentagesRounding"),
        align: "center",
        verticalAlign: "bottom",
        y: 10,
        style: {
          fontSize: "12px",
          color: "#666",
        },
        useHTML: false,
      },

      xAxis: { categories: years.map(String) },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: t("participation.percentGross") },
        labels: {
          formatter() {
            return this.value + "%";
          },
        },
      },
      legend: { align: "center", verticalAlign: "bottom" },
      tooltip: {
        useHTML: true,
        formatter() {
          const p = this.point;
          return `
            <b>${this.series.name}</b><br/>
            ${t("participation.year")}: ${p.year}<br/>
            ${t("participation.share")}: ${fmtPct(p.share)} ${t("participation.ofGross")}<br/>
            ${t("participation.value")}: ${fmtMil(p.value)}
          `;
        },
      },
      plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
      credits: { enabled: false },
      series,
    });
    return;
  }

  // update
  chart.setTitle({ text: titleText.value });
  while (chart.series.length) chart.series[0].remove(false);
  series.forEach((s) => chart.addSeries(s, false));
  chart.xAxis[0].setCategories(years.map(String), false);
  chart.redraw();
}

function buildDescriptions(rows = []) {
  if (!rows.length) {
    descItems.value = [];
    return;
  }

  const lastYear = rows.reduce(
    (m, r) => Math.max(m, Number(r.year)),
    -Infinity
  );
  const exp = exporting.value?.name ?? t("participation.exporter");
  const imp = importing.value?.name ?? t("participation.partnerEconomy");

  const shareOf = (key) => {
    const r = rows.find((x) => x.var === key && Number(x.year) === lastYear);
    return r ? toPct(r.share) : 0;
  };

  const mkText = (key, pct) => {
    const pctTxt = fmtPct(pct);
    const common = {
      exporting: exp,
      importing: imp,
      sector: lowerSector.value,
      year: lastYear,
      share: pctTxt,
    };
    switch (key) {
      case "Intermediate_directly_consumed": return t("participation.descIntermediate", common);
      case "Final_directly_consumed": return t("participation.descFinal", common);
      case "Forward_linkages2": return t("participation.descBack", common);
      case "Forward_linkages": return t("participation.descThird", common);
      case "Backward_linkages": return t("participation.descFva", common);
      case "Double_counted_exports": return t("participation.descDouble", common);
      default:
        return "";
    }
  };

  descItems.value = VAR_MAP.map((cfg) => {
    const pct = shareOf(cfg.key);
    return {
      key: cfg.key,
      code: cfg.code,
      title: t(`participation.${cfg.labelKey}`),
      color: cfg.color,
      text: mkText(cfg.key, pct),
    };
  });
}

/* ----------------------------- data flow ----------------------------- */
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !yearStart.value ||
    !yearEnd.value
  ) {
    isAvail.value = false;
    destroyChart();
    descItems.value = [];
    return;
  }

  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: sector.value?.sectorID ?? null,
    year: buildYearRange(yearStart.value, yearEnd.value),
  };

  try {
    const { data: rows } = await axios.post(
      `${serverData.value}/va/str_component.php`,
      JSON.stringify(payload)
    );

    // กัน response เก่าทับ response ใหม่
    if (myReq !== requestId) return;

    const checkTotal = (rows || []).filter((x) => Number(x.total_exports) != 0);
    if (checkTotal.length === 0) {
      isAvail.value = false;
      destroyChart();
      descItems.value = [];
      return;
    }

    isAvail.value = true;

    const normalized = normalizeForChart(rows);
    await upsertChart(normalized);
    buildDescriptions(rows);
  } catch (err) {
    console.error(err);
    isAvail.value = false;
    destroyChart();
    descItems.value = [];
  }
}

/* ----------------------------- watchers ----------------------------- */
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

// ✅ ไม่ใช้ immediate เพื่อกันยิงก่อน mount (และกันยิงซ้ำกับ onMounted)
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
  }
);

/* ----------------------------- lifecycle ----------------------------- */
onMounted(async () => {
  // ✅ โหลดครั้งแรกครั้งเดียวที่นี่
  await loadData();
});

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped lang="scss"></style>
