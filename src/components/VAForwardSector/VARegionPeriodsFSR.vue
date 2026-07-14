<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto bg-white border border-[#DDDDDD] rounded-md mt-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-lg font-bold fblack">{{ t('forward.regionPeriods') }}</div>
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
      <div
        class="w-full lg:w-[60%] flex justify-center pt-4"
        v-show="!isLoading"
      >
        <div
          id="chartFSRange02"
          class="w-full max-w-[600px] min-h-[500px]"
        ></div>
      </div>
      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full mb-2"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t('forward.viewLess') : t('forward.viewMore') }}
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
            <u>{{ t('backward.charts.breakdown') }}</u>
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
            id="chartFSRange02-breakdown"
            style="height: 420px; width: 100%"
          ></div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('backward.charts.close')" color="primary" v-close-popup />
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
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

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
    title: t('backward.charts.regionAsia'),
    color: "#1E88E5",
    icon: "images/asia.svg",
    desc: "",
  },
  {
    id: 1,
    key: "Europe",
    title: t('backward.charts.regionEurope'),
    color: "#FB8C00",
    icon: "images/europe.svg",
    desc: "",
  },
  {
    id: 2,
    key: "North America",
    title: t('backward.charts.regionNorthAmerica'),
    color: "#2E7D32",
    icon: "images/northamerica.svg",
    desc: "",
  },
  {
    id: 3,
    key: "Latin America",
    title: t('backward.charts.regionLatinAmerica'),
    color: "#8E24AA",
    icon: "images/latinamerica.svg",
    desc: "",
  },
  {
    id: 4,
    key: "Rest of the World",
    title: t('backward.charts.regionRestWorld'),
    color: "#EC69B3",
    icon: "images/row.svg",
    desc: "",
  },
]);

const ecoList = ref([]);
const categories = ref([]);
const totalF = ref([]);
const seriesMain = ref([]);
const seriesDrill = ref([]);

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const build2Range = (s, e) => {
  let start = Number(s);
  let end = Number(e);

  const len = end - start + 1;
  // เคสเหมือนของเดิม: ต่างกัน 1 ปี -> แยกซ้ายขวาเป็นคนละปี
  if (len === 2) {
    return [{ label1: start, label2: end, y1: [start], y2: [end] }];
  }

  // คำนวณจุดแบ่ง
  const mid = start + Math.floor(len / 2);
  const isEven = len % 2 === 0;
  const leftEnd = isEven ? mid - 1 : mid;
  const rightStart = isEven ? mid : mid;

  const label1 = leftEnd === start ? String(start) : `${start}-${leftEnd}`;
  const label2 = rightStart === end ? String(end) : `${rightStart}-${end}`;

  const y1 = buildYearRange(start, leftEnd);
  const y2 = buildYearRange(rightStart, end);

  return [{ label1, label2, y1, y2 }];
};

const numMoney = (num) => {
  return Number(Number(num).toFixed(1));
};

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

const numMoneyBM = (num) => {
  num = Number(num);
  if (num < 1000) {
    return num.toFixed(1) + " " + t('forward.million');
  } else {
    return (num / 1000).toFixed(1) + " " + t('forward.billion');
  }
};

const loadData = async () => {
  isLoading.value = true;
  let payload = {
    exp_country: exporting.value.iso,
    exp_sector: Number(sector.value.sectorID),
    year: buildYearRange(yearStart, yearEnd),
  };

  const raw = await axios.post(
    `${serverData.value}va/forward_sector.php`,
    JSON.stringify(payload),
  );

  let rawFilter = raw.data.filter((x) => Number(x.value) > 0);
  let rawAll = rawFilter
    .map((d) => {
      if (d.imp_country == "RoW") {
        return {
          name: "Rest of the World",
          iso: "RoW",
          area: "Rest of the World",
          year: d.year,
          value: Number(d.value),
          total: Number(d.totalvalue),
        };
      }
      return {
        name: isoToName(d.imp_country).name,
        iso: isoToName(d.imp_country).iso,
        area: isoToName(d.imp_country).area,
        year: d.year,
        value: Number(d.value),
        total: Number(d.totalvalue),
      };
    })
    .filter((item) => item.name);

  let yearP = buildYearRange(yearStart, yearEnd);

  categories.value = [...build2Range(yearStart, yearEnd)];

  let totalFtemp = [];
  yearP.forEach((year) => {
    let selectData = rawAll.filter((d) => Number(d.year) == year)[0].total;
    totalFtemp.push(Number(selectData));
  });

  let y1End = categories.value[0].y1[categories.value[0].y1.length - 1];
  let y1Index = yearP.findIndex((x) => x == y1End);
  let totalFtemp1 = +totalFtemp
    .slice(0, y1Index + 1)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);
  let y2Start = categories.value[0].y2[0];
  let y2Index = yearP.findIndex((x) => x == y2Start);
  let totalFtemp2 = +totalFtemp
    .slice(y2Index, totalFtemp.length)
    .reduce((a, b) => a + b, 0)
    .toFixed(2);

  let rawAll1 = rawAll.filter(
    (x) =>
      Number(x.year) <=
      categories.value[0].y1[categories.value[0].y1.length - 1],
  );
  let rawAll2 = rawAll.filter(
    (x) => Number(x.year) >= categories.value[0].y2[0],
  );

  totalF.value = [totalFtemp1, totalFtemp2];
  seriesMain.value = [];
  regionCards.value.forEach((item) => {
    // Keep the API/data key in English and translate only the visible label.
    // Using item.title here makes every non-English locale filter out all data.
    let rName = item.key;
    let selectedData = rawAll1
      .filter((d) => d.area == rName)
      .reduce((a, b) => a + Number(b.value), 0);
    let selectedData2 = rawAll2
      .filter((d) => d.area == rName)
      .reduce((a, b) => a + Number(b.value), 0);
    seriesMain.value.push({
      name: item.title,
      color: item.color,
      data: [
        {
          y: numMoney((selectedData / totalF.value[0]) * 100),
          value: numMoney(selectedData),
        },
        {
          y: numMoney((selectedData2 / totalF.value[1]) * 100),
          value: numMoney(selectedData2),
        },
      ],
    });
  });

  seriesDrill.value = [];
  regionCards.value.forEach((item) => {
    let rName = item.key;
    let selectedData1 = rawAll1.filter((d) => d.area == rName);
    let selectedData2 = rawAll2.filter((d) => d.area == rName);
    let ecoCheck = [...new Set(selectedData1.map((d) => d.iso))];
    let tempInput = [];
    ecoCheck.forEach((eco) => {
      let v1 = Number(
        selectedData1
          .filter((d) => d.iso == eco)
          .reduce((a, b) => a + Number(b.value), 0)
          .toFixed(1),
      );
      let v2 = Number(
        selectedData2
          .filter((d) => d.iso == eco)
          .reduce((a, b) => a + Number(b.value), 0)
          .toFixed(1),
      );
      tempInput.push({
        name: isoToName(eco).name,
        data: [
          {
            y: numMoney((v1 / totalF.value[0]) * 100),
            value: numMoney(v1),
          },
          {
            y: numMoney((v2 / totalF.value[1]) * 100),
            value: numMoney(v2),
          },
        ],
      });
    });

    tempInput.sort(
      (a, b) => Number(b.data?.[1]?.y ?? 0) - Number(a.data?.[1]?.y ?? 0),
    );
    seriesDrill.value.push(tempInput);
  });

  if (seriesDrill.value[4]?.[0]) {
    seriesDrill.value[4][0].name = t('backward.charts.regionRestWorld');
  }
  for (let i = 0; i < 3; i++) {
    seriesDrill.value[i].sort((a, b) => b.data[1].y - a.data[1].y);
  }
  isLoading.value = false;
  desGen();
  drawChart();
};

const desGen = () => {
  regionCards.value.forEach((item, i) => {
    let lasty = seriesMain.value[i].data[1].y;
    let firsty = seriesMain.value[i].data[0].y;
    let diff = lasty - firsty;
    let textdiff = t('backward.charts.unchanged');
    if (diff < 0) {
      textdiff = t('backward.charts.downBy', { value: Math.abs(diff).toFixed(1) });
    } else if (diff > 0) {
      textdiff = t('backward.charts.upBy', { value: Math.abs(diff).toFixed(1) });
    }
    let textAdd = "";
    if (i != 4) {
      textAdd = t('forward.topRegionalDestination', {
        economy: seriesDrill.value[i][0].name,
        share: seriesDrill.value[i][0].data[1].y,
      });
    }
    let des = `${t('forward.destinationPeriodDescription', {
      current: categories.value[0].label2,
      share: lasty,
      exporting: exporting.value.name,
      sector: sector.value.sectorShortName,
      destination: item.title,
      change: textdiff,
      previous: categories.value[0].label1,
    })} ${textAdd}`;
    item.desc = des;
  });
};

const drawChart = () => {
  let title = t('forward.regionForwardPeriodsTitle', { exporting: exporting.value.name, sector: sector.value.sectorShortName.toLowerCase() });
  let categoriesData = [categories.value[0].label1, categories.value[0].label2];
  let series = seriesMain.value;
  Highcharts.chart("chartFSRange02", {
    chart: {
      type: "column",
    },
    title: {
      text: title,
      style: { fontSize: "24px", fontWeight: 600, color: "#333" },
    },
    yAxis: {
      title: {
        text: t('forward.percentForward'),
      },
      labels: {
        format: "{value}%",
      },
      min: 0,
      max: 100,
    },
    xAxis: {
      categories: categoriesData,
      tickLength: 0,
    },
    tooltip: {
      useHTML: true,
      borderRadius: 6,

      formatter() {
        return `<div style="font-weight:700">${this.series.name}</div>
        <div>${t('forward.year')}: ${this.key}</div>
        <div>${t('forward.share')}: ${this.y.toFixed(1)}% ${t('forward.ofForward')}</div>
        <div>${t('forward.value')}: ${numMoneyBM(this.point.value)}</div>
        `;
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    series: series,
    credits: { enabled: false },
  });
};

const loadEconomyList = async () => {
  const { data: economyList } = await axios.get(
    `${serverData.value}va/get_eco_not_group.php`,
  );
  ecoList.value = economyList;
};

/* =================================================================
   Breakdown dialog
   ================================================================= */
const dlg = ref({ open: false, title: "", regionKey: "" });

function openBreakdown(card) {
  dlg.value = { open: true, title: card.title, regionKey: card.id };
}

const drawBreakdown = () => {
  let categoriesData = [categories.value[0].label1, categories.value[0].label2];

  Highcharts.chart("chartFSRange02-breakdown", {
    chart: {
      type: "column",
    },
    title: {
      text: null,
    },
    yAxis: {
      title: {
        text: t('forward.percentForward'),
      },
      labels: {
        format: "{value}%",
      },
      min: 0,
    },
    xAxis: {
      categories: categoriesData,
      tickLength: 0,
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
    tooltip: {
      useHTML: true,
      borderRadius: 6,

      formatter() {
        return `<div style="font-weight:700">${this.series.name}</div>
        <div>${t('forward.year')}: ${this.key}</div>
        <div>${t('forward.share')}: ${this.y.toFixed(1)}% ${t('forward.ofForward')}</div>
        <div>${t('forward.value')}: ${numMoneyBM(this.point.value)}</div>
        `;
      },
    },
    plotOptions: { column: { stacking: "normal", borderWidth: 0 } },
    series: seriesDrill.value[dlg.value.regionKey],
    credits: { enabled: false },
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
watch(locale, () => {
  const titles = [
    t('backward.charts.regionAsia'),
    t('backward.charts.regionEurope'),
    t('backward.charts.regionNorthAmerica'),
    t('backward.charts.regionLatinAmerica'),
    t('backward.charts.regionRestWorld'),
  ];
  regionCards.value.forEach((card, index) => { card.title = titles[index]; });
  loadData();
});
</script>

<style lang="scss" scoped></style>
