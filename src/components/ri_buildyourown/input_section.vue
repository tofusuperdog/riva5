<template>
  <div class="row">
    <div class="col-8 q-px-xl q-pt-xl">
      <div class="row">
        <div class="col-4">
          <div class="font-16"><b>Integration type</b></div>
          <div>Select the desired type of integration</div>
        </div>
        <div class="col-3">
          <q-radio
            v-model="input.type"
            val="Sustainable"
            label="Sustainable Integration"
            color="secondary"
            @update:model-value="changeInputTypeSustainable()"
          />
        </div>
        <q-radio
          v-model="input.type"
          val="Conventional"
          label="Conventional Integration"
          color="secondary"
          @update:model-value="changeInputTypeConventional()"
        />
      </div>
      <br />
      <div class="font-16"><b>Period</b></div>
      <div class="q-pt-md text-center">
        <q-range
          v-model="input.year"
          marker-labels
          :min="periodSetup.min"
          :max="periodSetup.max"
          label-always
          markers
          style="width: 95%"
          color="secondary"
          @update:model-value="changeYear()"
        />
      </div>
      <div class="q-pt-md font-16"><b>Reporting economy(ies)</b></div>
      <div>
        Please select one, many or pre-selected group or reporting economies of
        interest.
      </div>
      <div>
        <q-select
          v-model="input.reporting"
          :options="countryReportOption"
          style="width: 100%"
          multiple
          use-chips
          stack-label
          filled
          @update:model-value="showSelectedReportList()"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section
                avatar
                v-if="!scope.opt.disable && /^[A-Z]{3}$/.test(scope.opt.value)"
              >
                <img
                  :src="getFlagUrl(scope.opt.value)"
                  alt="flag"
                  style="width: 24px; height: 16px"
                />
              </q-item-section>
              <q-item-section>
                {{ scope.opt.label }}
              </q-item-section></q-item
            ></template
          >
        </q-select>
      </div>
      <br />
      <div class="q-pt-md font-16"><b>Partner economy(ies)</b></div>
      <div>
        Please select one, many or a pre-selected group of partner economies of
        interest.
      </div>
      <div>
        <q-select
          v-model="input.partner"
          :options="countryPartnerOption"
          style="width: 100%"
          multiple
          use-chips
          stack-label
          filled
          @update:model-value="showSelectedPartnerList()"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section
                avatar
                v-if="!scope.opt.disable && /^[A-Z]{3}$/.test(scope.opt.value)"
              >
                <img
                  :src="getFlagUrl(scope.opt.value)"
                  alt="flag"
                  style="width: 24px; height: 16px"
                />
              </q-item-section>
              <q-item-section>
                {{ scope.opt.label }}
              </q-item-section></q-item
            ></template
          >
        </q-select>
      </div>
      <br />
      <div class="reportingSelectList q-pa-sm">
        <div class="font-16"><b>Selected reporting economy(ies)</b></div>
        <div class="q-pt-sm">
          <div class="row" style="width: 100%; height: 60px">
            <div
              class="countryTag q-mr-sm q-px-md q-mb-sm"
              v-for="(item, index) in countryReportList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
      <div class="partnerSelectList q-pa-sm">
        <div class="font-16"><b>Selected partner economy(ies)</b></div>
        <div class="q-pt-sm">
          <div class="row" style="width: 100%; height: 60px">
            <div
              class="countryTag q-mr-sm q-px-md q-mb-sm"
              v-for="(item, index) in countryFullList"
              :key="index"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
      <div class="q-pt-lg row justify-evenly text-center" style="width: 100%">
        <div class="clearAllBtnDiv" @click="clearAllBtn()">Clear all</div>
        <div class="startBtnDiv" @click="startBtn()">Start</div>
      </div>
      <br />
    </div>
    <div class="col-4 font-16 q-pa-md">
      <!-- dimension icon -->
      <div class="">
        <b>{{ input.type }} Integration dimensions (all included)</b>
      </div>
      <div>
        Select dimensions of interest. Hover to reveal included indicators.
      </div>
      <div class="q-pt-sm" style="width: 400px; margin: auto">
        <div class="q-pt-sm row justify-start">
          <div
            class="col-4 q-pa-sm"
            v-for="(item, index) in indicatorData"
            :key="index"
          >
            <div v-if="item.picked" @click="toggleSelectDimension(index)">
              <q-img
                :src="filePic(item.icon)"
                alt=""
                class="iconDimension cursor-pointer isPicked"
              >
                <q-tooltip>
                  {{ item.name }}<br />
                  <div v-for="(item2, index2) in item.indicator" :key="index2">
                    - {{ item2 }}
                  </div>
                </q-tooltip>
              </q-img>
            </div>

            <div v-else @click="toggleSelectDimension(index)">
              <q-img
                :src="filePic(item.icon)"
                alt=""
                class="iconDimension cursor-pointer"
              >
                <q-tooltip>
                  {{ item.name }}<br />
                  <div v-for="(item2, index2) in item.indicator" :key="index2">
                    - {{ item2 }}
                  </div>
                </q-tooltip>
              </q-img>
            </div>
          </div>
        </div>
      </div>
      <br />
      <!-- circle  -->
      <div class="font-16"><b>Data availability</b></div>
      <div>
        Based on your selection, this group’s integration will be based on
      </div>
      <br />
      <div class="q-px-md" align="center">
        <div class="notShowCircular" v-if="!dataAvailCircleChart.isShowChart">
          <div style="height: 40%"></div>
          <div class="" align="center" style="width: 80%">
            (Select your desired group of economies to check data availablity)
          </div>
        </div>
        <div class="showCircular" v-else>
          <q-circular-progress
            show-value
            font-size="36px"
            :value="dataAvailCircleChart.score"
            size="200px"
            :thickness="0.36"
            color="orange"
            track-color="grey-5"
          >
            {{ dataAvailCircleChart.score }}%
          </q-circular-progress>
        </div>
      </div>
      <br />
      <div align="center">of all possible reporter-partner pairs.</div>
      <div
        align="center"
        class="q-pb-md cursor-pointer"
        v-if="dataAvailCircleChart.isShowChart"
        @click="goToURL()"
      >
        <u>Click here to see this group’s availablitiy matrix</u>
      </div>
      <div v-else class="q-pb-md">&nbsp;</div>
      <q-dialog v-model="warnDialog.show">
        <q-card class="warnBox">
          <div class="font-24 text-grey-7 text-bold q-pt-sm" align="center">
            Missing data
            <q-icon
              class="fas fa-exclamation-circle"
              color="grey-7"
              size="28px"
            />
          </div>
          <hr />

          <div style="width: 650px; margin: auto">
            <div class="font-18 text-grey-7">
              The following economies were excluded from your selection due to
              lack of data:
            </div>
            <div class="font-14 text-grey-7">Reporting economy(ies):</div>
            <div class="row q-py-sm" v-if="warnDialog.reporting.length != 0">
              <div v-for="(item, i) in warnDialog.reporting" :key="i">
                <div class="countryTag q-mr-sm q-px-md q-mb-sm">
                  {{ item.label }}
                </div>
              </div>
            </div>

            <div class="font-14 text-grey-7">Partner economy(ies):</div>
            <div class="row q-py-sm" v-if="warnDialog.partner.length != 0">
              <div v-for="(items, index) in warnDialog.partner" :key="index">
                <div class="countryTag q-mr-sm q-px-md q-mb-sm">
                  {{ items.label }}
                </div>
              </div>
            </div>
          </div>

          <div
            class="q-pt-lg row justify-evenly"
            align="center"
            style="width: 100%"
          >
            <div class="clearAllBtnDiv" @click="doNotThing()">Back</div>
            <div class="startBtnDiv" @click="okInWarnDialog()">Start</div>
          </div>
          <div class="q-pa-sm"></div>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { serverSetup, yearInputShow } from "../../pages/server";
import { serverSetup } from "../../pages/server";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import countryAllWorld from "../../assets/countryAll.json";
import { countryGroupListRiva2 } from "../../pages/countryGroupList";
import { v4 as uuidv4 } from "uuid";
import { LocalStorage, Notify } from "quasar";

const { serverData } = serverSetup();
const yearInput = ref({ min: 2010, max: 2020 });
// const { yearInput } = yearInputShow();
const route = useRoute();
const router = useRouter();

const id = ref("");
const dataAvailCircleChart = ref({
  score: 0,
  isShowChart: false,
});

const countryOptions = ref([]);
const countryReportOption = ref([]);
const countryPartnerOption = ref([]);
const countryFullList = ref([]);
const countryReportList = ref([]);
const indicatorData = ref([]);
const pickAll = ref(0);

const periodSetup = ref({
  min: 2000,
  max: 2020,
});

const input = ref({
  partner: [],
  reporting: [],
  year: {
    min: 2012,
    max: 2020,
  },
  type: "Sustainable",
  disaggregation: "dimension",
  dimensionPicked: [],
});

const dataTemp = ref([]);

const warnDialog = ref({
  show: false,
  reporting: [],
  partner: [],
});

const emit = defineEmits([
  "change-integration-type",
  "reset-start-btn",
  "start-btn",
]);

onMounted(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = Number(result.data[0].yearStart);
  yearInput.value.max = Number(result.data[0].yearEnd);
  await loadData();
  await loadCountry();
  await loadPeriod();
  if (route.name == "ribuildyourown") {
    let reportingTemp = {
      disable: false,
      label: "ASEAN",
      value: "asean",
    };
    input.value.reporting.push(reportingTemp);
    await showSelectedReportList();
    let partnerTemp = {
      disable: false,
      label: "RCEP",
      value: "rcep",
    };
    input.value.partner.push(partnerTemp);
    showSelectedPartnerList();
    // toggleSelectDimension(0);
    // toggleSelectDimension(1);
    // toggleSelectDimension(2);

    // toggleSelectDimension(3);
    // toggleSelectDimension(4);
    // toggleSelectDimension(5);
    // toggleSelectDimension(6);
    setTimeout(() => {
      startBtn();
    }, 1000);
  }
});

const doNotThing = () => {
  warnDialog.value.show = false;
};

const okInWarnDialog = () => {
  for (let i = 0; i < countryReportList.value.length; i++) {
    let checkDel = false;
    warnDialog.value.reporting.forEach((x) => {
      if (x.iso == countryReportList.value[i].iso) {
        countryReportList.value.splice(i, 1);
        checkDel = true;
      }
    });
    if (checkDel) {
      i--;
    }
  }

  for (let j = 0; j < countryFullList.value.length; j++) {
    let checkPartner = false;
    warnDialog.value.partner.forEach((partner) => {
      if (partner.iso == countryFullList.value[j].iso) {
        countryFullList.value.splice(j, 1);
        checkPartner = true;
      }
    });
    if (checkPartner) {
      j--;
    }
  }
  checkDataAvailability();
  warnDialog.value.show = false;
  emit("start-btn", {
    input: input.value,
    countryFullList: countryFullList.value,
    reportingList: countryReportList.value,
  });
};

const filePic = (fileName) => {
  return serverData.value + "pic/" + fileName;
};

const clearAllBtn = () => {
  router.push("/reloadpage/ribuildyourown_clear");
};

const startBtn = () => {
  if (input.value.year.min == input.value.year.max) {
    Notify.create({
      message: "Start and end year can not be the same.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
    return;
  }

  if (pickAll.value == 0) {
    Notify.create({
      message: "Please select one dimension.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });

    return;
  }
  if (countryReportList.value.length > 0 && countryFullList.value.length > 0) {
    checkCountryNodata();
  } else {
    Notify.create({
      message: "Please select Reporting economy and Partner economy.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
  }
};

const checkCountryNodata = () => {
  let countTemp = 0;
  let countAlert = 0;
  warnDialog.value.reporting = [];
  warnDialog.value.partner = [];
  for (let i = 0; i < countryReportList.value.length; i++) {
    countTemp = 0;
    dataTemp.value.forEach((x) => {
      if (x.reporting == countryReportList.value[i].iso) {
        countTemp++;
      }
    });

    if (countTemp == 0) {
      countAlert++;
      warnDialog.value.reporting.push(countryReportList.value[i]);
    }
  }

  for (let j = 0; j < countryFullList.value.length; j++) {
    countTemp = 0;
    dataTemp.value.forEach((x) => {
      if (x.partner == countryFullList.value[j].iso) {
        countTemp++;
      }
    });

    if (countTemp == 0) {
      countAlert++;
      warnDialog.value.partner.push(countryFullList.value[j]);
    }
  }

  if (countAlert == 0) {
    emit("start-btn", {
      input: input.value,
      countryFullList: countryFullList.value,
      reportingList: countryReportList.value,
    });
  } else {
    warnDialog.value.show = true;
  }
};

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};

const changeYear = () => {
  resetStartBtn();
  checkDataAvailability();
};

const changeInputTypeSustainable = () => {
  input.value.type = "Sustainable";
  emit("change-integration-type", "Sustainable");
  input.value.partner = [];
  input.value.reporting = [];
  countryFullList.value = [];
  countryReportList.value = [];
  loadData();
  loadCountry();
  resetStartBtn();
  checkDataAvailability();
};

const changeInputTypeConventional = () => {
  input.value.type = "Conventional";
  emit("change-integration-type", "Conventional");
  input.value.partner = [];
  input.value.reporting = [];
  countryFullList.value = [];
  countryReportList.value = [];

  loadData();
  loadCountry();
  resetStartBtn();
  checkDataAvailability();
};
const toggleSelectDimension = (index) => {
  let pick = indicatorData.value[index].picked;
  indicatorData.value[index].picked = !pick;
  if (!pick) {
    pickAll.value++;
  } else {
    pickAll.value--;
  }

  indicatorData.value.push(0);
  indicatorData.value.pop();
  input.value.dimensionPicked = indicatorData.value;

  checkDataAvailability();
  resetStartBtn();
};

const showSelectedPartnerList = () => {
  resetStartBtn();
  countryFullList.value = [];
  let countryPartyTemp = [];
  let iso = input.value.partner.map((x) => x.value);

  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let test = [...new Set(countryPartyTemp)];

  test.forEach((x) => {
    let temp = countryAllWorld.filter((y) => y.iso == x);
    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].country,
        iso: temp[0].iso,
      };

      countryFullList.value.push(inputCountry);
    }
  });
  countryFullList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
  checkDataAvailability();
};

const showSelectedReportList = () => {
  resetStartBtn();
  countryReportList.value = [];
  let countryPartyTemp = [];
  let iso = input.value.reporting.map((x) => x.value);

  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let test = [...new Set(countryPartyTemp)];

  test.forEach((x) => {
    let temp = countryAllWorld.filter((y) => y.iso == x);
    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].country,
        iso: temp[0].iso,
      };

      countryReportList.value.push(inputCountry);
    }
  });
  countryReportList.value.sort((a, b) => (a.label > b.label ? 1 : -1));

  checkDataAvailability();
};

const checkDataAvailability = () => {
  if (
    countryReportList.value.length > 0 &&
    countryFullList.value.length > 0 &&
    pickAll.value > 0
  ) {
    id.value = uuidv4();
    let saveData = {
      input: input.value,
      database: "All data",
      type: "SpecificAllData",
      disaggregation: "Dimension",
      key: id.value,
    };
    LocalStorage.clear();
    LocalStorage.set("dataAvail", saveData);
    showDataCircle(true);
  } else {
    showDataCircle(false);
  }
};

const showDataCircle = async (show) => {
  if (show) {
    let dim = [];
    for (let i = 0; i < input.value.dimensionPicked.length; i++) {
      if (input.value.dimensionPicked[i].picked) dim.push(i + 1);
    }
    let dataInput = {
      partner: countryFullList.value.map((x) => x.iso),
      reporting: countryReportList.value.map((x) => x.iso),
      type: input.value.type,
      dimension: dim,
    };

    let dimLength = dim.length;
    let countScore = 0;
    let total = 0;
    let url = serverData.value + "ri/build_circle_build.php";
    let res = await axios.post(url, JSON.stringify(dataInput));

    dataTemp.value = res.data;
    if (dataTemp.value.length > 0) {
      dataTemp.value = dataTemp.value.filter((x) => x.dimall >= dimLength / 2);
    }

    dataInput.partner.forEach((partner) => {
      dataInput.reporting.forEach((reporting) => {
        let tempTable = dataTemp.value.filter(
          (x) => x.reporting == reporting && x.partner == partner
        );

        if (tempTable.length != 0) {
          countScore++;
        }

        if (reporting != partner) {
          total++;
        }
      });
    });
    // return;
    if (total == 0) {
      dataAvailCircleChart.value.score = 0;
    } else {
      dataAvailCircleChart.value.score = Number(
        ((countScore / total) * 100).toFixed(0)
      );
    }
  }
  dataAvailCircleChart.value.isShowChart = show;
};

const resetStartBtn = () => {
  emit("reset-start-btn");
};

const loadData = async () => {
  pickAll.value = 0;
  indicatorData.value = [];
  let data = {
    type: input.value.type,
  };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(data));
  indicatorData.value = res.data;
  indicatorData.value.forEach((x) => (x.picked = false));
  toggleSelectDimension(0);
  toggleSelectDimension(1);
  toggleSelectDimension(2);

  toggleSelectDimension(3);
  toggleSelectDimension(4);
  toggleSelectDimension(5);
  toggleSelectDimension(6);
};

const loadCountry = async () => {
  let tableReport = "";
  let tablePartner = "";
  countryReportOption.value = [];
  countryPartnerOption.value = [];
  if (input.value.type == "Sustainable") {
    tableReport = "ri_eco_build_reporter_sus";
    tablePartner = "ri_eco_build_partner_sus";
  } else {
    tableReport = "ri_eco_build_reporter_con";
    tablePartner = "ri_eco_build_partner_con";
  }

  let url = serverData.value + "ri/build_load_country.php";
  let dataReport = {
    table: tableReport,
  };
  let res1 = await axios.post(url, JSON.stringify(dataReport));

  res1.data.forEach((element) => {
    let tempData = {
      label: element.country,
      value: element.iso,
      disable: element.disable ? true : false,
    };
    countryReportOption.value.push(tempData);
  });

  let dataPartner = {
    table: tablePartner,
  };
  let res2 = await axios.post(url, JSON.stringify(dataPartner));
  res2.data.forEach((element) => {
    let tempData = {
      label: element.country,
      value: element.iso,
      disable: element.disable ? true : false,
    };
    countryPartnerOption.value.push(tempData);
  });
};

const loadPeriod = () => {
  periodSetup.value.min = Number(yearInput.value.min);
  periodSetup.value.max = Number(yearInput.value.max);
  input.value.year.min = Number(yearInput.value.min);
  input.value.year.max = Number(yearInput.value.max);
};
</script>

<style lang="scss" scoped>
.startBtnDiv {
  cursor: pointer;
  width: 280px;
  background-color: #2d9687;
  height: 45px;
  line-height: 45px;
  font-size: 20px;
  color: white;
  border-radius: 5px;
  border: 3px solid #2d9687;
}
.clearAllBtnDiv {
  cursor: pointer;
  width: 280px;
  height: 45px;
  line-height: 45px;
  font-size: 20px;
  color: #757575;
  border-radius: 5px;
  border: 3px solid #2d9687;
}
.countryTag {
  background-color: #dedede;
  color: #626262;
  border-radius: 50px;
  height: 20px;
}

.selectedPartner {
  width: 98%;
  height: 340px;
  border: 1px dashed #c4c4c4;
}
.iconDimension {
  opacity: 0.35;
  transform: scale(0.9);
  width: 100%;
  transition: all 0.2s ease-out;
}
.isPicked {
  opacity: 1;
  transform: scale(1);
  border: 3px solid #2d9687;
}
.showCircular {
  margin: auto;
  height: 240px;
  line-height: 240px;
}
.notShowCircular {
  margin: auto;

  height: 240px;
  border: 1px dashed #cbcbcb;
}

.reportingSelectList {
  width: 98%;
  height: 120px;
  border: 1px dashed #c4c4c4;
  overflow-y: auto;
}

.partnerSelectList {
  margin-top: 10px;
  width: 98%;
  height: 220px;
  border: 1px dashed #c4c4c4;
  overflow-y: auto;
}
.warnBox {
  max-width: 850px;
  width: 750px;
}
</style>
