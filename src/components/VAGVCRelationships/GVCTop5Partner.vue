<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 border-1 bg-white border-[#DDDDDD] rounded-md mt-2 md:mt-4 pb-2 md:pb-4"
  >
    <div class="p-2 text-left pl-4 text-lg text-bold fblack">
      {{ t('gvc.topPartnersPeriods') }}
    </div>
    <div class="h-1 border-b-1 border-b-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <!-- Backward -->
      <div class="flex-1">
        <div
          id="chartTop5PartnerBack"
          class="w-full max-w-[500px] mx-auto"
        ></div>
      </div>
      <!-- Forward -->
      <div class="flex-1">
        <div
          id="chartTop5PartnerFor"
          class="w-full max-w-[500px] mx-auto"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useQuasar } from "quasar";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

// ===== props / server =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();
const { t, locale } = useI18n({ useScope: "global" });

// ===== input from parent component =====
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);
const countryName = translateEconomy(props.inputData.exporting, locale.value);

// ===== state =====
const periods = ref({ p1Years: [], p2Years: [], p1Label: "", p2Label: "" });
const top5Backward = ref({ p1: [], p2: [] }); // [{imp_eco,total,sector}]
const top5Forward = ref({ p1: [], p2: [] }); // [{imp_eco,total,sector}]

//เก็บ total ของ Backward / Forward / Total Exports แต่ละ Period
const sumBackwardP1 = ref(0);
const sumBackwardP2 = ref(0);
const sumForwardP1 = ref(0);
const sumForwardP2 = ref(0);
const sumGrossP1 = ref(0);
const sumGrossP2 = ref(0);

// เก็บ total ต่อ eco (ใช้คำนวณ subtitle “up from …%”)
const backTotalsByEcoP1 = ref({});
const backTotalsByEcoP2 = ref({});
const forTotalsByEcoP1 = ref({});
const forTotalsByEcoP2 = ref({});

// ===== helpers =====

/**
 * Builds an array of years from start (s) to end (e) inclusive.
 * @param {number} s - start year
 * @param {number} e - end year
 * @returns {number[]} array of years
 */
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

/**
 * Splits an array of years into two periods of equal length, with the last
 * year of the first period being the first year of the second period if the
 * length of the array is odd.
 *
 * @param {number[]} years - array of years
 * @returns {{p1Years: number[], p2Years: number[], p1Label: string, p2Label: string}} - object with the two periods
 */
function splitToTwoPeriods(years) {
  const n = years.length;
  let p1Years, p2Years;
  if (n % 2 === 0) {
    const half = n / 2;
    p1Years = years.slice(0, half);
    p2Years = years.slice(half);
  } else {
    const half = Math.floor(n / 2) + 1;
    p1Years = years.slice(0, half);
    p2Years = years.slice(half - 1);
  }
  return {
    p1Years,
    p2Years,
    p1Label: `${p1Years[0]}-${p1Years[p1Years.length - 1]}`,
    p2Label: `${p2Years[0]}-${p2Years[p2Years.length - 1]}`,
  };
}

// รวม value ตาม eco (กรองปีได้ด้วย yearSet)
function sumByEco(rows, yearSet = null) {
  return rows.reduce((acc, r) => {
    // ถ้ามีการส่ง yearSet มา (ไม่ใช่ null)
    if (yearSet !== null) {
      const year = Number(r.year);

      // ถ้าปีนี้ไม่ได้อยู่ใน yearSet → ข้ามไป ไม่เอาค่านี้
      if (!yearSet.has(year)) {
        return acc;
      }
    }

    // ถ้าไม่มี yearSet หรือปีอยู่ใน yearSet → สะสมค่า
    const k = String(r.imp_country); // key = sector
    const v = Number(r.value) || 0; // value = ตัวเลข (fallback = 0)

    // สะสมค่า eco เดิม + ค่าใหม่
    if (acc[k] === undefined) {
      acc[k] = v;
    } else {
      acc[k] += v;
    }

    return acc;
  }, {});
}

// เลือก Top N พร้อมชื่อ eco
function pickTopNEcos(totalObj, n, ecoMap) {
  return Object.entries(totalObj)
    .map(([imp_eco, total]) => ({
      imp_eco,
      total,
      ecoName: ecoMap.get(String(imp_eco)) ?? `Sector ${imp_eco}`,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

const PALETTE10 = [
  "#9CCC65",
  "#FF7043",
  "#AB47BC",
  "#3FBFCF",
  "#8D6E63",
  "#EC407A",
  "#FFA726",
  "#66BB6A",
  "#42A5F5",
  "#7E57C2",
];

// million -> billion (คงที่ 1 ตำแหน่ง)
const toB = (n) => Number((Number(n) / 1000).toFixed(1));
const fmtB = (n) => `$${toB(n).toFixed(1)}B`;
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

// ----- สร้าง series ซ้อน (stacked) ให้มี 5 sector/แท่งเสมอ + ฝัง share ใน point
function buildStackedSeriesTop5(top5, labels, denomB0, denomB1) {
  // denomB0/1 คือ “ผลรวมลิงเคจ” ของแต่ละช่วง (หน่วย: billion)
  const p1Map = Object.fromEntries(top5.p1.map((d) => [String(d.imp_eco), d]));
  const p2Map = Object.fromEntries(top5.p2.map((d) => [String(d.imp_eco), d]));

  // รวม eco ids สูงสุด 10 (กันกรณี top5 แต่ละช่วงไม่ซ้ำกัน)
  const ids = [
    ...top5.p1.map((d) => String(d.imp_eco)),
    ...top5.p2
      .map((d) => String(d.imp_eco))
      .filter((id) => !top5.p1.some((d) => String(d.imp_eco) === id)),
  ].slice(0, 10);

  // จัดอันดับจาก “ผลรวมสองช่วง” มาก -> น้อย เพื่อให้ก้อนใหญ่สุดอยู่ล่าง
  const ranked = ids
    .map((code) => {
      const name =
        p1Map[code]?.ecoName || p2Map[code]?.ecoName || `ecoName ${code}`;
      const v1B = toB(p1Map[code]?.total || 0);
      const v2B = toB(p2Map[code]?.total || 0);
      return { code, name, v1B, v2B, key: v1B + v2B };
    })
    .sort((a, b) => b.key - a.key);

  return ranked.map((s, i) => {
    const share0 = denomB0 > 0 ? (s.v1B / denomB0) * 100 : 0;
    const share1 = denomB1 > 0 ? (s.v2B / denomB1) * 100 : 0;
    return {
      name: s.name,
      color: PALETTE10[i % PALETTE10.length],
      data: [
        { y: s.v1B, period: labels[0], share: share0 },
        { y: s.v2B, period: labels[1], share: share1 },
      ],
    };
  });
}

// ----- สร้าง subtitle ตามสเปค
function buildSubtitle({
  linkType, // 'backward linkages' | 'forward linkages'
  country,
  p1Label,
  p2Label,
  totalLinkP1,
  totalLinkP2, // sum (million) ของช่วงขวา
  totalGrossP2, // sum gross exports (million) ของช่วงขวา
  totalsBySectorP1, // object sector->sum (million)
  totalsBySectorP2, // object sector->sum (million)
  ecoMap, // Map(catID -> name)
}) {
  // sector ที่ใหญ่สุดในช่วงขวา
  const topP2 = Object.entries(totalsBySectorP2)
    .map(([k, v]) => ({ k, v }))
    .sort((a, b) => b.v - a.v)[0];

  const topName = ecoMap.get(String(topP2?.k)) ?? `Sector ${topP2?.k ?? "-"}`;

  const shareGrossP2 =
    totalGrossP2 > 0 ? (totalLinkP2 / totalGrossP2) * 100 : 0;

  const shareTopP2 =
    totalLinkP2 > 0 ? (Number(topP2?.v || 0) / totalLinkP2) * 100 : 0;

  const shareTopP1 =
    (Number(totalsBySectorP1[String(topP2?.k)] || 0) / totalLinkP1) * 100;
  const directionShare = shareTopP2 - shareTopP1 > 0 ? "up" : "down";

  return t('gvc.chartPeriodsTitle', { economy: country });
}

// ----- Plot common options
function makeCommonOptions({
  title,
  subtitle,
  categories,
  series,
  kind,
  titleColor,
}) {
  return {
    chart: { type: "column" },
    title: {
      text: title,
      style: { color: titleColor, fontWeight: 600 }, // << กำหนดสีของ Title
    },
    subtitle: { text: subtitle },

    xAxis: {
      categories,
      tickLength: 0,
      gridLineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: t('gvc.usdBillion') },
      reversedStacks: false,
    },
    legend: {
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      floating: false,
      itemStyle: { fontSize: "12px" },
      itemMarginTop: 2,
      itemMarginBottom: 2,
      symbolRadius: 6,
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          formatter() {
            return this.y ? `${this.y.toFixed(1)}B` : null;
          },
          style: { textOutline: "none", fontWeight: 600, fontSize: "11px" },
        },
      },
    },
    tooltip: {
      useHTML: true,
      formatter() {
        const period = this.point?.period ?? this.point?.category ?? "";
        const val = (this.y ?? 0).toFixed(1);
        // ใช้ share ที่คำนวณไว้ใน point เพื่อบอกว่าเป็น % ของ backward/forward
        const shareText = `${(this.point?.share ?? 0).toFixed(1)}% ${kind}`;
        return `<b>${this.series.name}</b><br/>${t('gvc.period')}: ${period}<br/>${t('gvc.share')}: ${shareText}<br/>${t('gvc.value')}: $${val} ${t('gvc.billion')}`;
      },
    },
    series,
    credits: { enabled: false },
  };
}

// ===== load & render =====
async function loadTop5Partner() {
  const years = buildYearRange(yearStart, yearEnd);
  periods.value = splitToTwoPeriods(years);
  const p1Set = new Set(periods.value.p1Years);
  const p2Set = new Set(periods.value.p2Years);

  const urlData = `${serverData.value}va/gvc_toppartner_overview.php`;
  const payload = { exp_country: props.inputData.exporting.iso, year: years };
  const urlEco = `${serverData.value}va/get_eco_not_group.php`;

  const [resData, ecoRows] = await Promise.all([
    axios.post(urlData, JSON.stringify(payload)).then((r) => r.data),
    axios.get(urlEco).then((r) => r.data),
  ]);

  const ecoMap = new Map(ecoRows.map((s) => [String(s.iso), translateEconomy({ iso: s.iso, name: s.economic }, locale.value)]));

  // แตกเป็น Backward / Forward
  const backRows = resData.filter((r) => r.var === "Backward_linkages");
  const forRows = resData.filter(
    (r) => r.var === "Forward_linkages" || r.var === "Forward_linkages2"
  );

  // รวมตาม eco (ล้าน USD)
  backTotalsByEcoP1.value = sumByEco(backRows, p1Set);
  backTotalsByEcoP2.value = sumByEco(backRows, p2Set);
  forTotalsByEcoP1.value = sumByEco(forRows, p1Set);
  forTotalsByEcoP2.value = sumByEco(forRows, p2Set);

  // เลือก Top5/ช่วง
  top5Backward.value = {
    p1: pickTopNEcos(backTotalsByEcoP1.value, 5, ecoMap),
    p2: pickTopNEcos(backTotalsByEcoP2.value, 5, ecoMap),
  };
  top5Forward.value = {
    p1: pickTopNEcos(forTotalsByEcoP1.value, 5, ecoMap),
    p2: pickTopNEcos(forTotalsByEcoP2.value, 5, ecoMap),
  };

  // โหลด total export + รวมลิงเคจ เพื่อใส่ subtitle และ tooltip share
  const urlTotal = `${serverData.value}/va/gvc_overview.php`;
  const totalPayload = {
    exp_country: props.inputData.exporting.iso,
    year: years,
  };
  const resultTotal = await axios
    .post(urlTotal, JSON.stringify(totalPayload))
    .then((r) => r.data);

  // รวมยอดลิงเคจ + gross exports แยก 2 ช่วง (ล้าน USD)
  sumBackwardP1.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);
  sumBackwardP2.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  sumForwardP1.value = resultTotal
    .filter((r) => r.var === "Forward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);
  sumForwardP2.value = resultTotal
    .filter((r) => r.var === "Forward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  // ใช้ total_exports จากฝั่ง Backward (ค่าเท่ากันในปีเดียวกัน)
  sumGrossP1.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);
  sumGrossP2.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);

  // ===== Render: Backward =====
  {
    const cats = [periods.value.p1Label, periods.value.p2Label];
    const series = buildStackedSeriesTop5(
      top5Backward.value,
      cats,
      toB(sumBackwardP1.value), // denom (billion) ของช่วงซ้าย
      toB(sumBackwardP2.value) // denom (billion) ของช่วงขวา
    );
    const subtitle = buildSubtitle({
      linkType: "backward linkages",

      country: countryName,
      p1Label: periods.value.p1Label,
      p2Label: periods.value.p2Label,
      totalLinkP1: sumBackwardP1.value,
      totalLinkP2: sumBackwardP2.value,
      totalGrossP2: sumGrossP2.value,
      totalsBySectorP1: backTotalsByEcoP1.value,
      totalsBySectorP2: backTotalsByEcoP2.value,
      ecoMap,
    });
    Highcharts.chart(
      "chartTop5PartnerBack",
      makeCommonOptions({
        title: t('gvc.backward'),
        titleColor: "#56A13F",
        subtitle,
        categories: cats,
        series,
        kind: t('gvc.backward'),
      })
    );
  }

  // ===== Render: Forward =====
  {
    const cats = [periods.value.p1Label, periods.value.p2Label];

    const series = buildStackedSeriesTop5(
      top5Forward.value,
      cats,
      toB(sumForwardP1.value), // denom (billion) ของช่วงซ้าย
      toB(sumForwardP2.value) // denom (billion) ของช่วงขวา
    );

    const subtitle = buildSubtitle({
      linkType: "forward linkages",

      country: countryName,
      p1Label: periods.value.p1Label,
      p2Label: periods.value.p2Label,
      totalLinkP1: sumForwardP1.value,
      totalLinkP2: sumForwardP2.value,
      totalGrossP2: sumGrossP2.value,
      totalsBySectorP1: forTotalsByEcoP1.value,
      totalsBySectorP2: forTotalsByEcoP2.value,
      ecoMap,
    });
    Highcharts.chart(
      "chartTop5PartnerFor",
      makeCommonOptions({
        title: t('gvc.forward'),
        titleColor: "#4BAEED", // << สีฟ้า
        subtitle,
        categories: cats,
        series,
        kind: t('gvc.forward'),
      })
    );
  }
}

onMounted(loadTop5Partner);
</script>

<style lang="scss" scoped></style>
