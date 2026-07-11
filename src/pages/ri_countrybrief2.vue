<template>
  <div style="background-color: #7a7a7a; height: 3260px">
    <div
      class="bg-white q-pb-md"
      style="
        width: 1200px;
        height: fit-content;
        margin: auto;
        background: white;
      "
    >
      <div ref="content">
        <div class="printPage text-white">
          <div
            style="background: #04284d; width: 100%; height: 140px"
            class="q-pt-md"
          >
            <div style="padding-top: 5px; padding-left: 20px" class="row">
              <div class="col-1" style="width: 150px">
                <img src="images/unescaplogo.svg" style="height: 50px" alt="" />
              </div>
              <div class="col-2"></div>
              <div class="col">
                <div class="row justify-center">
                  <div>
                    <img src="images/logobig2.png" width="190px" alt />
                  </div>
                  <div>
                    <div class="font-16 q-pt-xs">
                      <span style="color: #e0d04e">REGIONAL INTEGRATION</span>
                      AND
                    </div>
                    <div class="font-16">VALUE CHAIN ANALYZER</div>
                  </div>
                </div>
              </div>
              <div class="col-3">
                <div
                  class="q-pa-md row justify-center"
                  id="printSection"
                  align="right"
                >
                  <div>
                    <q-btn
                      no-caps
                      text-color="black"
                      @click="printBtn()"
                      style="background-color: white"
                      v-if="btnShow"
                    >
                      <div>
                        <span>print</span>
                      </div>
                    </q-btn>
                  </div>
                  <div>
                    <q-btn
                      @click="downloadPDF()"
                      class="q-mx-md"
                      no-caps
                      text-color="black"
                      style="background-color: white"
                      v-if="btnShow"
                    >
                      <div>
                        <span>PDF</span>
                      </div>
                    </q-btn>
                  </div>
                  <div>
                    <q-btn
                      no-caps
                      text-color="black"
                      style="background-color: white"
                      @click="isShowShare = true"
                      v-if="btnShow"
                    >
                      <div>
                        <span>Share</span>
                      </div>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
            <div align="center" style="font-size: 20px">
              Country brief: {{ countryReportName }} : 2010 - {{ yearMax }}
            </div>
          </div>
          <div class="typeData">Sustainable integration (SI)</div>
          <div class="contentPage">
            <div class="text-indigo-10 q-pt-md">
              {{ countryReportName.replace("&#8594;", "-") }}'s sustainable
              integration score with the world in {{ yearMax }} was
              <span class="bigBold">{{ scoreWithWorldSI.toFixed(2) }}</span>
            </div>
            <div align="center" class="q-pt-xs">
              <div id="mapSIShow"></div>
            </div>
            <div align="center" class="font-note">
              Notes: This map is based on SI scores between
              {{ countryReportName }} and {{ noPercentInMapSI }}% of all 196
              UN-recognized economies.
            </div>
            <div
              class="q-pl-xl font-content"
              style="padding-right: 50px"
              align="left"
            >
              <div v-html="firstSentenceSI"></div>
              <div v-html="secondSentenceSI"></div>
              <div v-html="thirdSentenceSI"></div>
            </div>
            <hr />
            <div class="text-indigo-10 textLowerMain">
              {{ mainTextin1LowerSI }}
            </div>
            <div class="row">
              <div class="col-6 q-pl-xl">
                <div class="blueTitle">By sub-regions</div>
                <div align="center">
                  <div id="barChartSI"></div>
                </div>
              </div>
              <div class="col-6 q-pr-xl">
                <div class="blueTitle">By dimension and indicator</div>
                <div align="center">
                  <div id="spiderChartSI"></div>
                </div>
                <div class="font-note">{{ dimNoDataSI }}</div>
              </div>
            </div>
            <div class="font-content">
              Notes: These graphs are based on SI Scores between
              {{ countryReportName }} and {{ noPercentInMapAPSI }}% of all 58
              ESCAP economies.
            </div>
            <div class="row">
              <div class="col-6 font-content q-pt-sm" align="left">
                <div
                  style="
                    padding-left: 50px;
                    padding-right: 25px;
                    text-align: justify;
                  "
                >
                  <div v-html="subSentence1SI"></div>
                  <div v-html="subSentence2SI"></div>
                  <div v-html="subSentence3SI"></div>
                </div>
              </div>
              <div class="col-6 font-content q-pt-sm q-pr-xl" align="left">
                <div
                  style="
                    padding-left: D0px;
                    padding-right: 25px;
                    text-align: justify;
                  "
                >
                  <div v-html="dimSentence1SI"></div>
                  <div v-html="dimSentence2SI"></div>
                  <div v-html="dimSentence3SI"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="break"
          v-show="
            !(
              reporterISO == 'KIR' ||
              reporterISO == 'TLS' ||
              reporterISO == 'TON' ||
              reporterISO == 'VUT'
            )
          "
        ></div>

        <div
          class="printPage text-white"
          v-show="
            !(
              reporterISO == 'KIR' ||
              reporterISO == 'TLS' ||
              reporterISO == 'TON' ||
              reporterISO == 'VUT'
            )
          "
        >
          <div
            style="background: #04284d; width: 100%; height: 140px"
            class="q-pt-md"
          >
            <div style="padding-top: 5px; padding-left: 20px" class="row">
              <div class="col-1" style="width: 150px">
                <img src="images/unescaplogo.svg" style="height: 50px" alt="" />
              </div>
              <div class="col-1"></div>
              <div class="col">
                <div class="row justify-center">
                  <div>
                    <img src="images/logobig2.png" width="190px" alt />
                  </div>
                  <div>
                    <div class="font-20 q-pt-xs">
                      <span style="color: #e0d04e">REGIONAL INTEGRATION</span>
                      AND
                    </div>
                    <div class="font-20">VALUE CHAIN ANALYZER</div>
                  </div>
                </div>
              </div>
              <div class="col-2"></div>
            </div>
            <div align="center" class="text-h6">
              Country brief: {{ countryReportName }} : 2010 - {{ yearMax }}
            </div>
          </div>
          <div class="typeData">Conventional integration (CI)</div>

          <div class="contentPage">
            <div class="text-indigo-10">
              {{ countryReportName }}'s conventional integration score with the
              world in {{ yearMax }} was
              <span class="bigBold">{{ scoreWithWorldCI.toFixed(2) }}</span>
            </div>
            <div align="center" class="q-pt-xs">
              <div id="mapCIShow"></div>
            </div>
            <div align="center" class="font-note">
              Notes: This map is based on CI scores between
              {{ countryReportName }} and {{ noPercentInMapCI }}% of all 196
              UN-recognized economies.
            </div>
            <div class="q-px-xl font-content" align="left">
              <div v-html="firstSentenceCI"></div>
              <div v-html="secondSentenceCI"></div>
              <div v-html="thirdSentenceCI"></div>
            </div>
            <hr />
            <div class="text-indigo-10 textLowerMain">
              {{ mainTextin1LowerCI }}
            </div>
            <div class="row">
              <div class="col-6 q-pl-xl">
                <div class="blueTitle">By sub-regions</div>
                <div align="center">
                  <div id="barChartCI"></div>
                </div>
              </div>
              <div class="col-6 q-pr-xl">
                <div class="blueTitle">By dimension and indicator</div>
                <div align="center">
                  <div id="spiderChartCI"></div>
                </div>
                <div class="font-note">{{ dimNoDataCI }}</div>
              </div>
            </div>
            <div class="font-content">
              Notes: These graphs are based on CI Scores between
              {{ countryReportName }} and {{ noPercentInMapAPCI }}% of all 58
              ESCAP economies.
            </div>
            <div class="row">
              <div class="col-6 font-content q-pt-sm" align="left">
                <div
                  style="
                    padding-left: 50px;
                    padding-right: 25px;
                    text-align: justify;
                  "
                >
                  <div v-html="subSentence1CI"></div>
                  <div v-html="subSentence2CI"></div>
                  <div v-html="subSentence3CI"></div>
                </div>
              </div>
              <div class="col-6 font-content q-pt-sm q-pr-xl" align="justify">
                <div
                  style="
                    padding-left: D0px;
                    padding-right: 25px;
                    text-align: justify;
                  "
                >
                  <div v-html="dimSentence1CI"></div>
                  <div v-html="dimSentence2CI"></div>
                  <div v-html="dimSentence3CI"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="isShowShare" persistent>
      <q-card class="shareDia q-pa-md">
        <div class="row justify-between">
          <div>Share</div>
          <div class="cursor-pointer" @click="isShowShare = false">
            <q-icon name="fa-solid fa-xmark" size="20px" />
          </div>
        </div>
        <div class="row justify-between q-px-lg q-py-lg">
          <div>
            <ShareNetwork
              network="facebook"
              :url="urlLink"
              title="RIVA - A Revolutionary Platform"
              description="Country brief from RIVA "
              quote="RIVA: Revolutionizing International Trade"
              hashtag="#RIVA"
            >
              <img
                src="images/facebookShare.svg"
                alt="Facebook Share"
                style="height: 120px"
                class="cursor-pointer"
              />
            </ShareNetwork>
            <div class="text-center">Facebook</div>
          </div>
          <div>
            <ShareNetwork
              network="twitter"
              :url="urlLink"
              title="RIVA - A Revolutionary Platform"
              description="Country brief from RIVA "
              hashtag="#RIVA"
            >
              <img
                src="images/xShare.svg"
                alt="Twitter Share"
                style="height: 120px"
                class="cursor-pointer"
              />
            </ShareNetwork>
            <div class="text-center">Twitter</div>
          </div>
          <div>
            <ShareNetwork
              network="linkedin"
              :url="urlLink"
              title="RIVA - A Revolutionary Platform"
              description="Country brief from RIVA "
              source="https://riva.negotiatetrade.org"
            >
              <img
                src="images/inShare.svg"
                alt="LinkedIn Share"
                style="height: 120px"
                class="cursor-pointer"
              />
            </ShareNetwork>
            <div class="text-center">LinkedIn</div>
          </div>
        </div>
        <div class="q-px-lg">
          <div class="boxGrey q-px-md row">
            <div class="col ellipsis">{{ urlLink }}</div>
            <div
              style="width: 40px; color: #1996d4; font-weight: 600"
              class="text-right cursor-pointer"
              @click="copyLink()"
            >
              COPY
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
// import { serverSetup, yearInputShow } from "./server";
import { serverSetup } from "./server";
import { useRoute } from "vue-router";
import countryAllWorld from "../assets/country_allcompare.json";
import { countryGroupListRiva2 } from "./countryGroupList";
import tileMap from "../assets/tiledmap.json";
import { Loading, Notify } from "quasar";

import axios from "axios";
import html2pdf from "jspdf-html2canvas";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
// const { yearInput } = yearInputShow();
const { serverData } = serverSetup();

const route = useRoute();

const isShowShare = ref(false);
const urlLink = ref("");
const reporterISO = ref(route.params.iso);
const yearMax = ref(2019);

const countryWorldSI = ref([]);
const countryAllReport = ref([]);
const countryReportName = ref("");
const countryReportList = ref([]);
const countryReportFullList = ref([]);
const countryPartnerFullList = ref([]);

const indicatorDataSI = ref([]);
const indicatorDataCI = ref([]);

const scoreWithWorldSI = ref(0);
const scoreWithWorldCI = ref(0);

const tiledMapSI = ref([]);
const tiledMapCI = ref([]);

const noPercentInMapCI = ref(0);
const noPercentInMapSI = ref(0);
const noPercentInMapAPCI = ref(0);
const noPercentInMapAPSI = ref(0);

const firstSentenceSI = ref("");
const firstSentenceCI = ref("");

const secondSentenceSI = ref("");
const secondSentenceCI = ref("");

const dimensionName = ref([
  "Trade and investment",
  "Financial markets",
  "Value chains",
  "Infrastucture and connectivity",
  "Movement of people",
  "Regulatory cooperation",
  "Digital economy",
]);

const mainTextin1LowerSI = ref("");
const mainTextin1LowerCI = ref("");

const dimensionSI = ref("");
const dimensionSIResult = ref([]);
const thirdSentenceSI = ref("");
const thirdSentenceCI = ref("");
const dimensionCI = ref("");
const dimensionCIResult = ref([]);

const dimFinalSI = ref([]);
const dimYearSI = ref([]);
const dataSpiderSI = ref([]);
const dimSentence1SI = ref("");
const dimSentence2SI = ref("");
const dimSentence3SI = ref("");
const dimNoDataSI = ref("");
const dimDiffSI = ref([]);

const dimFinalCI = ref([]);
const dimYearCI = ref([]);
const dataSpiderCI = ref([]);
const dimSentence1CI = ref("");
const dimSentence2CI = ref("");
const dimSentence3CI = ref("");
const dimNoDataCI = ref("");
const dimDiffCI = ref([]);

const byCountryDataSI = ref([]);
const byCountryChartSI = ref([]);
const byRegionSI = ref([]);
const byCountryDataCI = ref([]);
const byCountryChartCI = ref([]);
const byRegionCI = ref([]);

const subSentence1SI = ref("");
const subSentence2SI = ref("");
const subSentence3SI = ref("");

const subSentence1CI = ref("");
const subSentence2CI = ref("");
const subSentence3CI = ref("");
const yearHL = ref("");
const yearHH = ref("");
const btnShow = ref(true);
const yearInput = ref({ min: 2010, max: 2020 });

const printBtn = () => {
  window.print();
};

const downloadPDF = async () => {
  btnShow.value = false;
  await nextTick();
  let pages = document.getElementsByClassName("printPage");

  html2pdf(pages, {
    html2canvas: {
      scrollX: 0,
      scrollY: -window.scrollY,
    },
    jsPDF: {
      format: "a4",
    },

    imageType: "image/jpeg",
    output: "./pdf/generate.pdf",
  }).then(() => {
    btnShow.value = true;
  });
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(urlLink.value);
    isShowShare.value = false;
    Notify.create({
      message: "Copied to clipboard",
      color: "positive",
      position: "top",
      icon: "fa-solid fa-circle-check",
    });
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

onMounted(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = Number(result.data[0].yearStart);
  yearInput.value.max = Number(result.data[0].yearEnd);
  Loading.show();
  urlLink.value =
    "https://riva.negotiatetrade.org/#/ricountrybrief2/" + reporterISO.value;
  yearMax.value = yearInput.value.max;
  yearHL.value = Math.floor((yearInput.value.min + yearMax.value) / 2);
  yearHH.value = Math.ceil((yearInput.value.min + yearMax.value) / 2);
  loadInt();
});

const loadInt = async () => {
  countryReportName.value = countryAllWorld.filter(
    (x) => x.iso == reporterISO.value
  )[0].country;

  indicatorDataSI.value = [];
  let data = {
    type: "Sustainable",
  };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(data));
  indicatorDataSI.value = res.data;

  indicatorDataCI.value = [];
  data = {
    type: "Conventional",
  };

  res = await axios.post(url, JSON.stringify(data));
  indicatorDataCI.value = res.data;
  await calInitScoreInTheWorld();
  await mapSI();
  if (
    reporterISO.value != "KIR" ||
    reporterISO.value != "TLS" ||
    reporter.value != "TON" ||
    reporter.value != "VUT"
  ) {
    await mapCI();
  }
};

const mapCI = async () => {
  let data = {
    name: "score in map",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  let url2 = serverData.value + "ri/brief_fivebar_top4_eco.php";
  let res2 = await axios.post(url2, JSON.stringify(data));
  let result2 = res2.data;
  let datax = [];
  countryPartnerFullList.value.forEach((x) => {
    let scoreArray = result2.filter((item) => item.partner == x);
    let score = 0;
    let countryCode;
    if (scoreArray.length > 0) {
      score =
        scoreArray.reduce((a, b) => a + Number(b.score), 0) / scoreArray.length;

      let countryCodeFilter = countryAllWorld.filter((y) => y.iso == x);

      if (countryCodeFilter.length > 0) {
        countryCode = countryCodeFilter[0].code;
        let scoreAdd = Number(score.toFixed(2));
        let temp = {
          country: countryCode,
          score: scoreAdd,
        };
        datax.push(temp);
      }
    }
  });
  //Reset value in Json
  tiledMapCI.value = [...tileMap];
  tiledMapCI.value.forEach((x) => {
    let dataMatch = datax.filter((y) => y.country == x.alpha2);
    if (dataMatch.length > 0) {
      x.value = dataMatch[0].score;
    } else {
      x.value = -999;
    }
  });

  //Note below chart
  noPercentInMapCI.value = ((datax.length / 196) * 100).toFixed(0);
  let numInMap = tiledMapCI.value.map((x) => x.value);
  let numMax = Math.max(...numInMap);
  let st1Set = Number((numMax / 5).toFixed(2));
  let st2Set = Number(((numMax / 5) * 2).toFixed(2));
  let st3Set = Number(((numMax / 5) * 3).toFixed(2));
  let st4Set = Number(((numMax / 5) * 4).toFixed(2));
  let st5Set = Number(numMax.toFixed(2));
  Highcharts.chart("mapCIShow", {
    chart: {
      type: "tilemap",
      inverted: true,
      width: "800",
      height: "450",
    },

    title: {
      text: "",
    },

    xAxis: {
      visible: false,
    },

    yAxis: {
      visible: false,
    },

    colorAxis: {
      dataClasses: [
        {
          to: 0,
          color: "#8B8A89",
          name: "No data available",
        },
        {
          from: 0,
          to: st1Set,
          color: "#C25555",
          name: "0 - " + st1Set,
        },
        {
          from: st1Set,
          to: st2Set,
          color: "#E7A84A",
          name: st1Set + " - " + st2Set,
        },
        {
          from: st2Set,
          to: st3Set,
          color: "#FBD49A",
          name: st2Set + " - " + st3Set,
        },
        {
          from: st3Set,
          to: st4Set,
          color: "#D3CF5E",
          name: st3Set + " - " + st4Set,
        },
        {
          from: st4Set,
          to: st5Set,
          color: "#65BA47",
          name: st4Set + " - " + st5Set,
        },
      ],
    },

    tooltip: {
      pointFormatter: function () {
        let result = "";
        if (this.value == -999) {
          result = "No data available for " + this.name;
        } else {
          result =
            this.name + "'s conventional integration score is " + this.value;
        }

        return result;
      },
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: "{point.alpha2}",
          color: "#000000",
          style: {
            textOutline: false,
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    series: [
      {
        name: "",
        data: tiledMapCI.value,
      },
    ],
  });
  sentence1TopCI();
};

const sentence1TopCI = async () => {
  //First bullet below map
  let lastYearValue = scoreWithWorldCI.value;
  let firstYearValue;
  let data = {
    name: "OK",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: 2010,
    type: "Conventional",
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  firstYearValue = res.data[0].value;
  if (firstYearValue > lastYearValue) {
    firstSentenceCI.value =
      "<ul><li>From 2010-" +
      yearMax.value +
      ", " +
      countryReportName.value +
      "'s CI " +
      " score <b>has progressed negatively</b>, decreasing from " +
      firstYearValue.toFixed(2) +
      " to " +
      lastYearValue.toFixed(2) +
      " between periods.</li></ul>";
  } else {
    firstSentenceCI.value =
      "<ul><li>From 2010-" +
      yearMax.value +
      ", " +
      countryReportName.value +
      "'s CI " +
      " score <b>has progressed positively</b>, increasing from " +
      firstYearValue.toFixed(2) +
      " to " +
      lastYearValue.toFixed(2) +
      " between periods.</li></ul>";
  }
  sentence2TopCI();
};

const sentence2TopCI = async () => {
  //Second bullet below map
  let partnerInput = [];
  let resultRegion = [];
  let dataTempSI = {};
  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  let data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Asia-Pacific",
    score: res.data[0].value,
  };

  resultRegion.push(dataTempSI);

  //Europe
  countryPartyTemp = [];
  iso = ["europe"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Europe",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //latin_america__caribbean
  countryPartyTemp = [];
  iso = ["latin_america__caribbean"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Latin America and the Caribbean",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //africa_middle_east
  countryPartyTemp = [];
  iso = ["africa_middle_east"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Africa and Middle-East",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //north_america
  countryPartyTemp = [];
  iso = ["north_america"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "North-America",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);
  resultRegion.sort((a, b) => b.score - a.score);

  //Top4
  let top4Raw = [];
  tiledMapCI.value.forEach((x) => {
    let temp = {
      alpha2: x.alpha2,
      alpha3: x.alpha3,
      name: x.name,
      value: x.value,
    };
    top4Raw.push(temp);
  });
  top4Raw.sort((a, b) => b.value - a.value);
  top4Raw = top4Raw.slice(0, 4);

  secondSentenceCI.value = `<ul><li>In ${yearMax.value}, ${
    countryReportName.value
  }  had the highest CI score with ${
    resultRegion[0].region
  } (${resultRegion[0].score.toFixed(2)}), followed by ${
    resultRegion[1].region
  } (${resultRegion[1].score.toFixed(2)}), ${
    resultRegion[2].region
  } (${resultRegion[2].score.toFixed(2)}), ${
    resultRegion[3].region
  } (${resultRegion[3].score.toFixed(2)}), and ${
    resultRegion[4].region
  } (${resultRegion[4].score.toFixed(2)}) regions. By country, ${
    countryReportName.value
  }'s four highest CI scores were with ${
    top4Raw[0].name
  } (${top4Raw[0].value.toFixed(2)}),
      ${top4Raw[1].name} (${top4Raw[1].value.toFixed(2)}),
      ${top4Raw[2].name} (${top4Raw[2].value.toFixed(2)}), and
      ${top4Raw[3].name} (${top4Raw[3].value.toFixed(2)}). </li></ul>`;

  sentence3TopCI();
};

const sentence3TopCI = async () => {
  let input = {
    year: {
      min: 2010,
      max: yearMax.value,
    },
    type: "Conventional",
  };
  let data3 = {
    inputData: input,
    countryPartnerList: "xxx",
    countryReportList: "xxx",
    partnerMap: countryPartnerFullList.value,
    reportMap: countryReportFullList.value,
  };

  let url3 = serverData.value + "ri/econ_intra_index_by_dimension_1.php";
  let res3 = await axios.post(url3, JSON.stringify(data3));
  let url3x = serverData.value + "ri/econ_intra_index_by_dimension_2.php";
  let res3x = await axios.post(url3x, JSON.stringify(data3));
  dimensionCI.value = [...res3.data, ...res3x.data];

  let dimensionLastYearRawCI = dimensionCI.value.filter(
    (x) => x.year == yearMax.value
  );

  for (let i = 1; i <= 7; i++) {
    let dimTemp = dimensionLastYearRawCI
      .filter((x) => Number(x.dimension) == i)
      .map((x) => x.score);
    let dimScore = dimTemp.reduce((a, b) => a + Number(b), 0) / dimTemp.length;
    let dimTemp2 = {
      dimension: dimensionName.value[i - 1],
      score: Number(dimScore.toFixed(2)),
    };
    dimensionCIResult.value.push(dimTemp2);
  }
  dimensionCIResult.value = dimensionCIResult.value.filter((x) => x.score >= 0);
  dimensionCIResult.value.sort((a, b) => b.score - a.score);

  thirdSentenceCI.value = `<ul><li>${
    countryReportName.value
  }'s CI with world is highest in ${
    dimensionCIResult.value[0].dimension
  } (${dimensionCIResult.value[0].score.toFixed(2)}) and ${
    dimensionCIResult.value[1].dimension
  } (${dimensionCIResult.value[1].score.toFixed(
    2
  )}) dimensions. It is lowest in ${
    dimensionCIResult.value[dimensionCIResult.value.length - 1].dimension
  } (${dimensionCIResult.value[
    dimensionCIResult.value.length - 1
  ].score.toFixed(2)}) and ${
    dimensionCIResult.value[dimensionCIResult.value.length - 2].dimension
  } (${dimensionCIResult.value[
    dimensionCIResult.value.length - 2
  ].score.toFixed(2)}).</li></ul>`;
  mainSentenceCI();
};

const mainSentenceCI = async () => {
  //make partner country list
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let countryPartner = [...new Set(countryPartyTemp)];

  //Score with the world
  let data4 = {
    name: "OK",
    partner: countryPartner,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  let url4 = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res4 = await axios.post(url4, JSON.stringify(data4));
  let scoreAP = res4.data[0].value;
  if (countryReportName.value != "Asia-Pacific (ESCAP)") {
    mainTextin1LowerCI.value = `${
      countryReportName.value
    }'s conventional integration score with Asia-Pacific in ${
      yearMax.value
    } was ${scoreAP.toFixed(2)}`;
  } else {
    mainTextin1LowerCI.value = `Asia-Pacific conventional integration score in ${
      yearMax.value
    } was ${scoreAP.toFixed(2)}`;
  }
  let data = {
    name: "score in map",
    partner: countryPartner,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  let url2 = serverData.value + "ri/brief_fivebar_top4_eco.php";
  let res2 = await axios.post(url2, JSON.stringify(data));
  let datax = [...new Set(res2.data.map((x) => x.partner))];
  noPercentInMapAPCI.value = ((datax.length / 59) * 100).toFixed(0);
  byDimensionCI();
};

const byDimensionCI = async () => {
  let partnerInput = [];

  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  let input = {
    year: {
      min: 2010,
      max: yearMax.value,
    },
    type: "Conventional",
  };
  let data6 = {
    inputData: input,
    countryPartnerList: "xxx",
    countryReportList: "xxx",
    partnerMap: partnerInput,
    reportMap: countryReportFullList.value,
  };
  let url6 = serverData.value + "ri/econ_intra_index_by_dimension_1.php";
  let res6 = await axios.post(url6, JSON.stringify(data6));
  let url6x = serverData.value + "ri/econ_intra_index_by_dimension_2.php";
  let res6x = await axios.post(url6x, JSON.stringify(data6));
  let dimRaw = [...res6.data, ...res6x.data];
  dimFinalCI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
      let dimTemp = dimRaw.filter(
        (data) =>
          Number(data.dimension) == dimCount && Number(data.year) == yearCount
      );
      let dimTemp2 =
        dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
      let dataTemp = {
        dimension: dimCount,
        score: dimTemp2,
        year: yearCount,
      };
      dimFinalCI.value.push(dataTemp);
    }
  }

  dimYearCI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dimTemp1 = dimFinalCI.value.filter(
      (x) => x.year <= yearHL.value && x.dimension == dimCount
    );

    let dimFinal1 = dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;
    let temp1 = {
      dimension: dimCount,
      score: dimFinal1,
      year: "2010-" + yearHL.value,
    };
    dimYearCI.value.push(temp1);
    let dimTemp2 = dimFinalCI.value.filter(
      (x) => x.year >= yearHH.value && x.dimension == dimCount
    );
    let dimFinal2 = dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
    let temp2 = {
      dimension: dimCount,
      score: dimFinal2,
      year: yearHH.value + "-" + yearMax.value,
    };
    dimYearCI.value.push(temp2);
  }

  let dataPointTemp = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dataTemp = dimYearCI.value.filter(
      (x) => x.dimension == dimCount && x.year == "2010-" + yearHL.value
    );

    dataPointTemp.push(Number(dataTemp[0].score.toFixed(2)));
  }
  {
    let dataTemp = {
      name: "2010-" + yearHL.value,
      data: dataPointTemp,
    };
    dataSpiderCI.value.push(dataTemp);
  }
  dataPointTemp = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dataTemp = dimYearCI.value.filter(
      (x) =>
        x.dimension == dimCount && x.year == yearHH.value + "-" + yearMax.value
    );
    dataPointTemp.push(Number(dataTemp[0].score.toFixed(2)));
  }
  {
    let dataTemp = {
      name: yearHH.value + "-" + yearMax.value,
      data: dataPointTemp,
    };
    dataSpiderCI.value.push(dataTemp);
  }
  let blankItem = [];
  dataSpiderCI.value[0].data.forEach((x, index) => {
    if (isNaN(x)) {
      blankItem.push(index);
    }
  });
  if (blankItem.length > 0) {
    dimNoDataCI.value = "Not available for ";
    if (blankItem.length == 1) {
      dimNoDataCI.value += dimensionName.value[blankItem[0]];
    } else if (blankItem.length == 2) {
      dimNoDataCI.value +=
        dimensionName.value[blankItem[0]] +
        " and " +
        dimensionName.value[blankItem[1]];
    } else if (blankItem.length == 3) {
      dimNoDataCI.value +=
        dimensionName.value[blankItem[0]] +
        ", " +
        dimensionName.value[blankItem[1]] +
        " and " +
        dimensionName.value[blankItem[2]];
    }
  }

  dimSentenceGenCI();
  spiderChartCI();
};

const dimSentenceGenCI = async () => {
  let partnerInput = [];

  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];
  //First Sentence
  let dimLastYear = dimYearCI.value.filter(
    (x) => x.year == yearHH.value + "-" + yearMax.value && x.score >= 0
  );
  let maxScore = Math.max(...dimLastYear.map((x) => x.score));
  let dimLastMax = dimLastYear.filter((x) => x.score == maxScore);
  let data7 = {
    inputData: {
      year: {
        min: yearMax.value,
        max: yearMax.value,
      },
      type: "Conventional",
    },
    dimension: dimLastMax[0].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };
  let url7 = serverData.value + "ri/econ_spider_indicator.php";
  let res7 = await axios.post(url7, JSON.stringify(data7));
  let dimRaw7 = res7.data;
  let dimRaw7Ind = [...new Set(dimRaw7.map((x) => Number(x.indicator)))];
  let dimRaw7IndFinal = [];
  dimRaw7Ind.forEach((x) => {
    let dimRaw7Temp = dimRaw7.filter((y) => Number(y.indicator) == x);
    if (dimRaw7Temp.length > 0) {
      let dimRaw7Score;
      dimRaw7Score =
        dimRaw7Temp.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw7Temp.length;
      let temp = {
        dimension: dimLastMax[0].dimension,
        indicator: x,
        score: dimRaw7Score,
      };
      dimRaw7IndFinal.push(temp);
    }
  });

  dimRaw7IndFinal.sort((a, b) => b.score - a.score);
  if (dimRaw7IndFinal.length == 1) {
    let ind1 =
      indicatorDataCI.value[dimRaw7IndFinal[0].dimension - 1].indicator[
        dimRaw7IndFinal[0].indicator - 1
      ];
    dimSentence1CI.value = `<ul><li>${
      countryReportName.value
    }'s CI score with Asia-Pacific is highest in ${
      dimensionName.value[dimLastMax[0].dimension - 1]
    }. through integration in <i>${ind1}</i>.</li></ul>`;
  } else {
    let ind1 =
      indicatorDataCI.value[dimRaw7IndFinal[0].dimension - 1].indicator[
        dimRaw7IndFinal[0].indicator - 1
      ];
    let ind2 =
      indicatorDataCI.value[dimRaw7IndFinal[1].dimension - 1].indicator[
        dimRaw7IndFinal[1].indicator - 1
      ];
    dimSentence1CI.value = `<ul><li>${
      countryReportName.value
    }'s CI score with Asia-Pacific is highest in ${
      dimensionName.value[dimLastMax[0].dimension - 1]
    }. through integration in <i>${ind1}</i> and <i>${ind2}</i> indicators.</li></ul>`;
  }

  //Second Sentence
  dimYearCI.value = dimYearCI.value.filter((x) => x.score >= 0);
  let dimYearCIStart = dimYearCI.value.filter(
    (x) => x.year == "2010-" + yearHL.value
  );
  let dimYearCIEnd = dimYearCI.value.filter(
    (x) => x.year == yearHH.value + "-" + yearMax.value
  );
  dimYearCIStart.sort((a, b) => a.dimension - b.dimension);
  dimYearCIEnd.sort((a, b) => a.dimension - b.dimension);
  dimDiffCI.value = [];
  dimYearCIStart.forEach((x, index) => {
    let diff = dimYearCIEnd[index].score - dimYearCIStart[index].score;
    let tempData = {
      dimension: dimYearCIStart[index].dimension,
      diff: diff,
    };
    dimDiffCI.value.push(tempData);
  });
  dimDiffSI.value.sort((a, b) => b.diff - a.diff);
  let data8 = {
    inputData: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Conventional",
    },
    dimension: dimDiffCI.value[0].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };
  let url8 = serverData.value + "ri/econ_spider_indicator.php";
  let res8 = await axios.post(url8, JSON.stringify(data8));
  let dimMaxRaw = res8.data;
  let dimRaw8Ind = [...new Set(dimMaxRaw.map((x) => Number(x.indicator)))];
  let dimRaw8aIndFinal = [];
  dimRaw8Ind.forEach((x) => {
    let dimRaw8TempStart = dimMaxRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) <= yearHL.value
    );
    let dimRaw8TempEnd = dimMaxRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) > yearHH.value
    );

    if (dimRaw8TempStart.length > 0) {
      let dimRaw8ScoreStart =
        dimRaw8TempStart.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw8TempStart.length;
      let dimRaw8ScoreEnd =
        dimRaw8TempEnd.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw8TempEnd.length;

      let temp = {
        indicator: x,
        diff: dimRaw8ScoreEnd - dimRaw8ScoreStart,
      };
      dimRaw8aIndFinal.push(temp);
    }
  });
  dimRaw8aIndFinal.sort((a, b) => b.diff - a.diff);
  let IndMax =
    "<i>" +
    indicatorDataCI.value[dimDiffCI.value[0].dimension - 1].indicator[
      dimRaw8aIndFinal[0].indicator - 1
    ] +
    "</i> (" +
    Math.abs(dimRaw8aIndFinal[0].diff).toFixed(2) +
    ") and <i>" +
    indicatorDataCI.value[dimDiffCI.value[0].dimension - 1].indicator[
      dimRaw8aIndFinal[1].indicator - 1
    ] +
    "</i> (" +
    Math.abs(dimRaw8aIndFinal[1].diff).toFixed(2) +
    ") indicators.";
  if (countryReportName.value != "Asia-Pacific (ESCAP)") {
    dimSentence2CI.value = `<ul><li>Since 2010-${yearHL.value}, ${
      countryReportName.value
    }'s score with Asia-Pacific progressed the most in ${
      dimensionName.value[dimDiffCI.value[0].dimension - 1]
    } (${dimDiffCI.value[0].diff.toFixed(
      2
    )}), driven by improvements in the ${IndMax}</li></ul>`;
  } else {
    dimSentence2CI.value = `<ul><li>Since 2010-${yearHL.value}, ${
      countryReportName.value
    }'s score progressed the most in ${
      dimensionName.value[dimDiffCI.value[0].dimension - 1]
    } (${dimDiffCI.value[0].diff.toFixed(
      2
    )}), driven by improvements in the ${IndMax}</li></ul>`;
  }

  // Third sentence
  let data9 = {
    inputData: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    },
    dimension: dimDiffCI.value[dimDiffCI.value.length - 1].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };
  let url9 = serverData.value + "ri/econ_spider_indicator.php";
  let res9 = await axios.post(url9, JSON.stringify(data9));
  let dimMinRaw = res9.data;
  let dimRaw9Ind = [...new Set(dimMinRaw.map((x) => Number(x.indicator)))];
  let dimRaw9IndFinal = [];
  dimRaw9Ind.forEach((x) => {
    let dimRaw9TempStart = dimMinRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) <= yearHL.value
    );
    let dimRaw9TempEnd = dimMinRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) >= yearHH.value
    );

    if (dimRaw9TempStart.length > 0) {
      let dimRaw9ScoreStart =
        dimRaw9TempStart.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw9TempStart.length;
      let dimRaw9ScoreEnd =
        dimRaw9TempEnd.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw9TempEnd.length;
      let temp = {
        indicator: x,
        diff: dimRaw9ScoreEnd - dimRaw9ScoreStart,
      };
      dimRaw9IndFinal.push(temp);
    }
  });
  dimRaw9IndFinal.sort((a, b) => a.diff - b.diff);
  dimSentence3CI.value = `<ul><li>CI in ${
    dimensionName.value[
      dimDiffCI.value[dimDiffCI.value.length - 1].dimension - 1
    ]
  } dimension progressed the least. The indicator <i>${
    indicatorDataCI.value[
      dimDiffCI.value[dimDiffCI.value.length - 1].dimension - 1
    ].indicator[dimRaw9IndFinal[0].indicator - 1]
  }</i> indicator experienced a ${
    dimRaw9IndFinal[0].diff > 0 ? "increase " : "decline"
  } (${dimRaw9IndFinal[0].diff.toFixed(2)}).</li></ul>`;
};

const spiderChartCI = () => {
  Highcharts.chart("spiderChartCI", {
    chart: {
      polar: true,
      backgroundColor: "#FFFFFF",

      marginTop: "0",
    },
    title: {
      text: null,
    },
    pane: {
      size: "80%",
    },
    xAxis: {
      categories: dimensionName.value,
      tickmarkPlacement: "on",
      lineWidth: 0,
      gridLineColor: "#C4C4C4",
    },

    yAxis: {
      gridLineInterpolation: "polygon",
      lineWidth: 0,
      min: 0,
      max: 1,
      gridLineColor: "#C4C4C4",
      endOnTick: true,
      showLastLabel: true,
      tickPositions: [0, 0.25, 0.5, 0.75, 1.0],
    },

    tooltip: {
      shared: true,
      valueDecimals: 2,
    },

    series: dataSpiderCI.value,

    exporting: {
      enabled: false,
    },
    credits: { enabled: false },
  });
  byCountryCI();
};

const byCountryCI = async () => {
  let partnerInput = [];

  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  let countryReportListAP = [];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];
  partnerInput.forEach((item) => {
    let temp = {
      label: item,
    };
    countryReportListAP.push(temp);
  });

  let dataSend = {
    countryReportList: "xxx",
    countryPartnerList: countryReportListAP,
    reportMap: countryReportFullList.value,
    partnerMap: partnerInput,

    input: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Conventional",
    },
  };

  let url7 = serverData.value + "ri/econ_intra_eco_integration_by_country.php";
  let res7 = await axios.post(url7, JSON.stringify(dataSend));

  let dimRaw7 = res7.data;
  let cENEA = countryGroupListRiva2("ene_asia");
  let cSEA = countryGroupListRiva2("se_asia");
  let cSSWA = countryGroupListRiva2("ssw_asia");
  let cPAC = countryGroupListRiva2("pac");
  let cNCA = countryGroupListRiva2("nc_asia");

  dimRaw7.forEach((item) => {
    let country = item.name;
    let countryFullData = countryAllWorld.filter((x) => x.iso == country);
    let countryFullName = countryFullData[0].country;
    let subRegion = "";
    if (cENEA.includes(country)) {
      subRegion = "ENEA";
    } else if (cSEA.includes(country)) {
      subRegion = "SEA";
    } else if (cSSWA.includes(country)) {
      subRegion = "SSWA";
    } else if (cPAC.includes(country)) {
      subRegion = "PAC";
    } else if (cNCA.includes(country)) {
      subRegion = "NCA";
    }

    let yeardiff1 = yearHL.value - 2010 + 1;
    let data2010_14 = 0;
    for (let i = 1; i <= yeardiff1; i++) {
      data2010_14 += item.data[i - 1];
    }
    data2010_14 = data2010_14 / yeardiff1;

    let yeardiff2 = yearMax.value - yearHH.value + 1;
    let data2015_19 = 0;
    for (
      let i = yearMax.value - 2010 + 1;
      i >= yearMax.value - yearHH.value + 1;
      i--
    ) {
      data2015_19 += item.data[i - 1];
    }
    data2015_19 = data2015_19 / yeardiff2;

    let temp = {
      code: country,
      country: countryFullName,
      subRegion: subRegion,
      data2010_14: data2010_14,
      data2015_19: data2015_19,
      diff: data2015_19 - data2010_14,
    };
    byCountryDataCI.value.push(temp);
  });

  byCountryChartCI.value.categories = [
    "Asia-Pacific",
    "East and North-East Asia  (ENEA)",
    "South-East Asia (SEA)",
    "South and South-West Asia (SSWA)",
    "Pacific (PAC)",
    "North and Central Asia (NCA)",
  ];
  byCountryChartCI.value.data = [];

  //AP
  byCountryDataCI.value = byCountryDataCI.value.filter(
    (x) => x.data2015_19 != 0
  );
  {
    let ap1 =
      byCountryDataCI.value.reduce((a, b) => a + b.data2010_14, 0) /
      byCountryDataCI.value.length;
    let ap2 =
      byCountryDataCI.value.reduce((a, b) => a + b.data2015_19, 0) /
      byCountryDataCI.value.length;

    let temp = {
      region: "AP",
      data2010_14: ap1,
      data2015_19: ap2,
      diff: ap2 - ap1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataCI.value.filter((x) => x.subRegion == "ENEA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "ENEA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataCI.value.filter((x) => x.subRegion == "SEA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "SEA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataCI.value.filter((x) => x.subRegion == "SSWA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "SSWA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataCI.value.filter((x) => x.subRegion == "PAC");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "PAC",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataCI.value.filter((x) => x.subRegion == "NCA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "NCA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionCI.value.push(temp);
  }
  {
    let temp = {
      name: "2010-" + yearHL.value.toString().substr(2),
      data: [
        byRegionCI.value[0].data2010_14,
        byRegionCI.value[1].data2010_14,
        byRegionCI.value[2].data2010_14,
        byRegionCI.value[3].data2010_14,
        byRegionCI.value[4].data2010_14,
        byRegionCI.value[5].data2010_14,
      ],
    };
    byCountryChartCI.value.data.push(temp);
  }
  {
    let temp = {
      name: yearHH.value + "-" + yearMax.value.toString().substr(2),
      data: [
        byRegionCI.value[0].data2015_19,
        byRegionCI.value[1].data2015_19,
        byRegionCI.value[2].data2015_19,
        byRegionCI.value[3].data2015_19,
        byRegionCI.value[4].data2015_19,
        byRegionCI.value[5].data2015_19,
      ],
    };
    byCountryChartCI.value.data.push(temp);
  }
  barChartCI();
};

const barChartCI = () => {
  Highcharts.chart("barChartCI", {
    chart: {
      type: "column",
    },
    title: {
      text: null,
    },

    xAxis: {
      categories: byCountryChartCI.value.categories,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Asia-Pacific")
            return `<span style="color: #F99704; font-weight:bold;">Asia-Pacific</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      visible: false,
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },

    exporting: {
      enabled: false,
    },
    credits: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    series: byCountryChartCI.value.data,
  });
  subSentenceCI();
};

const subSentenceCI = async () => {
  // sentence 1
  {
    let subText01 = "";
    if (byRegionCI.value[0].diff > 0) {
      subText01 = "increased";
    } else {
      subText02 = "decreased";
    }
    let subText02 = "";
    let subText03 = "";
    let subDataSort = byRegionCI.value.sort((a, b) => b.diff - a.diff);
    if (subDataSort[0].region == "AP") {
      subText02 = subDataSort[1].region;
      subText03 = subDataSort[1].diff.toFixed(2);
    } else {
      subText02 = subDataSort[0].region;
      subText03 = subDataSort[0].diff.toFixed(2);
    }

    subSentence1CI.value = `<ul><li>Since 2010-14, ${
      countryReportName.value
    }'s CI score with Asia-Pacific ${subText01} (${byRegionCI.value[0].diff.toFixed(
      2
    )}), progressing the most with then ${subText02} sub-region (${subText03}).</li></ul>`;
  }

  // sentence 2
  {
    byCountryDataCI.value.sort((a, b) => b.diff - a.diff);
    let partnerInput = byCountryDataCI.value[0].code;

    let input = {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Conventional",
    };
    let data6 = {
      inputData: input,
      countryPartnerList: "xxx",
      countryReportList: "xxx",
      partnerMap: partnerInput,
      reportMap: countryReportFullList.value,
    };
    let url6 = serverData.value + "ri/econ_intra_index_by_dimension_1.php";
    let res6 = await axios.post(url6, JSON.stringify(data6));
    let url6x = serverData.value + "ri/econ_intra_index_by_dimension_2.php";
    let res6x = await axios.post(url6x, JSON.stringify(data6));
    let dimRaw = [...res6.data, ...res6x.data];
    let dimFinalCIShow = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
        let dimTemp = dimRaw.filter(
          (data) =>
            Number(data.dimension) == dimCount && Number(data.year) == yearCount
        );
        let dimTemp2 =
          dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
        let dataTemp = {
          dimension: dimCount,
          score: dimTemp2,
          year: yearCount,
        };
        dimFinalCIShow.push(dataTemp);
      }
    }

    let dimYearCI = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      let dimTemp1 = dimFinalCIShow.filter(
        (x) => x.year <= yearHL.value && x.dimension == dimCount
      );

      let dimFinal1 =
        dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;

      let dimTemp2 = dimFinalCIShow.filter(
        (x) => x.year >= yearHH.value && x.dimension == dimCount
      );
      let dimFinal2 =
        dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
      let temp2 = {
        dimension: dimCount,
        score1: dimFinal1,
        score2: dimFinal2,
        diff: dimFinal2 - dimFinal1,
      };
      dimYearCI.push(temp2);
    }
    dimYearCI = dimYearCI.filter((x) => x.score1 >= 0);
    dimYearCI.sort((a, b) => b.diff - a.diff);

    let subText01 = byCountryDataCI.value[0].country;
    let subText02 = byCountryDataCI.value[0].diff.toFixed(2);
    let subText03 = byCountryDataCI.value[1].country;
    let subText04 = byCountryDataCI.value[1].diff.toFixed(2);
    let subText05 = byCountryDataCI.value[2].country;
    let subText06 = byCountryDataCI.value[2].diff.toFixed(2);
    let subText07 = dimensionName.value[dimYearCI[0].dimension - 1];
    subSentence2CI.value = `<ul><li>By country, ${countryReportName.value}'s CI score increased the most with ${subText01} (${subText02}), driven by higher integration in ${subText07} dimension, followed by ${subText03} (${subText04}) and ${subText05} (${subText06})</li></ul>`;
  }

  //sentence 3
  {
    byCountryDataCI.value.sort((a, b) => b.data2015_19 - a.data2015_19);
    let partnerInput = byCountryDataCI.value[0].code;

    let input = {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Conventional",
    };
    let data6 = {
      inputData: input,
      countryPartnerList: "xxx",
      countryReportList: "xxx",
      partnerMap: partnerInput,
      reportMap: countryReportFullList.value,
    };
    let url6 = serverData.value + "ri/econ_intra_index_by_dimension_1.php";
    let res6 = await axios.post(url6, JSON.stringify(data6));
    let url6x = serverData.value + "ri/econ_intra_index_by_dimension_2.php";
    let res6x = await axios.post(url6x, JSON.stringify(data6));
    let dimRaw = [...res6.data, ...res6x.data];
    let dimFinalCIShow = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
        let dimTemp = dimRaw.filter(
          (data) =>
            Number(data.dimension) == dimCount && Number(data.year) == yearCount
        );
        let dimTemp2 =
          dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
        let dataTemp = {
          dimension: dimCount,
          score: dimTemp2,
          year: yearCount,
        };
        dimFinalCIShow.push(dataTemp);
      }
    }

    let dimYearCI = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      let dimTemp1 = dimFinalCIShow.filter(
        (x) => x.year <= yearHL.value && x.dimension == dimCount
      );

      let dimFinal1 =
        dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;

      let dimTemp2 = dimFinalCIShow.filter(
        (x) => x.year >= yearHH.value && x.dimension == dimCount
      );
      let dimFinal2 =
        dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
      let temp2 = {
        dimension: dimCount,
        score1: dimFinal1,
        score2: dimFinal2,
        diff: dimFinal2 - dimFinal1,
      };
      dimYearCI.push(temp2);
    }
    dimYearCI = dimYearCI.filter((x) => x.score1 >= 0);
    dimYearCI.sort((a, b) => b.score2 - a.score2);
    let subText01 = byCountryDataCI.value[0].country;
    let subText02 = byCountryDataCI.value[0].data2015_19.toFixed(2);
    let subText03 = dimensionName.value[dimYearCI[0].dimension - 1];
    let subText04 = dimYearCI[0].score2.toFixed(2);
    let subText05 = dimensionName.value[dimYearCI[1].dimension - 1];
    let subText06 = dimYearCI[1].score2.toFixed(2);
    subSentence3CI.value = `<ul><li>In Asia-Pacific, ${countryReportName.value} is most integrated with ${subText01} (${subText02}). Specifically, CI with ${subText01} is strongest in  ${subText03} (${subText04}) and ${subText05} (${subText06}).</li></ul>`;
  }
  Loading.hide();
};

const calInitScoreInTheWorld = async () => {
  //make report country list
  let countryPartyTemp = [];
  countryReportList.value = [];
  countryReportList.value.push(reporterISO.value);
  let iso = countryReportList.value;

  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);

    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  countryReportFullList.value = [...new Set(countryPartyTemp)];

  //make partner country list
  iso = ["wld"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  countryPartnerFullList.value = [...new Set(countryPartyTemp)];

  //Score with the world
  let data = {
    name: "OK",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  scoreWithWorldSI.value = res.data[0].value;

  let data2 = {
    name: "OK",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Conventional",
  };
  let url2 = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res2 = await axios.post(url2, JSON.stringify(data2));
  scoreWithWorldCI.value = res2.data[0].value;
};

const mapSI = async () => {
  //cal score in the map
  let data = {
    name: "score in map",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  let url2 = serverData.value + "ri/brief_fivebar_top4_eco.php";
  let res2 = await axios.post(url2, JSON.stringify(data));
  let result2 = res2.data;
  let datax = [];
  countryPartnerFullList.value.forEach((x) => {
    let scoreArray = result2.filter((item) => item.partner == x);
    let score = 0;
    let countryCode;
    if (scoreArray.length > 0) {
      score =
        scoreArray.reduce((a, b) => a + Number(b.score), 0) / scoreArray.length;

      let countryCodeFilter = countryAllWorld.filter((y) => y.iso == x);

      if (countryCodeFilter.length > 0) {
        countryCode = countryCodeFilter[0].code;
        let scoreAdd = Number(score.toFixed(2));
        let temp = {
          country: countryCode,
          score: scoreAdd,
        };
        datax.push(temp);
      }
    }
  });

  //Reset value in Json
  tiledMapSI.value = [...tileMap];
  tiledMapSI.value.forEach((x) => {
    let dataMatch = datax.filter((y) => y.country == x.alpha2);
    if (dataMatch.length > 0) {
      x.value = dataMatch[0].score;
    } else {
      x.value = -999;
    }
  });

  //Note below chart
  noPercentInMapSI.value = ((datax.length / 196) * 100).toFixed(0);

  let numInMap = tiledMapSI.value.map((x) => x.value);
  let numMax = Math.max(...numInMap);
  let st1Set = Number((numMax / 5).toFixed(2));
  let st2Set = Number(((numMax / 5) * 2).toFixed(2));
  let st3Set = Number(((numMax / 5) * 3).toFixed(2));
  let st4Set = Number(((numMax / 5) * 4).toFixed(2));
  let st5Set = Number(numMax.toFixed(2));
  Highcharts.chart("mapSIShow", {
    chart: {
      type: "tilemap",
      inverted: true,
      width: "800",
      height: "450",
    },

    title: {
      text: "",
    },

    xAxis: {
      visible: false,
    },

    yAxis: {
      visible: false,
    },

    colorAxis: {
      dataClasses: [
        {
          to: 0,
          color: "#8B8A89",
          name: "No data available",
        },
        {
          from: 0,
          to: st1Set,
          color: "#C25555",
          name: "0 - " + st1Set,
        },
        {
          from: st1Set,
          to: st2Set,
          color: "#E7A84A",
          name: st1Set + " - " + st2Set,
        },
        {
          from: st2Set,
          to: st3Set,
          color: "#FBD49A",
          name: st2Set + " - " + st3Set,
        },
        {
          from: st3Set,
          to: st4Set,
          color: "#D3CF5E",
          name: st3Set + " - " + st4Set,
        },
        {
          from: st4Set,
          to: st5Set,
          color: "#65BA47",
          name: st4Set + " - " + st5Set,
        },
      ],
    },

    tooltip: {
      pointFormatter: function () {
        let result = "";
        if (this.value == -999) {
          result = "No data available for " + this.name;
        } else {
          result =
            this.name + "'s sustainable integration score is " + this.value;
        }

        return result;
      },
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          format: "{point.alpha2}",
          color: "#000000",
          style: {
            textOutline: false,
            fontSize: "8px",
          },
        },
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
    series: [
      {
        name: "",
        data: tiledMapSI.value,
      },
    ],
  });
  sentence1TopSI();
};

const sentence1TopSI = async () => {
  let lastYearValue = scoreWithWorldSI.value;
  let firstYearValue;
  let data = {
    name: "OK",
    partner: countryPartnerFullList.value,
    reporting: countryReportFullList.value,
    year: 2010,
    type: "Sustainable",
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  firstYearValue = res.data[0].value;
  if (firstYearValue > lastYearValue) {
    firstSentenceSI.value =
      "<ul><li>From 2010-" +
      yearMax.value.toString().substr(2) +
      ", " +
      countryReportName.value +
      "'s SI " +
      " score <b>has progressed negatively</b>, decreasing from " +
      firstYearValue.toFixed(2) +
      " to " +
      lastYearValue.toFixed(2) +
      " between periods.</li></ul>";
  } else {
    firstSentenceSI.value =
      "<ul><li>From 2010-" +
      yearMax.value.toString().substr(2) +
      ", " +
      countryReportName.value +
      "'s SI " +
      " score <b>has progressed positively</b>, increasing from " +
      firstYearValue.toFixed(2) +
      " to " +
      lastYearValue.toFixed(2) +
      " between periods.</li></ul>";
  }
  sentence2TopSI();
};

const sentence2TopSI = async () => {
  let partnerInput = [];
  let resultRegion = [];
  let dataTempSI = {};
  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  let data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Asia-Pacific",
    score: res.data[0].value,
  };

  resultRegion.push(dataTempSI);

  //Europe
  countryPartyTemp = [];
  iso = ["europe"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Europe",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //latin_america__caribbean
  countryPartyTemp = [];
  iso = ["latin_america__caribbean"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Latin America and the Caribbean",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //africa_middle_east
  countryPartyTemp = [];
  iso = ["africa_middle_east"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "Africa and Middle-East",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);

  //north_america
  countryPartyTemp = [];
  iso = ["north_america"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  data = {
    name: "OK",
    partner: partnerInput,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  res = await axios.post(url, JSON.stringify(data));
  dataTempSI = {
    region: "North-America",
    score: res.data[0].value,
  };
  resultRegion.push(dataTempSI);
  resultRegion.sort((a, b) => b.score - a.score);

  //Top4
  let top4Raw = [];

  tiledMapSI.value.forEach((x) => {
    let temp = {
      alpha2: x.alpha2,
      alpha3: x.alpha3,
      name: x.name,
      value: x.value,
    };
    top4Raw.push(temp);
  });

  top4Raw.sort((a, b) => b.value - a.value);
  top4Raw = top4Raw.slice(0, 4);
  secondSentenceSI.value = `<ul><li>In ${yearMax.value}, ${
    countryReportName.value
  }  had the highest SI score with ${
    resultRegion[0].region
  } (${resultRegion[0].score.toFixed(2)}), followed by ${
    resultRegion[1].region
  } (${resultRegion[1].score.toFixed(2)}), ${
    resultRegion[2].region
  } (${resultRegion[2].score.toFixed(2)}), ${
    resultRegion[3].region
  } (${resultRegion[3].score.toFixed(2)}), and ${
    resultRegion[4].region
  } (${resultRegion[4].score.toFixed(2)}) regions. By country, ${
    countryReportName.value
  }'s four highest SI scores were with ${
    top4Raw[0].name
  } (${top4Raw[0].value.toFixed(2)}),
      ${top4Raw[1].name} (${top4Raw[1].value.toFixed(2)}),
      ${top4Raw[2].name} (${top4Raw[2].value.toFixed(2)}), and
      ${top4Raw[3].name} (${top4Raw[3].value.toFixed(2)}). </li></ul>`;
  sentence3TopSI();
};
const sentence3TopSI = async () => {
  let input = {
    year: {
      min: 2010,
      max: yearMax.value,
    },
    type: "Sustainable",
  };
  let data2 = {
    input: input,
  };

  let url2 = serverData.value + "ri/brief_intra_index_by_dimension_forap.php";
  let res2 = await axios.post(url2, JSON.stringify(data2));
  dimensionSI.value = res2.data;
  let dimensionLastYearRawSI = dimensionSI.value.filter(
    (x) => x.year == yearMax.value
  );

  for (let i = 1; i <= 7; i++) {
    let dimTemp = dimensionLastYearRawSI
      .filter((x) => Number(x.dimension) == i)
      .map((x) => x.score);
    let dimScore = dimTemp.reduce((a, b) => a + Number(b), 0) / dimTemp.length;
    let dimTemp2 = {
      dimension: dimensionName.value[i - 1],
      score: Number(dimScore.toFixed(2)),
    };
    dimensionSIResult.value.push(dimTemp2);
  }
  dimensionSIResult.value = dimensionSIResult.value.filter((x) => x.score >= 0);
  dimensionSIResult.value.sort((a, b) => b.score - a.score);

  thirdSentenceSI.value = `<ul><li>${
    countryReportName.value
  }'s SI with world is highest in ${
    dimensionSIResult.value[0].dimension
  } (${dimensionSIResult.value[0].score.toFixed(2)}) and ${
    dimensionSIResult.value[1].dimension
  } (${dimensionSIResult.value[1].score.toFixed(
    2
  )}) dimensions. It is lowest in ${
    dimensionSIResult.value[dimensionSIResult.value.length - 1].dimension
  } (${dimensionSIResult.value[
    dimensionSIResult.value.length - 1
  ].score.toFixed(2)}) and ${
    dimensionSIResult.value[dimensionSIResult.value.length - 2].dimension
  } (${dimensionSIResult.value[
    dimensionSIResult.value.length - 2
  ].score.toFixed(2)}).</li></ul>`;
  mainSentenceSI();
};
const mainSentenceSI = async () => {
  //make partner country list
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let countryPartner = [...new Set(countryPartyTemp)];

  //Score with the world
  let data4 = {
    name: "OK",
    partner: countryPartner,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  let url4 = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res4 = await axios.post(url4, JSON.stringify(data4));
  let scoreAP = res4.data[0].value;
  if (countryReportName.value != "Asia-Pacific (ESCAP)") {
    mainTextin1LowerSI.value = `${
      countryReportName.value
    }'s sustainable integration score with Asia-Pacific in ${
      yearMax.value
    } was ${scoreAP.toFixed(2)}`;
  } else {
    mainTextin1LowerSI.value = `Asia-Pacific sustainable integration score in ${
      yearMax.value
    } was ${scoreAP.toFixed(2)}`;
  }
  let data = {
    name: "score in map",
    partner: countryPartner,
    reporting: countryReportFullList.value,
    year: yearMax.value,
    type: "Sustainable",
  };
  let url2 = serverData.value + "ri/brief_fivebar_top4_eco.php";
  let res2 = await axios.post(url2, JSON.stringify(data));
  let datax = [...new Set(res2.data.map((x) => x.partner))];
  noPercentInMapAPSI.value = ((datax.length / 59) * 100).toFixed(0);

  byDimensionSI();
};

const byDimensionSI = async () => {
  let partnerInput = [];

  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];

  let input = {
    year: {
      min: 2010,
      max: yearMax.value,
    },
    type: "Sustainable",
  };
  let data6 = {
    inputData: input,
    countryPartnerList: "xxx",
    countryReportList: "xxx",
    partnerMap: partnerInput,
    reportMap: countryReportFullList.value,
  };

  let url6 = serverData.value + "ri/econ_intra_index_by_dimension.php";
  let res6 = await axios.post(url6, JSON.stringify(data6));
  let dimRaw = res6.data;
  dimFinalSI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
      let dimTemp = dimRaw.filter(
        (data) =>
          Number(data.dimension) == dimCount && Number(data.year) == yearCount
      );
      let dimTemp2 =
        dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
      let dataTemp = {
        dimension: dimCount,
        score: dimTemp2,
        year: yearCount,
      };
      dimFinalSI.value.push(dataTemp);
    }
  }

  dimYearSI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dimTemp1 = dimFinalSI.value.filter(
      (x) => x.year <= yearHL.value && x.dimension == dimCount
    );

    let dimFinal1 = dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;
    let temp1 = {
      dimension: dimCount,
      score: dimFinal1,
      year: "2010-" + yearHL.value,
    };
    dimYearSI.value.push(temp1);
    let dimTemp2 = dimFinalSI.value.filter(
      (x) => x.year >= yearHH.value && x.dimension == dimCount
    );
    let dimFinal2 = dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
    let temp2 = {
      dimension: dimCount,
      score: dimFinal2,
      year: yearHH.value + "-" + yearMax.value,
    };
    dimYearSI.value.push(temp2);
  }

  let dataPointTemp = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dataTemp = dimYearSI.value.filter(
      (x) => x.dimension == dimCount && x.year == "2010-" + yearHL.value
    );

    dataPointTemp.push(Number(dataTemp[0].score.toFixed(2)));
  }
  {
    let dataTemp = {
      name: "2010-" + yearHL.value,
      data: dataPointTemp,
    };
    dataSpiderSI.value.push(dataTemp);
  }
  dataPointTemp = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    let dataTemp = dimYearSI.value.filter(
      (x) =>
        x.dimension == dimCount && x.year == yearHH.value + "-" + yearMax.value
    );
    dataPointTemp.push(Number(dataTemp[0].score.toFixed(2)));
  }
  {
    let dataTemp = {
      name: yearHH.value + "-" + yearMax.value,
      data: dataPointTemp,
    };
    dataSpiderSI.value.push(dataTemp);
  }
  let blankItem = [];
  dataSpiderSI.value[0].data.forEach((x, index) => {
    if (isNaN(x)) {
      blankItem.push(index);
    }
  });
  if (blankItem.length > 0) {
    dimNoDataSI.value = "Not available for ";
    if (blankItem.length == 1) {
      dimNoDataSI.value += dimensionName.value[blankItem[0]];
    } else if (blankItem.length == 2) {
      dimNoDataSI.value +=
        dimensionName.value[blankItem[0]] +
        " and " +
        dimensionName.value[blankItem[1]];
    } else if (blankItem.length == 3) {
      dimNoDataSI.value +=
        dimensionName.value[blankItem[0]] +
        ", " +
        dimensionName.value[blankItem[1]] +
        " and " +
        dimensionName.value[blankItem[2]];
    }
  }
  dimSentenceGenSI();
  spiderChartSI();
};
const dimSentenceGenSI = async () => {
  let partnerInput = [];
  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];
  //First Sentence
  let dimLastYear = dimYearSI.value.filter(
    (x) => x.year == yearHH.value + "-" + yearMax.value && x.score >= 0
  );
  let maxScore = Math.max(...dimLastYear.map((x) => x.score));
  let dimLastMax = dimLastYear.filter((x) => x.score == maxScore);
  let data7 = {
    inputData: {
      year: {
        min: yearMax.value,
        max: yearMax.value,
      },
      type: "Sustainable",
    },
    dimension: dimLastMax[0].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };
  let url7 = serverData.value + "ri/econ_spider_indicator.php";
  let res7 = await axios.post(url7, JSON.stringify(data7));

  let dimRaw7 = res7.data;
  let dimRaw7Ind = [...new Set(dimRaw7.map((x) => Number(x.indicator)))];
  let dimRaw7IndFinal = [];
  dimRaw7Ind.forEach((x) => {
    let dimRaw7Temp = dimRaw7.filter((y) => Number(y.indicator) == x);
    if (dimRaw7Temp.length > 0) {
      let dimRaw7Score;
      dimRaw7Score =
        dimRaw7Temp.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw7Temp.length;
      let temp = {
        dimension: dimLastMax[0].dimension,
        indicator: x,
        score: dimRaw7Score,
      };
      dimRaw7IndFinal.push(temp);
    }
  });

  dimRaw7IndFinal.sort((a, b) => b.score - a.score);
  if (dimRaw7IndFinal.length == 1) {
    let ind1 =
      indicatorDataSI.value[dimRaw7IndFinal[0].dimension - 1].indicator[
        dimRaw7IndFinal[0].indicator - 1
      ];
    dimSentence1SI.value = `<ul><li>${
      countryReportName.value
    }'s SI score with Asia-Pacific is highest in ${
      dimensionName.value[dimLastMax[0].dimension - 1]
    }. through integration in <i>${ind1}</i>.</li></ul>`;
  } else {
    let ind1 =
      indicatorDataSI.value[dimRaw7IndFinal[0].dimension - 1].indicator[
        dimRaw7IndFinal[0].indicator - 1
      ];
    let ind2 =
      indicatorDataSI.value[dimRaw7IndFinal[1].dimension - 1].indicator[
        dimRaw7IndFinal[1].indicator - 1
      ];
    dimSentence1SI.value = `<ul><li>${
      countryReportName.value
    }'s SI score with Asia-Pacific is highest in ${
      dimensionName.value[dimLastMax[0].dimension - 1]
    }. through integration in <i>${ind1}</i> and <i>${ind2}</i> indicators.</li></ul>`;
  }

  //Second Sentence

  dimYearSI.value = dimYearSI.value.filter((x) => x.score >= 0);
  let dimYearSIStart = dimYearSI.value.filter(
    (x) => x.year == "2010-" + yearHL.value
  );
  let dimYearSIEnd = dimYearSI.value.filter(
    (x) => x.year == yearHH.value + "-" + yearMax.value
  );
  dimYearSIStart.sort((a, b) => a.dimension - b.dimension);
  dimYearSIEnd.sort((a, b) => a.dimension - b.dimension);

  dimDiffSI.value = [];
  dimYearSIStart.forEach((x, index) => {
    let diff = dimYearSIEnd[index].score - dimYearSIStart[index].score;
    let tempData = {
      dimension: dimYearSIStart[index].dimension,
      diff: diff,
    };
    dimDiffSI.value.push(tempData);
  });
  dimDiffSI.value.sort((a, b) => b.diff - a.diff);
  let data8 = {
    inputData: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    },
    dimension: dimDiffSI.value[0].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };
  let url8 = serverData.value + "ri/econ_spider_indicator.php";
  let res8 = await axios.post(url8, JSON.stringify(data8));

  let dimMaxRaw = res8.data;

  let dimRaw8Ind = [...new Set(dimMaxRaw.map((x) => Number(x.indicator)))];
  let dimRaw8IndFinal = [];
  dimRaw8Ind.forEach((x) => {
    let dimRaw8TempStart = dimMaxRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) <= 2014
    );
    let dimRaw8TempEnd = dimMaxRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) > 2014
    );

    if (dimRaw8TempStart.length > 0) {
      let dimRaw8ScoreStart =
        dimRaw8TempStart.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw8TempStart.length;
      let dimRaw8ScoreEnd =
        dimRaw8TempEnd.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw8TempEnd.length;

      let temp = {
        indicator: x,
        diff: dimRaw8ScoreEnd - dimRaw8ScoreStart,
      };
      dimRaw8IndFinal.push(temp);
    }
  });

  dimRaw8IndFinal.sort((a, b) => b.diff - a.diff);

  let IndMax =
    "<i>" +
    indicatorDataSI.value[dimDiffSI.value[0].dimension - 1].indicator[
      dimRaw8IndFinal[0].indicator - 1
    ] +
    "</i> (" +
    Math.abs(dimRaw8IndFinal[0].diff).toFixed(2) +
    ") and <i>" +
    indicatorDataSI.value[dimDiffSI.value[0].dimension - 1].indicator[
      dimRaw8IndFinal[1].indicator - 1
    ] +
    "</i> (" +
    Math.abs(dimRaw8IndFinal[1].diff).toFixed(2) +
    ") indicators.";

  if (countryReportName.value != "Asia-Pacific (ESCAP)") {
    dimSentence2SI.value = `<ul><li>Since 2010-${yearHL.value
      .toString()
      .substr(2)}, ${
      countryReportName.value
    }'s score with Asia-Pacific progressed the most in ${
      dimensionName.value[dimDiffSI.value[0].dimension - 1]
    } (${dimDiffSI.value[0].diff.toFixed(
      2
    )}), driven by improvements in the ${IndMax}</li></ul>`;
  } else {
    dimSentence2SI.value = `<ul><li>Since 2010-${yearHL.value
      .toString()
      .substr(2)}, ${countryReportName.value}'s score progressed the most in ${
      dimensionName.value[dimDiffSI.value[0].dimension - 1]
    } (${dimDiffSI.value[0].diff.toFixed(
      2
    )}), driven by improvements in the ${IndMax}</li></ul>`;
  }

  // Third sentence
  let data9 = {
    inputData: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    },
    dimension: dimDiffSI.value[dimDiffSI.value.length - 1].dimension,
    selected: partnerInput,
    reporter: countryReportFullList.value,
  };

  let url9 = serverData.value + "ri/econ_spider_indicator.php";
  let res9 = await axios.post(url9, JSON.stringify(data9));
  let dimMinRaw = res9.data;

  let dimRaw9Ind = [...new Set(dimMinRaw.map((x) => Number(x.indicator)))];
  let dimRaw9IndFinal = [];
  dimRaw9Ind.forEach((x) => {
    let dimRaw9TempStart = dimMinRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) <= 2014
    );
    let dimRaw9TempEnd = dimMinRaw.filter(
      (y) => Number(y.indicator) == x && Number(y.year) > 2014
    );

    if (dimRaw9TempStart.length > 0) {
      let dimRaw9ScoreStart =
        dimRaw9TempStart.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw9TempStart.length;
      let dimRaw9ScoreEnd =
        dimRaw9TempEnd.reduce((a, b) => a + Number(b.score), 0) /
        dimRaw9TempEnd.length;

      let temp = {
        indicator: x,
        diff: dimRaw9ScoreEnd - dimRaw9ScoreStart,
      };
      dimRaw9IndFinal.push(temp);
    }
  });
  dimRaw9IndFinal.sort((a, b) => a.diff - b.diff);
  dimSentence3SI.value = `<ul><li>SI in ${
    dimensionName.value[
      dimDiffSI.value[dimDiffSI.value.length - 1].dimension - 1
    ]
  } dimension progressed the least. The indicator <i>${
    indicatorDataSI.value[
      dimDiffSI.value[dimDiffSI.value.length - 1].dimension - 1
    ].indicator[dimRaw9IndFinal[0].indicator - 1]
  }</i> indicator experienced a ${
    dimRaw9IndFinal[0].diff > 0 ? "increase " : "decline"
  } (${dimRaw9IndFinal[0].diff.toFixed(2)}).</li></ul>`;
};

const spiderChartSI = () => {
  Highcharts.chart("spiderChartSI", {
    chart: {
      polar: true,
      backgroundColor: "#FFFFFF",

      marginTop: "0",
    },
    title: {
      text: null,
    },
    pane: {
      size: "80%",
    },
    xAxis: {
      categories: dimensionName.value,
      tickmarkPlacement: "on",
      lineWidth: 0,
      gridLineColor: "#C4C4C4",
    },

    yAxis: {
      gridLineInterpolation: "polygon",
      lineWidth: 0,
      min: 0,
      max: 1,
      gridLineColor: "#C4C4C4",
      endOnTick: true,
      showLastLabel: true,
      tickPositions: [0, 0.25, 0.5, 0.75, 1.0],
    },

    tooltip: {
      shared: true,
      valueDecimals: 2,
    },

    series: dataSpiderSI.value,

    exporting: {
      enabled: false,
    },
    credits: { enabled: false },
  });
  byCountrySI();
};

const byCountrySI = async () => {
  let partnerInput = [];

  //Asia-Pacific
  let countryPartyTemp = [];
  let iso = ["escap"];
  let countryReportListAP = [];
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  partnerInput = [...new Set(countryPartyTemp)];
  partnerInput.forEach((item) => {
    let temp = {
      label: item,
    };
    countryReportListAP.push(temp);
  });

  let dataSend = {
    countryReportList: "xxx",
    countryPartnerList: countryReportListAP,
    reportMap: countryReportFullList.value,
    partnerMap: partnerInput,

    input: {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    },
  };

  let url7 = serverData.value + "ri/econ_intra_eco_integration_by_country.php";
  let res7 = await axios.post(url7, JSON.stringify(dataSend));

  let dimRaw7 = res7.data;
  let cENEA = countryGroupListRiva2("ene_asia");
  let cSEA = countryGroupListRiva2("se_asia");
  let cSSWA = countryGroupListRiva2("ssw_asia");
  let cPAC = countryGroupListRiva2("pac");
  let cNCA = countryGroupListRiva2("nc_asia");

  dimRaw7.forEach((item) => {
    let country = item.name;
    let countryFullData = countryAllWorld.filter((x) => x.iso == country);
    let countryFullName = countryFullData[0].country;
    let subRegion = "";
    if (cENEA.includes(country)) {
      subRegion = "ENEA";
    } else if (cSEA.includes(country)) {
      subRegion = "SEA";
    } else if (cSSWA.includes(country)) {
      subRegion = "SSWA";
    } else if (cPAC.includes(country)) {
      subRegion = "PAC";
    } else if (cNCA.includes(country)) {
      subRegion = "NCA";
    }
    let yeardiff1 = yearHL.value - 2010 + 1;
    let data2010_14 = 0;
    for (let i = 1; i <= yeardiff1; i++) {
      data2010_14 += item.data[i - 1];
    }
    data2010_14 = data2010_14 / yeardiff1;

    let yeardiff2 = yearMax.value - yearHH.value + 1;
    let data2015_19 = 0;
    for (
      let i = yearMax.value - 2010 + 1;
      i >= yearMax.value - yearHH.value + 1;
      i--
    ) {
      data2015_19 += item.data[i - 1];
    }
    data2015_19 = data2015_19 / yeardiff2;

    let temp = {
      code: country,
      country: countryFullName,
      subRegion: subRegion,
      data2010_14: data2010_14,
      data2015_19: data2015_19,
      diff: data2015_19 - data2010_14,
    };
    byCountryDataSI.value.push(temp);
  });

  byCountryChartSI.value.categories = [
    "Asia-Pacific",
    "East and North-East Asia  (ENEA)",
    "South-East Asia (SEA)",
    "South and South-West Asia (SSWA)",
    "Pacific (PAC)",
    "North and Central Asia (NCA)",
  ];
  byCountryChartSI.value.data = [];

  //AP
  byCountryDataSI.value = byCountryDataSI.value.filter(
    (x) => x.data2015_19 != 0
  );
  {
    let ap1 =
      byCountryDataSI.value.reduce((a, b) => a + b.data2010_14, 0) /
      byCountryDataSI.value.length;
    let ap2 =
      byCountryDataSI.value.reduce((a, b) => a + b.data2015_19, 0) /
      byCountryDataSI.value.length;

    let temp = {
      region: "AP",
      data2010_14: ap1,
      data2015_19: ap2,
      diff: ap2 - ap1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataSI.value.filter((x) => x.subRegion == "ENEA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "ENEA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataSI.value.filter((x) => x.subRegion == "SEA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "SEA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataSI.value.filter((x) => x.subRegion == "SSWA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "SSWA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataSI.value.filter((x) => x.subRegion == "PAC");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "PAC",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let ENEAData = byCountryDataSI.value.filter((x) => x.subRegion == "NCA");
    let ENEA1 =
      ENEAData.reduce((a, b) => a + b.data2010_14, 0) / ENEAData.length;
    let ENEA2 =
      ENEAData.reduce((a, b) => a + b.data2015_19, 0) / ENEAData.length;
    let temp = {
      region: "NCA",
      data2010_14: ENEA1,
      data2015_19: ENEA2,
      diff: ENEA2 - ENEA1,
    };
    byRegionSI.value.push(temp);
  }
  {
    let temp = {
      name: "2010-" + yearHL.value.toString().substr(2),
      data: [
        byRegionSI.value[0].data2010_14,
        byRegionSI.value[1].data2010_14,
        byRegionSI.value[2].data2010_14,
        byRegionSI.value[3].data2010_14,
        byRegionSI.value[4].data2010_14,
        byRegionSI.value[5].data2010_14,
      ],
    };
    byCountryChartSI.value.data.push(temp);
  }
  {
    let temp = {
      name: yearHH.value + "-" + yearMax.value.toString().substr(2),
      data: [
        byRegionSI.value[0].data2015_19,
        byRegionSI.value[1].data2015_19,
        byRegionSI.value[2].data2015_19,
        byRegionSI.value[3].data2015_19,
        byRegionSI.value[4].data2015_19,
        byRegionSI.value[5].data2015_19,
      ],
    };
    byCountryChartSI.value.data.push(temp);
  }

  barChartSI();
};

const barChartSI = () => {
  Highcharts.chart("barChartSI", {
    chart: {
      type: "column",
    },
    title: {
      text: null,
    },

    xAxis: {
      categories: byCountryChartSI.value.categories,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Asia-Pacific")
            return `<span style="color: #F99704; font-weight:bold;">Asia-Pacific</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      visible: false,
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },

    exporting: {
      enabled: false,
    },
    credits: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "10px",
          },
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    series: byCountryChartSI.value.data,
  });
  subSentenceSI();
};

const subSentenceSI = async () => {
  // sentence 1
  {
    let subText01 = "";
    if (byRegionSI.value[0].diff > 0) {
      subText01 = "increased";
    } else {
      subText02 = "decreased";
    }
    let subText02 = "";
    let subText03 = "";
    let subDataSort = byRegionSI.value.sort((a, b) => b.diff - a.diff);
    if (subDataSort[0].region == "AP") {
      subText02 = subDataSort[1].region;
      subText03 = subDataSort[1].diff.toFixed(2);
    } else {
      subText02 = subDataSort[0].region;
      subText03 = subDataSort[0].diff.toFixed(2);
    }

    subSentence1SI.value = `<ul><li>Since 2010-${yearHL.value
      .toString()
      .substr(2)}, ${
      countryReportName.value
    }'s SI score with Asia-Pacific ${subText01} (${byRegionSI.value[0].diff.toFixed(
      2
    )}), progressing the most with then ${subText02} sub-region (${subText03}).</li></ul>`;
  }

  // sentence 2
  {
    byCountryDataSI.value.sort((a, b) => b.diff - a.diff);
    let partnerInput = byCountryDataSI.value[0].code;

    let input = {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    };
    let data6 = {
      inputData: input,
      countryPartnerList: "xxx",
      countryReportList: "xxx",
      partnerMap: partnerInput,
      reportMap: countryReportFullList.value,
    };
    let url6 = serverData.value + "ri/econ_intra_index_by_dimension.php";
    let res6 = await axios.post(url6, JSON.stringify(data6));
    let dimRaw = res6.data;

    let dimFinalSIShow = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
        let dimTemp = dimRaw.filter(
          (data) =>
            Number(data.dimension) == dimCount && Number(data.year) == yearCount
        );
        let dimTemp2 =
          dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
        let dataTemp = {
          dimension: dimCount,
          score: dimTemp2,
          year: yearCount,
        };
        dimFinalSIShow.push(dataTemp);
      }
    }

    let dimYearSI = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      let dimTemp1 = dimFinalSIShow.filter(
        (x) => x.year <= yearHL.value && x.dimension == dimCount
      );

      let dimFinal1 =
        dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;

      let dimTemp2 = dimFinalSIShow.filter(
        (x) => x.year >= yearHH.value && x.dimension == dimCount
      );
      let dimFinal2 =
        dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
      let temp2 = {
        dimension: dimCount,
        score1: dimFinal1,
        score2: dimFinal2,
        diff: dimFinal2 - dimFinal1,
      };
      dimYearSI.push(temp2);
    }
    dimYearSI = dimYearSI.filter((x) => x.score1 >= 0);
    dimYearSI.sort((a, b) => b.diff - a.diff);

    let subText01 = byCountryDataSI.value[0].country;
    let subText02 = byCountryDataSI.value[0].diff.toFixed(2);
    let subText03 = byCountryDataSI.value[1].country;
    let subText04 = byCountryDataSI.value[1].diff.toFixed(2);
    let subText05 = byCountryDataSI.value[2].country;
    let subText06 = byCountryDataSI.value[2].diff.toFixed(2);
    let subText07 = dimensionName.value[dimYearSI[0].dimension - 1];
    subSentence2SI.value = `<ul><li>By country, ${countryReportName.value}'s SI score increased the most with ${subText01} (${subText02}), driven by higher integration in ${subText07} dimension, followed by ${subText03} (${subText04}) and ${subText05} (${subText06})</li></ul>`;
  }

  //sentence 3
  {
    byCountryDataSI.value.sort((a, b) => b.data2015_19 - a.data2015_19);
    let partnerInput = byCountryDataSI.value[0].code;

    let input = {
      year: {
        min: 2010,
        max: yearMax.value,
      },
      type: "Sustainable",
    };
    let data6 = {
      inputData: input,
      countryPartnerList: "xxx",
      countryReportList: "xxx",
      partnerMap: partnerInput,
      reportMap: countryReportFullList.value,
    };
    let url6 = serverData.value + "ri/econ_intra_index_by_dimension.php";
    let res6 = await axios.post(url6, JSON.stringify(data6));

    let dimRaw = res6.data;
    let dimFinalSIShow = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      for (let yearCount = 2010; yearCount <= yearMax.value; yearCount++) {
        let dimTemp = dimRaw.filter(
          (data) =>
            Number(data.dimension) == dimCount && Number(data.year) == yearCount
        );
        let dimTemp2 =
          dimTemp.reduce((a, b) => a + Number(b.score), 0) / dimTemp.length;
        let dataTemp = {
          dimension: dimCount,
          score: dimTemp2,
          year: yearCount,
        };
        dimFinalSIShow.push(dataTemp);
      }
    }

    let dimYearSI = [];
    for (let dimCount = 1; dimCount <= 7; dimCount++) {
      let dimTemp1 = dimFinalSIShow.filter(
        (x) => x.year <= yearHL.value && x.dimension == dimCount
      );

      let dimFinal1 =
        dimTemp1.reduce((a, b) => a + b.score, 0) / dimTemp1.length;

      let dimTemp2 = dimFinalSIShow.filter(
        (x) => x.year >= yearHH.value && x.dimension == dimCount
      );
      let dimFinal2 =
        dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
      let temp2 = {
        dimension: dimCount,
        score1: dimFinal1,
        score2: dimFinal2,
        diff: dimFinal2 - dimFinal1,
      };
      dimYearSI.push(temp2);
    }
    dimYearSI = dimYearSI.filter((x) => x.score1 >= 0);
    dimYearSI.sort((a, b) => b.score2 - a.score2);
    let subText01 = byCountryDataSI.value[0].country;
    let subText02 = byCountryDataSI.value[0].data2015_19.toFixed(2);
    let subText03 = dimensionName.value[dimYearSI[0].dimension - 1];
    let subText04 = dimYearSI[0].score2.toFixed(2);
    let subText05 = dimensionName.value[dimYearSI[1].dimension - 1];
    let subText06 = dimYearSI[1].score2.toFixed(2);
    subSentence3SI.value = `<ul><li>In Asia-Pacific, ${countryReportName.value} is most integrated with ${subText01} (${subText02}). Specifically, SI with ${subText01} is strongest in  ${subText03} (${subText04}) and ${subText05} (${subText06}).</li></ul>`;
  }
};
</script>

<style lang="scss" scoped>
.blueTitle {
  width: 90%;
  margin: auto;
  color: white;
  padding-top: 6px;
  height: 40px;
  background-color: #04274c;
}
.break {
  break-after: page;
}
.bgblue {
  height: 70px;
  background-color: #04284d;
  color: white;
}
.typeData {
  position: relative;
  top: -20px;
  background-color: #ededed;
  color: black;
  width: 80%;
  height: 40px;
  line-height: 40px;
  border-radius: 10px;
  margin: auto;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}
.contentPage {
  background-color: white;
  color: black;
  margin-top: -10px;
  padding-bottom: 0px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}
.font-note {
  font-size: 12px;
  font-weight: 400;
}
.font-content {
  font-size: 14px;
  font-weight: 400;
}
.bigBold {
  font-weight: bolder;
}
.textLowerMain {
  padding-top: 12px;
  padding-bottom: 20px;
}
// .printPage {
//   // padding-top: 10px;
// }
@media print {
  body {
    background-color: #fff;
  }

  .set-p-right {
    padding-right: 20px;
  }

  #printSection {
    display: none;
  }

  @page {
    margin: 0mm;
  }
}

.boxGrey {
  background-color: #d9d9d9;
  height: 40px;
  line-height: 40px;
}
</style>
