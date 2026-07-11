<template>
  <div style="background-color: #7a7a7a; color: rgb(117, 117, 117)">
    <div class="mainApp">
      <ri-header :menu="0"></ri-header>
      <input-rep @country="countryInput" />

      <div class="row">
        <div class="col-6 q-pa-md">
          <line-chart
            v-if="isDataReady"
            :data="input"
            :ecoName="ecoName"
            :si="lineSI"
            :ci="lineCI"
          />
        </div>
        <div class="col-6 q-pa-md">
          <dim-chart
            :data="input"
            :ecoName="ecoName"
            :data1="dimYearSI1"
            :data2="dimYearSI2"
            :data3="dimYearCI1"
            :data4="dimYearCI2"
          />
        </div>
      </div>
      <div class="text-h6" align="center">
        <div v-if="ecoName == 'Asia-Pacific'">
          Which Asia-Pacific economies were most integrated with the rest of the
          region in {{ yearEnd }}? - Stylized honeycomb map of the Asia-Pacific
          region
        </div>
        <div v-if="ecoName != 'Asia-Pacific'">
          Which Asia-Pacific economies were most integrated with
          {{ ecoName }} in {{ yearEnd }}? – Sylized honeycomb map of the
          Asia-Pacific region
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <div class="text-h6 text-center q-pt-md">Sustainable integration</div>
          <div class="text-center">
            Hover to reveal the country's name and integration score
          </div>

          <tileMap :tilemapData="tilemapData" :dataScore="tileSI" />
        </div>
        <div class="col-6">
          <div class="text-h6 text-center q-pt-md">
            Conventional integration
          </div>
          <div class="text-center">
            Hover to reveal the country's name and integration score
          </div>
          <tileMap :tilemapData="tilemapData" :dataScore="tileCI" />
        </div>
      </div>

      <div class="text-h6 text-center q-pt-md">
        Learn more about integration in Asia and the Pacific:
      </div>

      <div class="q-pt-md">
        <div class="row justify-center">
          <div style="width: 250px">
            <q-btn
              label="Country brief"
              class="btn"
              outline
              color="secondary"
              @click="goTOCountryBrief()"
            />
          </div>
          <div style="width: 250px">
            Eveything you need to know in<br />
            a handy 2-page format
          </div>
        </div>
        <div class="q-py-md text-center">
          Explore integration from different prespectives with our interactive
          web tool:
        </div>
        <div class="row justify-center q-pb-md">
          <div>
            <div
              class="row bigBtn cursor-pointer justify-center"
              @click="goToInra()"
            >
              <div style="width: 100px" class="q-pt-sm">
                <img src="images/intra-g.svg" alt="" />
              </div>
              <div
                class="text-secondary q-pt-md q-pl-md"
                style="font-size: 16px"
              >
                Intra-group<br />integration
              </div>
            </div>
            <div class="text-center">
              Symmetric integration between<br />
              a group of economies
            </div>
          </div>
          <div style="width: 20px"></div>
          <div>
            <div
              class="row bigBtn cursor-pointer justify-center"
              @click="goToEco()"
            >
              <div style="width: 100px; padding-top: 13px">
                <img src="images/eco-g.svg" alt="" />
              </div>
              <div
                class="text-secondary q-pt-md q-pl-md"
                style="font-size: 16px"
              >
                Economy-partner<br />integration
              </div>
            </div>
            <div class="text-center">
              Asymmetric integration between<br />
              different economies
            </div>
          </div>
          <div style="width: 20px"></div>
          <div>
            <div
              class="row bigBtn cursor-pointer justify-center"
              @click="goToBuild()"
            >
              <div style="width: 100px; padding-top: 13px">
                <img src="images/build-g.svg" alt="" />
              </div>
              <div
                class="text-secondary q-pl-md"
                style="font-size: 16px; padding-top: 27px"
              >
                Build your own
              </div>
            </div>
            <div class="text-center">
              Customize your integration index —<br />
              choose specific dimensions
            </div>
          </div>
        </div>
      </div>

      <footerMain />
    </div>
  </div>
</template>

<script setup>
import riHeader from "../components/RI_header.vue";
import inputRep from "../components/ri_overview/select_reporter.vue";
import lineChart from "../components/ri_overview/line_chart.vue";
import dimChart from "../components/ri_overview/dim_chart.vue";
import footerMain from "../components/footer2.vue";

import { ref, onMounted, onBeforeMount, computed } from "vue";
// import { serverSetup, yearInputShow, tileData } from "./server";
import { serverSetup, tileData } from "./server";
import { countryGroupListRiva2 } from "./countryGroupList.js";
import tileMap from "../components/ri_overview/TileMap.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
const { serverData } = serverSetup();

const isDataReady = computed(
  () => lineSI.value.length > 0 && lineCI.value.length > 0
);
// const { yearInput } = yearInputShow();
const { tilemapData } = tileData();
const yearInput = ref({ min: 2010, max: 2020 });
const router = useRouter();
const yearStart = ref(0);
const yearEnd = ref(0);
const yearHL = ref(0);
const yearHH = ref(0);

const input = ref([]);
const ecoName = ref("");

const dimFinalSI = ref([]);
const dimYearSI = ref([]);
const dimYearSI1 = ref([]);
const dimYearSI2 = ref([]);

const dimFinalCI = ref([]);
const dimYearCI = ref([]);
const dimYearCI1 = ref([]);
const dimYearCI2 = ref([]);

const lineSI = ref([]);
const lineCI = ref([]);

const tileSI = ref([]);
const tileCI = ref([]);

const partner = ref([
  "AFG",
  "ARM",
  "ASM",
  "AZE",
  "COK",
  "FJI",
  "FSM",
  "GEO",
  "GUM",
  "IRN",
  "KAZ",
  "KGZ",
  "KIR",
  "MDV",
  "MHL",
  "MNP",
  "NCL",
  "NIU",
  "NRU",
  "PAK",
  "PLW",
  "PYF",
  "SLB",
  "TJK",
  "TKM",
  "TLS",
  "TON",
  "TUR",
  "TUV",
  "UZB",
  "VUT",
  "WSM",
  "PNG",
  "RUS",
  "KHM",
  "IDN",
  "PHL",
  "LAO",
  "BTN",
  "NPL",
  "BGD",
  "IND",
  "LKA",
  "MMR",
  "THA",
  "AUS",
  "NZL",
  "BRN",
  "MYS",
  "SGP",
  "VNM",
  "MAC",
  "PRK",
  "HKG",
  "MNG",
  "CHN",
  "KOR",
  "JPN",
]);

const countryInput = (inputData) => {
  input.value = inputData.countryOutput;
  ecoName.value = inputData.ecoName;

  loadDimCal();
  loadDimLeft();
  loadLineChart();
  loadTileCal();
};

//start Dim chart

const loadDimCal = async () => {
  $q.loading.show();
  let input2 = {
    year: {
      min: yearInput.value.min,
      max: yearInput.value.max,
    },
    type: "Sustainable",
  };

  let data6 = {
    input: input2,
    partnerMap: partner.value,
    reportMap: input.value,
  };

  let url6 = serverData.value + "ri/overview_intra_index_by_dimension.php";
  let res6 = await axios.post(url6, JSON.stringify(data6));
  let dimRaw = res6.data;

  dimFinalSI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    for (
      let yearCount = yearStart.value;
      yearCount <= yearEnd.value;
      yearCount++
    ) {
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
      year: yearStart.value + "-" + yearHL.value,
    };
    dimYearSI.value.push(temp1);

    let dimTemp2 = dimFinalSI.value.filter(
      (x) => x.year >= yearHH.value && x.dimension == dimCount
    );
    let dimFinal2 = dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
    let temp2 = {
      dimension: dimCount,
      score: dimFinal2,
      year: yearHH.value + "-" + yearEnd.value,
    };

    dimYearSI.value.push(temp2);
  }

  {
    let temp1 = dimYearSI.value.filter(
      (x) => x.year == yearStart.value + "-" + yearHL.value
    );
    temp1.sort((a, b) => a.dimension - b.dimension);
    dimYearSI1.value = temp1.map((x) => Number(x.score.toFixed(2)));
  }
  {
    let temp1 = dimYearSI.value.filter(
      (x) => x.year == yearHH.value + "-" + yearEnd.value
    );

    temp1.sort((a, b) => a.dimension - b.dimension);
    dimYearSI2.value = temp1.map((x) => Number(x.score.toFixed(2)));
  }
};

const loadDimLeft = async () => {
  let input2 = {
    year: {
      min: yearStart.value,
      max: yearEnd.value,
    },
    type: "Conventional",
  };
  let data6 = {
    input: input2,
    partnerMap: partner.value,
    reportMap: input.value,
  };
  let url6 = serverData.value + "ri/overview_intra_index_by_dimension.php";
  let res6 = await axios.post(url6, JSON.stringify(data6));
  let dimRaw = res6.data;

  dimFinalCI.value = [];
  for (let dimCount = 1; dimCount <= 7; dimCount++) {
    for (
      let yearCount = yearStart.value;
      yearCount <= yearEnd.value;
      yearCount++
    ) {
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
      year: yearStart.value + "-" + yearHL.value,
    };
    dimYearCI.value.push(temp1);

    let dimTemp2 = dimFinalCI.value.filter(
      (x) => x.year >= yearHH.value && x.dimension == dimCount
    );

    let dimFinal2 = dimTemp2.reduce((a, b) => a + b.score, 0) / dimTemp2.length;
    let temp2 = {
      dimension: dimCount,
      score: dimFinal2,
      year: yearHH.value + "-" + yearEnd.value,
    };

    dimYearCI.value.push(temp2);
  }
  {
    let temp1 = dimYearCI.value.filter(
      (x) => x.year == yearStart.value + "-" + yearHL.value
    );
    temp1.sort((a, b) => a.dimension - b.dimension);
    dimYearCI1.value = temp1.map((x) => Number(x.score.toFixed(2)));
  }
  {
    let temp1 = dimYearCI.value.filter(
      (x) => x.year == yearHH.value + "-" + yearEnd.value
    );

    temp1.sort((a, b) => a.dimension - b.dimension);
    dimYearCI2.value = temp1.map((x) => Number(x.score.toFixed(2)));
  }
};
//End dim chart

//Start line chart
const loadLineChart = async () => {
  let partnerInput = [];
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
    countryPartnerList: countryReportListAP,
    reportMap: input.value,
    partnerMap: partnerInput,

    input: {
      year: {
        min: yearStart.value,
        max: yearEnd.value,
      },
      type: "Sustainable",
    },
  };
  let url7 =
    serverData.value + "ri/overview_intra_eco_integration_by_country.php";
  let res7 = await axios.post(url7, JSON.stringify(dataSend));
  let dimRaw7 = res7.data;
  dimRaw7 = dimRaw7.filter((x) => x.lastValue != 0);
  lineSI.value = [];
  let countYear = yearEnd.value - yearStart.value + 1;
  for (let i = 1; i <= countYear; i++) {
    lineSI.value.push(0);
  }

  dimRaw7.forEach((x) => {
    for (let i = 0; i < countYear; i++) {
      lineSI.value[i] += x.data[i];
    }
  });

  lineSI.value = lineSI.value.map((x) =>
    Number((x / dimRaw7.length).toFixed(2))
  );

  let dataSendCI = {
    countryPartnerList: countryReportListAP,
    reportMap: input.value,
    partnerMap: partnerInput,

    input: {
      year: {
        min: yearStart.value,
        max: yearEnd.value,
      },
      type: "Conventional",
    },
  };
  let url7C =
    serverData.value + "ri/overview_intra_eco_integration_by_country.php";
  let res7C = await axios.post(url7C, JSON.stringify(dataSendCI));
  let dimRaw7C = res7C.data;
  dimRaw7C = dimRaw7C.filter((x) => x.lastValue != 0);
  lineCI.value = [];
  let countYearCI = yearEnd.value - yearStart.value + 1;
  for (let i = 1; i <= countYearCI; i++) {
    lineCI.value.push(0);
  }

  dimRaw7C.forEach((x) => {
    for (let i = 0; i < countYearCI; i++) {
      lineCI.value[i] += x.data[i];
    }
  });

  lineCI.value = lineCI.value.map((x) =>
    Number((x / dimRaw7C.length).toFixed(2))
  );
  $q.loading.hide();
};

//End line chart

//TileMap
const loadTileCal = async () => {
  const dataInputSustainable = {
    partner: partner.value,
    reporting: input.value,
    year: yearInput.value.max,
    type: "Sustainable",
  };
  const dataInputConventional = {
    partner: partner.value,
    reporting: input.value,
    year: yearInput.value.max,
    type: "Conventional",
  };
  const url = serverData.value + "ri/overview_tilemap.php";

  try {
    const [resSustainable, resConventional] = await Promise.all([
      axios.post(url, JSON.stringify(dataInputSustainable)),
      axios.post(url, JSON.stringify(dataInputConventional)),
    ]);
    tileSI.value = resSustainable.data || [];
    tileCI.value = resConventional.data || [];
  } catch (error) {
    console.error("Error loading data:", error);
  }
};
//EndTileMap

const goToInra = () => {
  router.push("/riintragroup");
};
const goToEco = () => {
  router.push("/riecopartner");
};
const goToBuild = () => {
  router.push("/ribuildyourown");
};
const goTOCountryBrief = () => {
  router.push("/ricountrybrief");
};

onBeforeMount(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = result.data[0].yearStart;
  yearInput.value.max = result.data[0].yearEnd;
  yearStart.value = Number(yearInput.value.min);
  yearEnd.value = Number(yearInput.value.max);

  yearHL.value = Math.floor((yearStart.value + yearEnd.value) / 2);
  yearHH.value = Math.ceil((yearStart.value + yearEnd.value) / 2);
});

onMounted(() => {
  // Refresh the page on first load to ensure meta tag change
  sessionStorage.removeItem("reloaded2");
  if (!sessionStorage.getItem("reloaded")) {
    sessionStorage.setItem("reloaded", "true");
    location.reload();
  }
});
</script>

<style lang="scss" scoped>
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  background-color: #fff;
}
.bigBtn {
  width: 250px;
  height: 80px;
  border: 1px solid #2d9687;
  border-radius: 10px;
}
.btn {
  width: 240px;
  height: 40px;
}
.loading {
  text-align: center;
  font-size: 20px;
  padding: 50px;
}
</style>
