<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t('forward.bySector') }}
    </div>
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
              {{ t('forward.preparing') }}
            </div>
            <div class="text-sm text-gray-600 mt-0.5">
              {{ t('forward.rendering') }}
            </div>
            <div class="text-xs text-gray-500 mt-3">
              {{ t('forward.patience') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row" v-show="!isLoading">
      <!-- กราฟหลัก -->
      <div class="w-full flex items-center justify-center pt-4">
        <div
          id="chartFImSingle01"
          class="w-full max-w-[1100px] min-h-[450px]"
        ></div>
        <div class="flex flex-row justify-center pb-2 px-2">
          <div
            class="flex justify-center items-center px-2"
            v-for="c in sectorColors"
            :key="c.id"
          >
            <div class="w-3 h-3" :style="{ backgroundColor: c.color }"></div>
            <div class="pl-2">{{ c.name }}</div>
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
import { useI18n } from 'vue-i18n';
import { translateSector, translateSectorGroup } from "../../i18n/sectors";
const { t, locale } = useI18n();

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const importing = ref(props.inputData.importing);
const year = computed(() => Number(props.inputData?.year) || null);
const isLoading = ref(true);

let chartInstance = null; // เก็บ instance Highcharts
const sectorList = ref([]);

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

const sectorIDToData = (id) => {
  let selectData = sectorList.value.find((item) => item.catID == id);
  return selectData;
};

const moneyShort = (n) => {
  n = Number(n);
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} ${t('forward.billion')}`;
  return `$${n.toFixed(1)} ${t('forward.million')}`;
};
const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

const loadData = async () => {
  isLoading.value = true;
  //Load sector data
  const { data: sectorData } = await axios.get(
    `${serverData.value}va/get_sector.php`
  );
  sectorList.value = sectorData;

  //Load Main data
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    year: [year.value],
  };

  let res = await axios.post(
    `${serverData.value}va/forward_import.php`,
    JSON.stringify(payload)
  );
  //Total Forward
  let resultData = res.data.filter((x) => x.exp_sector != 0);
  let totalF = res.data.filter((x) => x.exp_sector == 0)[0].value;

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

  //contentData
  let contentData = resultData.map((d) => {
    const sectorData = sectorIDToData(d.exp_sector);
    let name = translateSector({ catID: d.exp_sector, category: sectorData.shortname }, locale.value);
    let parent = sectorIDToData(d.exp_sector).sectiongroup;
    let value = Number(d.value);
    let share = Number(((Number(d.value) / totalF) * 100).toFixed(1));
    let color = sectorColors.filter((x) => x.id == parent)[0].color;

    return {
      name,
      parent,
      ValMn: value,
      sharePct: share,
      value: share,
      color,
    };
  });

  //Top5
  let top5 = contentData.sort((a, b) => b.ValMn - a.ValMn).slice(0, 5);

  let gData = [
    ...sectorColors.map((item) => ({ ...item, name: translateSectorGroup(item.id, locale.value) })),
    ...contentData,
  ];

  isLoading.value = false;
  plotGraph(gData, totalF, gTotal, top5);

  // console.clear();
  // console.log("top5", top5);
  // console.log("contentData", contentData);
  // console.log("sectorList", sectorList.value);
  // console.log("resultData", resultData);
  // console.log("totalF", totalF);
  // console.log(gTotal);
};

const plotGraph = (gData, totalF, gTotal, top5) => {
  let title = t('forward.sectorContributionTitle', { exporting: exporting.value.name, importing: importing.value.name });
  let subtitle = t('forward.sectorSubtitle', {
    exporting: exporting.value.name,
    importing: importing.value.name,
    gross: moneyShort(gTotal),
    year: year.value,
    forward: moneyShort(totalF),
  });

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  chartInstance = Highcharts.chart("chartFImSingle01", {
    chart: { backgroundColor: "#fff" },
    title: { text: title, style: { fontSize: "20px", fontWeight: 600 } },
    subtitle: { text: subtitle },
    xAxis: { visible: false },
    yAxis: { visible: false },
    series: [
      {
        type: "treemap",
        layoutAlgorithm: "squarified",
        data: gData,
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
          })} ${t('forward.million')}`;

        return `
      <div >
        <div style="font-weight:700">${name}</div>
        <div>${t('forward.share')}: ${share}%</div>
        <div>${t('forward.value')}: ${moneyShort(valMn)}</div>
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

// ===== Graph =====
onMounted(() => {
  loadData();
});

watch(
  [() => exporting.value?.iso, () => importing.value?.iso, () => year.value],
  () => loadData(),
  { immediate: false }
);
watch(locale, () => loadData());
</script>

<style lang="scss" scoped></style>
