<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("participation.acrossYears") }}
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
        <div
          id="chartPartRange02"
          class="w-full max-w-[600px] min-h-[420px]"
        ></div>
      </div>

      <!-- ปุ่ม View more/less (มือถือ) -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t("participation.viewLess") : t("participation.viewMore") }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <!-- คำอธิบาย -->
      <div class="p-4 pt-4 w-full lg:w-[40%]" v-show="showDetail">
        <!-- GVC-related -->
        <div class="mb-6">
          <div class="font-semibold text-[#56353A]">
            {{ t("participation.gvcRelated") }}
          </div>
          <div
            class="underline cursor-pointer text-[#0672CB] mb-2 inline-block"
            @click="gvcDialog = true"
          >
            {{ t("participation.breakdown") }}
          </div>
          <div class="fsub">{{ t("participation.gvcSummary", { year: latestYear, share: gvcTotalPct.toFixed(1), exporting: exporting?.name, importing: importing?.name }) }}</div>
          <ul class="list-disc ml-6 mt-1 fsub">
            <li>{{ t("participation.gvcForward", { share: forwardPct1.toFixed(1), exporting: exporting?.name, importing: importing?.name }) }}</li>
            <li>{{ t("participation.gvcReturned", { share: forwardPct2.toFixed(1), exporting: exporting?.name, importing: importing?.name }) }}</li>
            <li>{{ t("participation.gvcFva", { share: fvaPct.toFixed(1), exporting: exporting?.name, importing: importing?.name }) }}</li>
            <li>{{ t("participation.gvcDouble", { share: doublePct.toFixed(1) }) }}</li>
          </ul>
        </div>

        <!-- Direct consumption -->
        <div>
          <div class="font-semibold text-[#e052b0]">
            {{ t("participation.directConsumption") }}
          </div>
          <div
            class="underline cursor-pointer text-[#0672CB] mb-2 inline-block"
            @click="directDialog = true"
          >
            {{ t("participation.breakdown") }}
          </div>
          <div class="fsub">{{ t("participation.directSummary", { year: latestYear, share: directTotalPct.toFixed(1), exporting: exporting?.name, importing: importing?.name }) }}</div>
          <ul class="list-disc ml-6 mt-1 fsub">
            <li>{{ t("participation.intermediateExports", { share: interPct.toFixed(1) }) }}</li>
            <li>{{ t("participation.finalExports", { share: finalPct.toFixed(1) }) }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- GVC dialog -->
    <q-dialog v-model="gvcDialog" @show="drawGvcDialog" @hide="destroyGvc">
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div class="text-center text-[18px] font-semibold fblack">
            {{ t("participation.gvcRelated") }}
          </div>
          <div
            id="chartPartRange02-gvc"
            style="height: 380px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('participation.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Direct dialog -->
    <q-dialog
      v-model="directDialog"
      @show="drawDirectDialog"
      @hide="destroyDirect"
    >
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div class="text-center text-[18px] font-semibold fblack">
            {{ t("participation.directConsumption") }}
          </div>
          <div
            id="chartPartRange02-direct"
            style="height: 380px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('participation.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";

/* ----------------------------- props / server ----------------------------- */
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });
const $q = useQuasar();

/* ----------------------------- UI states --------------------------------- */
const showDetail = ref($q.screen.gt.sm);
const gvcDialog = ref(false);
const directDialog = ref(false);
const isAvail = ref(true);

/* ----------------------------- inputs (reactive) ------------------------- */
const exporting = computed(() => props.inputData?.exporting ?? null);
const importing = computed(() => props.inputData?.importing ?? null);
const sector = computed(() => props.inputData?.sector ?? null);
const yearStart = computed(() => Number(props.inputData?.yearStart) || null);
const yearEnd = computed(() => Number(props.inputData?.yearEnd) || null);

/* ----------------------------- dataset & charts -------------------------- */
let mainChart = null;
let gvcChart = null;
let directChart = null;

const years = ref([]);
const dataByYear = ref({}); // { 2020: { share:{...}, value:{...} } }

/* ----------------------------- helpers ---------------------------------- */
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const pct = (x) => (Number(x) || 0) * 100;
const r1 = (n) => Number((n ?? 0).toFixed(1));
const money = (n) =>
  `$${Number(n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} ${t("participation.million")}`;

/* Tooltip (ใช้ร่วมทุกกราฟใน dialog) */
const dialogTooltip = function () {
  const p = this.point;
  return `
    <div style="min-width:220px">
      <div style="font-weight:700">${this.series.name}</div>
      <div>${t("participation.year")}: ${p.year}</div>
      <div>${t("participation.share")}:&nbsp; ${Number(p.y ?? 0).toFixed(1)}% ${t("participation.ofGross")}</div>
      <div>${t("participation.value")}:&nbsp; ${money(p.value)}</div>
    </div>`;
};

/* ----------------------------- derived for description ------------------- */
const latestYear = computed(() =>
  years.value.length ? Math.max(...years.value) : null
);

const safeShare = (key) =>
  latestYear.value ? dataByYear.value[latestYear.value]?.share?.[key] ?? 0 : 0;

const forwardPct1 = computed(() => r1(pct(safeShare("forward"))));
const forwardPct2 = computed(() => r1(pct(safeShare("forward2"))));
const fvaPct = computed(() => r1(pct(safeShare("backward"))));
const doublePct = computed(() => r1(pct(safeShare("double"))));
const interPct = computed(() => r1(pct(safeShare("intermediate"))));
const finalPct = computed(() => r1(pct(safeShare("final"))));

const gvcTotalPct = computed(() =>
  r1(forwardPct1.value + forwardPct2.value + fvaPct.value + doublePct.value)
);
const directTotalPct = computed(() => r1(interPct.value + finalPct.value));

/* ----------------------------- chart destroy helpers --------------------- */
function destroyMain() {
  if (mainChart) {
    try {
      mainChart.destroy();
    } catch (e) {}
    mainChart = null;
  }
}
function destroyGvc() {
  if (gvcChart) {
    try {
      gvcChart.destroy();
    } catch (e) {}
    gvcChart = null;
  }
}
function destroyDirect() {
  if (directChart) {
    try {
      directChart.destroy();
    } catch (e) {}
    directChart = null;
  }
}
function destroyAllCharts() {
  destroyMain();
  destroyGvc();
  destroyDirect();
}

/* ----------------------------- data loading ------------------------------ */
let requestId = 0;

async function loadData() {
  const myReq = ++requestId;

  // guard: input ยังไม่พร้อม => ไม่ต้องยิง API
  if (
    !exporting.value?.iso ||
    !importing.value?.iso ||
    !yearStart.value ||
    !yearEnd.value
  ) {
    isAvail.value = false;
    years.value = [];
    dataByYear.value = {};
    destroyAllCharts();
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

    // กัน request เก่าทับใหม่
    if (myReq !== requestId) return;

    const checkTotal = (rows || []).filter((x) => Number(x.total_exports) != 0);
    if (checkTotal.length === 0) {
      isAvail.value = false;
      years.value = [];
      dataByYear.value = {};
      destroyAllCharts();
      return;
    }

    isAvail.value = true;

    // group rows -> { year: { share:{}, value:{} } }
    const store = {};
    const yset = new Set();

    (rows || []).forEach((r) => {
      const y = Number(r.year);
      yset.add(y);

      store[y] ??= {
        share: {
          forward: 0,
          forward2: 0,
          backward: 0,
          double: 0,
          intermediate: 0,
          final: 0,
        },
        value: {
          forward: 0,
          forward2: 0,
          backward: 0,
          double: 0,
          intermediate: 0,
          final: 0,
        },
      };

      const sh = Number(r.share) || 0; // 0-1
      const val = Number(r.value) || 0; // million

      const map = {
        Forward_linkages: "forward",
        Forward_linkages2: "forward2",
        Backward_linkages: "backward",
        Double_counted_exports: "double",
        Intermediate_directly_consumed: "intermediate",
        Final_directly_consumed: "final",
      };

      const key = map[r.var];
      if (key) {
        store[y].share[key] += sh;
        store[y].value[key] += val;
      }
    });

    years.value = Array.from(yset).sort((a, b) => a - b);
    dataByYear.value = store;

    await drawMain();

    // ถ้า dialog เปิดอยู่ให้ reflow/refresh
    if (gvcDialog.value) await nextTick(() => drawGvcDialog());
    if (directDialog.value) await nextTick(() => drawDirectDialog());
  } catch (err) {
    console.error(err);
    isAvail.value = false;
    years.value = [];
    dataByYear.value = {};
    destroyAllCharts();
  }
}

/* ----------------------------- main chart -------------------------------- */
async function drawMain() {
  await nextTick(); // container อยู่หลัง v-if="isAvail"

  if (!isAvail.value || !years.value.length) return;

  const cats = years.value.map(String);

  const makePoint = (y, sharePct, valueSum, title) => ({
    y: r1(sharePct),
    value: valueSum,
    year: y,
    seriesTitle: title,
  });

  const gvcPoints = years.value.map((y) => {
    const s = dataByYear.value[y]?.share || {};
    const v = dataByYear.value[y]?.value || {};
    const sharePct =
      pct(s.forward) + pct(s.forward2) + pct(s.backward) + pct(s.double);
    const valueSum =
      (v.forward || 0) +
      (v.forward2 || 0) +
      (v.backward || 0) +
      (v.double || 0);
    return makePoint(y, sharePct, valueSum, t("participation.gvcRelated"));
  });

  const directPoints = years.value.map((y) => {
    const s = dataByYear.value[y]?.share || {};
    const v = dataByYear.value[y]?.value || {};
    const sharePct = pct(s.intermediate) + pct(s.final);
    const valueSum = (v.intermediate || 0) + (v.final || 0);
    return makePoint(
      y,
      sharePct,
      valueSum,
      t("participation.directConsumption")
    );
  });

  const mainTooltip = function () {
    const p = this.point;
    return `
      <div style="min-width:210px">
        <div style="font-weight:700">${p.seriesTitle || this.series.name}</div>
        <div>${t("participation.year")}: ${p.year}</div>
        <div>${t("participation.share")}: ${Number(p.y).toFixed(1)}% ${t("participation.ofGross")}</div>
        <div>${t("participation.value")}: ${money(p.value)}</div>
      </div>`;
  };

  const title = t("participation.gvcTrendTitle", { exporting: exporting.value.name, sector: String(sector.value?.sectorShortName ?? "").toLowerCase(), importing: importing.value.name });

  if (mainChart) {
    mainChart.setTitle({ text: title });
    while (mainChart.series.length) mainChart.series[0].remove(false);

    mainChart.addSeries(
      {
        name: t("participation.gvcRelated"),
        data: gvcPoints,
        color: "#56353A",
      },
      false
    );
    mainChart.addSeries(
      {
        name: t("participation.directConsumption"),
        data: directPoints,
        color: "#E47ABC",
      },
      false
    );

    mainChart.xAxis[0].setCategories(cats, false);
    mainChart.redraw();
    return;
  }

  mainChart = Highcharts.chart("chartPartRange02", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    caption: {
      text: t("participation.percentagesRounding"),
      align: "center",
      verticalAlign: "bottom",
      y: 10,
      style: { fontSize: "12px", color: "#666" },
      useHTML: false,
    },
    xAxis: { categories: cats },
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
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    tooltip: { useHTML: true, formatter: mainTooltip },
    credits: { enabled: false },
    series: [
      {
        name: t("participation.gvcRelated"),
        data: gvcPoints,
        color: "#56353A",
      },
      {
        name: t("participation.directConsumption"),
        data: directPoints,
        color: "#E47ABC",
      },
    ],
  });
}

/* ----------------------------- dialog charts ----------------------------- */
const commonDialogOptions = (cats) => ({
  chart: { type: "column", backgroundColor: "#fff" },
  title: { text: null },
  xAxis: { categories: cats },
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
  plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
  credits: { enabled: false },
  tooltip: {
    useHTML: true,
    formatter: dialogTooltip,
    borderRadius: 6,
    backgroundColor: "#fff",
    shadow: true,
    padding: 8,
  },
});

function drawGvcDialog() {
  if (!years.value.length) return;
  const cats = years.value.map(String);

  const mk = (sh, val) =>
    years.value.map((y) => ({ y: r1(pct(sh(y))), value: r1(val(y)), year: y }));

  const sF2 = mk(
    (y) => dataByYear.value[y]?.share?.forward2 || 0,
    (y) => dataByYear.value[y]?.value?.forward2 || 0
  );
  const sF = mk(
    (y) => dataByYear.value[y]?.share?.forward || 0,
    (y) => dataByYear.value[y]?.value?.forward || 0
  );
  const sB = mk(
    (y) => dataByYear.value[y]?.share?.backward || 0,
    (y) => dataByYear.value[y]?.value?.backward || 0
  );
  const sD = mk(
    (y) => dataByYear.value[y]?.share?.double || 0,
    (y) => dataByYear.value[y]?.value?.double || 0
  );

  if (gvcChart) {
    while (gvcChart.series.length) gvcChart.series[0].remove(false);
    gvcChart.addSeries(
      {
        name: t("participation.dvaBack"),
        data: sF2,
        color: "#FF8A65",
      },
      false
    );
    gvcChart.addSeries(
      {
        name: t("participation.dvaThird"),
        data: sF,
        color: "#EC407A",
      },
      false
    );
    gvcChart.addSeries(
      { name: t("participation.fva"), data: sB, color: "#26A69A" },
      false
    );
    gvcChart.addSeries(
      { name: t("participation.doubleCounted"), data: sD, color: "#8E24AA" },
      false
    );
    gvcChart.xAxis[0].setCategories(cats, false);
    gvcChart.redraw();
    gvcChart.reflow();
    return;
  }

  gvcChart = Highcharts.chart("chartPartRange02-gvc", {
    ...commonDialogOptions(cats),
    series: [
      {
        name: t("participation.dvaBack"),
        data: sF2,
        color: "#FF8A65",
      },
      {
        name: t("participation.dvaThird"),
        data: sF,
        color: "#EC407A",
      },
      { name: t("participation.fva"), data: sB, color: "#26A69A" },
      { name: t("participation.doubleCounted"), data: sD, color: "#8E24AA" },
    ],
  });
}

function drawDirectDialog() {
  if (!years.value.length) return;
  const cats = years.value.map(String);

  const sInter = years.value.map((y) => ({
    y: r1(pct(dataByYear.value[y]?.share?.intermediate || 0)),
    value: r1(dataByYear.value[y]?.value?.intermediate || 0),
    year: y,
  }));
  const sFinal = years.value.map((y) => ({
    y: r1(pct(dataByYear.value[y]?.share?.final || 0)),
    value: r1(dataByYear.value[y]?.value?.final || 0),
    year: y,
  }));

  if (directChart) {
    while (directChart.series.length) directChart.series[0].remove(false);
    directChart.addSeries(
      { name: t("participation.dvaIntermediate"), data: sInter, color: "#26C6DA" },
      false
    );
    directChart.addSeries(
      { name: t("participation.dvaFinal"), data: sFinal, color: "#1E88E5" },
      false
    );
    directChart.xAxis[0].setCategories(cats, false);
    directChart.redraw();
    directChart.reflow();
    return;
  }

  directChart = Highcharts.chart("chartPartRange02-direct", {
    ...commonDialogOptions(cats),
    series: [
      { name: t("participation.dvaIntermediate"), data: sInter, color: "#26C6DA" },
      { name: t("participation.dvaFinal"), data: sFinal, color: "#1E88E5" },
    ],
  });
}

/* ----------------------------- watchers ---------------------------------- */
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

// ✅ Watch เฉพาะ key ที่ทำให้ต้อง reload จริง ๆ + immediate โหลดครั้งแรก (ไม่มี onMounted แล้ว)
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
  { immediate: true }
);

onBeforeUnmount(() => {
  destroyAllCharts();
});
</script>

<style scoped>
.fsub {
  color: #666;
}
.fblack {
  color: #222;
}
</style>
