<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <div class="p-2 text-lg font-bold fblack">Source region across years</div>
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
              Try a different year range, sector, or economy pair.
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
      <div class="w-full lg:w-[60%] flex justify-center pt-4">
        <div
          id="chartBSRange01"
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
      <!-- รายละเอียด + ปุ่ม breakdown -->
      <div class="p-4 pt-4 w-full lg:w-[40%] fsub" v-show="showDetail">
        <div v-for="r in regionCards" :key="r.key" class="mb-4">
          <div class="flex items-center gap-2">
            <img :src="r.icon" alt="" />
            <div :style="{ color: r.color }" class="text-lg font-semibold">
              {{ r.title }}
            </div>
          </div>
          <div class="cursor-pointer text-[#0672CB]" @click="openBreakdown(r)">
            <u>Click here to see the breakdown</u>
          </div>
          <div>{{ r.desc }}</div>
        </div>
      </div>
    </div>

    <!-- Breakdown dialog -->
    <q-dialog v-model="dlg.open" @show="drawBreakdown">
      <q-card class="max-w-[90vw] w-full">
        <q-card-section>
          <div class="text-center text-[22px] font-semibold fblack">
            {{ dlg.title }}
          </div>
          <div
            id="chartBSRange01-breakdown"
            style="height: 420px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="CLOSE" color="primary" v-close-popup />
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

const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

const showDetail = ref($q.screen.gt.sm);
watch(
  () => $q.screen.gt.sm,
  (v) => (showDetail.value = v)
);

/* ======== inputs ======== */
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const sector = ref(props.inputData.sector);
const yearStart = ref(Number(props.inputData.yearStart));
const yearEnd = ref(Number(props.inputData.yearEnd));

/* ======== data buckets by region ======== */
const dataAsia = ref([]);
const dataEurope = ref([]);
const dataNorthAmerica = ref([]);
const dataLatinAmerica = ref([]);
const dataROW = ref([]);
const seriesData = ref([]);
const yearData = ref([]);

const isLoading = ref(true);
const isAvail = ref(true);

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);
const pct1 = (n) => (Number(n || 0) * 100).toFixed(1);
const money1 = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} million`;

/* ======== region card meta (icon/สี) ======== */
const regionCards = ref([
  {
    key: "Asia-Pacific",
    title: "Asia-Pacific",
    color: "#1E88E5",
    icon: "images/asia.svg",
    desc: "",
  },
  {
    key: "Europe",
    title: "Europe",
    color: "#FB8C00",
    icon: "images/europe.svg",
    desc: "",
  },
  {
    key: "North America",
    title: "North America",
    color: "#2E7D32",
    icon: "images/northamerica.svg",
    desc: "",
  },
  {
    key: "Latin America",
    title: "Latin America",
    color: "#8E24AA",
    icon: "images/latinamerica.svg",
    desc: "",
  },
  {
    key: "Rest of the World",
    title: "Rest of the World",
    color: "#EC69B3",
    icon: "images/row.svg",
    desc: "",
  },
]);

/* ======== helpers สรุปข้อมูลรายปี ======== */
const sumBy = (arrRef, field) => {
  const years = buildYearRange(yearStart.value, yearEnd.value);
  return years.map((y) =>
    Number(
      arrRef.value
        .filter((d) => +d.year === y)
        .reduce((a, b) => a + (parseFloat(b[field]) || 0), 0)
        .toFixed(field === "share" ? 4 : 2)
    )
  );
};

/* ======== main load ======== */
async function loadData() {
  isLoading.value = true;
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: buildYearRange(yearStart.value, yearEnd.value),
  };

  let { data: raw } = await axios.post(
    `${serverData.value}va/back_source.php`,
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

  // แยกตาม region และเรียง value มาก -> น้อย (ให้เลือก top ได้ง่าย)
  const sortByValDesc = (a, b) => Number(b.value) - Number(a.value);
  dataAsia.value = raw
    .filter((d) => d.area === "Asia-Pacific")
    .sort(sortByValDesc);
  dataEurope.value = raw.filter((d) => d.area === "Europe").sort(sortByValDesc);
  dataNorthAmerica.value = raw
    .filter((d) => d.area === "North America")
    .sort(sortByValDesc);
  dataLatinAmerica.value = raw
    .filter((d) => d.area === "Latin America")
    .sort(sortByValDesc);
  dataROW.value = raw
    .filter((d) => d.area === "Rest of the World")
    .sort(sortByValDesc);

  yearData.value = buildYearRange(yearStart.value, yearEnd.value);

  // series สำหรับกราฟเส้นหลัก (ใช้ share เป็น %)
  seriesData.value = [
    {
      name: "Asia-Pacific",
      color: "#1E88E5",
      data: sumBy(dataAsia, "value"),
      share: sumBy(dataAsia, "share"),
    },
    {
      name: "Europe",
      color: "#FB8C00",
      data: sumBy(dataEurope, "value"),
      share: sumBy(dataEurope, "share"),
    },
    {
      name: "North America",
      color: "#2E7D32",
      data: sumBy(dataNorthAmerica, "value"),
      share: sumBy(dataNorthAmerica, "share"),
    },
    {
      name: "Latin America",
      color: "#8E24AA",
      data: sumBy(dataLatinAmerica, "value"),
      share: sumBy(dataLatinAmerica, "share"),
    },
    {
      name: "Rest of the World",
      color: "#EC69B3",
      data: sumBy(dataROW, "value"),
      share: sumBy(dataROW, "share"),
    },
  ];

  // เติมคำอธิบายการ์ด (last vs first + top country ของปีล่าสุด)
  regionCards.value.forEach((card, idx) => {
    const ser = seriesData.value[idx];
    const first = ser.share[0] ?? 0;
    const last = ser.share[ser.share.length - 1] ?? 0;
    const diff = (last - first) * 100;
    const dir = diff > 0 ? "up" : diff < 0 ? "down" : "unchanged";

    const bag = {
      "Asia-Pacific": dataAsia,
      Europe: dataEurope,
      "North America": dataNorthAmerica,
      "Latin America": dataLatinAmerica,
      "Rest of the World": dataROW,
    }[card.key];

    let topLine = "";
    const lastYearStr = String(yearEnd.value);
    const inLast = (bag.value || []).filter(
      (d) => String(d.year) === lastYearStr
    );
    if (inLast.length) {
      const top = inLast.reduce((a, b) =>
        Number(b.value) > Number(a.value) ? b : a
      );
      topLine = ` ${
        top.economic
      } is the top regional source economy, accounting for ${pct1(
        top.share
      )}% of FVA in ${sector.value.sectorShortName.toLowerCase()} ${
        sector.value.sectorShortName == "All sectors" ? "" : "sector"
      } of ${exporting.value.name}.`;
    }
    const changeText =
      dir === "unchanged"
        ? ""
        : ` ${dir} by ${Math.abs(diff).toFixed(1)} percentage points`;
    card.desc = `${pct1(last)}% of ${
      exporting.value.name
    }'s FVA is sourced from ${card.title},${changeText} since ${
      yearStart.value
    }.${card.key === "Rest of the World" ? "" : topLine}`;
  });
  isLoading.value = false;
  drawMain();
}

/* ======== main chart (line) ======== */
function drawMain() {
  const categories = yearData.value.map(String);
  const series = seriesData.value.map((s) => ({
    type: "spline",
    name: s.name,
    color: s.color,
    data: s.share.map((v) => +(v * 100).toFixed(1)),
    marker: { enabled: true, symbol: "square", radius: 4 },
  }));
  const maxY = Math.max(...series.flatMap((s) => s.data));
  const yMax = Math.ceil((maxY + 2) / 5) * 5 || 10;
  let title = `Which regions are the main sources of Foreign Value Added (FVA) embedded in ${exporting.value.name}'s ${sector.value.sectorShortName} exports to ${importing.value.name}?`;

  Highcharts.chart("chartBSRange01", {
    chart: { backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: { categories, tickLength: 0 },
    yAxis: {
      min: 0,
      max: yMax,
      title: { text: "Percent of Backward Linkages" },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: { align: "center", verticalAlign: "bottom" },
    tooltip: {
      useHTML: true,
      formatter() {
        // เติม value จาก seriesData ตำแหน่งเดียวกัน
        const ser = seriesData.value.find((s) => s.name === this.series.name);
        const i = this.point.index ?? this.point.x ?? this.x;
        const val = ser?.data?.[i] ?? 0;
        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>Year:&nbsp; ${categories[i]}</div>
            <div>Share:&nbsp; ${this.y.toFixed(1)}% of backward linkages</div>
            <div>Value:&nbsp; ${money1(val)}</div>
          </div>`;
      },
    },
    plotOptions: {
      series: { lineWidth: 3, states: { hover: { lineWidth: 3 } } },
    },
    credits: { enabled: false },
    series,
  });
}

/* =================================================================
   Breakdown dialog
   ================================================================= */
const dlg = ref({ open: false, title: "", regionKey: "" });

function openBreakdown(card) {
  dlg.value = { open: true, title: card.title, regionKey: card.key };
}

function drawBreakdown() {
  const years = yearData.value.map(String);

  // ดึง raw ของ region ที่เลือก
  const bag =
    {
      "Asia-Pacific": dataAsia,
      Europe: dataEurope,
      "North America": dataNorthAmerica,
      "Latin America": dataLatinAmerica,
      "Rest of the World": dataROW,
    }[dlg.value.regionKey].value || [];

  // กลุ่มตามประเทศ -> series (stacked column)
  const byCountry = {};
  for (const r of bag) {
    const k = r.economic || r.source_country;
    byCountry[k] ??= {
      name: k,
      data: Array(years.length).fill({ y: 0, value: 0, year: "" }),
    };
    const idx = years.indexOf(String(r.year));
    if (idx > -1) {
      const yPct = (parseFloat(r.share) || 0) * 100;
      const valMn = parseFloat(r.value) || 0;
      byCountry[k].data[idx] = {
        y: +yPct.toFixed(1),
        value: +valMn.toFixed(1),
        year: String(r.year),
      };
    }
  }
  const series = Object.values(byCountry);

  let dlgChart = Highcharts.chart("chartBSRange01-breakdown", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: { text: null },
    xAxis: { categories: years, tickLength: 0 },
    yAxis: {
      min: 0,
      title: { text: "Percent of Backward Linkage" },
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

      // ขนาดตัวอักษร/มาร์จิ้นมีผลต่อความสูงต่อแถว
      itemStyle: { fontSize: "12px" },
      itemMarginTop: 4,
      itemMarginBottom: 4,
      symbolHeight: 10,

      // ให้พอสำหรับ 3 แถว → ปรับเลขนี้ได้ตามดีไซน์จริง
      maxHeight: 120, // ≈ 3 แถว (22px ต่อแถว โดยประมาณ)

      // สไตล์ปุ่มเลื่อนเพจของ legend
      navigation: {
        enabled: true,
        activeColor: "#333",
        inactiveColor: "#ccc",
        arrowSize: 12,
        animation: true,
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>Year:&nbsp; ${p.year || years[this.point.index]}</div>
            <div>Share:&nbsp; ${Number(p.y).toFixed(
              1
            )}% of backward linkages</div>
            <div>Value:&nbsp; ${money1(p.value)}</div>
          </div>`;
      },
    },
    credits: { enabled: false },
    series,
  });
}

onMounted(loadData);
</script>

<style scoped></style>
