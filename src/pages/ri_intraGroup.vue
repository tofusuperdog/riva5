<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div><RIHeader :menu="1" /></div>
      <div class="row">
        <div class="col">
          <input-section
            @reset-start-btn="resetStartBtn"
            @get-input="showDataAvailChart"
            @start-btn="startBtn"
            @change-integration-type="changeIntegrationType"
          />
        </div>

        <!-- dimension icon / data available circle -->

        <div style="background: #ededed; width: 480px">
          <dimensions-icon :type="input.type"></dimensions-icon>
          <circle-avail
            :score="dataAvailCircleChart.score"
            :isShowChart="dataAvailCircleChart.showChart"
          ></circle-avail>
        </div>
      </div>
      <div v-if="showResultAfterStartBtn">
        <div>
          <hr />
          <div>
            <!-- four bar chart`` -->
            <four-bar
              :type="input.type"
              :year="input.year.max"
              :name="fourBarName"
              :data="fourBarData"
            ></four-bar>
          </div>
          <hr />
          <!-- by country / by dimension btn -->
          <select-desired
            :input="input.disaggregation"
            @change-disaggregation="changeDisaggraegation"
          ></select-desired>
        </div>
        <!-- Result of bydimension`` -->
        <div v-show="input.disaggregation == 'dimension'">
          <line-chart-dimension :dataGet="dataLinesend"></line-chart-dimension>
          <dimension-tab :dataGet="dataLinesend" @go-to-eco="gotoEco">
          </dimension-tab>
        </div>
        <div v-show="input.disaggregation == 'country'">
          <main-linechart :dataGet="dataLinesend"></main-linechart>
          <hr />
          <economy-circle
            :dataGet="dataLinesend"
            @go-to-dimension="gotoDimension"
          ></economy-circle>
        </div>
      </div>
      <footerMain />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
import inputSection from "../components/ri_intragroup/input_section.vue";
import dimensionsIcon from "../components/ri_dimension_icon.vue";
import circleAvail from "../components/ri_economy_circle.vue";
import fourBar from "../components/ri_fourbar.vue";
import selectDesired from "../components/ri_select_desired_level.vue";
import lineChartDimension from "../components/ri_intragroup/linechart_by_dimension.vue";
import dimensionTab from "../components/ri_intragroup/datatab_dimension.vue";
import mainLinechart from "../components/ri_intragroup/linechart_by_country.vue";
import economyCircle from "../components/ri_intragroup/ri_economuy_circle.vue";
import { serverSetup } from "./server";
import axios from "axios";

const { serverData } = serverSetup();

const countryFullList = ref([]);
const input = ref({
  partner: [],
  year: {
    min: 2012,
    max: 2018,
  },
  type: "Sustainable",
  disaggregation: "dimension",
});
const showResultAfterStartBtn = ref(false);
const dataAvailCircleChart = ref({
  showChart: false,
  score: 0,
});
const fourBarName = ref("Your game");
const fourBarData = ref([]);
const dataLinesend = ref({});

const gotoDimension = () => {
  input.value.disaggregation = "dimension";
  window.scrollTo(0, 1400);
};

const gotoEco = () => {
  input.value.disaggregation = "country";
  window.scrollTo(0, 1400);
};

const resetStartBtn = () => {
  showResultAfterStartBtn.value = false;
};

const showDataAvailChart = (data) => {
  dataAvailCircleChart.value.showChart = data.showDataAvailChart;
  countryFullList.value = data.countryFullList;
  input.value = data.input;
  dataLinesend.value = {
    countryFullList: countryFullList.value,
    input: input.value,
  };
  calScoreInDataAvail();
};

const startBtn = (inputSend) => {
  showResultAfterStartBtn.value = true;
  countryFullList.value = inputSend.countryFullList;
  input.value = inputSend.input;
  dataLinesend.value = {
    countryFullList: countryFullList.value,
    input: input.value,
  };
  calFourBarChart();
};

const changeIntegrationType = (integrationType) => {
  input.value.type = integrationType;
};

const calScoreInDataAvail = async () => {
  let data = {
    type: input.value.type,
    economic: countryFullList.value.map((x) => x.iso),
  };

  let url = serverData.value + "ri/intra_circle_intra.php";
  let res = await axios.post(url, JSON.stringify(data));

  dataAvailCircleChart.value.score = Number(res.data);
};

const calFourBarChart = async () => {
  fourBarData.value = [];
  let labelName = "Your group";
  if (input.value.partner.length == 1) {
    labelName = input.value.partner[0].label;
  }
  fourBarName.value = labelName;
  let data = {
    name: labelName,
    economic: countryFullList.value.map((x) => x.iso),
    year: input.value.year.max,
    type: input.value.type,
  };
  let url = serverData.value + "ri/intra_fivebar_onlyyourgroup_intra.php";
  let res = await axios.post(url, JSON.stringify(data));
  fourBarData.value.push(res.data[0]);
};

const changeDisaggraegation = (type) => {
  input.value.disaggregation = type;
};
</script>

<style lang="scss" scoped>
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  background-color: #fff;
}
</style>
