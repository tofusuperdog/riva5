<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t("backward.charts.bySector") }}
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
              {{ t("backward.charts.tryDifferentEconomy") }}
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
      <!-- กราฟหลัก -->
      <div
        class="w-full flex items-center justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartBSSingle01"
          class="w-full max-w-[1100px] min-h-[450px]"
        ></div>
        <div class="flex flex-row justify-center pb-2 px-2">
          <div
            class="flex justify-center items-center px-2"
            v-for="c in sectorColors"
            :key="c.id"
          >
            <div class="w-3 h-3" :style="{ backgroundColor: c.color }"></div>
            <div class="pl-2">{{ translateSectorGroup(c.id, locale) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateSector, translateSectorGroup } from "../../i18n/sectors";

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();
const { t, locale } = useI18n();

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const source = ref(props.inputData.source);
const year = computed(() => Number(props.inputData?.year) || null);

let chartInstance = null; // เก็บ instance Highcharts
const isLoading = ref(true);
const isAvail = ref(true);

const sectorColors = [
  { id: "Agriculture", name: "Agriculture", color: "#2ECC71" }, // เขียวสด
  { id: "Mining", name: "Mining", color: "#9B59B6" }, // ม่วงสด
  { id: "Construction", name: "Construction", color: "#E67E22" }, // ส้มสด
  { id: "Utilities", name: "Utilities", color: "#F1C40F" }, // เหลืองสด

  // Manufacturing -> ใช้โทนแดง-ชมพู
  {
    id: "Manufacturing Low tech",
    name: "Manufacturing Low tech",
    color: "#E74C3C",
  },
  {
    id: "Manufacturing High and medium tech",
    name: "Manufacturing High and medium tech",
    color: "#FF6F91",
  },

  // Service -> ไล่เฉดฟ้า/น้ำเงิน
  {
    id: "Services Trade and repair",
    name: "Services Trade and repair",
    color: "#3498DB",
  },
  { id: "Services Tourism", name: "Services Tourism", color: "#5DADE2" },
  { id: "Services Transport", name: "Services Transport", color: "#2E86C1" },
  { id: "Services ICT", name: "Services ICT", color: "#1F618D" },
  {
    id: "Services Property and business",
    name: "Services Property and business",
    color: "#154360",
  },
  { id: "Services Financial", name: "Services Financial", color: "#85C1E9" },
  {
    id: "Services Public and welfare",
    name: "Services Public and welfare",
    color: "#2874A6",
  },
  {
    id: "Services Private household",
    name: "Services Private household",
    color: "#21618C",
  },
];

const moneyNum = (num) => {
  num = Number(num);
  if (num < 1000) {
    return "$" + num.toFixed(1) + " " + t("backward.charts.million");
  } else {
    return "$" + (num / 1000).toFixed(1) + " " + t("backward.charts.billion");
  }
};

const loadData = async () => {
  isLoading.value = true;
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    source_country: source.value.iso,
    year: [year.value],
  };

  let res = await axios.post(
    `${serverData.value}va/back_sector.php`,
    JSON.stringify(payload)
  );
  let raw = res.data;
  raw = raw.filter((x) => Number(x.value) > 0);
  if (raw.length === 0) {
    isAvail.value = false;
    isLoading.value = false;
    return;
  } else {
    isAvail.value = true;
  }

  let resultData = res.data;
  let totalBack = resultData.filter((x) => x.exp_sector == 0)[0].value;
  resultData = resultData.filter((x) => x.exp_sector != 0);

  let resSector = await axios.get(`${serverData.value}va/get_sector.php`);
  let sectorList = resSector.data;

  let dataGraph = resultData.map((d) => {
    const sector = sectorList.find((x) => x.catID == d.exp_sector);
    let name = translateSector({ catID: d.exp_sector, category: sector?.shortname || String(d.exp_sector) }, locale.value);
    let parent = sector?.sectiongroup;
    let share = Number(((Number(d.value) / totalBack) * 100).toFixed(1));
    let color = sectorColors.filter((x) => x.id == parent)[0].color;

    return {
      name,
      parent,
      ValMn: Number(d.value),
      sharePct: share,
      value: share,
      color,
    };
  });

  let payload2 = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    exp_sector: 0,
    year: [year.value],
  };
  let tres = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload2)
  );

  let gTotal = tres.data[0].total_exports;

  let getdata = [];

  getdata.push(...sectorColors.map((item) => ({ ...item, name: translateSectorGroup(item.id, locale.value) })));
  getdata.push(...dataGraph);

  let top5 = dataGraph.sort((a, b) => b.value - a.value).slice(0, 5);

  let title = t("backward.charts.sourceSectorSingleTitle", { source: source.value.name, exporting: exporting.value.name, importing: importing.value.name });
  const sectors = top5.map((item) => `${item.name} (${item.value}%)`).join(", ");
  let subtitle = t("backward.charts.sourceSectorSubtitle", { exporting: exporting.value.name, importing: importing.value.name, gross: moneyNum(gTotal), year: year.value, backward: moneyNum(totalBack), source: source.value.name, sectors });

  isLoading.value = false;

  // ✅ destroy chart เดิม
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
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
        const isChild = typeof this.point.sharePct !== "undefined"; // มีเฉพาะใบ (child)
        const name = this.point.name || this.key;

        // ถ้า hover ที่ "กลุ่ม" (parent) ให้โชว์แค่ชื่อ
        if (!isChild) {
          return `<div style="font-weight:700">${name}</div>`;
        }

        // child node
        const share = this.point.sharePct ?? 0;
        const valMn = this.point.ValMn ?? 0; // << ใช้ V ใหญ่ M ใหญ่ ให้ตรงกับ data

        const moneyFmt = (n) =>
          `$${Number(n || 0).toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} ${t("backward.charts.million")}`;

        return `
      <div style="min-width:200px">
        <div style="font-weight:700">${name}</div>
        <div>${t("backward.charts.share")}: ${share}%</div>
        <div>${t("backward.charts.value")}: ${moneyFmt(valMn)}</div>
      </div>`;
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

onMounted(() => {
  loadData();
});

// ✅ re-run เมื่อ prop เปลี่ยน
watch(
  [
    () => exporting.value?.iso,
    () => importing.value?.iso,
    () => source.value?.iso,
    () => year.value,
    () => locale.value,
  ],
  () => loadData(),
  { immediate: false }
);
</script>

<style lang="scss" scoped></style>
