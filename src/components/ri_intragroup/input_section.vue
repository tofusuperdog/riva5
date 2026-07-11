<template>
  <div class="q-px-xl q-pt-xl">
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
      <div class="col">
        <q-radio
          v-model="input.type"
          val="Conventional"
          label="Conventional integration"
          color="secondary"
          @update:model-value="changeInputTypeConventional()"
        />
      </div>
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
    <div class="q-pt-md font-16"><b>Economies</b></div>
    <div>
      Please select two or more economies of interest or a pre-selected group.
    </div>
    <div>
      <q-select
        v-model="input.partner"
        :options="countryIntraOption"
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
    <div class="selectedPartner relative-position q-pa-sm">
      <div class="font-16"><b>Selected economies</b></div>
      <div class="q-pt-sm">
        <div class="row" style="width: 90%">
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
          <div class="font-14 text-grey-7">Economy(ies):</div>
          <div class="row q-py-sm" v-if="warnDialog.economic.length != 0">
            <div v-for="(item, i) in warnDialog.economic" :key="i">
              <div class="countryTag q-mr-sm q-px-md q-mb-sm">
                {{ item.label }}
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
// import { serverSetup, yearInputShow } from "../../pages/server.js";
import { serverSetup } from "../../pages/server.js";
import { countryGroupListRiva2 } from "../../pages/countryGroupList";
import countryAllWorld from "../../assets/countryAll.json";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { v4 as uuidv4 } from "uuid";
import { LocalStorage, Notify } from "quasar";

// const { yearInput } = yearInputShow();
const { serverData } = serverSetup();
const route = useRoute();
const router = useRouter();
const yearInput = ref({ min: 2010, max: 2020 });
const input = ref({
  partner: [],
  year: {
    min: 2010,
    max: 2018,
  },
  type: "Sustainable",
  disaggregation: "dimension",
});

const periodSetup = ref({
  min: 2010,
  max: 2018,
});
const countryIntraOption = ref([]);
const countryFullList = ref([]);
const dataTemp = ref([]);

const emit = defineEmits([
  "change-integration-type",
  "reset-start-btn",
  "get-input",
  "start-btn",
]);
const warnDialog = ref({
  show: false,
  economic: [],
});

onMounted(async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = Number(result.data[0].yearStart);
  yearInput.value.max = Number(result.data[0].yearEnd);
  periodSetup.value.min = yearInput.value.min;
  periodSetup.value.max = yearInput.value.max;
  loadCountry();
  loadPeriod();
  if (route.name == "riintragroup") {
    preLoad();
  }
});

const loadCountry = async () => {
  let table = "";
  countryIntraOption.value = [];
  if (input.value.type == "sustainable") {
    table = "ri_eco_intra_sus";
  } else {
    table = "ri_eco_intra_con";
  }
  const dataSend = {
    table: table,
  };
  const url = serverData.value + "ri/getEcoDataGroup.php";
  const res = await axios.post(url, JSON.stringify(dataSend));

  countryIntraOption.value = res.data.map((option) => ({
    label: option.name,
    value: option.iso,
    disable: option.disable,
  }));
};

const loadPeriod = () => {
  periodSetup.value.min = yearInput.value.min;
  periodSetup.value.max = yearInput.value.max;
  input.value.year.min = yearInput.value.min;
  input.value.year.max = yearInput.value.max;
};

const preLoad = () => {
  let partnerInput = {
    disable: false,
    label: "ASEAN",
    value: "asean",
  };
  input.value.partner.push(partnerInput);
  showSelectedPartnerList();
  startBtn();
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

const checkDataAvailability = () => {
  if (countryFullList.value.length >= 2) {
    let id = uuidv4();
    let input2 = JSON.parse(JSON.stringify(input.value));
    let saveData = {
      input: input2,
      database: "digi",
      compareType: "group",
      disaggregation: "pair",
      key: id,
    };

    saveData.input.compareType = "group";
    saveData.input.disaggregation = "pair";
    saveData.input.dataBase = "digi";
    LocalStorage.clear();
    LocalStorage.set("dataAvail", saveData);
    emit("get-input", {
      showDataAvailChart: true,
      input: input.value,
      countryFullList: countryFullList.value,
    });
  } else {
    emit("get-input", {
      showDataAvailChart: false,
      input: input.value,
      countryFullList: countryFullList.value,
    });
  }
};

const changeInputTypeSustainable = () => {
  input.value.type = "Sustainable";
  emit("change-integration-type", "Sustainable");
  loadCountry();
  input.value.partner = [];
  countryFullList.value = [];
  resetStartBtn();
  checkDataAvailability();
};

const changeInputTypeConventional = () => {
  input.value.type = "Conventional";
  emit("change-integration-type", "Conventional");
  loadCountry();
  input.value.partner = [];
  countryFullList.value = [];
  resetStartBtn();
  checkDataAvailability();
};

const resetStartBtn = () => {
  emit("reset-start-btn");
};

const changeYear = () => {
  resetStartBtn();
  checkDataAvailability();
};

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};

const clearAllBtn = () => {
  router.push("/reloadpage/riintragroup_clear");
};
const startBtn = () => {
  if (input.value.year.min == input.value.year.max) {
    Notify.create({
      message: "Start and end year can not be the same.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
  }

  if (countryFullList.value.length >= 2) {
    loadDataTemp();
  } else {
    Notify.create({
      message:
        "Please select at least one bilateral relationship with valid data.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
  }
};

const loadDataTemp = async () => {
  let data = {
    economic: countryFullList.value.map((x) => x.iso),
    type: input.value.type,
  };
  let url = serverData.value + "ri/intra_circle_loaddata.php";
  let res = await axios.post(url, JSON.stringify(data));
  dataTemp.value = res.data;
  checkCountryNodata();
};

const checkCountryNodata = () => {
  let countTemp = 0;
  let countAlert = 0;
  warnDialog.value.economic = [];
  for (let j = 0; j < countryFullList.value.length; j++) {
    countTemp = 0;
    dataTemp.value.forEach((x) => {
      if (
        x.partner == countryFullList.value[j].iso ||
        x.reporting == countryFullList.value[j].iso
      ) {
        countTemp++;
      }
    });
    if (countTemp == 0) {
      countAlert++;
      warnDialog.value.economic.push(countryFullList.value[j]);
    }
  }
  if (countAlert == 0) {
    ///////
    emit("start-btn", {
      input: input.value,
      countryFullList: countryFullList.value,
    });
  } else {
    warnDialog.value.show = true;
  }
};

const doNotThing = () => {
  warnDialog.value.show = false;
};

const okInWarnDialog = () => {
  for (let j = 0; j < countryFullList.value.length; j++) {
    let checkEconomic = false;
    warnDialog.value.economic.forEach((partner) => {
      if (partner.iso == countryFullList.value[j].iso) {
        countryFullList.value.splice(j, 1);
        checkEconomic = true;
      }
    });
    if (checkEconomic) {
      j--;
    }
  }
  if (countryFullList.value.length < 2) {
    Notify.create({
      message:
        "Please select at least one bilateral relationship with valid data.",
      color: "negative",
      icon: "fa-solid fa-circle-exclamation",
      position: "top",
    });
    warnDialog.value.show = false;
    return;
  }
  checkDataAvailability();
  warnDialog.value.show = false;
  emit("start-btn", {
    input: input.value,
    countryFullList: countryFullList.value,
  });
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
  display: inline;
  border-radius: 50px;
}

.selectedPartner {
  width: 98%;
  height: 440px;
  border: 1px dashed #c4c4c4;
  overflow-y: auto;
}
.warnMoreThan24 {
  color: #ee0202;
  font-size: 18px;
}
.warnBox {
  max-width: 850px;
  width: 750px;
}
</style>
