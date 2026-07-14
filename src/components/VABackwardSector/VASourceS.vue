<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("backward.charts.bySource") }}
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
      <div class="w-full">
        <div class="w-full flex items-center justify-center pt-4">
          <div
            id="chartBSSingle01"
            class="w-full max-w-[1100px] min-h-[500px]"
          ></div>
        </div>
        <div class="flex flex-row justify-center pb-2 px-2">
          <div class="flex justify-center items-center">
            <div class="w-3 h-3 bg-[#1F77B4]"></div>
            <div class="pl-2">Asia-Pacific</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#FF813D]"></div>
            <div class="pl-2">Europe</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#2CA02C]"></div>
            <div class="pl-2">North America</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#9467BD]"></div>
            <div class="pl-2">Latin America</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#E377C2]"></div>
            <div class="pl-2">Rest of the World</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, toRef } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const { locale, t } = useI18n({ useScope: "global" });
const economyName = (row) => translateEconomy({ iso: row.source_country, name: row.economic }, locale.value);
const regionName = (area) => ({
  "Asia-Pacific": t("backward.charts.regionAsia"), Europe: t("backward.charts.regionEurope"),
  "North America": t("backward.charts.regionNorthAmerica"), "Latin America": t("backward.charts.regionLatinAmerica"),
  "Rest of the World": t("backward.charts.regionRestWorld"),
}[area] || area);
const $q = useQuasar();

// ===== input from parent component =====
// ✅ ผูกกับ props โดยตรง (ไม่ copy ครั้งเดียว)
const exporting = toRef(props.inputData, "exporting");
const importing = toRef(props.inputData, "importing");
const sector = toRef(props.inputData, "sector");
const year = computed(() => Number(props.inputData?.year) || null);

const top5 = ref([]);
const backValue = ref("");
const gexport = ref("");
let chartInstance = null;
const totalsByParent = ref([]);

const shareNum = (num) => Number((Number(num) * 100).toFixed(1));
const isLoading = ref(true);
const isAvail = ref(true);

// สีประจำโซน
const AREA_COLOR = {
  "Asia-Pacific": "#1F77B4",
  Europe: "#FF813D",
  "North America": "#2CA02C",
  "Latin America": "#9467BD",
  "Rest of the World": "#E377C2",
};

const moneyNum = (num) => {
  num = Number(num);
  if (num < 1000) {
    return "USD " + num.toFixed(1) + " " + t("backward.charts.million");
  } else {
    return "USD " + (num / 1000).toFixed(1) + " " + t("backward.charts.billion");
  }
};

const loadData = async () => {
  isLoading.value = true;
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: [year.value],
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

  top5.value = rawAll
    .filter((x) => x.economic != "Rest of the World")
    .sort((a, b) => Number(b.share) - Number(a.share))
    .slice(0, 5);

  const rawStructure = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload)
  );

  let rawStructure1 = rawStructure.data.filter(
    (d) => d.var === "Backward_linkages"
  );

  backValue.value = rawStructure1[0].value;
  gexport.value = rawStructure1[0].total_exports;

  const areas = [
    "Asia-Pacific",
    "Europe",
    "North America",
    "Latin America",
    "Rest of the World",
  ];
  const parentNodes = areas.map((a) => ({
    id: a,
    name: regionName(a),
    color: AREA_COLOR[a] || "#999",
  }));

  const countryNodes = rawAll.map((d) => ({
    name: economyName(d),
    parent: d.area,
    value: +(Number(d.share) * 100).toFixed(1), // ขนาดพื้นที่ (เปอร์เซ็นต์)
    sharePct: +(Number(d.share) * 100).toFixed(1), // เก็บไว้โชว์ใน label/tooltip
    valMn: +(+d.value).toFixed(1), // มูลค่า (ล้าน)
    color: AREA_COLOR[d.area] || "#999",
  }));
  isLoading.value = false;
  drawChart(countryNodes, parentNodes, areas);
};

const drawChart = (countryNodes, parentNodes, areas) => {
  const title = t("backward.charts.sourceTitle", { exporting: exporting.value.name, sector: sector.value.sectorShortName, importing: importing.value.name });

  let getdata = [];
  getdata.push(...parentNodes);
  getdata.push(...countryNodes);

  const regionIds = new Set([
    "Asia-Pacific",
    "Europe",
    "North America",
    "Latin America",
    "Rest of the World",
  ]);

  totalsByParent.value = getdata
    .filter((d) => d.parent && regionIds.has(d.parent)) // เอาเฉพาะประเทศที่มี parent เป็น region
    .reduce((acc, d) => {
      const key = d.parent;
      acc[key] = (acc[key] || 0) + Number(d.value || 0);
      return acc;
    }, {});

  // ✅ ปัดเป็นทศนิยม 1 ตำแหน่ง (ยังเป็น number)
  Object.keys(totalsByParent.value).forEach((k) => {
    totalsByParent.value[k] = Number(totalsByParent.value[k].toFixed(1));
  });

  const contributors = top5.value
    .map((row) => `${economyName(row)} (${shareNum(row.share)}%)`)
    .join(", ");
  const subtitle = t("backward.charts.sourceSubtitle", {
    exporting: exporting.value.name,
    sector: sector.value.sectorShortName,
    importing: importing.value.name,
    gross: moneyNum(gexport.value),
    year: year.value,
    fva: moneyNum(backValue.value),
    asia: totalsByParent.value["Asia-Pacific"],
    europe: totalsByParent.value["Europe"],
    northAmerica: totalsByParent.value["North America"],
    latinAmerica: totalsByParent.value["Latin America"],
    restWorld: totalsByParent.value["Rest of the World"],
    contributors,
  });

  // ✅ ลบกราฟเดิมก่อนวาดใหม่
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  // ⬇️ สร้างซีรีส์ปลอมสำหรับ legend ตามโซน
  const legendSeries = areas.map((a) => ({
    type: "scatter",
    name: regionName(a),
    color: AREA_COLOR[a] || "#999",
    data: [], // ไม่มีจุดจริง
    showInLegend: true,
    enableMouseTracking: false, // ไม่ให้โต้ตอบ
  }));

  chartInstance = Highcharts.chart("chartBSSingle01", {
    chart: { backgroundColor: "#fff" },
    title: { text: title, style: { fontSize: "20px", fontWeight: 600 } },
    subtitle: { text: subtitle },
    xAxis: { visible: false },
    yAxis: { visible: false },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        data: getdata,
      },
    ],
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      symbolRadius: 0,
      symbolHeight: 12,
      symbolWidth: 12,
    },
    tooltip: {
      useHTML: true,
      formatter: function () {
        return ` <div style="font-weight:700">${this.key}</div>
        <div>${t("backward.charts.share")}: ${this.point.sharePct}%</div>
        <div>${t("backward.charts.value")}: $${this.point.valMn} ${t("backward.charts.million")}</div>`;
      },
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      symbolHeight: 12,
      symbolWidth: 12,
      symbolRadius: 0,
    },

    credits: { enabled: false },
  });
};

// ✅ ดูค่าเปลี่ยน แล้วโหลดใหม่ (รวม year)
watch(
  [
    () => exporting.value?.iso,
    () => importing.value?.iso,
    () => sector.value?.sectorID,
    () => year.value,
  ],
  () => {
    loadData();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>
