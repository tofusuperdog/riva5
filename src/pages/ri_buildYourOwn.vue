<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div><RIHeader :menu="3" /></div>
      <div>
        <div>
          <input-section
            @start-btn="startBtn"
            @reset-start-btn="resetStartBtn"
            @change-integration-type="changeIntegrationType"
          />
        </div>
      </div>
      <div v-if="showResultAfterStartBtn" class="">
        <div>
          <hr />
          <div>
            <four-bar :dataSend="dataFourBar"></four-bar>
          </div>
          <hr />
          <select-desired
            :input="input.disaggregation"
            @change-disaggregation="changeDisaggraegation"
          ></select-desired>
        </div>
        <!-- by dimension  -->
        <div v-show="input.disaggregation == 'dimension'">
          <line-chart-dimension :dataSend="dataSend2"></line-chart-dimension>
          <dimension-tab :dataSend="dataSend2"></dimension-tab>
          <div class="q-pb-lg" style="background: #ededed" align="center">
            <div class="btnOutGreen" @click="changeDisaggregationToEco()">
              Explore integration by economy
            </div>
          </div>
        </div>
        <!-- by Country -->
        <div v-show="input.disaggregation == 'country'">
          <main-linechart :dataSend="dataSend2"></main-linechart>
          <spider-web :dataSend="dataSend2"></spider-web>
          <div class="q-py-lg" style="background: #ededed" align="center">
            <div class="btnOutGreen" @click="changeDisaggregationToDimension()">
              Explore integration by dimension
            </div>
          </div>
        </div>
      </div>
    </div>

    <footerMain />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
import inputSection from "../components/ri_buildyourown/input_section.vue";
import fourBar from "../components/ri_buildyourown/ri_fourbar.vue";
import selectDesired from "../components/ri_select_desired_level.vue";
import lineChartDimension from "../components/ri_buildyourown/linechart_by_dimension.vue";
import dimensionTab from "../components/ri_buildyourown/datatab_dimension.vue";
import mainLinechart from "../components/ri_buildyourown/main_linechart.vue";
import spiderWeb from "../components/ri_buildyourown/spiderweb.vue";
import { LocalStorage } from "quasar";
import { useRoute } from "vue-router";
import { serverSetup } from "./server";
import axios from "axios";
const { serverData } = serverSetup();

const route = useRoute();

const dataFourBar = ref({
  data: [],
  name: "",
  partner: "",
  type: "",
  year: "",
});

const dataSend2 = ref({
  data: [],
  input: {},
  report: [],
});

const countryFullList = ref([]);
const countryReportList = ref([]);

const input = ref({
  partner: [],
  reporting: [],
  year: {
    min: 2012,
    max: 2020,
  },
  type: "Sustainable",
  disaggregation: "country",
  dimensionPicked: [],
});

const showResultAfterStartBtn = ref(false);

const dataAvailCircleChart = ref({
  showChart: false,
  score: 0,
});

const fourBarName = ref("Your group");
const fourBarData = ref([]);
const fourBarNamePatner = ref("with your group of partners");

const changeDisaggraegation = (type) => {
  input.value.disaggregation = type;
};

const startBtn = (inputSend) => {
  showResultAfterStartBtn.value = true;
  countryFullList.value = inputSend.countryFullList;
  countryReportList.value = inputSend.reportingList;
  input.value = inputSend.input;
  calFourBarChart();
};

const changeDisaggregationToDimension = () => {
  input.value.disaggregation = "dimension";
  window.scrollTo(0, 1400);
};

const changeDisaggregationToEco = () => {
  input.value.disaggregation = "country";
  window.scrollTo(0, 1400);
};

const resetStartBtn = () => {
  showResultAfterStartBtn.value = false;
};

const changeIntegrationType = (integrationType) => {
  input.value.type = integrationType;
};

const calFourBarChart = async () => {
  fourBarData.value = [];
  let labelName = "Your Group";

  if (input.value.reporting.length == 1) {
    labelName = input.value.reporting[0].label;
  }

  fourBarName.value = labelName;
  let labelPartner = "with your group of partners";
  if (input.value.partner.length == 1) {
    labelPartner = "with " + input.value.partner[0].label;
  }
  fourBarNamePatner.value = labelPartner;
  let dimUse = convertDimensionToArray(input.value.dimensionPicked);
  let data = {
    name: labelName,
    reporting: countryReportList.value.map((x) => x.iso),
    partner: countryFullList.value.map((x) => x.iso),
    year: input.value.year.max,
    type: input.value.type,
    dimension: dimUse,
  };

  let url = serverData.value + "ri/build_fivebar_onlyyourgroup_build.php";
  let res = await axios.post(url, JSON.stringify(data));

  let rawData = res.data;
  let score = 0;
  let countPair = 0;
  let pairScore = [];
  let dimPass = data.dimension.length / 2;

  data.reporting.forEach((reporting) => {
    data.partner.forEach((partner) => {
      let sum = 0;
      let dataTemp = rawData.filter(
        (x) => x.reporter == reporting && x.partner == partner
      );
      if (dataTemp.length >= dimPass) {
        dataTemp.forEach((eachDim) => (sum += Number(eachDim.score)));
        sum /= dataTemp.length;
        countPair++;
        let obTemp = {
          reporter: reporting,
          partner: partner,
          score: Number(sum.toFixed(2)),
        };
        pairScore.push(obTemp);
      } else {
        sum = 0;
      }
      score += sum;
    });
  });
  pairScore.sort((a, b) => b.score - a.score);
  score /= countPair;

  fourBarData.value.push({
    name: labelName,
    value: Number(score.toFixed(2)),
    own: true,
  });
  dataFourBar.value = {
    name: fourBarData.value[0].name,
    type: input.value.type,
    year: input.value.year.max,
    data: fourBarData.value,
    partner: fourBarNamePatner.value,
  };
  dataSend2.value = {
    input: input.value,
    data: countryFullList.value,
    report: countryReportList.value,
  };
};

const convertDimensionToArray = (dim) => {
  let dimGet = dim.map((x) => x.picked);
  let dimReturn = [];
  dimGet.forEach((item, index) => {
    if (item) {
      dimReturn.push(index + 1);
    }
  });
  return dimReturn;
};
</script>

<style lang="scss" scoped>
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  background-color: #fff;
}
.btnOutGreen {
  cursor: pointer;
  width: 340px;
  height: 35px;
  line-height: 30px;
  border: 3px solid #2d9687;
  border-radius: 5px;
  font-size: 14px;
}
</style>
