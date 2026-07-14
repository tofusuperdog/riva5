<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">
      {{ t('forward.inRegion', { region: regionName }) }}
    </div>
    <div class="border-b border-[#DDDDDD]"></div>
    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full flex items-center justify-center pt-4">
        <div
          id="chartFISingle02"
          class="w-full max-w-[1100px] min-h-[500px]"
        ></div>
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

// data
const sectorColors = [
  { id: "Agriculture", name: "Agriculture", color: "#2ECC71", code: "A" }, // เขียวสด
  { id: "Mining", name: "Mining", color: "#9B59B6", code: "B" }, // ม่วงสด
  { id: "Construction", name: "Construction", color: "#E67E22", code: "C" }, // ส้มสด
  { id: "Utilities", name: "Utilities", color: "#F1C40F", code: "D" }, // เหลืองสด

  // Manufacturing -> ใช้โทนแดง-ชมพู
  {
    id: "Manufacturing Low tech",
    name: "Manufacturing Low tech",
    color: "#E74C3C",
    code: "E",
  },
  {
    id: "Manufacturing High and medium tech",
    name: "Manufacturing High and medium tech",
    color: "#FF6F91",
    code: "F",
  },

  // Service -> ไล่เฉดฟ้า/น้ำเงิน
  {
    id: "Services Trade and repair",
    name: "Services Trade and repair",
    color: "#3498DB",
    code: "G",
  },
  {
    id: "Services Tourism",
    name: "Services Tourism",
    color: "#5DADE2",
    code: "H",
  },
  {
    id: "Services Transport",
    name: "Services Transport",
    color: "#2E86C1",
    code: "I",
  },
  { id: "Services ICT", name: "Services ICT", color: "#1F618D", code: "J" },
  {
    id: "Services Property and business",
    name: "Services Property and business",
    color: "#154360",
    code: "K",
  },
  {
    id: "Services Financial",
    name: "Services Financial",
    color: "#85C1E9",
    code: "L",
  },
  {
    id: "Services Public and welfare",
    name: "Services Public and welfare",
    color: "#2874A6",
    code: "M",
  },
  {
    id: "Services Private household",
    name: "Services Private household",
    color: "#21618C",
    code: "N",
  },
];

const sectorList = ref([]);

// result
const countriesISO = ref([]);
const countriesName = ref([]);
const economyList = ref([]);
const regionName = ref("");
const gTotal = ref([]);
const seriesMain = ref([]);
const seriesDrill = ref([]);

let chartInstance = null;

// Helper
const sectorIDtoData = (id) => {
  let selectData = sectorList.value.find((item) => item.catID == id);
  return selectData;
};

const isoToData = (iso) => {
  return economyList.value.find((d) => d.iso == iso);
};
const isoToRegion = (iso) =>
  economyList.value.find((d) => d.iso === iso)?.region || exporting.value.name;

const digit1 = (num) => {
  return Number(Number(num).toFixed(2));
};

// Load data
const loadEconomyList = async () => {
  const res2 = await axios.get(`${serverData.value}va/get_eco_not_group.php`);
  economyList.value = res2.data;
};

const loadSectorList = async () => {
  const { data: sectorData } = await axios.get(
    `${serverData.value}va/get_sector.php`
  );
  sectorList.value = sectorData;
};
const loadData = async () => {
  gTotal.value = [];
  countriesISO.value = [];
  countriesName.value = [];
  seriesMain.value = [];
  seriesDrill.value = [];
  //Load Main data
  const payload = {
    exp_country: exporting.value.iso,
    imp_country: importing.value.iso,
    year: [year.value],
  };

  let res = await axios.post(
    `${serverData.value}va/forward_import_region.php`,
    JSON.stringify(payload)
  );

  let rawData = res.data.filter((d) => d.exp_sector != 0);

  regionName.value = isoToRegion(exporting.value.iso);
  countriesISO.value = [...new Set(rawData.map((d) => d.exp_country))];
  countriesName.value = countriesISO.value.map(
    (iso) => isoToData(iso).economic
  );

  // รวม gross export
  const payload2 = {
    exp_country: countriesISO.value,
    imp_country: importing.value.iso,
    exp_sector: 0,
    year: year.value,
  };
  const res2 = await axios.post(
    `${serverData.value}va/str_component.php`,
    JSON.stringify(payload2)
  );
  const resTotalExports = res2.data.filter((x) => x.var == "Forward_linkages");
  countriesISO.value.forEach((iso) => {
    const totalx =
      resTotalExports.find((d) => d.exp_country === iso)?.total_exports ?? 0;
    gTotal.value.push(Number(totalx));
  });

  //จัดข้อมูล
  let rawFinal = rawData.map((d) => {
    let sectorID = d.exp_sector;
    const sectorData = sectorIDtoData(sectorID);
    let sectorName = translateSector({ catID: sectorID, category: sectorData.shortname }, locale.value);
    let sectorGroup = sectorIDtoData(sectorID).sectiongroup;
    let value = Number(d.value);
    let exp_country = d.exp_country;
    return {
      exp_country,
      sectorID,
      sectorName,
      sectorGroup,
      value,
    };
  });

  let sectorGroup = [
    ...new Set(sectorList.value.map((d) => d.sectiongroup)),
  ].slice(1);

  sectorGroup.forEach((group) => {
    let dataTemp = [];
    const groupCode = sectorColors.find((d) => d.id == group).code;
    countriesISO.value.forEach((iso, i) => {
      let V1 = Number(
        rawFinal
          .filter((d) => d.exp_country == iso && d.sectorGroup == group)
          .reduce((a, b) => a + b.value, 0)
          .toFixed(1)
      );
      dataTemp.push({
        y: digit1((V1 / gTotal.value[i]) * 100),
        value: V1,
        drilldown: `${iso}-${groupCode}`,
        category: countriesName.value[i],
      });
    });

    seriesMain.value.push({
      name: translateSectorGroup(group, locale.value),
      color: sectorColors.find((d) => d.id == group).color,
      data: dataTemp,
    });
  });
  // console.clear();
  countriesISO.value.forEach((iso, i) => {
    let cN = countriesName.value[i];

    sectorGroup.forEach((group) => {
      let dataTemp = [];
      let groupCode = sectorColors.find((d) => d.id == group).code;
      let gName = sectorColors.find((d) => d.id == group).name;
      let selected = rawFinal
        .filter((x) => x.exp_country == iso && x.sectorGroup == group)
        .map((d) => {
          return {
            name: d.sectorName,
            y: digit1((d.value / gTotal.value[i]) * 100),
            value: d.value,
          };
        });

      seriesDrill.value.push({
        id: `${iso}-${groupCode}`,
        name: `${cN}`,
        type: "pie",
        data: selected,
      });
    });
  });

  drawChart();

  // console.log(sectorGroup);
  // console.log("gTotal", gTotal.value);
  // console.log("sectorList", sectorList.value);
  // console.log("economyList", economyList.value);
  // console.log("countriesISO", countriesISO.value);
  // console.log("countriesName", countriesName.value);
  // console.log("rawData", rawData);
  // console.log("rawFinal", rawFinal);
  // console.log("seriesMain", seriesMain.value);
  // console.log("seriesDrill", seriesDrill.value);
};

function moneyFmt(n) {
  n = Number(n);
  if (n >= 1000) return `$${(n / 1000).toFixed(1)} ${t('forward.billion')}`;
  return `$${n.toFixed(1)} ${t('forward.million')}`;
}

function mainTooltipFormatter() {
  const categories = this.series?.chart?.xAxis?.[0]?.categories || [];
  const country = this.point.category ?? categories[this.point.x];
  return `
    <div style="min-width:220px">
      <div style="font-weight:700;font-size:16px">${country}</div>
      <div style="margin-top:4px">${this.series.name}</div>
      <div>${t('forward.share')}:&nbsp; ${this.y.toFixed(1)}%</div>
      <div>${t('forward.value')}:&nbsp; ${moneyFmt(this.point.value)}</div>
    </div>`;
}
function pieTooltipFormatter() {
  return `
    <div style="min-width:200px">
      <div style="font-weight:700">${this.point.name}</div>
      <div>${t('forward.share')}:&nbsp; ${this.y.toFixed(2)}%</div>
      <div>${t('forward.value')}:&nbsp; ${moneyFmt(this.point.value)}</div>
    </div>`;
}

const drawChart = () => {
  const title = t('forward.regionContributionTitle', { region: regionName.value, importing: importing.value.name });
  const yTitle = t('forward.percentGrossTo', { economy: importing.value.name });
  const mainSubtitleText = t('forward.clickBar');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart("chartFISingle02", {
    chart: {
      type: "column",
      backgroundColor: "#fff",
      events: {
        drilldown(e) {
          this._titleBackup = this._titleBackup || this.title?.textStr || "";
          this._subtitleBackup =
            this._subtitleBackup || this.subtitle?.textStr || "";
          this.setSubtitle({ text: null });
          this.update(
            {
              tooltip: { useHTML: true, formatter: pieTooltipFormatter },
              plotOptions: {
                pie: {
                  dataLabels: { enabled: true, format: "{point.name}" },
                  showInLegend: false,
                },
              },
              xAxis: { categories: [] },
              yAxis: { title: { text: null } },
            },
            false
          );
          const categories = this.xAxis[0].categories || [];
          const country = e.point?.category ?? categories[e.point.x];
          this.setTitle({
            text: t('forward.countrySectorTitle', { country, importing: importing.value.name }),
          });
        },
        drillup() {
          this.update(
            {
              tooltip: { useHTML: true, formatter: mainTooltipFormatter },
              plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
              xAxis: {
                categories: countriesName.value,
                tickLength: 0,
                labels: { style: { color: "#333", fontWeight: "normal" } },
              },
              yAxis: {
                min: 0,
                title: { text: yTitle },
                labels: {
                  formatter() {
                    return this.value + "%";
                  },
                },
                gridLineColor: "#eee",
              },
            },
            false
          );
          this.setTitle({ text: this._titleBackup });
          this.setSubtitle({ text: this._subtitleBackup || mainSubtitleText });
        },
      },
    },
    title: {
      text: title,
      style: { fontSize: "20px", fontWeight: 600, color: "#333" },
    },
    subtitle: { text: mainSubtitleText, style: { color: "#666" } },
    xAxis: {
      categories: countriesName.value,
      tickLength: 0,
      labels: { style: { color: "#333", fontWeight: "normal" } },
    },
    yAxis: {
      min: 0,
      title: { text: yTitle },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      itemMarginTop: 4,
      itemMarginBottom: 4,
      itemStyle: {
        whiteSpace: "nowrap",
      },
      maxHeight: 130, // ✅ จำกัดความสูง ~ 3 บรรทัด
      navigation: {
        enabled: true, // ✅ ให้มีปุ่ม 1/2 ▼
        arrowSize: 12,
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          color: "#333",
        },
        activeColor: "#000",
        inactiveColor: "#CCC",
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    tooltip: { useHTML: true, formatter: mainTooltipFormatter },
    series: seriesMain.value,
    drilldown: {
      series: seriesDrill.value,
      allowPointDrilldown: true,
      activeAxisLabelStyle: {
        cursor: "default",
        color: "#333",
        textDecoration: "none",
        fontWeight: "normal",
      },
    },
    credits: { enabled: false },
  });
};
watch(
  [
    () => year.value, // << เปลี่ยนปีให้โหลดใหม่
  ],
  async () => {
    await loadEconomyList();
    await loadSectorList();
    await loadData();
  }
);

onMounted(async () => {
  await loadEconomyList();
  await loadSectorList();
  await loadData();
});
watch(locale, () => loadData());
</script>

<style lang="scss" scoped></style>
