<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">Region across years</div>
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

    <div class="flex flex-col lg:flex-row" v-show="!isLoading">
      <!-- กราฟหลัก -->
      <div
        class="w-full lg:w-[60%] flex justify-center pt-4"
        v-show="!isLoading"
      >
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
      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 w-full lg:w-[40%] fsub"
        v-show="showDetail && !isLoading"
      >
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

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();

// ===== Basic state =====
const showDetail = ref($q.screen.gt.sm);
const isLoading = ref(true);

// ===== input from parent component =====
const exporting = ref(props.inputData.exporting);
const sector = ref(props.inputData.sector);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);

const regionCards = ref([
  {
    id: 0,
    key: "Asia-Pacific",
    title: "Asia-Pacific",
    color: "#1E88E5",
    icon: "images/asia.svg",
    desc: "",
  },
  {
    id: 1,
    key: "Europe",
    title: "Europe",
    color: "#FB8C00",
    icon: "images/europe.svg",
    desc: "",
  },
  {
    id: 2,
    key: "North America",
    title: "North America",
    color: "#2E7D32",
    icon: "images/northamerica.svg",
    desc: "",
  },
  {
    id: 3,
    key: "Latin America",
    title: "Latin America",
    color: "#8E24AA",
    icon: "images/latinamerica.svg",
    desc: "",
  },
  {
    id: 4,
    key: "Rest of the World",
    title: "Rest of the World",
    color: "#EC69B3",
    icon: "images/row.svg",
    desc: "",
  },
]);

// ===== Data for calculation =====
const ecoList = ref([]);
const categories = ref([]);
const totalF = ref([]);
const seriesMain = ref([]);
const seriesDrill = ref([]);

// === Helper ===
const rangeYear = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
const shareNum = (num) => Number((Number(num) * 100).toFixed(1));

const isoToName = (iso) => {
  let dataSelected = ecoList.value.find((item) => item.iso == iso);
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

const loadEconomyList = async () => {
  const { data: economyList } = await axios.get(
    `${serverData.value}va/get_eco_not_group.php`,
  );
  ecoList.value = economyList;
};

// === Load Main data ===
const loadData = async () => {
  isLoading.value = true;
  categories.value = rangeYear(yearStart, yearEnd);
  let payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: rangeYear(yearStart, yearEnd),
  };

  const { data: raw } = await axios.post(
    `${serverData.value}va/forward_sector.php`,
    JSON.stringify(payload),
  );

  totalF.value = [];
  categories.value.forEach((year) => {
    let selectData = raw.filter((d) => d.year == year)[0].totalvalue;
    totalF.value.push(Number(selectData));
  });

  let rawFinal = raw
    .map((d) => {
      let cData;
      if (d.imp_country == "RoW") {
        cData = {
          name: "Rest of the World",
          iso: "RoW",
          area: "Rest of the World",
        };
      } else {
        cData = isoToName(d.imp_country);
      }

      if (cData != 0) {
        let cName = cData.name;
        let cISO = cData.iso;
        let cArea = cData.area;
        let year = d.year;
        let value = Number(d.value);

        let share = Number(
          ((d.value / totalF.value[year - yearStart]) * 100).toFixed(1),
        );
        return {
          name: cName,
          iso: cISO,
          area: cArea,
          year: year,
          value: value,
          share: share,
        };
      }
    })
    .filter(Boolean);

  seriesMain.value = [];
  regionCards.value.forEach((r) => {
    let regionN = r.key;
    let dataMain = [];
    categories.value.forEach((year) => {
      let selectData = rawFinal.filter(
        (d) => d.year == year && d.area == regionN,
      );
      let sumData = Number(
        selectData.reduce((a, b) => a + Number(b.value), 0).toFixed(1),
      );

      let sharePer = shareNum(sumData / totalF.value[year - yearStart]);
      dataMain.push({
        y: sharePer,
        value: sumData,
      });
    });

    seriesMain.value.push({
      name: r.title,
      data: dataMain,
      color: r.color,
    });
  });

  seriesDrill.value = [];
  let dataDrill = [];
  regionCards.value.forEach((r) => {
    let regionN = r.key;
    let selectData = rawFinal.filter((d) => d.area == regionN && d.value != 0);

    let ecoTemp = [...new Set(selectData.map((x) => x.iso))]; // uniq
    dataDrill = [];
    ecoTemp.forEach((e) => {
      let dataTemp = [];
      categories.value.forEach((year, i) => {
        if (selectData.find((x) => x.iso == e && x.year == year) == undefined) {
          dataTemp.push({
            y: 0,
            value: 0,
          });
        } else {
          dataTemp.push({
            y: Number(
              selectData.find((x) => x.iso == e && x.year == year).share,
            ),
            value: selectData.find((x) => x.iso == e && x.year == year).value,
          });
        }
      });
      dataDrill.push({
        name: isoToName(e).name,
        data: dataTemp,
      });
    });
    seriesDrill.value.push(
      dataDrill.sort(
        (a, b) => b.data[yearEnd - yearStart].y - a.data[yearEnd - yearStart].y,
      ),
    );
  });
  seriesDrill.value[4][0].name = "Rest of the World";
  isLoading.value = false;

  genDes();
  drawMainChart();
};

const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);

  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} billion`;
  return `$${n.toFixed(1)} million`;
};

const genDes = () => {
  for (let i = 0; i < 5; i++) {
    let lasty = seriesMain.value[i].data[yearEnd - yearStart].y;
    let firsty = seriesMain.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = "unchanged";
    if (diff < 0) {
      textdiff = "down by " + Math.abs(diff).toFixed(1) + " percentage points";
    } else if (diff > 0) {
      textdiff = "up by " + Math.abs(diff).toFixed(1) + " percentage points";
    }
    let top = "";
    if (i != 4) {
      top = `${
        seriesDrill.value[i][0].name
      } is the top regional destination, accounting for ${
        seriesDrill.value[i][0].data[yearEnd - yearStart].y
      }% of ${exporting.value.name}'s intermediate exports to GVCs.`;
    }

    let des = `${lasty}% of ${exporting.value.name}'s Forward linkages go to ${regionCards.value[i].title}, ${textdiff} since  ${yearStart}. ${top} `;
    regionCards.value[i].desc = des;
  }
};
/* =================================================================
   Breakdown dialog
   ================================================================= */
const dlg = ref({ open: false, title: "", regionKey: "" });

function openBreakdown(card) {
  dlg.value = { open: true, title: card.title, regionKey: card.id };
}

const drawBreakdown = () => {
  let series = seriesDrill.value[dlg.value.regionKey];
  const years = categories.value.map(String);
  Highcharts.chart("chartBSRange01-breakdown", {
    chart: { type: "column", backgroundColor: "#fff" },
    title: { text: null },
    xAxis: { categories: years, tickLength: 0 },
    yAxis: {
      min: 0,
      title: { text: "Percent of Forward Linkage" },
      labels: {
        formatter() {
          return this.value + "%";
        },
      },
      gridLineColor: "#eee",
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,

      formatter() {
        return `<div style="font-weight:700">${this.series.name}</div>
        <div>Year: ${this.category}</div>
        <div>Share: ${this.y.toFixed(1)}% of forward linkages</div>
        <div>Value: ${moneyShort(this.point.value)}</div>`;
      },
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
      maxHeight: 100, // ≈ 3 แถว (22px ต่อแถว โดยประมาณ)

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
    credits: { enabled: false },
    series,
  });
};

const drawMainChart = () => {
  let categoriesData = categories.value.map(String);
  let series = seriesMain.value;
  let title = `In which regions do ${
    exporting.value.name
  }'s exports in ${sector.value.sectorShortName.toLowerCase()} contribute the most towards the production of further exports?`;

  Highcharts.chart("chartBSRange01", {
    chart: { type: "spline", backgroundColor: "#fff" },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    xAxis: { categories: categoriesData, tickLength: 0 },
    yAxis: {
      min: 0,

      title: { text: "Percent of Forward Linkages" },
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
      borderRadius: 6,
      formatter() {
        const i = this.point.index ?? this.point.x ?? 0;
        const year = categoriesData[i]; // ปีจากแกน X
        const share = this.y ?? this.point.y ?? 0; // ค่า % จากแกน Y
        // คุณ push point แบบ { y: sharePer, value: sumData }
        const valueRaw = this.point.value ?? this.point.options?.value ?? null;

        return `
          <div style="min-width:220px">
            <div style="font-weight:700">${this.series.name}</div>
            <div>Year: ${year}</div>
            <div>Share:&nbsp; ${share.toFixed(1)}% of forward linkages</div>
               <div>Value:&nbsp; ${moneyShort(Number(valueRaw))}</div>
          </div>
        `;
      },
    },

    plotOptions: {
      series: { lineWidth: 3, states: { hover: { lineWidth: 3 } } },
    },
    credits: { enabled: false },
    series,
  });
};

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge),
);

onMounted(async () => {
  await loadEconomyList();
  await loadData();
});
</script>

<style lang="scss" scoped></style>
