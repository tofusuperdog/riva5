<template>
  <div
    class="max-w-[1200px] w-[95%] mx-auto relative z-100 border-1 bg-white border-[#DDDDDD] rounded-md mt-2 md:mt-4 pb-2 md:pb-4"
  >
    <!-- หัวข้อ -->
    <div class="p-2 text-left pl-4 text-lg text-bold fblack">
      {{ t('gvc.acrossPeriods') }}
    </div>
    <div class="h-1 border-b-1 border-b-[#DDDDDD]"></div>

    <div class="flex flex-col lg:flex-row">
      <!-- กราฟหลัก -->
      <div class="w-full lg:w-[60%] flex items-center justify-center pt-4">
        <div id="chartGVCRange02" class="w-full max-w-[600px]"></div>
      </div>

      <!-- ปุ่ม View more/less -->
      <div
        class="lg:hidden text-[#0672CB] cursor-pointer text-center font-semibold w-full"
        @click="showDetail = !showDetail"
      >
        {{ showDetail ? t('gvc.viewLess') : t('gvc.viewMore') }}
        <q-icon
          :name="showDetail ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        />
      </div>

      <!-- รายละเอียด -->
      <div
        class="p-4 pt-4 w-full lg:w-[40%] flex items-center"
        v-show="showDetail"
      >
        <div>
          <div class="flex items-center">
            <img src="/images/vaBackwardG.svg" />
            <div class="backwardC text-2xl pl-2 font-medium">
              {{ t('gvc.backward') }}
            </div>
          </div>
          <div class="backwardC">
            {{ t('gvc.fvaExports', { economy: countryName }) }}
          </div>
          <div class="fsub">{{ desBackward }}</div>

          <div class="flex items-center pt-4">
            <img src="/images/vaForwardG.svg" />
            <div class="forwardC text-2xl pl-2 font-medium">
              {{ t('gvc.forward') }}
            </div>
          </div>
          <div class="forwardC">
            {{ t('gvc.dvaForeignExports', { economy: countryName }) }}
          </div>
          <div class="fsub">{{ desForward }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { serverSetup } from "../../pages/server";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

// ===== Props / Server / Screen =====
const props = defineProps({ inputData: Object });
const { serverData } = serverSetup();
const $q = useQuasar();
const { t, locale } = useI18n({ useScope: "global" });

// ===== Basic state =====
const countryName = translateEconomy(props.inputData.exporting, locale.value);
const yearStart = Number(props.inputData.yearStart);
const yearEnd = Number(props.inputData.yearEnd);
const showDetail = ref($q.screen.gt.sm);

// ===== Chart data state (รวมเป็นก้อนต่อช่วงเลย) =====
const labels = ref([]); // ["YYYY-YYYY (P1)","YYYY-YYYY (P2)"]
const grossB = ref([0, 0]); // หน่วย Billion USD
const backB = ref([0, 0]);
const forwB = ref([0, 0]);
const backShare = ref([0, 0]); // %
const forwShare = ref([0, 0]); // %

// Description (ด้านขวา)
const desForward = ref("");
const desBackward = ref("");

// ===== Helpers =====
const B = (million) => Number((Number(million || 0) / 1000).toFixed(1)); // M -> B(1)
const pct = (num, den) =>
  den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0;

// แปลงลิสต์ปีเป็น 2 ช่วงพร้อม label
function splitToTwoPeriods(years) {
  const n = years.length;
  const half = n % 2 === 0 ? n / 2 : Math.floor(n / 2) + 1;
  const p1 = years.slice(0, half);
  const p2 = n % 2 === 0 ? years.slice(half) : years.slice(half - 1);
  const lbl = (ys) => `${ys[0]}-${ys[ys.length - 1]}`;
  return { p1, p2, p1Label: lbl(p1), p2Label: lbl(p2) };
}

// สร้าง year list
const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

// สรุปข้อมูลต่อ "ปี" จาก raw rows (ดึงค่าปีละ back/for/share และคำนวณ gross/ปี)
function summarizeByYear(rows) {
  // คาดว่า rows = [{year,var,value,share}, ...] var = "Backward linkages"|"Forward linkages"
  const yearMap = new Map();
  for (const r of rows) {
    const y = Number(r.year);
    const v = r.var?.toLowerCase();
    if (!yearMap.has(y))
      yearMap.set(y, {
        back: 0,
        backShare: 0,
        forw: 0,
        forwShare: 0,
        gross: 0,
      });

    const it = yearMap.get(y);
    if (v?.includes("backward")) {
      it.back = Number(r.value) || 0;
      it.backShare = Number(r.share) || 0; // (เช่น 0.2462)
    } else if (v?.includes("forward")) {
      it.forw = Number(r.value) || 0;
      it.forwShare = Number(r.share) || 0;
    }
    yearMap.set(y, it);
  }

  // คำนวณ gross/ปี จาก share ที่มี
  for (const [y, it] of yearMap) {
    const grossFromBack = it.backShare > 0 ? it.back / it.backShare : 0;
    const grossFromFor = it.forwShare > 0 ? it.forw / it.forwShare : 0;
    it.gross = Math.max(grossFromBack, grossFromFor); // ใช้อันที่มี share
    yearMap.set(y, it);
  }
  return yearMap; // Map(year -> {back,forw,gross,...})
}

// รวมค่าทั้งช่วง (p1 หรือ p2) แล้วแปลงเป็น Billion + Share
function sumPeriod(yearMap, periodYears) {
  let back = 0,
    forw = 0,
    gross = 0;
  for (const y of periodYears) {
    const it = yearMap.get(Number(y));
    if (!it) continue;
    back += Number(it.back || 0);
    forw += Number(it.forw || 0);
    gross += Number(it.gross || 0);
  }
  return {
    backB: B(back),
    forwB: B(forw),
    grossB: B(gross),
    backShare: pct(back, gross),
    forwShare: pct(forw, gross),
  };
}

// สร้างคำอธิบาย (ด้านขวา)
function buildDesc(linkName, data) {
  const [p1Share, p2Share] = data.share;
  const [p1ValB, p2ValB] = data.valB;
  const trend = t(p1Share > p2Share ? 'gvc.decreased' : 'gvc.increased');
  const delta = p1Share === 0 ? 0 : ((p2Share - p1Share) / p1Share) * 100;
  const deltaTxt = `${delta >= 0 ? "+" : ""}${Math.abs(delta).toFixed(2)}%`;
  return t('gvc.periodDescription', { first: labels.value[0], second: labels.value[1], linkage: linkName, economy: countryName, direction: trend, firstShare: p1Share, secondShare: p2Share, firstValue: p1ValB, secondValue: p2ValB });
}

// วาดกราฟ Overlapped (Gross เป็นพื้นหลัง, Back ซีกซ้าย, Forward ซีกขวา)
function plotGraph() {
  const catsDup = [...labels.value, ...labels.value]; // [P1,P2,P1,P2]
  Highcharts.chart("chartGVCRange02", {
    chart: { type: "column", backgroundColor: "#FFFFFF" },
    title: {
      text: t('gvc.chartPeriodsTitle', { economy: countryName }),
    },
    xAxis: {
      categories: catsDup,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { style: { fontSize: "12px" } },
    },
    yAxis: {
      min: 0,
      title: { text: t('gvc.usdBillion'), style: { fontSize: "14px" } },
      labels: {
        formatter() {
          return `$${this.value}`;
        },
        style: { fontSize: "12px" },
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      itemStyle: { fontSize: "13px" },
    },
    plotOptions: {
      series: { grouping: false, pointPadding: 0 },
      column: { borderWidth: 0 },
    },
    tooltip: {
      useHTML: true,
      formatter() {
        const p = this.point;
        let html = `<b>${this.series.name}</b><br/>${t('gvc.period')}: ${p.period}<br/>${t('gvc.value')}: $${p.y} ${t('gvc.billion')}`;
        if (typeof p.share !== "undefined") {
          html += `<br/>${t('gvc.share')}: ${p.share}% ${t('gvc.ofGross')}<br/>${t('gvc.grossExports')}: $${p.gross} ${t('gvc.billion')}`;
        }
        return html;
      },
    },
    colors: ["#9E9E9E", "#2d9687", "#0a628a"],
    series: [
      // Gross (พื้นหลัง) วางทุกคอลัมน์
      {
        name: t('gvc.grossExports'),
        zIndex: 0,
        pointWidth: 50,
        pointPlacement: 0,
        color: "#BEBEBE",
        data: [
          { x: 0, y: grossB.value[0], period: labels.value[0] },
          { x: 1, y: grossB.value[1], period: labels.value[1] },
          { x: 2, y: grossB.value[0], period: labels.value[0] },
          { x: 3, y: grossB.value[1], period: labels.value[1] },
        ],
      },
      // Backward — เฉพาะกลุ่มแรก (คอลัมน์ 0,1)
      {
        name: t('gvc.backward'),
        zIndex: 2,
        pointWidth: 50,
        pointPlacement: 0.16,
        color: "#56A13F",
        data: [
          {
            x: 0,
            y: backB.value[0],
            share: backShare.value[0],
            gross: grossB.value[0],
            period: labels.value[0],
          },
          {
            x: 1,
            y: backB.value[1],
            share: backShare.value[1],
            gross: grossB.value[1],
            period: labels.value[1],
          },
          { x: 2, y: null },
          { x: 3, y: null },
        ],
      },
      // Forward — เฉพาะกลุ่มสอง (คอลัมน์ 2,3)
      {
        name: t('gvc.forward'),
        zIndex: 2,
        pointWidth: 50,
        pointPlacement: 0.16,
        color: "#4BAEED",
        data: [
          { x: 0, y: null },
          { x: 1, y: null },
          {
            x: 2,
            y: forwB.value[0],
            share: forwShare.value[0],
            gross: grossB.value[0],
            period: labels.value[0],
          },
          {
            x: 3,
            y: forwB.value[1],
            share: forwShare.value[1],
            gross: grossB.value[1],
            period: labels.value[1],
          },
        ],
      },
    ],
    credits: { enabled: false },
  });
}

// ===== Load & build =====
async function loadAndRender() {
  try {
    // สร้างช่วงปี + split เป็น 2 ก้อน
    const years = buildYearRange(yearStart, yearEnd);
    const { p1, p2, p1Label, p2Label } = splitToTwoPeriods(years);
    labels.value = [p1Label, p2Label];

    // โหลดข้อมูล
    const url = `${serverData.value}/va/gvc_overview.php`;
    const payload = { exp_country: props.inputData.exporting.iso, year: years };
    const rows = (await axios.post(url, JSON.stringify(payload))).data || [];

    // สรุปเป็นรายปี แล้วรวมเป็นรายช่วง
    const byYear = summarizeByYear(rows);
    const p1Sum = sumPeriod(byYear, p1);
    const p2Sum = sumPeriod(byYear, p2);

    // เก็บค่า (Billion + Share)
    grossB.value = [p1Sum.grossB, p2Sum.grossB];
    backB.value = [p1Sum.backB, p2Sum.backB];
    forwB.value = [p1Sum.forwB, p2Sum.forwB];
    backShare.value = [p1Sum.backShare, p2Sum.backShare];
    forwShare.value = [p1Sum.forwShare, p2Sum.forwShare];

    // สร้างคำอธิบาย
    desBackward.value = buildDesc(t('gvc.foreignValueAdded'), {
      share: backShare.value,
      valB: backB.value,
    });
    desForward.value = buildDesc(
      t('gvc.exportedInputs', { economy: countryName }),
      {
        share: forwShare.value,
        valB: forwB.value,
      }
    );

    // วาดกราฟ
    plotGraph();
  } catch (e) {
    console.error(e);
  }
}

// sync showDetail กับขนาดจอ
watch(
  () => $q.screen.gt.sm,
  (isLarge) => (showDetail.value = isLarge)
);

onMounted(loadAndRender);
</script>

<style scoped></style>
