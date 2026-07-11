<template>
  <div class="q-pa-md bg-white" style="width: 100%">
    <div>
      <div class="row font-18" style="height: 65px">
        <!-- Menu #1 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          :class="{ textSelected: menuSelectedId == 1 }"
          @click="selectMenuId1()"
        >
          Integration<br />across years
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 1 }"></div>
        </div>

        <!-- Menu #2 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          @click="selectMenuId2()"
          :class="{ textSelected: menuSelectedId == 2 }"
        >
          Integration<br />
          across periods
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 2 }"></div>
        </div>

        <!-- menu #3 -->
        <div
          class="col-2 selectBoxDiv cursor-pointer"
          align="center"
          style="line-height: 58px"
          @click="selectMenuId3()"
          :class="{ textSelected: menuSelectedId == 3 }"
        >
          Data availability
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 3 }"></div>
        </div>

        <!-- menu #4 -->
        <div
          class="col-2 selectBoxDiv q-pt-xs cursor-pointer"
          align="center"
          @click="selectMenuId4()"
          :class="{ textSelected: menuSelectedId == 4 }"
        >
          Weights / <br />weight simulation
          <div :class="{ lineGreenSelectedBox: menuSelectedId == 4 }"></div>
        </div>

        <div
          class="col-4 selectBoxDiv q-pr-md cursor-pointer"
          align="center"
          style="line-height: 65px"
          @click="goToURL()"
        >
          <u>Click here to see this group's availablity matrix</u>
        </div>
      </div>
    </div>
    <div class="borderMainBox">
      <!-- Graph menu #1 -->
      <div v-show="menuSelectedId == 1">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select dimensions of interest</div>
            <div class="font-14">
              In parenthesis, each economy's asymmetric
              {{ input.type.toLowerCase() }} integration index with this partner
              group in
              {{ input.year.max }}
            </div>
            <div class="q-pt-md">
              Click on each dimension to select/unselect it from the graph.
            </div>
            <div
              class="row q-py-sm cursor-pointer"
              @click="ecoIntegrationGroupToggleOnOff()"
            >
              <div
                class="checkBoxGroup"
                style="background-color: #f07435"
                v-show="ecoIntegrationGroupVisible"
              ></div>
              <div
                class="checkBoxGroup"
                v-show="!ecoIntegrationGroupVisible"
              ></div>
              <div class="q-pl-sm">
                Group average ({{ Number(ecoIntegrationAvg).toFixed(2) }})
              </div>
            </div>
            <div><hr /></div>
            <div class="row pt-2">
              <div
                v-for="(item, index) in ecoIntegrationChart"
                :key="index"
                class="col-12 row q-pb-md font-12"
              >
                <div
                  @click="ecoIntegrationToggleOnOff(index)"
                  class="cursor-pointer row"
                  v-if="item.lastValue >= 0"
                >
                  <div
                    class="checkBox"
                    :style="{ backgroundColor: item.color }"
                    v-show="item.visible == true"
                  ></div>
                  <div
                    class="checkBox"
                    style="border: 1px solid #757575"
                    v-show="item.visible == false"
                  ></div>

                  <div class="q-pl-sm row">
                    <div style="max-width: 200px; display: inline-block">
                      {{ capitalize(item.name) }} ({{
                        Number(item.lastValue).toFixed(2)
                      }})
                    </div>
                  </div>
                </div>
                <div v-else class="row">
                  <div
                    class="checkBox"
                    :style="{ backgroundColor: 'grey' }"
                    v-show="item.visible == true"
                  ></div>
                  <div class="q-pl-sm row">
                    <div style="max-width: 250px; display: inline-block">
                      {{ capitalize(item.name) }} (No data available)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did {{ yourGroupNameSub }}'s Integration with this group
                progress across periods?
              </div>
            </div>
            <div class="font-12">
              Since {{ input.year.min }}, {{ yourGroupNameSub }}'s Integration
              {{ ecoIntegrationPercentChange > 0 ? "increased" : "decreased" }}
              by
              {{ Math.abs(ecoIntegrationPercentChange) }}%. In
              {{ input.year.max }}
              <span v-if="ecoIntegrationChartSort.length > 1">
                , your group was most integrated in
                {{ ecoIntegrationChartSort[0].name.toLowerCase() }} ({{
                  Number(ecoIntegrationChartSort[0].lastValue).toFixed(2)
                }}) and least in
                {{
                  ecoIntegrationChartSort[
                    ecoIntegrationChartSort.length - 1
                  ].name.toLowerCase()
                }}
                ({{
                  Number(
                    ecoIntegrationChartSort[ecoIntegrationChartSort.length - 1]
                      .lastValue
                  ).toFixed(2)
                }}).
              </span>
            </div>

            <div
              id="lineChartByDimension"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- Graph menu #2 -->
      <div v-show="menuSelectedId == 2">
        <div class="row">
          <div style="width: 400px" class="q-pa-md borderRight">
            <div class="font-24">Select economies of interest</div>
            <div class="font-14">
              In parenthesis, each economy's asymmetric
              {{ input.type.toLowerCase() }} integration index progression with
              this partner group across periods.
            </div>
            <div class="q-pt-md">
              Click on each country to select/unselect it from the graph.
            </div>
            <div
              class="row q-py-sm cursor-pointer"
              @click="integrationProgressToggleGroupOnOff()"
            >
              <div
                class="checkBoxGroup"
                style="background-color: #f07435"
                v-show="integrationProgressChartGroupVisible"
              ></div>
              <div
                class="checkBoxGroup"
                v-show="!integrationProgressChartGroupVisible"
              ></div>
              <div class="q-pl-sm">
                Group average ({{ Number(ecoIntegrationAvg).toFixed(2) }})
              </div>
            </div>
            <div><hr /></div>
            <div class="row pt-2">
              <div
                v-for="(item, index) in intergrationProgressList"
                :key="index"
                class="col-12 row q-pb-md font-12 cursor-pointer"
                @click="integrationProgressToggleOnOff(index)"
              >
                <div
                  class="checkBox"
                  style="background-color: #2d9687"
                  v-show="item.visible == true"
                ></div>
                <div
                  class="checkBox"
                  style="border: 1px solid #757575"
                  v-show="item.visible == false"
                ></div>

                <div class="q-pl-sm row">
                  <div style="max-width: 350px; display: inline-block">
                    {{ item.name }}
                    <span
                      v-if="
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ) >= 0
                      "
                      class="positiveText"
                      >(+{{
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ).toFixed(2)
                      }})</span
                    >
                    <span
                      v-else-if="
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ) < 0
                      "
                      class="negativeText"
                      >(-{{
                        Number(
                          integrationProgressChartSeries2[index] -
                            integrationProgressChartSeries1[index]
                        ).toFixed(2)
                      }})</span
                    >
                    <span v-else>(No data available) </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col q-px-md">
            <div class="q-pt-md">
              <div class="font-24">
                How did {{ yourGroupNameSub }}'s integration progress across
                periods?
              </div>
              <div class="font-12">{{ integrationProgressSubTitleText }}</div>
              <div class="font-12">{{ integrationProgressSubTitleText2 }}</div>
            </div>
            <div
              id="container2x"
              style="max-width: 1024px; width: 100%; margin: auto"
            ></div>
          </div>
        </div>
      </div>
      <!-- Graph menu #3 -->
      <div v-show="menuSelectedId == 3">
        <div class="q-pa-md">
          <div class="font-24">
            How much data is available for each of the dimensions considered?
          </div>
          <div class="font-12">
            {{ dataAvailable.subTitle1 }} {{ dataAvailable.subTitle2 }}
          </div>
        </div>
        <div
          id="container3x"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>
      </div>
      <!-- Graph menu#4 -->
      <div v-show="menuSelectedId == 4">
        <div class="q-pa-md">
          <div class="font-24">
            How much is each dimensions contributing to the overall integration
            index ?
          </div>
          <div class="font-12">{{ weight.subTitle1 }}</div>
        </div>
        <div
          id="container4x"
          style="max-width: 1024px; width: 100%; margin: auto"
        ></div>

        <div align="center">
          <div class="btn_weight" @click="showWeightDia()">
            Change your index's dimension weights
          </div>
        </div>
      </div>
    </div>
    <!-- Pop up  -->
    <div v-show="showAdjustWeightDia" persistent class="dialogDiv">
      <div class="weightDiv">
        <div align="right">
          <div class="q-pr-md q-pt-md">
            <q-icon
              name="fas fa-times"
              size="24px"
              class="cursor-pointer"
              @click="showAdjustWeightDia = false"
            />
          </div>
        </div>
        <div class="font-24" align="center">
          Integration score across periods - simulation
        </div>
        <div class="q-px-lg font-18">
          How do dimension weights affect your group's integration score across
          periods?
        </div>
        <div class="q-px-lg font-12 q-pb-sm">
          WARING: This is an experimental tool designed to test the robustness
          of the aggregate score in DigiSRII against different weighting
          schemes. The results derived should be interpreted with caution.
        </div>
        <div class="row" style="width: 97%; margin: auto">
          <div class="chartWeight col">
            <div
              id="weightChartShowx"
              style="max-width: 1024px; width: 100%; margin: auto"
              v-show="wShowChart"
            ></div>
            <div v-show="!wShowChart" class="textNeedGen">
              Please click on the generate button to update the graph
            </div>
          </div>
          <div class="weightBar font-12">
            <div class="row">
              <div class="col q-pl-sm q-pt-sm">Dimension</div>
              <div style="width: 60px" align="center">Weights<br />input</div>
              <div style="width: 60px" align="center">
                Calibrated<br />weights
              </div>
              <div style="width: 60px" align="center">
                DigiSRII<br />weights
              </div>
            </div>
            <hr />

            <div class="row lineDim" v-show="input.dimensionPicked[0].picked">
              <div class="col lineDim q-pl-sm">Trade and investment</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[0]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[0] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[0] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[1].picked">
              <div class="col lineDim q-pl-sm">Financial markets</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[1]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[1] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[1] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[2].picked">
              <div class="col lineDim q-pl-sm">Value chains</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[2]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[2] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[2] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[3].picked">
              <div class="col lineDim q-pl-sm">
                Infrastructure and connectivity
              </div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[3]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[3] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[3] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[4].picked">
              <div class="col lineDim q-pl-sm">Movement of people</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[4]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[4] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[4] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[5].picked">
              <div class="col lineDim q-pl-sm">Regulatory cooperation</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[5]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[5] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[5] }}%</div>
            </div>

            <div class="row lineDim" v-show="input.dimensionPicked[6].picked">
              <div class="col lineDim q-pl-sm">Digital economy</div>
              <div style="width: 60px" class="q-pt-xs">
                <q-input
                  outlined
                  style="width: 55px"
                  dense
                  v-model.number="weightAdjust[6]"
                  @blur="changeWeight()"
                />
              </div>
              <div style="width: 60px" align="center">{{ weightReal[6] }}%</div>
              <div style="width: 60px" align="center">{{ weightInit[6] }}%</div>
            </div>
            <div align="center" class="q-pt-sm">
              <q-btn
                outlined
                label="Generate"
                class="genBtn"
                @click="genBtn()"
                :disable="hideGenBtn"
              />
            </div>
            <div class="q-pt-md" align="center">
              <div
                class="cursor-pointer"
                style="width: 130px"
                @click="resetWeight()"
              >
                <u> Reset weights</u>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { LocalStorage } from "quasar";
import { serverSetup } from "../../pages/server";
import axios from "axios";

const props = defineProps({
  dataSend: Object,
});
const { serverData } = serverSetup();
const data = ref([]);
const input = ref({
  partner: [],
  reporting: [],
  year: {
    min: 2000,
    max: 2001,
  },
  type: "Sustainable",
  disaggregation: "dimension",
  resultBy: "Reporter",
  dimensionPicked: [
    { picked: false },
    { picked: false },
    { picked: false },
    { picked: false },
    { picked: false },
    { picked: false },
    { picked: false },
  ],
});
const report = ref([]);
const id = ref("");
const menuSelectedId = ref(1);
const yourGroupName = ref("Your group");
const yourGroupNameSub = ref("the reporting group");
const dimPick = ref([]);
const colorPattern = ref([
  "#64C1E8",
  "#D85B63",
  "#D680AD",
  "#88643A",
  "#C0BA80",
  "#FDC47D",
  "#EA3B46",
]);

const ecoIntegrationChart = ref([{ name: "" }, { name: "" }]);
const ecoIntegrationChartGroup = ref([]);
const ecoIntegrationAvg = ref(0);
const ecoIntegrationPercentChange = ref(0);
const ecoIntegrationGroupVisible = ref(true);
const ecoIntegrationChartSort = ref([{ name: "" }, { name: "" }]);
const ecoIntegrationFinalChart = ref([]);
const integrationProgressChart = ref([{ name: "" }, { name: "" }]);
const integrationProgressChartGroup = ref([]);
const integrationProgressChartGroupVisible = ref(true);
const integrationProgressChartSeries1 = ref([]); //ข้อมูลดิบของ series 1
const integrationProgressChartSeries2 = ref([]); //ข้อมูลดิบของ series 2
const intergrationProgressList = ref([]); //รายชื่อประเทศด้านซ้าย not include group avg
const integrationProgressPlotChartCat = ref([]);
const integrationProgressPlotChartSeries1 = ref([]);
const integrationProgressPlotChartSeries2 = ref([]);
const integrationProgressPlotChartGroup = ref([]);
const integrationProgressYearStart = ref("");
const integrationProgressYearEnd = ref("");
const integrationProgressSubTitleText = ref("");
const integrationProgressSubTitleText2 = ref("");
const integrationProgressdiffValueArray = ref([]);

const dataAvailable = ref({
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
  subTitle2: "",
});

const weight = ref({
  equalWeight: 100,
  rawData: [],
  cat: [],
  chartData: [],
  subTitle1: "",
});

const showAdjustWeightDia = ref(false);
const adjustWeight = ref({});
const weightAdjust = ref([0, 0, 0, 0, 0, 0, 0]);
const weightReal = ref([0, 0, 0, 0, 0, 0, 0]);
const weightInit = ref([0, 0, 0, 0, 0, 0, 0]);
const wCat = ref([]);
const wS1 = ref([]);
const wS2 = ref([]);
const wFullData = ref([]);
const wShowChart = ref(true);
const hideGenBtn = ref(false);

watch(
  () => props.dataSend,
  async (newValue) => {
    if (newValue) {
      data.value = props.dataSend.data;
      input.value = props.dataSend.input;
      report.value = props.dataSend.report;
      await checkYourName();
      await loadEcoIntegration();
      await loadDataFromDatabase();
      weightLoadData();
    }
  }
);

const changeWeight = () => {
  let totalW = weightAdjust.value.reduce((a, b) => Number(a) + b, 0);
  for (let i = 0; i < 7; i++) {
    weightReal.value[i] = Number(
      ((weightAdjust.value[i] / totalW) * 100).toFixed(1)
    );
  }
  weightReal.value.push(22);
  weightReal.value.pop();
  wShowChart.value = false;

  if (isNaN(weightReal.value[0])) {
    hideGenBtn.value = true;
  } else {
    hideGenBtn.value = false;
  }
};

const resetWeight = () => {
  weightReal.value = [0, 0, 0, 0, 0, 0, 0];
  weightAdjust.value = [0, 0, 0, 0, 0, 0, 0];
  weight.value.rawData.forEach((x) => {
    weightReal.value[x.indexDimension - 1] = x.data;
    weightAdjust.value[x.indexDimension - 1] = x.data;
  });
  wS1.value[0] = wS1.value[1];
  wS2.value[0] = wS2.value[1];
  genWeightChart();
  wShowChart.value = true;
};

const showWeightDia = () => {
  showAdjustWeightDia.value = true;
  let tempWeight = weight.value.rawData;
  tempWeight.sort((a, b) => a.indexDimension - b.indexDimension);
  for (let i = 0; i < 7; i++) {
    weightAdjust.value[i] = 0;
    weightReal.value[i] = 0;
  }
  let groupScore = integrationProgressPlotChartGroup.value;
  wCat.value = ["Your group<br/>Simulation", "Your group<br/>DigiSRII score"];
  wS1.value = [groupScore[0], groupScore[0]];
  wS2.value = [groupScore[1], groupScore[1]];
  for (let i = 0; i < tempWeight.length; i++) {
    tempWeight[i].series1 = integrationProgressChartSeries1.value[i];
    tempWeight[i].series2 = integrationProgressChartSeries2.value[i];
    weightAdjust.value[tempWeight[i].indexDimension - 1] = tempWeight[i].data;
    weightReal.value[tempWeight[i].indexDimension - 1] = tempWeight[i].data;
    weightInit.value[tempWeight[i].indexDimension - 1] = tempWeight[i].data;
    wCat.value.push(tempWeight[i].name);
    wS1.value.push(integrationProgressChartSeries1.value[i]);
    wS2.value.push(integrationProgressChartSeries2.value[i]);
  }
  wFullData.value = tempWeight;

  genWeightChart();
};

const genBtn = () => {
  let wDim = wFullData.value.map((x) => x.indexDimension);
  let sumS1 = 0;
  let sumS2 = 0;
  let totalS = 0;
  let count = 1;
  wDim.forEach((index) => {
    sumS1 += wS1.value[count + 1] * weightReal.value[index - 1];
    sumS2 += wS2.value[count + 1] * weightReal.value[index - 1];
    totalS += weightReal.value[index - 1];
    count++;
  });

  wS1.value[0] = Number((sumS1 / totalS).toFixed(2));
  wS2.value[0] = Number((sumS2 / totalS).toFixed(2));
  genWeightChart();
  wShowChart.value = true;
};

const genWeightChart = () => {
  let yAxisTitle = input.value.type + " integration score";

  Highcharts.chart("weightChartShowx", {
    chart: {
      type: "column",
      height: "470px",
    },
    title: {
      text: null,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: wCat.value,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Your group<br/>Simulation")
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: yAxisTitle,
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },

    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    series: [
      {
        name: "2010-2014",
        data: wS1.value,
        color: "#2381B8",
      },
      {
        name: "2015-2019",
        data: wS2.value,
        color: "#13405A",
      },
    ],
  });
};

const weightLoadData = async () => {
  let dataInput = {
    input: input.value,
    countryPartnerList: data.value,
    countryReportList: report.value,
    reportMap: report.value.map((x) => x.iso),
    partnerMap: data.value.map((x) => x.iso),
    dimension: dimPick.value,
  };

  let dimPass = dimPick.value.length / 2;
  let url = serverData.value + "ri/build_data_avail_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(dataInput));
  let dataChart = [];

  for (let k = 0; k < dimPick.value.length; k++) {
    let indexDimension = dimPick.value[k];
    let temp = {
      name: input.value.dimensionPicked[indexDimension - 1].name,
      indexDimension: indexDimension,
      data: 0,
    };
    dataChart.push(temp);
  }
  let countPair = 0;
  for (let i = 0; i < report.value.length; i++) {
    for (let j = 0; j < data.value.length; j++) {
      let tempPairCountry = res.data.filter(
        (x) =>
          x.reporting == report.value[i].iso && x.partner == data.value[j].iso
      );

      if (tempPairCountry.length >= dimPass) {
        countPair++;
        let tempWeight = 100 / tempPairCountry.length;
        for (let k = 0; k < tempPairCountry.length; k++) {
          let dimCheck = Number(tempPairCountry[k].dim);
          for (let l = 0; l < dataChart.length; l++) {
            if (dataChart[l].indexDimension == dimCheck) {
              dataChart[l].data += tempWeight;
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < dataChart.length; i++) {
    dataChart[i].data /= countPair;
    dataChart[i].data = Number(dataChart[i].data.toFixed(1));
  }
  weight.value.rawData = [];
  for (let i = 0; i < dataChart.length; i++) {
    weight.value.rawData[i] = dataChart[i];
  }
  weight.value.rawData.sort((a, b) => b.data - a.data);

  setDataforWeight();
};

const setDataforWeight = () => {
  weight.value.equalWeight = Number(
    (100 / weight.value.rawData.length).toFixed(2)
  );
  weight.value.cat = weight.value.rawData.map((x) => x.name);
  weight.value.chartData = weight.value.rawData.map((x) => x.data);

  if (weight.value.rawData.length > 1) {
    weight.value.subTitle1 = `${weight.value.rawData[0].name} (${Number(
      weight.value.chartData[0]
    ).toFixed(2)}%)
      were the most prominent dimensions in driving ${
        yourGroupNameSub.value
      }’s integration, whereas ${
      weight.value.rawData[weight.value.rawData.length - 1].name
    } (${Number(
      weight.value.chartData[weight.value.rawData.length - 1]
    ).toFixed(
      2
    )}%) were the least. Full data availability would yield an equal weighting average across all economies, each with weighing ${
      weight.value.equalWeight
    }%.`;
  }

  plotChartDataWeight();
};

const plotChartDataWeight = () => {
  let EQweight = weight.value.equalWeight;
  Highcharts.chart("container4x", {
    chart: {
      type: "column",
      height: "470px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: weight.value.cat,
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "",
      },
      plotLines: [
        {
          color: "red",
          width: 1,
          value: EQweight,
          zIndex: 5,
          dashStyle: "longdashdot",
          label: {
            text: "Equal weight: " + EQweight,
            align: "right",
          },
        },
      ],
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    legend: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    series: [
      {
        name: "weight",
        data: weight.value.chartData,
        color: "#2381B8",
      },
    ],
  });
};

const loadDataFromDatabase = async () => {
  let dataInput = {
    input: input.value,
    countryPartnerList: data.value,
    countryReportList: report.value,
    reportMap: report.value.map((x) => x.iso),
    partnerMap: data.value.map((x) => x.iso),
    dimension: dimPick.value,
  };

  let dimPass = dimPick.value.length / 2;
  let url = serverData.value + "ri/build_data_avail_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(dataInput));
  let dataChart = [];

  for (let k = 0; k < dimPick.value.length; k++) {
    let indexDimension = dimPick.value[k];
    let temp = {
      name: input.value.dimensionPicked[indexDimension - 1].name,
      indexDimension: indexDimension,
      data: 0,
    };
    dataChart.push(temp);
  }

  let countPair = 0;
  for (let i = 0; i < report.value.length; i++) {
    for (let j = 0; j < data.value.length; j++) {
      let tempPairCountry = res.data.filter(
        (x) =>
          x.reporting == report.value[i].iso && x.partner == data.value[j].iso
      );

      if (tempPairCountry.length >= dimPass) {
        countPair++;
        for (let k = 0; k < tempPairCountry.length; k++) {
          // console.log(Number(tempPairCountry[k].dim));
          let dimCheck = Number(tempPairCountry[k].dim);
          for (let l = 0; l < dataChart.length; l++) {
            if (dataChart[l].indexDimension == dimCheck) {
              dataChart[l].data += 1;
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < dataChart.length; i++) {
    dataChart[i].data = (dataChart[i].data * 100) / countPair;
    dataChart[i].data = Number(dataChart[i].data.toFixed(2));
  }
  for (let i = 0; i < dataChart.length; i++) {
    dataAvailable.value.rawData.push(dataChart[i]);
  }

  //-------------------------------------
  let avgGroup = Math.round(
    dataAvailable.value.rawData
      .map((x) => x.data)
      .reduce((pc, cc) => pc + cc, 0) / dataAvailable.value.rawData.length
  );
  let temp = {
    name: "Your group",
    data: avgGroup,
  };
  dataAvailable.value.rawData.push(temp);
  dataAvailable.value.rawData.sort((a, b) => b.data - a.data);
  setDataforDataAvail(avgGroup);
};

const setDataforDataAvail = (avgGroup) => {
  dataAvailable.value.cat = dataAvailable.value.rawData.map((x) => x.name);
  dataAvailable.value.chartData = dataAvailable.value.rawData.map(
    (x) => x.data
  );
  dataAvailable.value.subTitle1 = `${
    yourGroupNameSub.value
  }'s has data for (${Number(avgGroup).toFixed(
    2
  )}%) of all possible reporter-partner pairs.`;

  if (dataAvailable.value.rawData.length > 3) {
    dataAvailable.value.subTitle2 = `${
      dataAvailable.value.rawData[0].name
    } (${Number(dataAvailable.value.chartData[0]).toFixed(
      2
    )}%) were the dimensions with the most complete data set, while ${dataAvailable.value.rawData[
      dataAvailable.value.rawData.length - 1
    ].name.toLowerCase()} (${Number(
      dataAvailable.value.chartData[dataAvailable.value.chartData.length - 1]
    ).toFixed(2)}%) were the least.`;
  }
  plotChartDataAvail();
};

const plotChartDataAvail = () => {
  Highcharts.chart("container3x", {
    chart: {
      type: "column",
      height: "500px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: dataAvailable.value.cat,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Your group")
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: "",
      },
      labels: {
        format: "{value} %",
      },
    },

    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f}%</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    legend: { enabled: false },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2) + "%";
          },
        },
      },
    },
    series: [
      {
        name: "data availability",
        data: dataAvailable.value.chartData,
        color: "#2381B8",
      },
    ],
  });
};

const selectMenuId1 = () => {
  menuSelectedId.value = 1;
};

const selectMenuId2 = () => {
  menuSelectedId.value = 2;
};

const selectMenuId3 = () => {
  menuSelectedId.value = 3;
};

const selectMenuId4 = () => {
  menuSelectedId.value = 4;
};

const goToURL = () => {
  let dataGet = LocalStorage.getItem("dataAvail");
  id.value = dataGet.key;
  window.open("#/ridataavail/" + id.value).focus;
};

const capitalize = (s) => {
  if (s.length == 0) {
    return "";
  } else {
    return s[0].toUpperCase() + s.slice(1).toLowerCase();
  }
};

const ecoIntegrationGroupToggleOnOff = () => {
  ecoIntegrationChartGroup.value["visible"] =
    !ecoIntegrationChartGroup.value["visible"];
  ecoIntegrationGroupVisible.value = ecoIntegrationChartGroup.value["visible"];
  mergeEcoIntegration();
};

const ecoIntegrationToggleOnOff = (index) => {
  ecoIntegrationChart.value[index]["visible"] =
    !ecoIntegrationChart.value[index]["visible"];
  ecoIntegrationChart.value.push("xxx");
  ecoIntegrationChart.value.pop();
  mergeEcoIntegration();
};

const integrationProgressToggleGroupOnOff = () => {
  integrationProgressChartGroupVisible.value =
    !integrationProgressChartGroupVisible.value;
  integrationProgressMergeData();
};

const integrationProgressToggleOnOff = (index) => {
  intergrationProgressList.value[index]["visible"] =
    !intergrationProgressList.value[index]["visible"];
  integrationProgressMergeData();
};

const checkYourName = () => {
  if (input.value.reporting.length == 1) {
    yourGroupNameSub.value = input.value.reporting[0].label;
    yourGroupName.value = input.value.reporting[0].label;
  }
  let dim = [];
  for (let i = 0; i < input.value.dimensionPicked.length; i++) {
    if (input.value.dimensionPicked[i].picked) dim.push(i + 1);
  }
  dimPick.value = dim;
};

const loadEcoIntegration = async () => {
  ecoIntegrationChart.value = [];

  let dataInput = {
    input: input.value,
    countryPartnerList: data.value,
    countryReportList: report.value,
    reportMap: report.value.map((x) => x.iso),
    partnerMap: data.value.map((x) => x.iso),
    dimension: dimPick.value,
  };
  let dimPass = dimPick.value.length / 2;
  let allYear = input.value.year.max - input.value.year.min + 1;
  let url = serverData.value + "ri/build_index_by_dimension.php";
  let res = await axios.post(url, JSON.stringify(dataInput));
  let allData = res.data;
  let tableTemp = [];

  dataInput.reportMap.forEach((reporter) => {
    let resultReportList = allData.filter(
      (result) => result.reporter == reporter
    );

    dataInput.partnerMap.forEach((partner) => {
      let resultReportPartnerList = resultReportList.filter(
        (result2) => result2.partner == partner
      );

      if (resultReportPartnerList.length != 0) {
        if (resultReportPartnerList.length >= dimPass * allYear) {
          for (let i = 0; i < resultReportPartnerList.length; i++) {
            tableTemp.push(resultReportPartnerList[i]);
          }
        }
      }
    });
  });

  // -----------------------------------------------
  for (let i = 0; i < dimPick.value.length; i++) {
    let indexDimension = dimPick.value[i];
    let dataBeforePush = {
      name: input.value.dimensionPicked[indexDimension - 1].name,
      data: [],
      lastValue: 0,
    };
    for (let j = input.value.year.min; j <= input.value.year.max; j++) {
      let tempData = tableTemp.filter(
        (x) => x.dimension == indexDimension && x.year == j
      );

      let avgData =
        tempData.reduce((total, item) => {
          return total + Number(item.score);
        }, 0) / tempData.length;

      dataBeforePush.data.push(Number(avgData.toFixed(4)));
    }
    dataBeforePush.lastValue =
      dataBeforePush.data[dataBeforePush.data.length - 1];
    ecoIntegrationChart.value.push(dataBeforePush);
  }

  ecoIntegrationChartSort.value = [];
  ecoIntegrationChart.value.forEach((item) => {
    let temp = {
      name: item.name,
      lastValue: item.lastValue,
    };
    ecoIntegrationChartSort.value.push(temp);
  });
  ecoIntegrationChartSort.value.sort((a, b) => b.lastValue - a.lastValue);

  let diffYear = input.value.year.max - input.value.year.min;

  for (let i = 0; i < ecoIntegrationChart.value.length; i++) {
    for (let j = 0; j < input.value.dimensionPicked.length; j++) {
      if (
        ecoIntegrationChart.value[i]["name"] ==
        input.value.dimensionPicked[j].name
      ) {
        ecoIntegrationChart.value[i]["color"] =
          input.value.dimensionPicked[j].color;
      }
    }
    ecoIntegrationChart.value[i]["visible"] = true;
  }

  let avgValue = [];
  for (let j = 0; j <= diffYear; j++) {
    let cYear = input.value.year.min + j;
    let tableFilterYear = tableTemp.filter((x) => x.year == cYear);

    //////   avg of Pair country
    let sumEachPair = 0;
    let countPair = 0;
    dataInput.reportMap.forEach((report) => {
      dataInput.partnerMap.forEach((partner) => {
        let tableEachPair = tableFilterYear.filter(
          (x) => x.reporter == report && x.partner == partner
        );
        if (tableEachPair.length > 0) {
          sumEachPair +=
            tableEachPair.reduce((sum, item) => sum + Number(item.score), 0) /
            tableEachPair.length;
          countPair++;
        }
      });
    });
    avgValue[j] = Number((sumEachPair / countPair).toFixed(4));
  }

  ecoIntegrationChartGroup.value = {
    name: "Group average",
    data: avgValue,
    lastValue: avgValue[diffYear],
    color: "#FF9616",
    visible: true,
    dashStyle: "dash",
  };

  ecoIntegrationAvg.value = ecoIntegrationChartGroup.value.lastValue;
  ecoIntegrationPercentChange.value = (
    ((avgValue[diffYear] - avgValue[0]) / avgValue[0]) *
    100
  ).toFixed(0);

  integrationProgressPrepareData();

  mergeEcoIntegration();
};

const integrationProgressPrepareData = () => {
  integrationProgressMakeEcoList();
  integrationProgressMakeAvg();
  integrationProgressMakeAvgGroup();
  integrationProgressLegendChartName();
  intergrationProgressSubTitle();
  integrationProgressMergeData();
};

const integrationProgressMakeEcoList = () => {
  intergrationProgressList.value = [];
  ecoIntegrationChart.value.forEach((item) => {
    let temp = [];

    temp = {
      name: item.name,
      lastValue: item.lastValue,
      visible: true,
    };

    intergrationProgressList.value.push(temp);
  });
};

const integrationProgressMakeAvg = () => {
  ecoIntegrationChart.value.forEach((item) => {
    //Find avg value in 2 series for economic (not include group)
    let diffYearByTwo = Math.floor(
      (input.value.year.max - input.value.year.min) / 2
    );

    let arr1 = item.data.slice(0, diffYearByTwo + 1);

    let avg1 = Number(arr1.reduce((pc, cc) => pc + cc, 0)) / arr1.length;
    let arr2 = item.data.slice(item.data.length - diffYearByTwo - 1);
    let avg2 = Number(arr2.reduce((pc, cc) => pc + cc, 0)) / arr2.length;
    let temp1 = {
      name: item.name,
      color: "#2381B8",
      data: Number(avg1).toFixed(4),
    };
    let temp2 = {
      name: item.name,
      color: "#13405A8",
      data: Number(avg2).toFixed(4),
    };
    integrationProgressChartSeries1.value.push(temp1);

    integrationProgressChartSeries2.value.push(temp2);
  });
  integrationProgressChartSeries1.value =
    integrationProgressChartSeries1.value.map((x) => Number(x.data));
  integrationProgressChartSeries2.value =
    integrationProgressChartSeries2.value.map((x) => Number(x.data));
};

const integrationProgressMakeAvgGroup = () => {
  integrationProgressPlotChartGroup.value = [];

  let diffYearByTwo = Math.floor(
    (input.value.year.max - input.value.year.min) / 2
  );
  let arrGroup1 = ecoIntegrationChartGroup.value.data.slice(
    0,
    diffYearByTwo + 1
  );
  let arrGroup2 = ecoIntegrationChartGroup.value.data.slice(
    ecoIntegrationChartGroup.value.data.length - diffYearByTwo - 1
  );
  let avgGroup1 =
    Number(arrGroup1.reduce((pc, cc) => pc + cc, 0)) / arrGroup1.length;
  let avgGroup2 =
    Number(arrGroup2.reduce((pc, cc) => pc + cc, 0)) / arrGroup2.length;
  integrationProgressPlotChartGroup.value.push(Number(avgGroup1.toFixed(4)));
  integrationProgressPlotChartGroup.value.push(Number(avgGroup2.toFixed(4)));
};

const integrationProgressLegendChartName = () => {
  let diffYear = Math.floor((input.value.year.max - input.value.year.min) / 2);
  integrationProgressYearStart.value =
    input.value.year.min + "-" + (input.value.year.min + diffYear);
  integrationProgressYearEnd.value =
    input.value.year.max - diffYear + "-" + input.value.year.max;
};

const intergrationProgressSubTitle = () => {
  let diffGroup =
    integrationProgressPlotChartGroup.value[1] -
    integrationProgressPlotChartGroup.value[0];

  integrationProgressSubTitleText.value = `From ${
    integrationProgressYearStart.value
  } to ${integrationProgressYearEnd.value}
      ${yourGroupNameSub.value}’s integration average ${
    diffGroup > 0 ? "increased" : "decreased"
  } ${Math.abs(diffGroup).toFixed(2)} from  ${Number(
    integrationProgressPlotChartGroup.value[0]
  ).toFixed(2)} to ${Number(integrationProgressPlotChartGroup.value[1]).toFixed(
    2
  )}.`;

  let counter = 0;
  intergrationProgressList.value.forEach((item) => {
    let temp = {
      name: item.name,
      diffData: Number(
        (
          integrationProgressChartSeries2.value[counter] -
          integrationProgressChartSeries1.value[counter]
        ).toFixed(2)
      ),
    };

    integrationProgressdiffValueArray.value.push(temp);
    counter++;
  });
  integrationProgressdiffValueArray.value.sort(
    (a, b) => b.diffData - a.diffData
  );

  if (integrationProgressdiffValueArray.value.length > 2) {
    integrationProgressSubTitleText2.value = `${
      integrationProgressdiffValueArray.value[0].name
    } (${Number(integrationProgressdiffValueArray.value[0].diffData).toFixed(
      2
    )}) progressed the most.
        ${
          integrationProgressdiffValueArray.value[
            integrationProgressdiffValueArray.value.length - 1
          ].name
        } (${Number(
      integrationProgressdiffValueArray.value[
        integrationProgressdiffValueArray.value.length - 1
      ].diffData
    ).toFixed(2)}) progressed the least.`;
  }
};

const integrationProgressMergeData = () => {
  integrationProgressPlotChartCat.value = [];
  integrationProgressPlotChartSeries1.value = [];
  integrationProgressPlotChartSeries2.value = [];

  if (integrationProgressChartGroupVisible.value) {
    integrationProgressPlotChartCat.value.push("Your group");
    integrationProgressPlotChartSeries1.value.push(
      integrationProgressPlotChartGroup.value[0]
    );
    integrationProgressPlotChartSeries2.value.push(
      integrationProgressPlotChartGroup.value[1]
    );
  }

  let countInter = 0;
  intergrationProgressList.value.forEach((item) => {
    if (item.visible) {
      integrationProgressPlotChartCat.value.push(item.name);
      integrationProgressPlotChartSeries1.value.push(
        integrationProgressChartSeries1.value[countInter]
      );
      integrationProgressPlotChartSeries2.value.push(
        integrationProgressChartSeries2.value[countInter]
      );
    }
    countInter++;
  });
  loadIntegrationPeriodsChart();
};

const loadIntegrationPeriodsChart = () => {
  let yAxisTitle = input.value.type + " Integration";
  Highcharts.chart("container2x", {
    chart: {
      type: "column",
      height: "500px",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: integrationProgressPlotChartCat.value,
      crosshair: true,
      labels: {
        formatter() {
          if (this.value == "Your group")
            return `<span style="color: #F99704; font-weight:bold;">${this.value}</span>`;
          else {
            return this.value;
          }
        },
      },
    },
    yAxis: {
      min: 0,
      max: 1,
      title: {
        text: yAxisTitle,
      },
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    tooltip: {
      headerFormat:
        '<span style="font-size:16px"><b>{point.key}</b></span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:.2f} </b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        borderWidth: 0,
      },
      series: {
        dataLabels: {
          enabled: true,
          formatter: function () {
            return Highcharts.numberFormat(this.y, 2);
          },
        },
      },
    },
    legend: {
      align: "right",
      verticalAlign: "top",
      y: 50,
      layout: "vertical",
      floating: true,
    },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },
    series: [
      {
        name: integrationProgressYearStart.value,
        data: integrationProgressPlotChartSeries1.value,
        color: "#2381B8",
      },
      {
        name: integrationProgressYearEnd.value,
        data: integrationProgressPlotChartSeries2.value,
        color: "#13405A",
      },
    ],
  });
};

const mergeEcoIntegration = () => {
  ecoIntegrationFinalChart.value = [];
  ecoIntegrationChart.value.forEach((x) => {
    ecoIntegrationFinalChart.value.push(x);
  });
  ecoIntegrationFinalChart.value.push(ecoIntegrationChartGroup.value);
  LineChartByCountry();
};
const LineChartByCountry = () => {
  let yAxisTitle = input.value.type + " Integration";

  Highcharts.chart("lineChartByDimension", {
    chart: {
      height: "500px",
    },
    title: {
      text: "",
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
    },
    yAxis: {
      // min: 0,

      title: {
        text: yAxisTitle,
      },
    },
    xAxis: {
      tickInterval: 1,
    },
    tooltip: {
      useHTML: true,
      headerFormat: "",
      pointFormatter: function () {
        return (
          "<div class='font-16'><b>" +
          this.series.name +
          "</b></div><div>" +
          yAxisTitle +
          " index: " +
          Number(this.y).toFixed(2) +
          "</div>"
        );
      },
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        pointStart: input.value.year.min,
      },
    },
    credits: {
      enabled: false,
    },
    series: ecoIntegrationFinalChart.value,
    legend: { enabled: false },
    exporting: {
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "downloadCSV",
            "downloadXLS",
            //"viewData",
          ],
        },
      },
    },

    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              layout: "horizontal",
              align: "center",
              verticalAlign: "bottom",
            },
          },
        },
      ],
    },
  });
};
</script>

<style lang="scss" scoped>
.positiveText {
  color: #2d9687;
}
.negativeText {
  color: #d85b63;
}
.colorBox {
  width: 16px;
  height: 16px;
  border: 1px solid #757575;
}
.selectBoxDiv {
  border: 1px solid #757575;
}
.textSelected {
  color: #2d9687;
  font-weight: bold;
}
.lineGreenSelectedBox {
  height: 7px;
  background-color: #2d9687;
}
.borderMainBox {
  border: 1px solid #757575;
  height: 650px;
  width: 100%;
}
.borderRight {
  border-right: 1px solid #c4c4c4;
  height: 650px;
}
.checkBox {
  width: 20px;
  height: 20px;
}
.checkBoxGroup {
  width: 20px;
  height: 20px;
  border: 1px solid #757575;
}
.btn_weight {
  background-color: #2d9687;
  color: white;
  width: 450px;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
  border-radius: 5px;
  cursor: pointer;
}
.weightDiv {
  width: 1100px;
  max-width: 1100px;
  height: 630px;
  background-color: #fefefe;
  margin: auto;

  border: 1px solid #888;
}
.chartWeight {
  height: 450px;
  margin: auto;
}
.weightBar {
  width: 360px;
  height: 450px;
  border-left: 1px solid #757575;
}
.chartInside {
  width: 100%;
  height: 200px;
}
.chartLabel {
  width: 100%;
  height: 50px;
  text-align: center;
  line-height: 50px;
}
.lineDim {
  line-height: 50px;
  height: 50px;
}
.genBtn {
  width: 200px;
  background-color: #2d9687;
  color: white;
}
.dialogDiv {
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  padding-top: 100px; /* Location of the box */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}
.textNeedGen {
  font-size: 20px;
  text-align: center;
  position: relative;
  top: 150px;
  color: #c25555;
}
.font-12 {
  font-size: 12px;
}
</style>
