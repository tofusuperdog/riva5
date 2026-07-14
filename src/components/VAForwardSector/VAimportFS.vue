<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t('forward.byImporter') }}
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full flex items-center justify-center pt-4">
        <div
          id="chartFSTSingle01"
          class="w-full max-w-[1100px] min-h-[450px]"
        ></div>
        <div class="flex flex-row justify-center pb-2 px-2">
          <div class="flex justify-center items-center">
            <div class="w-3 h-3 bg-[#1F77B4]"></div>
            <div class="pl-2">{{ t('backward.charts.regionAsia') }}</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#FF813D]"></div>
            <div class="pl-2">{{ t('backward.charts.regionEurope') }}</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#2CA02C]"></div>
            <div class="pl-2">{{ t('backward.charts.regionNorthAmerica') }}</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#9467BD]"></div>
            <div class="pl-2">{{ t('backward.charts.regionLatinAmerica') }}</div>
          </div>
          <div class="flex justify-center pl-2 items-center">
            <div class="w-3 h-3 bg-[#E377C2]"></div>
            <div class="pl-2">{{ t('backward.charts.regionRestWorld') }}</div>
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
const { t, locale } = useI18n();

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);
let chartInstance = null;

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const sector = ref(props.inputData.sector);
const year = computed(() => Number(props.inputData?.year) || null);

// ===== Computed =====
const top5 = ref([]);
const ecoList = ref([]);
const gexport = ref("");
const backValue = ref("");

const AREA_COLOR = {
  "Asia-Pacific": "#1F77B4",
  Europe: "#FF813D",
  "North America": "#2CA02C",
  "Latin America": "#9467BD",
  "Rest of the World": "#E377C2",
};

const shareNum = (num) => Number((Number(num) * 100).toFixed(1));
const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  let n1 = Number(n);
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n1 / 1000).toFixed(1)} ${t('forward.billion')}`;

  return `$${n1.toFixed(1)} ${t('forward.million')}`;
};

const isoToData = (iso) => {
  return ecoList.value.find((d) => d.iso == iso);
};

const loadData = async () => {
  //load sector List
  const { data: sectorData } = await axios.get(
    `${serverData.value}va/get_eco_not_group.php`
  );
  ecoList.value = sectorData;

  const payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: [year.value],
  };
  //โหลดข้อมูล
  let { data: rawAll } = await axios.post(
    `${serverData.value}va/forward_sector.php`,
    JSON.stringify(payload)
  );

  rawAll = rawAll.filter((x) => Number(x.value) > 0);

  let totalF = Number(
    rawAll.filter((x) => x.exp_sector == sector.value.sectorID)[0].totalvalue
  );

  //Gross export
  const payload2 = {
    exp_country: exporting.value.iso,
    imp_country: "WLD",
    exp_sector: Number(sector.value.sectorID),
    year: [year.value],
  };
  const rawStructure = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload2)
  );

  let rawStructure1 = rawStructure.data.filter(
    (d) => d.var === "Backward_linkages"
  );

  backValue.value = rawStructure1[0].value;
  gexport.value = rawStructure1[0].total_exports;

  let CountryNodes = rawAll
    .map((d) => {
      let cData;
      if (d.imp_country == "RoW") {
        cData = {
          economic: "Rest of the World",
          iso: "RoW",
          area: "Rest of the World",
        };
      } else {
        cData = isoToData(d.imp_country);
      }
      if (cData) {
        return {
          name: cData.economic,
          parent: cData.area,
          valMn: Number(d.value),
          value: shareNum(Number(d.value) / totalF),
          sharePct: shareNum(Number(d.value) / totalF),
          color: AREA_COLOR[cData.area],
        };
      }
    })
    .filter(Boolean);

  let ParentNodes = [
    {
      id: "Asia-Pacific",
      name: t('backward.charts.regionAsia'),
      color: "#1F77B4",
    },
    {
      id: "Europe",
      name: t('backward.charts.regionEurope'),
      color: "#FF813D",
    },
    {
      id: "North America",
      name: t('backward.charts.regionNorthAmerica'),
      color: "#2CA02C",
    },
    {
      id: "Latin America",
      name: t('backward.charts.regionLatinAmerica'),
      color: "#9467BD",
    },
    {
      id: "Rest of the World",
      name: t('backward.charts.regionRestWorld'),
      color: "#E377C2",
    },
  ];

  let getData = [...ParentNodes, ...CountryNodes];
  let top5 = CountryNodes.sort(
    (a, b) => Number(b.valMn) - Number(a.valMn)
  ).slice(0, 5);

  drawChart(getData, top5);
  // console.clear();
  // console.log("top5", top5);
  // console.log("totalF", totalF);
  // console.log("ecoList", ecoList.value);
  // console.log("rawAll", rawAll);
};

const drawChart = (getdata, top5) => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  let title = t('forward.destinationTitle', { exporting: exporting.value.name });
  // top5 = [{ name: 'A', value: 12.3 }, ...] (สูงสุด 5 ตัว)
  const topText = (top5 ?? [])
    .slice(0, 5)
    .map((x) => `${x.name} (${Number(x.value).toFixed(1)}%)`)
    .join(", ")
    .replace(/, ([^,]*)$/, " and $1"); // เปลี่ยน comma สุดท้ายเป็น "and"

  const mainlyText = topText
    ? `mainly ${topText}`
    : `no major partner economies identified`;

  let subtitle = t('forward.importerSubtitle', {
    exporting: exporting.value.name,
    sector: sector.value.sectorShortName,
    gross: moneyShort(gexport.value),
    year: year.value,
    forward: moneyShort(backValue.value),
  });

  chartInstance = Highcharts.chart("chartFSTSingle01", {
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
        <div>${t('forward.share')}: ${this.point.sharePct}%</div>
        <div>${t('forward.value')}: ${moneyShort(this.point.valMn)} </div>`;
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

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);

// ✅ ดูค่าเปลี่ยน แล้วโหลดใหม่ (รวม year)
watch(
  [() => exporting.value?.iso, () => sector.value?.sectorID, () => year.value],
  () => {
    loadData();
  },
  { immediate: true }
);
watch(locale, () => loadData());
</script>

<style lang="scss" scoped></style>
