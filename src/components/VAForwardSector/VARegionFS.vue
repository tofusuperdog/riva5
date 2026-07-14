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
          id="chartFSSingle02"
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
const { t, locale } = useI18n();

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const sector = ref(props.inputData.sector);
const year = computed(() => Number(props.inputData?.year) || null);

/* เก็บ instance ของกราฟ เพื่อ destroy ก่อนวาดใหม่ */
let chartInstance = null;

const regionList = ref([
  "Asia-Pacific",
  "Europe",
  "North America",
  "Latin America",
  "Rest of the World",
]);

// result
const economyList = ref([]);
const regionName = ref("");
const gTotal = ref([]);
const countriesISO = ref([]);
const countriesName = ref([]);
const seriesMain = ref([]);
const seriesDrill = ref([]);

const isoToData = (iso) => {
  let dataSelected = economyList.value.find((item) => item.iso == iso);
  if (dataSelected) {
    return {
      name: dataSelected.economic,
      iso: dataSelected.iso,
      area: dataSelected.area,
    };
  } else {
    return 0;
  }
};

const isoToRegion = (iso) =>
  economyList.value.find((d) => d.iso === iso)?.region || exporting.value.name;
const valueNum = (num) => Number(Number(num).toFixed(1));

const loadEconomyList = async () => {
  const res2 = await axios.get(`${serverData.value}va/get_eco_not_group.php`);
  economyList.value = res2.data;
  // อัปเดต regionName ตาม exporting ปัจจุบัน
  if (exporting.value?.iso) regionName.value = isoToRegion(exporting.value.iso);
};

const genSeriesMain = (arr, rName) => {
  const setMain =
    rName === "Asia-Pacific"
      ? "A"
      : rName === "Europe"
      ? "B"
      : rName === "North America"
      ? "C"
      : rName === "Latin America"
      ? "D"
      : "E";
  let dataTemp = [];

  countriesISO.value.forEach((iso, i) => {
    let sumV = arr
      .filter((d) => d.area === rName && d.exp_country === iso)
      .reduce((acc, cur) => acc + Number(cur.value), 0);
    let dataAdd = {
      y: Number(((sumV / gTotal.value[i]) * 100).toFixed(1)),
      value: Number(sumV.toFixed(1)),
      drilldown: `${iso}-${setMain}`,
      category: isoToData(iso).name,
    };
    dataTemp.push(dataAdd);
  });
  return dataTemp;
};

const loadData = async () => {
  gTotal.value = [];
  countriesISO.value = [];
  countriesName.value = [];
  seriesMain.value = [];
  seriesDrill.value = [];

  /* ✅ รีเซ็ต state ก่อนคำนวณรอบใหม่ */

  const payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: year.value,
  };

  const { data: result } = await axios.post(
    `${serverData.value}va/forward_sector_region.php`,
    JSON.stringify(payload)
  );

  countriesISO.value = [...new Set(result.map((d) => d.exp_country))];
  countriesName.value = countriesISO.value.map((iso) => isoToData(iso).name);

  // รวม gross export
  const payload2 = {
    exp_country: countriesISO.value,
    imp_country: "WLD",
    exp_sector: Number(sector.value.sectorID),
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

  //จัดรูปแบบข้อมูลใหม่

  let rawAll = result
    .map((d) => {
      let indexData = countriesISO.value.findIndex((x) => x == d.exp_country);
      if (d.imp_country == "RoW") {
        return {
          exp_country: d.exp_country,
          name: "Rest of the World",
          iso: "RoW",
          area: "Rest of the World",
          year: d.year,
          value: Number(d.value),
          share: valueNum((d.value / gTotal.value[indexData]) * 100),
        };
      }
      return {
        exp_country: d.exp_country,
        name: isoToData(d.imp_country).name,
        iso: isoToData(d.imp_country).iso,
        area: isoToData(d.imp_country).area,
        year: d.year,
        value: Number(d.value),
        share: valueNum((d.value / gTotal.value[indexData]) * 100),
      };
    })
    .filter((item) => item.name);

  seriesMain.value = [
    {
      name: t('backward.charts.regionAsia'),
      color: "#1F77B4",
      data: genSeriesMain(rawAll, "Asia-Pacific"),
    },
    {
      name: t('backward.charts.regionEurope'),
      color: "#FF813D",
      data: genSeriesMain(rawAll, "Europe"),
    },
    {
      name: t('backward.charts.regionNorthAmerica'),
      color: "#2CA02C",
      data: genSeriesMain(rawAll, "North America"),
    },
    {
      name: t('backward.charts.regionLatinAmerica'),
      color: "#9467BD",
      data: genSeriesMain(rawAll, "Latin America"),
    },
    {
      name: t('backward.charts.regionRestWorld'),
      color: "#E377C2",
      data: genSeriesMain(rawAll, "Rest of the World"),
    },
  ];
  countriesISO.value.forEach((iso, i) => {
    regionList.value.forEach((rName) => {
      const setMain =
        rName === "Asia-Pacific"
          ? "A"
          : rName === "Europe"
          ? "B"
          : rName === "North America"
          ? "C"
          : rName === "Latin America"
          ? "D"
          : "E";
      let id = `${iso}-${setMain}`;
      let name = countriesName.value[i];
      let type = "pie";
      let selectedData = rawAll
        .filter((d) => d.exp_country === iso && d.area === rName)
        .map((d) => ({
          name: d.name,
          y: Number(((d.value / gTotal.value[i]) * 100).toFixed(1)),
          value: valueNum(d.value),
        }));
      seriesDrill.value.push({
        id,
        name,
        type,
        data: selectedData,
      });
    });
  });

  drawChart();
  // console.clear();

  // console.log(gTotal.value);
  // console.log("countriesISO", countriesISO.value);
  // console.log("countriesName", countriesName.value);
  // console.log("result", result);
  // console.log("rawAll", rawAll);
  // console.log("seriesMain", seriesMain.value);
  // console.log("seriesDrill", seriesDrill.value);
  // console.log("regionName", regionName.value);
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
      <div>${t('forward.share')}:&nbsp; ${this.y.toFixed(1)}%
  </div>
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
  const title = t('forward.regionDestinationTitle', { region: regionName.value, sector: sector.value.sectorShortName.toLowerCase() });
  const yTitle = t('forward.percentGrossTo', { economy: t('forward.world') });
  const mainSubtitleText = t('forward.clickBar');

  /* ✅ ทำลายกราฟเก่าก่อนวาดใหม่ */
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = Highcharts.chart("chartFSSingle02", {
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
            text: t('forward.countryDestinationTitle', { country, sector: sector.value.sectorShortName.toLowerCase() }),
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
    legend: { align: "center", verticalAlign: "bottom" },
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
    await loadData();
  }
);

onMounted(async () => {
  await loadEconomyList();
  await loadData();
});
watch(locale, () => loadData());
</script>

<style lang="scss" scoped></style>
