<template>
  <div class="col q-px-xl q-pt-xl">
    <div class="row">
      <div class="col-4">
        <div class="font-16"><b>Integration type</b></div>
        <div>Select the desired type of integration</div>
      </div>
      <div class="col-3">
        <q-radio
          v-model="input.type"
          val="Sustainable"
          label="Sustainable integration"
          color="secondary"
          @update:model-value="changeInputTypeSustainable()"
        />
      </div>
      <q-radio
        v-model="input.type"
        val="Conventional"
        label="Conventional integration"
        color="secondary"
        @update:model-value="changeInputTypeConventional()"
      />
    </div>
    <br />
    <div class="font-16"><b>Period</b></div>
    <div class="q-pt-md" align="center">
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
      Please select one, many or a pre-selected group of reporting economies of
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
    <div class="row">
      <div class="col-4">
        <div class="font-16 q-pt-sm"><b>Disaggregation results by</b></div>
      </div>
      <div class="col-3">
        <q-radio
          v-model="input.resultBy"
          val="Reporter"
          label="Partner"
          color="secondary"
          @update:model-value="changeYear()"
        />
      </div>
      <q-radio
        v-model="input.resultBy"
        val="Partner"
        label="Reporter"
        color="secondary"
        @update:model-value="changeYear()"
      />
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
    <div class="q-py-lg row justify-evenly" align="center" style="width: 100%">
      <div class="clearAllBtnDiv" @click="clearAllBtn()">Clear all</div>
      <div class="startBtnDiv" @click="startBtn()">Start</div>
    </div>
    <!-- dialog  check data lag -->
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
</template>

<script setup>
import { onMounted, ref } from "vue";
// import { serverSetup, yearInputShow } from "../../pages/server";
import { serverSetup } from "../../pages/server";
import countryAllWorld from "../../assets/countryAll.json";
import { countryGroupListRiva2 } from "../../pages/countryGroupList";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { LocalStorage, Notify } from "quasar";
import { v4 as uuidv4 } from "uuid";
const { serverData } = serverSetup();
// const { yearInput } = yearInputShow();
const yearInput = ref({ min: 2010, max: 2020 });
const route = useRoute();
const router = useRouter();

const props = defineProps({
  dataSendInput: {
    type: Object,
    require: false,
  },
});

const countryOptions = ref([]);
const countryReportOption = ref([]);
const countryPartnerOption = ref([]);
const countryFullList = ref([]);
const countryReportList = ref([]);
const dataTemp = ref([]);
const setInput = ref(false);

const periodSetup = ref({
  min: 2010,
  max: 2018,
});

const input = ref({
  partner: [],
  reporting: [],
  year: {
    min: 2010,
    max: 2018,
  },
  type: "Sustainable",
  disaggregation: "dimension",
  resultBy: "Reporter",
});

const warnDialog = ref({
  show: false,
  reporting: [],
  partner: [],
});

const emit = defineEmits([
  "change-integration-type",
  "reset-start-btn",
  "show-dataavail-chart",
  "start-btn",
]);

onMounted(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = Number(result.data[0].yearStart);
  yearInput.value.max = Number(result.data[0].yearEnd);
  if (props.dataSendInput != undefined) {
    input.value = props.dataSendInput.input;
    setInput.value = props.dataSendInput.setInput;
  }
  await loadCountry();
  await loadPeriod();
  if (route.name == "rieconomypartner") {
    if (setInput.value) {
      let temp = [];
      temp.push({
        label: input.value.reporting.label,
        value: input.value.reporting.iso,
      });
      input.value.reporting = temp;
      let tempPartner = [];
      input.value.partner.forEach((x) => {
        let tempx = {
          label: x.label,
          value: x.iso,
        };
        tempPartner.push(tempx);
      });
      input.value.partner = tempPartner;
      showSelectedPartnerList();
      showSelectedReportList();
    } else {
      let reportingTemp = {
        disable: false,
        label: "ASEAN",
        value: "asean",
      };
      input.value.reporting.push(reportingTemp);
      showSelectedReportList();
      let partnerTemp = {
        disable: false,
        label: "RCEP",
        value: "rcep",
      };
      input.value.partner.push(partnerTemp);
      showSelectedPartnerList();
      checkDataAvailability();
      startBtn();
    }
  }
});

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

const doNotThing = () => {
  warnDialog.value.show = false;
};

const clearAllBtn = () => {
  router.push("/reloadpage/riecopartner_clear");
};

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};

const changeYear = () => {
  checkDataAvailability();
  resetStartBtn();
};

const changeInputTypeSustainable = () => {
  input.value.type = "Sustainable";
  emit("change-integration-type", "Sustainable");
  loadCountry();
  input.value.partner = [];
  input.value.reporting = null;
  countryReportList.value = [];
  countryFullList.value = [];
  resetStartBtn();
  checkDataAvailability();
};

const changeInputTypeConventional = () => {
  input.value.type = "Conventional";
  emit("change-integration-type", "Conventional");
  loadCountry();
  input.value.partner = [];
  input.value.reporting = null;
  countryReportList.value = [];
  countryFullList.value = [];
  resetStartBtn();
  checkDataAvailability();
};

const showSelectedPartnerList = () => {
  resetStartBtn();
  countryFullList.value = [];
  let countryPartyTemp = [];
  if (input.value.partner && input.value.partner.length > 0) {
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
      // }
    });
    countryFullList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
    checkDataAvailability();
  }
};

const showSelectedReportList = () => {
  resetStartBtn();
  countryReportList.value = [];

  let countryPartyTemp = [];

  if (input.value.reporting && input.value.reporting.length > 0) {
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
  }
  countryReportList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
  checkDataAvailability();
};

const checkDataAvailability = () => {
  if (countryReportList.value.length > 0 && countryFullList.value.length > 0) {
    let id = uuidv4();
    let input2 = JSON.parse(JSON.stringify(input.value));
    let saveData = {
      input: input2,
      database: "DigiSRII",
      type: "Specific",
      disaggregation: "Pair",
      key: id,
    };
    saveData.input.dataBase = "digi";
    LocalStorage.clear();
    LocalStorage.set("dataAvail", saveData);
    emit("show-dataavail-chart", {
      showDataAvailChart: true,
      input: input.value,
      partner: countryFullList.value,
      report: countryReportList.value,
    });
  } else {
    emit("show-dataavail-chart", {
      showDataAvailChart: false,
      input: input.value,
      partner: countryFullList.value,
      report: countryReportList.value,
    });
  }
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
  if (countryReportList.value.length > 0 && countryFullList.value.length > 0) {
    loadDataTemp();
  } else {
    Notify.create({
      message: "Please select Reporting economy and Partner economy",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
  }
};
const loadDataTemp = async () => {
  let data = {
    partner: countryFullList.value.map((x) => x.iso),
    reporting: countryReportList.value.map((x) => x.iso),
    type: input.value.type,
  };
  let url = serverData.value + "ri/econ_circle_loaddata.php";
  let res = await axios.post(url, JSON.stringify(data));
  dataTemp.value = res.data;
  checkCountryNodata();
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

const resetStartBtn = () => {
  emit("reset-start-btn");
};
const loadCountry = async () => {
  let countryReportInput = [];
  let countryPartnerInput = [];

  countryReportOption.value = [];
  countryPartnerOption.value = [];
  if (input.value.type == "Conventional") {
    let urlCon2 = serverData.value + "ri/getEcoReportCon.php";
    let resCon2 = await axios.get(urlCon2);
    countryReportInput = resCon2.data;

    let urlCon = serverData.value + "ri/getEcoPartnerCon.php";
    let resCon = await axios.get(urlCon);
    countryPartnerInput = resCon.data;
  } else {
    let urlSus2 = serverData.value + "ri/getEcoReportSus.php";
    let resSus2 = await axios.get(urlSus2);
    countryReportInput = resSus2.data;

    let urlSus = serverData.value + "ri/getEcoPartnerSus.php";
    let resSus = await axios.get(urlSus);
    countryPartnerInput = resSus.data;
  }

  countryReportInput.forEach((element) => {
    let tempData = {
      label: element.name,
      value: element.iso,
      disable: element.disable ? true : false,
    };
    countryReportOption.value.push(tempData);
  });

  countryPartnerInput.forEach((element) => {
    let tempData = {
      label: element.name,
      value: element.iso,
      disable: element.disable ? true : false,
    };
    countryPartnerOption.value.push(tempData);
  });
};

const loadPeriod = () => {
  periodSetup.value.min = yearInput.value.min;
  periodSetup.value.max = yearInput.value.max;
  input.value.year.min = yearInput.value.min;
  input.value.year.max = yearInput.value.max;
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
.reportingSelectList {
  width: 98%;
  height: 120px;
  border: 1px dashed #c4c4c4;
  overflow-y: auto;
}
// .selectedPartner {
//   width: 98%;
//   height: 340px;
//   border: 1px dashed #c4c4c4;
// }
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
