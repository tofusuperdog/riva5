<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div><RIHeader :menu="2" /></div>
      <div class="row">
        <div class="col">
          <input-section
            :dataSend="dataSendInput"
            @reset-start-btn="resetStartBtn"
            @show-dataavail-chart="showDataAvailChart"
            @start-btn="startBtn"
            @change-integration-type="changeIntegrationType"
          />
        </div>

        <!--///////// right side //////// -->
        <div class="col-4" style="background: #ededed">
          <dimensions-icon :type="input.type"></dimensions-icon>

          <circle-avail
            :score="dataAvailCircleChart.score"
            :isShowChart="dataAvailCircleChart.showChart"
          ></circle-avail>
        </div>
      </div>
      <div v-if="showResultAfterStartBtn">
        <hr />
        <div class="q-pa-md">
          <four-bar :dataSend="dataFourBar"></four-bar>
        </div>
        <hr />
        <select-desired
          :input="input.disaggregation"
          @change-disaggregation="changeDisaggraegation"
        ></select-desired>
        <br />

        <div v-show="input.disaggregation == 'country'">
          <main-linechart :dataSend="dataSend2"></main-linechart>
          <spider-web :dataSend="dataSend2" style="height: auto"></spider-web>
          <div class="q-py-lg" style="background: #ededed" align="center">
            <div class="btnOutGreen" @click="changeDisaggregationToDimension()">
              Explore integration by dimension
            </div>
          </div>
        </div>

        <div v-show="input.disaggregation == 'dimension'">
          <line-chart-dimension :dataSend="dataSend2"></line-chart-dimension>
          <dimension-tab :dataSend="dataSend2"></dimension-tab>
          <div class="q-pb-lg" style="background: #ededed" align="center">
            <div class="btnOutGreen" @click="changeDisaggregationToEco()">
              Explore integration by economy
            </div>
          </div>
        </div>
      </div>
      <footerMain />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
import inputSection from "../components/ri_eco_partner/input_section.vue";
import dimensionsIcon from "../components/ri_dimension_icon.vue";
import circleAvail from "../components/ri_eco_partner/ri_data_avail_circle.vue";
import fourBar from "../components/ri_eco_partner/ri_fourbar.vue";
import selectDesired from "../components/ri_select_desired_level.vue";
import LineChartDimension from "../components/ri_eco_partner/linechart_by_dimension.vue";
import dimensionTab from "../components/ri_eco_partner/datatab_dimension.vue";
import mainLinechart from "../components/ri_eco_partner/linechartbycountry.vue";
import spiderWeb from "../components/ri_eco_partner/spiderweb.vue";
import { LocalStorage } from "quasar";
import { useRoute } from "vue-router";
import { serverSetup } from "./server";
import axios from "axios";
const { serverData } = serverSetup();

const route = useRoute();
const input = ref({
  partner: [],
  year: {
    min: 2012,
    max: 2020,
  },
  reporting: [],
  type: "Sustainable",
  disaggregation: "country",
});
const dataSendInput = ref({
  setInput: false,
  input: {
    partner: [],
    year: {
      min: 2012,
      max: 2020,
    },
    reporting: [],
    type: "Sustainable",
    disaggregation: "country",
  },
});

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
const countryOptions = ref([]);
const countryPartnerList = ref([]);
const countryReportList = ref([]);
const countryFullList = ref([]);
const setInput = ref(false);
const showResultAfterStartBtn = ref(false);
const yourScore = ref(0.74);

const dataAvailCircleChart = ref({
  showChart: false,
  score: 60,
});

const fourBarName = ref("Your group");
const fourBarNamePatner = ref("with your group of partners");
const fourBarData = ref([]);

onMounted(() => {
  let keyLocal = LocalStorage.getItem("keyId");
  let keyId = route.params.key ? route.params.key : null;
  if (keyId == keyLocal && keyLocal != null) {
    input.value.year = LocalStorage.getItem("year");
    input.value.partner = LocalStorage.getItem("partner");
    input.value.reporting = LocalStorage.getItem("reporter");
    setInput.value = true;
    dataSendInput.value = {
      setInput: setInput.value,
      input: {
        partner: input.value.partner,
        year: {
          min: input.value.year.min,
          max: input.value.year.max,
        },
        reporting: input.value.reporting,
        type: "Sustainable",
        disaggregation: "country",
      },
    };
  }
});

const changeDisaggregationToEco = () => {
  input.value.disaggregation = "country";
  window.scrollTo(0, 1400);
};

const changeDisaggregationToDimension = () => {
  input.value.disaggregation = "dimension";
  window.scrollTo(0, 1400);
};

const changeDisaggraegation = (type) => {
  input.value.disaggregation = type;
};

const resetStartBtn = () => {
  showResultAfterStartBtn.value = false;
};

const showDataAvailChart = (data) => {
  dataAvailCircleChart.value.showChart = data.showDataAvailChart;
  if (data.input.resultBy == "Reporter") {
    countryPartnerList.value = data.partner;
    countryReportList.value = data.report;
  } else {
    countryPartnerList.value = data.report;
    countryReportList.value = data.partner;
  }
  input.value = data.input;
  calScoreInDataAvail();
};

const startBtn = (inputSend) => {
  showResultAfterStartBtn.value = true;
  countryFullList.value = inputSend.countryFullList;
  input.value = inputSend.input;
  calFourBarChart();
};

const changeIntegrationType = (integrationType) => {
  input.value.type = integrationType;
};

const calScoreInDataAvail = async () => {
  let data = {
    partner: countryPartnerList.value.map((x) => x.iso),
    reporting: countryReportList.value.map((x) => x.iso),
    type: input.value.type,
  };
  let url = serverData.value + "ri/econ_circle_economy.php";
  let res = await axios.post(url, JSON.stringify(data));
  if (isNaN(res.data)) {
    dataAvailCircleChart.value.score = 0;
  } else {
    dataAvailCircleChart.value.score = Number(res.data);
  }
};

const calFourBarChart = async () => {
  fourBarData.value = [];
  let labelName = "Your group";
  if (input.value.reporting.length == 1) {
    labelName = input.value.reporting[0].label;
  }
  fourBarName.value = labelName;
  let labelPartner = "with your group of partners";
  if (input.value.partner.length == 1) {
    labelPartner = "with " + input.value.partner[0].label;
  }
  fourBarNamePatner.value = labelPartner;
  let data = {
    name: fourBarName.value,
    partner: countryPartnerList.value.map((x) => x.iso),
    reporting: countryReportList.value.map((x) => x.iso),
    year: input.value.year.max,
    type: input.value.type,
  };
  let url = serverData.value + "ri/econ_fivebar_onlyyourgroup_eco.php";
  let res = await axios.post(url, JSON.stringify(data));
  let tempYourGroup = {
    name: "Your group",
    value: res.data[0].value,
    own: true,
  };
  if (input.value.partner.length == 1 && input.value.reporting.length == 1) {
    tempYourGroup.name =
      input.value.reporting[0].label +
      " &#8594; " +
      input.value.partner[0].label;
  }
  fourBarData.value.push(tempYourGroup);
  let temp = {
    name: fourBarName.value,
    type: input.value.type,
    year: input.value.year.max,
    data: fourBarData.value,
    partner: fourBarNamePatner.value,
  };

  dataFourBar.value = temp;
  dataSend2.value = {
    input: input.value,
    data: countryFullList.value,
    report: countryReportList.value,
  };
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
