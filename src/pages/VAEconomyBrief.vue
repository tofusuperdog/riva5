<template>
  <div class="flex flex-col min-h-screen bg-[#f7f7f7]">
    <main class="flex-1 lg:mb-[200px]">
      <HeaderMain class="country-brief-top-menu" />
      <VATitle
        :menu="pageName"
        class="mt-15"
        :isShare="isShareOpen"
        :ShareText="inputDataFinal"
      />

      <div class="max-w-[1200px] w-[95%] mx-auto mt-[-100px] relative z-100">
        <div
          class="rounded-sm px-2 pt-4 pb-2"
          style="
            background: linear-gradient(
              -45deg,
              #113347 0%,
              #185172 57%,
              #133448 100%
            );
          "
        >
          <div
            class="flex flex-col md:flex-row justify-center items-center md:gap-6 mt-4 mb-7"
          >
            <div class="w-full max-w-[320px]">
              <EcoSelect
                :label="t('economyBrief.economy')"
                :initialValue="initialValue"
                @update:selected="onUpdateExportISO"
                :isShareOpen="isShareOpen"
                :inputDataFinal="inputDataFinal"
              />
            </div>

            <!-- ✅ Download -->
            <div class="w-[320px] pt-4">
              <button
                class="bg-[#FDC300] fblack h-12 px-4 rounded-sm inline-flex items-center cursor-pointer w-full text-center justify-center max-w-[340px] md:max-w-[220px] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
                :disabled="!canDownload"
                @click="downloadPDF"
              >
                <span v-if="!isDownloading">{{ t('economyBrief.download') }}</span>

                <span v-else class="inline-flex items-center gap-2">
                  <span
                    class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"
                  ></span>
                  {{ t('economyBrief.preparing') }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ หน้าเว็บจริง -->
      <div
        class="max-w-[1200px] w-[95%] mx-auto relative z-100 bg-[#FFFFFF] border-1 border-[#DDDDDD] rounded-md p-2 md:p-4 mt-2 md:mt-4 fblack"
      >
        <div class="economy-brief-guide" v-html="t('economyBrief.guideHtml')"></div>
      </div>

      <FooterMain class="mt-4 lg:mt-20 lg:mb-[-300px]" />
    </main>

    <!-- ✅ PDF TEMPLATE: มี 2 หน้า (page1 + page2) -->
    <div
      :class="[
        isPdfPreview ? 'pdf-preview-area' : 'pdf-hidden-area',
        isCapturingPdf ? 'pdf-desktop' : '',
      ]"
      @click.self="isPdfPreview = false"
    >
      <div class="pdf-preview-pages">
        <!-- ✅ PAGE 1 -->
        <div ref="pdfPage1Ref" class="pdf-page fblack">
          <!-- Header -->
          <div class="bg-[#02253D] p-2">
            <div class="flex items-center justify-between">
              <div class="w-32">
                <img
                  src="/images/escap.svg"
                  alt="escap logo"
                  class="h-10 ml-1"
                  width="120"
                  height="40"
                />
              </div>

              <div>
                <img
                  src="/images/rivafulllogo.svg"
                  alt="riva logo"
                  class="h-10"
                  width="320"
                  height="40"
                />
              </div>

              <div class="w-32"></div>
            </div>
            <div class="text-white text-center pb-1">
              Economy Briefs : {{ inputDataFinal.name }}
            </div>
          </div>

          <div class="h-3"></div>

          <div
            class="bg-[#414040] text-white text-[14px] h-[34px]"
            style="text-align: center"
          >
            1. Overview
          </div>

          <!-- Chart1 -->
          <div>
            <div class="px-2 pt-3 text-[14px] font-semibold text-center">
              {{ countryName }}'s Gross Exports: Backward vs Forward Linkages
              ({{ year }})
            </div>

            <!-- ✅ ใส่ pdf-row marker: บังคับให้เป็น row เสมอเวลาจับ PDF -->
            <div class="pdf-row flex flex-col lg:flex-row py-4 justify-center">
              <!-- backward -->
              <div>
                <div class="flex justify-center h-[120px] items-center">
                  <img
                    src="/images/greenContainer.svg"
                    alt=""
                    :style="{ height: BHeight + 'px', width: 'auto' }"
                    :height="BHeight"
                  />
                </div>
                <div class="flex justify-center pt-2 pb-1 items-center">
                  <div class="backwardC pl-1 pt-1">Backward Linkages</div>
                </div>
                <div class="max-w-[290px] mx-auto text-xs">
                  {{ backwardText }}
                </div>
              </div>

              <!-- Link (บางโปรเจคใช้ gt-sm ซ่อนบนมือถือ) -->
              <div class="gt-sm py-2">
                <div class="flex items-center justify-center">
                  <div class="flex justify-center pt-2">
                    <img src="/images/dotGreenHor.svg" alt="" class="w-6" width="24" height="24" />
                  </div>
                  <div class="px-2">
                    <div class="flex justify-center pb-2 pt-4">
                      <img :src="imgFile" alt="" class="w-[50px]" width="50" height="50" />
                    </div>
                  </div>
                  <div class="flex justify-center pt-2">
                    <img src="/images/dotBlueHor.svg" alt="" class="w-6" width="24" height="24" />
                  </div>
                </div>
                <div
                  class="flex justify-center pb-3 font-semibold max-w-[150px] text-center"
                >
                  {{ countryName }}
                </div>
              </div>

              <!-- forward -->
              <div>
                <div class="flex justify-center h-[120px] items-center">
                  <img
                    src="/images/blueContainer.svg"
                    alt=""
                    :style="{ height: FHeight + 'px', width: 'auto' }"
                    :height="FHeight"
                  />
                </div>
                <div class="flex justify-center pt-2 pb-1 items-center">
                  <div class="forwardC pl-1 pt-1">Forward Linkages</div>
                </div>
                <div class="max-w-[290px] mx-auto text-xs">
                  {{ forwardText }}
                </div>
              </div>
            </div>
          </div>

          <!-- key -->
          <div class="pdf-card text-xs">
            <div class="pdf-row flex">
              <div class="w-[50%] px-2">
                <div>Backward linkages</div>
                <div class="pl-4">
                  <ul class="list-disc">
                    <li>
                      How much do imports from abroad play a role in an
                      economy's export production?
                    </li>
                    <li>
                      Which exporting sectors in this economy rely the most on
                      imported content from other economies?
                    </li>
                    <li>
                      Which economies contribute the most towards this economy's
                      exports?
                    </li>
                  </ul>
                </div>
              </div>

              <div class="w-[50%] px-2">
                <div>Forward linkages</div>
                <div class="pl-4">
                  <ul class="list-disc">
                    <li>
                      How much does an economy's value-added in exports
                      contribute to export production in other economies?
                    </li>
                    <li>
                      Which exporting sectors in this economy contribute the
                      most to export production in other economies?
                    </li>
                    <li>
                      Which economies contribute the most towards this economy's
                      exports?Which economies are most dependent on this
                      economy's exports for their own export production?
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart2/3 -->
          <div class="pdf-row flex">
            <!-- Chart 2 -->
            <div class="w-[50%] p-2 text-xs">
              <div
                id="chartGVCRange01"
                style="width: 100%; height: 300px"
              ></div>
              <div style="color: #58a241; font-weight: 600; font-size: 14px">
                Backward Linkages
              </div>
              <div style="color: #58a241; font-weight: 500">
                Foreign value added in {{ countryName }}'s exports
              </div>
              <div>{{ desBackwardChart2 }}</div>
              <div style="padding-top: 6px">{{ desBackward }}</div>
            </div>

            <div class="w-[50%] p-2 text-xs">
              <div
                id="chartGVCRange02"
                style="width: 100%; height: 300px"
              ></div>
              <div style="color: #4baded; font-weight: 600; font-size: 14px">
                Forward Linkages
              </div>
              <div style="color: #4baded; font-weight: 500">
                {{ countryName }}'s value added in foreign exports
              </div>
              <div>{{ desForwardChart2 }}</div>
              <div style="padding-top: 6px">{{ desForward }}</div>
            </div>
          </div>

          <div class="pdf-note">
            <hr />
            <div class="flex justify-between">
              <div>
                Find out more at:
                <a href="https://riva.negotiatetrade.org"
                  ><u class="pdf-link">https://riva.negotiatetrade.org</u></a
                >
              </div>
              <div>1</div>
            </div>
          </div>
        </div>

        <!-- ✅ PAGE 2 -->
        <div ref="pdfPage2Ref" class="pdf-page fblack">
          <!-- Header -->
          <div class="bg-[#02253D] p-2">
            <div class="flex items-center justify-between">
              <div class="w-32">
                <img
                  src="/images/escap.svg"
                  alt="escap logo"
                  class="h-10 ml-1"
                  width="120"
                  height="40"
                />
              </div>

              <div>
                <img
                  src="/images/rivafulllogo.svg"
                  alt="riva logo"
                  class="h-10"
                  width="320"
                  height="40"
                />
              </div>

              <div class="w-32"></div>
            </div>
            <div class="text-white text-center pb-1">
              Economy Briefs : {{ inputDataFinal.name }}
            </div>
          </div>

          <div class="h-3"></div>

          <div
            class="bg-[#414040] text-white text-[14px] h-[34px]"
            style="text-align: center"
          >
            2. Top 5 GVC Sectors
          </div>

          <div class="pdf-row flex pt-3">
            <div class="w-[35%]">
              <div
                style="
                  color: #58a241;
                  font-weight: 600;
                  font-size: 14px;
                  padding-top: 5px;
                "
              >
                Backward Linkages
              </div>
              <div style="color: #58a241; font-weight: 500" class="text-xs">
                Foreign value added in {{ countryName }}'s exports
              </div>
              <div class="text-xs pr-4">{{ desChart4B }}</div>
            </div>

            <div class="w-[65%]">
              <div
                id="chartTop5BackSector"
                style="width: 100%; height: 220px"
              ></div>
            </div>
          </div>

          <div class="pdf-row flex">
            <div class="w-[35%]">
              <div
                style="
                  color: #4baded;
                  font-weight: 600;
                  font-size: 14px;
                  padding-top: 5px;
                "
              >
                Forward Linkages
              </div>
              <div style="color: #4baded; font-weight: 500" class="text-xs">
                {{ countryName }}'s value added in foreign exports
              </div>
              <div class="text-xs pr-4">{{ desChart4F }}</div>
            </div>

            <div class="w-[65%]">
              <div
                id="chartTop5ForSector"
                style="width: 100%; height: 220px"
              ></div>
            </div>
          </div>

          <div
            class="bg-[#414040] text-white text-[14px] h-[34px]"
            style="text-align: center"
          >
            3. Top 5 GVC Partners
          </div>

          <div class="pdf-row flex pt-3">
            <div class="w-[35%]">
              <div
                style="
                  color: #58a241;
                  font-weight: 600;
                  font-size: 14px;
                  padding-top: 5px;
                "
              >
                Backward Linkages
              </div>
              <div style="color: #58a241; font-weight: 500" class="text-xs">
                Foreign value added in {{ countryName }}'s exports
              </div>
              <div class="text-xs pr-4">{{ desChart5B }}</div>
            </div>

            <div class="w-[65%]">
              <div
                id="chartTop5PartnerBack"
                style="width: 100%; height: 220px"
              ></div>
            </div>
          </div>

          <div class="pdf-row flex">
            <div class="w-[35%]">
              <div
                style="
                  color: #4baded;
                  font-weight: 600;
                  font-size: 14px;
                  padding-top: 5px;
                "
              >
                Forward Linkages
              </div>
              <div style="color: #4baded; font-weight: 500" class="text-xs">
                {{ countryName }}'s value added in foreign exports
              </div>
              <div class="text-xs pr-4">{{ desChart5F }}</div>
            </div>

            <div class="w-[65%]">
              <div
                id="chartTop5PartnerFor"
                style="width: 100%; height: 220px"
              ></div>
            </div>
          </div>

          <div class="pdf-note">
            <hr />
            <div class="flex justify-between">
              <div>
                Find out more at:
                <a href="https://riva.negotiatetrade.org"
                  ><u class="pdf-link">https://riva.negotiatetrade.org</u></a
                >
              </div>
              <div>2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ✅ Fix for "Mobile PDF layout broken":
 * - Add isCapturingPdf flag to force desktop layout for PDF template regardless of viewport
 * - Add CSS override under .pdf-desktop
 * - Reduce html2canvas scale on mobile to avoid giant canvas & memory issues
 * - Wait 2 frames before capture
 *
 * NOTE: Highcharts is assumed global (as in your project).
 */

import HeaderMain from "../components/Header.vue";
import VATitle from "../components/VATitle.vue";
import EcoSelect from "../components/VAEconomySelect.vue";
import FooterMain from "../components/Footer.vue";

import axios from "axios";
import { serverSetup } from "./server.js";
import { ref, onMounted, nextTick, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const { serverData } = serverSetup();
const { t } = useI18n({ useScope: "global" });

/* =========================
 * UI STATE
 * ========================= */
const pageName = ref("CountryBriefs");
const inputDataFinal = ref({ name: "Thailand", iso: "THA" });
const countryName = ref(inputDataFinal.value.name || "");
const isShareOpen = ref(true);
const isDownloading = ref(false);
const isPdfPreview = ref(false);

// ✅ สำคัญ: เปิดโหมดนี้ตอน capture เพื่อ force desktop layout
const isCapturingPdf = ref(false);

const initialValue = ref({ iso: "ARG" });

/* =========================
 * YEAR STATE
 * ========================= */
const year = ref(2020);
const fyear = ref(2019);
const yearRange = ref([]);

/* =========================
 * PDF REFS
 * ========================= */
const pdfPage1Ref = ref(null);
const pdfPage2Ref = ref(null);

/* =========================
 * CHART 1 STATE
 * ========================= */
const backwardText = ref("");
const forwardText = ref("");
const imgFile = ref("");
const showFlag = ref(false);
const BHeight = ref(0);
const FHeight = ref(0);

/* =========================
 * CHART 2 STATE
 * ========================= */
const graphYearChart2 = ref([]);
const graphBackwardChart2 = ref([]);
const graphForwardChart2 = ref([]);
const desBackwardChart2 = ref("");
const desForwardChart2 = ref("");
let chart2Instance = null;

/* =========================
 * CHART 3 STATE
 * ========================= */
const labels = ref([]);
const grossB = ref([0, 0]);
const backB = ref([0, 0]);
const forwB = ref([0, 0]);
const backShare = ref([0, 0]);
const forwShare = ref([0, 0]);
const desForward = ref("");
const desBackward = ref("");
let chart3Instance = null;

/* =========================
 * CHART 4 STATE
 * ========================= */
const backTotalsBySectorP1 = ref({});
const backTotalsBySectorP2 = ref({});
const forTotalsBySectorP1 = ref({});
const forTotalsBySectorP2 = ref({});
const top5Backward2 = ref({ p1: [], p2: [] });
const top5Forward = ref({ p1: [], p2: [] });
const desChart4B = ref("");
const desChart4F = ref("");
const sumBackwardP1 = ref(0);
const sumBackwardP2 = ref(0);
const sumForwardP1 = ref(0);
const sumForwardP2 = ref(0);
const sumGrossP1 = ref(0);
const sumGrossP2 = ref(0);

/* =========================
 * CHART 5 STATE
 * ========================= */
const backTotalsByEcoP1 = ref({});
const backTotalsByEcoP2 = ref({});
const forTotalsByEcoP1 = ref({});
const forTotalsByEcoP2 = ref({});
const top5Backward2x = ref({ p1: [], p2: [] });
const top5Forward2x = ref({ p1: [], p2: [] });
const desChart5B = ref("");
const desChart5F = ref("");
const sumBackwardP1x = ref(0);
const sumBackwardP2x = ref(0);
const sumForwardP1x = ref(0);
const sumForwardP2x = ref(0);
const sumGrossP1x = ref(0);
const sumGrossP2x = ref(0);

/* =========================
 * ROUTE PARAM (optional)
 * ========================= */
const route = useRoute();

const normalizeISO = (v) =>
  String(v || "")
    .trim()
    .toUpperCase();

const applyExpToInitial = (exp) => {
  const iso = normalizeISO(exp);
  if (!iso) return;
  if (initialValue.value.iso === iso) return;

  initialValue.value = { ...initialValue.value, iso };
  inputDataFinal.value = { ...inputDataFinal.value, iso };
  countryName.value = "";
};

applyExpToInitial(route.params.exp);

watch(
  () => route.params.exp,
  (exp) => applyExpToInitial(exp),
);

/* =========================
 * COMPUTED
 * ========================= */
const canDownload = computed(() => {
  return !!countryName.value?.trim() && !isDownloading.value;
});

/* =========================
 * CONSTANTS / HELPERS
 * ========================= */
const PALETTE10 = [
  "#7E57C2",
  "#42A5F5",
  "#66BB6A",
  "#FFA726",
  "#EC407A",
  "#8D6E63",
  "#26C6DA",
  "#AB47BC",
  "#FF7043",
  "#9CCC65",
];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const moneyShort = (n) => {
  if (n == null || isNaN(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1000) return `$${(n / 1000).toFixed(1)} billion`;
  return `$${Number(n).toFixed(1)} million`;
};

const buildYearRange = (s, e) =>
  Array.from({ length: e - s + 1 }, (_, i) => s + i);

const pct = (num, den) =>
  den > 0 ? Number(((num / den) * 100).toFixed(1)) : 0;
const toB = (n) => Number((Number(n || 0) / 1000).toFixed(1));
const fmtB = (nMillion) => `$${toB(nMillion).toFixed(1)}B`;
const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

function splitYearsToTwoPeriods(years, { overlapOnOdd = true } = {}) {
  const n = years.length;
  if (n === 0) return { p1: [], p2: [], p1Label: "", p2Label: "" };

  if (n % 2 === 0) {
    const half = n / 2;
    const p1 = years.slice(0, half);
    const p2 = years.slice(half);
    return {
      p1,
      p2,
      p1Label: `${p1[0]}-${p1[p1.length - 1]}`,
      p2Label: `${p2[0]}-${p2[p2.length - 1]}`,
    };
  }

  const half = Math.floor(n / 2) + 1;
  const p1 = years.slice(0, half);
  const p2 = overlapOnOdd ? years.slice(half - 1) : years.slice(half);
  return {
    p1,
    p2,
    p1Label: `${p1[0]}-${p1[p1.length - 1]}`,
    p2Label: `${p2[0]}-${p2[p2.length - 1]}`,
  };
}

function sumByKey(rows, keyField, yearSet = null) {
  return rows.reduce((acc, r) => {
    if (yearSet !== null) {
      const y = Number(r.year);
      if (!yearSet.has(y)) return acc;
    }
    const k = String(r[keyField]);
    const v = Number(r.value) || 0;
    acc[k] = (acc[k] || 0) + v;
    return acc;
  }, {});
}

function pickTopN(totalObj, n, nameMap, fallbackPrefix = "Item") {
  return Object.entries(totalObj)
    .map(([id, total]) => ({
      id,
      total,
      name: nameMap.get(String(id)) ?? `${fallbackPrefix} ${id}`,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, n);
}

/**
 * ===== Chart 3 helpers =====
 */
function summarizeByYear(rows) {
  const yearMap = new Map();
  for (const r of rows) {
    const y = Number(r.year);
    const v = String(r.var || "").toLowerCase();

    if (!yearMap.has(y)) {
      yearMap.set(y, {
        back: 0,
        backShare: 0,
        forw: 0,
        forwShare: 0,
        gross: 0,
      });
    }

    const it = yearMap.get(y);
    if (v.includes("backward")) {
      it.back = Number(r.value) || 0;
      it.backShare = Number(r.share) || 0;
    } else if (v.includes("forward")) {
      it.forw = Number(r.value) || 0;
      it.forwShare = Number(r.share) || 0;
    }
    yearMap.set(y, it);
  }

  for (const [y, it] of yearMap) {
    const grossFromBack = it.backShare > 0 ? it.back / it.backShare : 0;
    const grossFromFor = it.forwShare > 0 ? it.forw / it.forwShare : 0;
    it.gross = Math.max(grossFromBack, grossFromFor);
    yearMap.set(y, it);
  }
  return yearMap;
}

function sumPeriod(byYearMap, periodYears) {
  let back = 0,
    forw = 0,
    gross = 0;

  for (const y of periodYears) {
    const it = byYearMap.get(Number(y));
    if (!it) continue;
    back += Number(it.back || 0);
    forw += Number(it.forw || 0);
    gross += Number(it.gross || 0);
  }

  return {
    backB: toB(back),
    forwB: toB(forw),
    grossB: toB(gross),
    backShare: pct(back, gross),
    forwShare: pct(forw, gross),
  };
}

function buildDesc(linkName, data) {
  const [p1Share, p2Share] = data.share;
  const [p1ValB, p2ValB] = data.valB;
  const trend = p1Share > p2Share ? "decrease" : "increase";

  return `Between ${labels.value[0]} and ${labels.value[1]}, the share of ${linkName} in ${countryName.value}'s gross exports ${trend} from ${p1Share}% to ${p2Share}%, equivalent to $${p1ValB}B and $${p2ValB}B respectively.`;
}

/**
 * ===== Chart 2 helpers =====
 */
function buildSeriesChart2(rows) {
  const years = [...new Set(rows.map((d) => Number(d.year)))].sort(
    (a, b) => a - b,
  );
  const byYear = new Map();
  for (const r of rows) {
    const y = Number(r.year);
    if (!byYear.has(y)) byYear.set(y, {});
    byYear.get(y)[r.var] = {
      y: Number(r.share) * 100,
      year: y,
      share: Number(r.share),
      value: Number(r.value),
    };
  }
  const pick = (varName) => years.map((y) => byYear.get(y)?.[varName] ?? null);

  return {
    categories: years,
    backward: pick("Backward linkages"),
    forward: pick("Forward linkages"),
  };
}

function desGraph2() {
  const firstYear = graphYearChart2.value[0];
  const lastYear = graphYearChart2.value[graphYearChart2.value.length - 1];

  const lastBackward =
    graphBackwardChart2.value[graphBackwardChart2.value.length - 1];
  const prevBackward = graphBackwardChart2.value[0];

  const shareNowB = Number(((lastBackward?.share || 0) * 100).toFixed(1));
  const sharePrevB = Number(((prevBackward?.share || 0) * 100).toFixed(1));
  const directionB = shareNowB > sharePrevB ? "up" : "down";

  desBackwardChart2.value = `In ${lastYear}, ${shareNowB}% of ${countryName.value}'s gross exports embedded FVA from aboard - ${directionB} from ${sharePrevB}% in ${firstYear}.`;

  const lastForward =
    graphForwardChart2.value[graphForwardChart2.value.length - 1];
  const prevForward = graphForwardChart2.value[0];

  const shareNowF = Number(((lastForward?.share || 0) * 100).toFixed(1));
  const sharePrevF = Number(((prevForward?.share || 0) * 100).toFixed(1));
  const directionF = shareNowF > sharePrevF ? "increased" : "decreased";

  desForwardChart2.value = `In ${lastYear}, ${countryName.value}'s DVA was ${shareNowF}% of ${countryName.value}'s gross exports, which ${directionF} from ${sharePrevF}% in ${firstYear}.`;
}

/**
 * ===== Generic subtitle builder (Chart4/5)
 */
function buildSubtitleGeneric({
  linkTypeLabel,
  country,
  p1Label,
  p2Label,
  totalLinkP1,
  totalLinkP2,
  totalGrossP2,
  totalsByTopKeyP1,
  totalsByTopKeyP2,
  idToNameMap,
  fallbackPrefix = "Item",
}) {
  const topP2 = Object.entries(totalsByTopKeyP2)
    .map(([k, v]) => ({ k, v }))
    .sort((a, b) => b.v - a.v)[0];

  const topName =
    idToNameMap.get(String(topP2?.k)) ?? `${fallbackPrefix} ${topP2?.k ?? "-"}`;

  const shareGrossP2 =
    totalGrossP2 > 0 ? (totalLinkP2 / totalGrossP2) * 100 : 0;
  const shareTopP2 =
    totalLinkP2 > 0 ? (Number(topP2?.v || 0) / totalLinkP2) * 100 : 0;

  const baseP1 = Number(totalsByTopKeyP1[String(topP2?.k)] || 0);
  const shareTopP1 = totalLinkP1 > 0 ? (baseP1 / totalLinkP1) * 100 : 0;

  const directionShare = shareTopP2 - shareTopP1 > 0 ? "up" : "down";

  return `Between ${p2Label}, ${country}’s ${linkTypeLabel} (${fmtB(
    totalLinkP2,
  )}) represented ${fmtPct(shareGrossP2)} of total gross exports. ${topName} represented ${fmtPct(
    shareTopP2,
  )} of ${country}’s ${linkTypeLabel}, ${directionShare} from ${fmtPct(
    shareTopP1,
  )} in ${p1Label}.`;
}

/**
 * ===== Stacked series builder (Chart4/5)
 */
function buildStackedSeriesTop5Generic(top5, periodLabels, denomB0, denomB1) {
  const p1Map = Object.fromEntries(top5.p1.map((d) => [String(d.id), d]));
  const p2Map = Object.fromEntries(top5.p2.map((d) => [String(d.id), d]));

  const ids = [
    ...top5.p1.map((d) => String(d.id)),
    ...top5.p2.map((d) => String(d.id)).filter((id) => !p1Map[id]),
  ].slice(0, 10);

  const ranked = ids
    .map((code) => {
      const name = p1Map[code]?.name || p2Map[code]?.name || `Item ${code}`;
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
        { y: s.v1B, period: periodLabels[0], share: share0 },
        { y: s.v2B, period: periodLabels[1], share: share1 },
      ],
    };
  });
}

function makeStackedColumnOptions({ categories, series, height = 200 }) {
  return {
    chart: { type: "column", height, animation: false },
    title: { text: "" },
    xAxis: {
      categories,
      tickLength: 0,
      gridLineWidth: 0,
      labels: { style: { fontSize: "10px" } },
    },
    yAxis: {
      min: 0,
      title: { text: "USD Billion", style: { fontSize: "10px" } },
      reversedStacks: false,
      labels: { style: { fontSize: "10px" } },
      maxPadding: 0,
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      floating: false,
      itemStyle: { fontSize: "10px" },
      itemMarginTop: 0,
      itemMarginBottom: 0,
      symbolRadius: 6,
    },
    plotOptions: {
      series: { animation: false },
      column: {
        stacking: "normal",
        borderWidth: 0,
      },
    },
    series,
    credits: { enabled: false },
    exporting: { enabled: false },
  };
}

/* =========================
 * EVENTS
 * ========================= */
const onUpdateExportISO = (selected) => {
  inputDataFinal.value = selected;
  countryName.value = selected?.name || "";
};

/* =========================
 * LOADERS
 * ========================= */
const loadYear = async () => {
  const res = await axios.get(`${serverData.value}va/get_year.php`);
  year.value = res.data[res.data.length - 1];
  fyear.value = res.data[0];

  yearRange.value = [];
  for (let i = Number(fyear.value); i <= Number(year.value); i++) {
    yearRange.value.push(i);
  }
};

const loadChart1 = async () => {
  const url = `${serverData.value}/va/gvc_overview.php`;
  const payload = { exp_country: inputDataFinal.value.iso, year: year.value };
  const rows = (await axios.post(url, JSON.stringify(payload))).data ?? [];

  let BValue = 0;
  let FValue = 0;

  const back = rows.find((x) => x.var === "Backward linkages");
  if (back) {
    const share = (Number(back.share) * 100).toFixed(1);
    const valM = Number(back.value);
    BValue = valM;
    backwardText.value = `Backward linkages refer to the use of foreign Value added (FVA) - value added produced abroad - in  ${countryName.value}'s exports. In ${year.value}, FVA accounted for ${share}% of ${countryName.value}'s gross exports, valued at USD ${moneyShort(valM)}.`;
  } else {
    backwardText.value = "";
  }

  const fwd = rows.find((x) => x.var === "Forward linkages");
  if (fwd) {
    const share = (Number(fwd.share) * 100).toFixed(1);
    const valM = Number(fwd.value);
    FValue = valM;
    forwardText.value = `Forward linkages represent ${countryName.value}'s Domestic Value Added (DVA) that is subsequently embedded in the gross exports of partner economies. In ${year.value}, forward linkages made up ${share}% of ${countryName.value}'s gross exports, equivalent to USD ${moneyShort(valM)}.`;
  } else {
    forwardText.value = "";
  }

  if (
    inputDataFinal.value.id == 0 ||
    inputDataFinal.value.iso == "TWN" ||
    inputDataFinal.value.iso == "HKG"
  ) {
    imgFile.value = "/images/flags/noflag.png";
    showFlag.value = false;
  } else {
    imgFile.value = `/images/flags/${inputDataFinal.value.iso}.png`;
    showFlag.value = true;
  }

  if (BValue > FValue) {
    BHeight.value = 80;
    FHeight.value = BValue > 0 ? Math.floor((FValue / BValue) * 80) : 50;
  } else {
    FHeight.value = 80;
    BHeight.value = FValue > 0 ? Math.floor((BValue / FValue) * 80) : 50;
  }
  if (BHeight.value < 50) BHeight.value = 40;
  if (FHeight.value < 50) FHeight.value = 50;
};

const plotGraph2 = () =>
  new Promise((resolve) => {
    const chartTitle = `How have ${countryName.value}'s GVCs linkages evolved over the years?`;

    chart2Instance = Highcharts.chart(
      "chartGVCRange01",
      {
        chart: { type: "spline", height: 300, animation: false },
        title: { text: chartTitle },
        xAxis: {
          categories: graphYearChart2.value,
          tickLength: 0,
          gridLineWidth: 0,
          labels: { style: { fontSize: "10px" } },
        },
        yAxis: {
          title: {
            text: `Percent of ${countryName.value}'s Gross exports`,
            style: { fontSize: "10px" },
          },
          labels: { format: "{value}%", style: { fontSize: "10px" } },
        },
        exporting: { enabled: false },
        credits: { enabled: false },
        plotOptions: {
          series: {
            animation: false,
            marker: { enabled: true },
            connectNulls: true,
          },
        },
        series: [
          { name: "Backward Linkages", data: graphBackwardChart2.value },
          { name: "Forward Linkages", data: graphForwardChart2.value },
        ],
      },
      (chart) => resolve(chart),
    );
  });

const loadChart2 = async () => {
  const dataSend = {
    exp_country: inputDataFinal.value.iso,
    year: yearRange.value,
  };

  const url = `${serverData.value}va/gvc_overview_across_years.php`;
  const res = await axios.post(url, JSON.stringify(dataSend));

  const { categories, backward, forward } = buildSeriesChart2(res.data);
  graphYearChart2.value = categories;
  graphBackwardChart2.value = backward;
  graphForwardChart2.value = forward;

  await nextTick();
  await plotGraph2();
  desGraph2();
};

const plotGraph3 = () =>
  new Promise((resolve) => {
    const catsDup = [...labels.value, ...labels.value];

    chart3Instance = Highcharts.chart(
      "chartGVCRange02",
      {
        chart: {
          type: "column",
          backgroundColor: "#FFFFFF",
          height: 300,
          animation: false,
        },
        title: {
          text: `How do ${countryName.value}'s GVC linkages compare across different periods?`,
        },
        xAxis: {
          categories: catsDup,
          tickLength: 0,
          gridLineWidth: 0,
          labels: { style: { fontSize: "10px" } },
        },
        yAxis: {
          min: 0,
          title: { text: "USD Billion", style: { fontSize: "10px" } },
          labels: {
            formatter() {
              return `$${this.value}`;
            },
            style: { fontSize: "10px" },
          },
        },
        legend: {
          align: "center",
          verticalAlign: "bottom",
          itemStyle: { fontSize: "10px" },
        },
        plotOptions: {
          series: { grouping: false, pointPadding: 0, animation: false },
          column: { borderWidth: 0 },
        },
        exporting: { enabled: false },
        credits: { enabled: false },

        series: [
          {
            name: "Gross Exports",
            zIndex: 0,
            pointWidth: 30,
            pointPlacement: 0,
            color: "#BEBEBE",
            animation: false,
            data: [
              { x: 0, y: grossB.value[0], period: labels.value[0] },
              { x: 1, y: grossB.value[1], period: labels.value[1] },
              { x: 2, y: grossB.value[0], period: labels.value[0] },
              { x: 3, y: grossB.value[1], period: labels.value[1] },
            ],
          },
          {
            name: "Backward Linkages",
            zIndex: 2,
            pointWidth: 30,
            pointPlacement: 0.16,
            color: "#56A13F",
            animation: false,
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
          {
            name: "Forward Linkages",
            zIndex: 2,
            pointWidth: 30,
            pointPlacement: 0.16,
            color: "#4BAEED",
            animation: false,
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
      },
      (chart) => resolve(chart),
    );
  });

const loadChart3 = async () => {
  const years = buildYearRange(fyear.value, year.value);
  const { p1, p2, p1Label, p2Label } = splitYearsToTwoPeriods(years, {
    overlapOnOdd: true,
  });
  labels.value = [p1Label, p2Label];

  const url = `${serverData.value}/va/gvc_overview.php`;
  const payload = { exp_country: inputDataFinal.value.iso, year: years };
  const rows = (await axios.post(url, JSON.stringify(payload))).data || [];

  const byYear = summarizeByYear(rows);
  const p1Sum = sumPeriod(byYear, p1);
  const p2Sum = sumPeriod(byYear, p2);

  grossB.value = [p1Sum.grossB, p2Sum.grossB];
  backB.value = [p1Sum.backB, p2Sum.backB];
  forwB.value = [p1Sum.forwB, p2Sum.forwB];
  backShare.value = [p1Sum.backShare, p2Sum.backShare];
  forwShare.value = [p1Sum.forwShare, p2Sum.forwShare];

  desBackward.value = buildDesc("foreign value added", {
    share: backShare.value,
    valB: backB.value,
  });
  desForward.value = buildDesc(
    `${countryName.value} exports used as inputs in other countries' exports`,
    { share: forwShare.value, valB: forwB.value },
  );

  await nextTick();
  await plotGraph3();
};

const loadChart4 = async () => {
  const years = buildYearRange(fyear.value, year.value);
  const {
    p1: p1Years,
    p2: p2Years,
    p1Label,
    p2Label,
  } = splitYearsToTwoPeriods(years, { overlapOnOdd: true });
  const p1Set = new Set(p1Years);
  const p2Set = new Set(p2Years);

  const urlData = `${serverData.value}va/gvc_topsector_overview.php`;
  const urlSector = `${serverData.value}va/get_sector.php`;
  const payload = { exp_country: inputDataFinal.value.iso, year: years };

  const [resData, sectorRows] = await Promise.all([
    axios.post(urlData, JSON.stringify(payload)).then((r) => r.data),
    axios.get(urlSector).then((r) => r.data),
  ]);

  const sectorMap = new Map(
    sectorRows.map((s) => [String(s.catID), s.shortname]),
  );

  const backRows = resData.filter((r) => r.var === "Backward_linkages");
  const forRows = resData.filter(
    (r) => r.var === "Forward_linkages" || r.var === "Forward_linkages2",
  );

  backTotalsBySectorP1.value = sumByKey(backRows, "exp_sector", p1Set);
  backTotalsBySectorP2.value = sumByKey(backRows, "exp_sector", p2Set);
  forTotalsBySectorP1.value = sumByKey(forRows, "exp_sector", p1Set);
  forTotalsBySectorP2.value = sumByKey(forRows, "exp_sector", p2Set);

  top5Backward2.value = {
    p1: pickTopN(backTotalsBySectorP1.value, 5, sectorMap, "Sector").map(
      (d) => ({
        id: d.id,
        total: d.total,
        name: d.name,
      }),
    ),
    p2: pickTopN(backTotalsBySectorP2.value, 5, sectorMap, "Sector").map(
      (d) => ({
        id: d.id,
        total: d.total,
        name: d.name,
      }),
    ),
  };

  top5Forward.value = {
    p1: pickTopN(forTotalsBySectorP1.value, 5, sectorMap, "Sector").map(
      (d) => ({
        id: d.id,
        total: d.total,
        name: d.name,
      }),
    ),
    p2: pickTopN(forTotalsBySectorP2.value, 5, sectorMap, "Sector").map(
      (d) => ({
        id: d.id,
        total: d.total,
        name: d.name,
      }),
    ),
  };

  const urlTotal = `${serverData.value}/va/gvc_overview.php`;
  const resultTotal = await axios
    .post(
      urlTotal,
      JSON.stringify({ exp_country: inputDataFinal.value.iso, year: years }),
    )
    .then((r) => r.data);

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

  sumGrossP1.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);

  sumGrossP2.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);

  const cats = [p1Label, p2Label];

  {
    const series = buildStackedSeriesTop5Generic(
      top5Backward2.value,
      cats,
      toB(sumBackwardP1.value),
      toB(sumBackwardP2.value),
    );

    desChart4B.value = buildSubtitleGeneric({
      linkTypeLabel: "backward linkages",
      country: countryName.value,
      p1Label,
      p2Label,
      totalLinkP1: sumBackwardP1.value,
      totalLinkP2: sumBackwardP2.value,
      totalGrossP2: sumGrossP2.value,
      totalsByTopKeyP1: backTotalsBySectorP1.value,
      totalsByTopKeyP2: backTotalsBySectorP2.value,
      idToNameMap: sectorMap,
      fallbackPrefix: "Sector",
    });

    Highcharts.chart(
      "chartTop5BackSector",
      makeStackedColumnOptions({ categories: cats, series, height: 200 }),
    );
  }

  {
    const series = buildStackedSeriesTop5Generic(
      top5Forward.value,
      cats,
      toB(sumForwardP1.value),
      toB(sumForwardP2.value),
    );

    desChart4F.value = buildSubtitleGeneric({
      linkTypeLabel: "forward linkages",
      country: countryName.value,
      p1Label,
      p2Label,
      totalLinkP1: sumForwardP1.value,
      totalLinkP2: sumForwardP2.value,
      totalGrossP2: sumGrossP2.value,
      totalsByTopKeyP1: forTotalsBySectorP1.value,
      totalsByTopKeyP2: forTotalsBySectorP2.value,
      idToNameMap: sectorMap,
      fallbackPrefix: "Sector",
    });

    Highcharts.chart(
      "chartTop5ForSector",
      makeStackedColumnOptions({ categories: cats, series, height: 200 }),
    );
  }
};

const loadChart5 = async () => {
  const years = buildYearRange(fyear.value, year.value);
  const {
    p1: p1Years,
    p2: p2Years,
    p1Label,
    p2Label,
  } = splitYearsToTwoPeriods(years, { overlapOnOdd: true });
  const p1Set = new Set(p1Years);
  const p2Set = new Set(p2Years);

  const urlData = `${serverData.value}va/gvc_toppartner_overview.php`;
  const urlEco = `${serverData.value}va/get_eco_not_group.php`;
  const payload = { exp_country: inputDataFinal.value.iso, year: years };

  const [resData, ecoRows] = await Promise.all([
    axios.post(urlData, JSON.stringify(payload)).then((r) => r.data),
    axios.get(urlEco).then((r) => r.data),
  ]);

  const ecoMap = new Map(ecoRows.map((s) => [String(s.iso), s.economic]));

  const backRows = resData.filter((r) => r.var === "Backward_linkages");
  const forRows = resData.filter(
    (r) => r.var === "Forward_linkages" || r.var === "Forward_linkages2",
  );

  backTotalsByEcoP1.value = sumByKey(backRows, "imp_country", p1Set);
  backTotalsByEcoP2.value = sumByKey(backRows, "imp_country", p2Set);
  forTotalsByEcoP1.value = sumByKey(forRows, "imp_country", p1Set);
  forTotalsByEcoP2.value = sumByKey(forRows, "imp_country", p2Set);

  top5Backward2x.value = {
    p1: pickTopN(backTotalsByEcoP1.value, 5, ecoMap, "Partner").map((d) => ({
      id: d.id,
      total: d.total,
      name: d.name,
    })),
    p2: pickTopN(backTotalsByEcoP2.value, 5, ecoMap, "Partner").map((d) => ({
      id: d.id,
      total: d.total,
      name: d.name,
    })),
  };

  top5Forward2x.value = {
    p1: pickTopN(forTotalsByEcoP1.value, 5, ecoMap, "Partner").map((d) => ({
      id: d.id,
      total: d.total,
      name: d.name,
    })),
    p2: pickTopN(forTotalsByEcoP2.value, 5, ecoMap, "Partner").map((d) => ({
      id: d.id,
      total: d.total,
      name: d.name,
    })),
  };

  const urlTotal = `${serverData.value}/va/gvc_overview.php`;
  const resultTotal = await axios
    .post(
      urlTotal,
      JSON.stringify({ exp_country: inputDataFinal.value.iso, year: years }),
    )
    .then((r) => r.data);

  sumBackwardP1x.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  sumBackwardP2x.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  sumForwardP1x.value = resultTotal
    .filter((r) => r.var === "Forward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  sumForwardP2x.value = resultTotal
    .filter((r) => r.var === "Forward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value), 0);

  sumGrossP1x.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p1Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);

  sumGrossP2x.value = resultTotal
    .filter((r) => r.var === "Backward linkages" && p2Set.has(Number(r.year)))
    .reduce((a, r) => a + Number(r.value) / Number(r.share), 0);

  const cats = [p1Label, p2Label];

  {
    const series = buildStackedSeriesTop5Generic(
      top5Backward2x.value,
      cats,
      toB(sumBackwardP1x.value),
      toB(sumBackwardP2x.value),
    );

    desChart5B.value = buildSubtitleGeneric({
      linkTypeLabel: "backward linkages",
      country: countryName.value,
      p1Label,
      p2Label,
      totalLinkP1: sumBackwardP1x.value,
      totalLinkP2: sumBackwardP2x.value,
      totalGrossP2: sumGrossP2x.value,
      totalsByTopKeyP1: backTotalsByEcoP1.value,
      totalsByTopKeyP2: backTotalsByEcoP2.value,
      idToNameMap: ecoMap,
      fallbackPrefix: "Partner",
    });

    Highcharts.chart(
      "chartTop5PartnerBack",
      makeStackedColumnOptions({ categories: cats, series, height: 200 }),
    );
  }

  {
    const series = buildStackedSeriesTop5Generic(
      top5Forward2x.value,
      cats,
      toB(sumForwardP1x.value),
      toB(sumForwardP2x.value),
    );

    desChart5F.value = buildSubtitleGeneric({
      linkTypeLabel: "forward linkages",
      country: countryName.value,
      p1Label,
      p2Label,
      totalLinkP1: sumForwardP1x.value,
      totalLinkP2: sumForwardP2x.value,
      totalGrossP2: sumGrossP2x.value,
      totalsByTopKeyP1: forTotalsByEcoP1.value,
      totalsByTopKeyP2: forTotalsByEcoP2.value,
      idToNameMap: ecoMap,
      fallbackPrefix: "Partner",
    });

    Highcharts.chart(
      "chartTop5PartnerFor",
      makeStackedColumnOptions({ categories: cats, series, height: 200 }),
    );
  }
};

/**
 * ✅ single entry to load everything
 */
const loadAllCharts = async () => {
  await loadChart1();
  await loadChart2();
  await loadChart3();
  await loadChart4();
  await loadChart5();
  await nextTick();
};

/* =========================
 * INIT
 * ========================= */
const loadData = async () => {
  await loadYear();
  countryName.value = inputDataFinal.value.name || countryName.value;
};

onMounted(async () => {
  await loadData();
  await nextTick();
});

/* =========================
 * PDF EXPORT HELPERS
 * ========================= */
const waitImages = async (root) => {
  const imgs = [...root.querySelectorAll("img")];
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((res) => {
            img.onload = res;
            img.onerror = res;
          }),
    ),
  );
};

const reflowChartsForCapture = async () => {
  // Chart2
  chart2Instance?.setSize?.(null, 300, false);
  chart2Instance?.reflow?.();
  chart2Instance?.redraw?.();

  // Chart3
  chart3Instance?.setSize?.(null, 300, false);
  chart3Instance?.reflow?.();
  chart3Instance?.redraw?.();

  // ✅ รอให้ layout/paint นิ่งจริงก่อน capture
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
};

/**
 * ✅ SAFARI FIX: html2canvas cannot correctly render SVG files loaded via <img> in Safari.
 * It renders them at their raw SVG intrinsic dimensions instead of CSS dimensions.
 *
 * Solution: before calling html2canvas, convert every SVG <img> inside `root`
 * to a rasterized PNG (drawn at the element's actual CSS pixel size on a canvas),
 * then restore the original srcs after capture.
 */
const convertSvgImgsToRaster = async (root) => {
  const imgs = [...root.querySelectorAll('img[src$=".svg"], img[src$=".SVG"]')];
  const restoreFns = [];

  await Promise.all(
    imgs.map(async (img) => {
      try {
        // Measured CSS rendered size
        const w = img.offsetWidth || img.width || 64;
        const h = img.offsetHeight || img.height || 64;
        if (!w || !h) return;

        // Fetch the SVG source
        const res = await fetch(img.src, { mode: 'cors' });
        const svgText = await res.text();

        // Build an Image from the SVG blob
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        await new Promise((resolve, reject) => {
          const tmpImg = new Image(w, h);
          tmpImg.onload = () => {
            // Draw to canvas at the exact CSS size
            const cv = document.createElement('canvas');
            cv.width = w * 2;   // 2x for retina-like quality
            cv.height = h * 2;
            const ctx = cv.getContext('2d');
            ctx.drawImage(tmpImg, 0, 0, cv.width, cv.height);

            const pngUrl = cv.toDataURL('image/png');
            const origSrc = img.src;

            // Swap to raster PNG
            img.src = pngUrl;
            img.width = w;
            img.height = h;

            // Schedule restore
            restoreFns.push(() => {
              img.src = origSrc;
              img.removeAttribute('width');
              img.removeAttribute('height');
            });

            URL.revokeObjectURL(url);
            resolve();
          };
          tmpImg.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          tmpImg.src = url;
        });
      } catch {
        // silently skip images that can't be converted
      }
    }),
  );

  // Wait one frame for the new img srcs to be painted
  await new Promise((r) => requestAnimationFrame(r));

  return restoreFns;
};

const addCapturedDivToPDF = async (doc, element, isFirstPage = false) => {
  await document.fonts?.ready;
  await waitImages(element);

  // ✅ Detect Safari — it has strict canvas size limits (~16MP)
  // and miscalculates SVG image dimensions for off-screen elements
  const isSafari =
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // ✅ SAFARI FIX: Pre-convert all SVG <img> to rasterized PNG
  // so html2canvas sees plain pixel images instead of SVGs
  let restoreFns = [];
  if (isSafari) {
    restoreFns = await convertSvgImgsToRaster(element);
  }

  // Safari caps canvas at ~16MP — limit scale to stay safe
  // pdf-page = 794×1123 → scale 1.5 → 1191×1685 = 2MP (safe)
  let scale = isMobile ? 1.2 : 2;
  if (isSafari && !isMobile) scale = 1.5;

  const elWidth = element.offsetWidth || 794;
  const elHeight = element.offsetHeight || 1123;

  const rect = element.getBoundingClientRect();

  try {
    const canvas = await html2canvas(element, {
      scale,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
      scrollX: -window.scrollX + rect.left * -1,
      scrollY: -window.scrollY,
      width: elWidth,
      height: elHeight,
      windowWidth: window.innerWidth || 1440,
      windowHeight: window.innerHeight || 900,
      x: 0,
      y: 0,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfW = doc.internal.pageSize.getWidth();
    const pdfH = doc.internal.pageSize.getHeight();
    const imgW = pdfW;
    const imgH = (canvas.height * imgW) / canvas.width;

    if (!isFirstPage) doc.addPage();
    doc.addImage(imgData, 'PNG', 0, 0, imgW, Math.min(imgH, pdfH));
  } finally {
    // ✅ Always restore original SVG srcs after capture
    restoreFns.forEach((fn) => fn());
  }
};

const downloadPDF = async () => {
  if (isDownloading.value) return;
  isDownloading.value = true;

  // ✅ เปิดโหมด desktop layout เฉพาะตอน capture
  isCapturingPdf.value = true;

  try {
    await loadAllCharts();
    await reflowChartsForCapture();

    // ✅ รอให้ CSS override ทำงาน + layout settle
    await nextTick();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    await addCapturedDivToPDF(doc, pdfPage1Ref.value, true);
    await addCapturedDivToPDF(doc, pdfPage2Ref.value, false);

    doc.save("report.pdf");
  } catch (err) {
    console.error("Download PDF error:", err);
    alert("Sorry, failed to generate PDF. Please try again.");
  } finally {
    isCapturingPdf.value = false;
    isDownloading.value = false;
  }
};
</script>

<style scoped>
.country-brief-top-menu {
  position: fixed !important;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2147483647 !important;
}

.economy-brief-guide {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
}

.economy-brief-guide :deep(h2) {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.5;
  font-weight: 600;
}

.economy-brief-guide :deep(h3) {
  margin: 0;
  padding-top: 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 600;
}

.economy-brief-guide :deep(p) {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.economy-brief-guide :deep(ul) {
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 1.25rem;
  padding-left: 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
  list-style: disc;
}

.economy-brief-guide :deep(li),
.economy-brief-guide :deep(strong) {
  font-size: inherit;
  line-height: inherit;
}

/* ✅ ซ่อนแบบย้ายไปนอกจอ แต่ยัง render ได้ */
.pdf-hidden-area {
  position: fixed;
  top: 0;
  left: -10000px;
  opacity: 1;
  pointer-events: none;
  z-index: 0;
}

/* ✅ Preview Mode */
.pdf-preview-area {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  padding: 24px;
}

.pdf-preview-pages {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pdf-page {
  width: 794px;
  height: 1123px;
  overflow: hidden;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.pdf-preview-area .pdf-page {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
}

.pdf-card {
  border: 1px solid #eee;
  border-radius: 4px;
  height: 145px;
  padding: 6px;
}

.pdf-note {
  margin-top: auto;
  font-size: 14px;
  color: #333;
}
.pdf-link {
  color: #2563eb;
}

/* --- FIX: FORCE DESKTOP LAYOUT WHILE CAPTURING PDF --- */
/* ✅ บังคับ "แถวที่ติด marker pdf-row" ให้เป็น row เสมอ ตอน download */
.pdf-desktop .pdf-page .pdf-row {
  flex-direction: row !important;
}

/* ✅ ถ้า class gt-sm ของคุณเป็น "ซ่อนบนมือถือ" ให้โชว์ตอน capture */
.pdf-desktop .pdf-page .gt-sm {
  display: block !important;
}

/* (Optional) กันบาง element ถูกย่อ/ซ้อนผิดจังหวะ */
.pdf-desktop .pdf-page {
  /* บังคับให้ layout คำนวณจากขนาดหน้า pdf-page ไม่ตาม viewport */
  width: 794px !important;
}

#chartGVCRange01 {
  height: 300px !important;
}
#chartGVCRange01 .highcharts-container {
  height: 300px !important;
}
</style>
