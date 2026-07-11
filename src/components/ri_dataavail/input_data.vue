<template>
  <div class="bgInput" align="center">
    <q-card flat class="cardBox">
      <q-tabs
        v-model="input.compareType"
        class="text-grey"
        active-color="secondary"
        indicator-color="secondary"
        align="justify"
        narrow-indicator
        no-caps
        @update:model-value="changeCompareType()"
      >
        <q-tab name="group" label="Economy group" />
        <q-tab name="specific" label="Specific reporter(s) and partner(s)" />

        <q-space style="width: 300px" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="input.compareType" animated>
        <!-- tab1 -->
        <q-tab-panel name="group">
          <div class="row justify-center q-pt-md">
            <div class="col-10">
              <div class="row items-center font-16">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Integration type</div>
                  <div class="font-14">
                    Select the desired type of integration
                  </div>
                </div>
                <div class="col-4 row items-center">
                  <q-radio
                    v-model="input.integration"
                    val="sustainable"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">Sustainable integration</div>
                  </div>
                </div>
                <div class="col-3 items-center row">
                  <q-radio
                    v-model="input.integration"
                    val="conventional"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">Conventional integration</div>
                  </div>
                </div>
              </div>

              <div class="row items-center font-16 q-pt-md">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Database</div>
                  <div class="font-14">Select database of interest</div>
                </div>
                <div class="col-4 row items-center">
                  <q-radio
                    v-model="input.dataBase"
                    val="digi"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div>
                    <div align="left" class="q-pt-lg">
                      <div class="fontW500 font-16">DigiSRII</div>
                    </div>
                    <div class="font-12">
                      Data restrictions for robustness apply
                    </div>
                  </div>
                </div>
                <div class="col-3 row items-center">
                  <q-radio
                    v-model="input.dataBase"
                    val="all"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div>
                    <div align="left" class="q-pt-lg">
                      <div class="fontW500 font-16">All Data</div>
                    </div>
                    <div class="font-12">No data restictions</div>
                  </div>
                </div>
              </div>

              <div class="row items-center font-16 q-pt-md">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Level of disaggregation</div>
                  <div class="font-14">
                    Include all previous disaggregation levels
                  </div>
                </div>
                <div class="col-2 fontW500" align="left">
                  <q-radio
                    v-model="input.disaggregation"
                    val="pair"
                    label="Pair"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
                <div class="col-2 fontW500" align="left">
                  <q-radio
                    v-model="input.disaggregation"
                    val="dimension"
                    label="Dimension"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
                <div class="col-2 fontW500" align="left">
                  <q-radio
                    v-model="input.disaggregation"
                    val="indicator"
                    label="Indicator"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
              </div>

              <div class="q-pt-md" align="left">
                <div class="font-18 fontW700">Economy group</div>
                <div class="font-14">
                  Select two or more economies of interest or a pre-selected
                  group
                </div>
              </div>
              <div class="q-pb-lg">
                <q-select
                  v-model="input.economy"
                  :options="countryOptions"
                  style="width: 100%"
                  multiple
                  use-chips
                  stack-label
                  filled
                  @update:model-value="showSelectedEconomyList()"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section
                        avatar
                        v-if="
                          !scope.opt.disable &&
                          /^[A-Z]{3}$/.test(scope.opt.value)
                        "
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
              <div
                class="selectedBox q-pa-sm"
                style="height: 400px"
                align="left"
              >
                <div class="font-16 fontW700">Selected economy group</div>

                <div class="q-pt-sm">
                  <div class="row">
                    <div
                      class="countryTag q-mr-sm q-px-md q-mb-sm"
                      v-for="(item, index) in countryEconomyList"
                      :key="index"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
        <!-- tab2 -->
        <q-tab-panel name="specific">
          <div class="row justify-center q-pt-md">
            <div class="col-10" align="left">
              <div class="row items-center font-16">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Integration type</div>
                  <div class="font-14">
                    Select the desired type of integration
                  </div>
                </div>
                <div class="col-4 row items-center">
                  <q-radio
                    v-model="input.integration"
                    val="sustainable"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">Sustainable integration</div>
                  </div>
                </div>
                <div class="col-3 items-center row">
                  <q-radio
                    v-model="input.integration"
                    val="conventional"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">Conventional integration</div>
                  </div>
                </div>
              </div>

              <div class="row items-center font-16 q-pt-md">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Database</div>
                  <div class="font-14">Select database of interest</div>
                </div>
                <div class="col-4 row items-center">
                  <q-radio
                    v-model="input.dataBase"
                    val="digi"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">DigiSRII</div>
                  </div>
                </div>
                <div class="col-3 row items-center">
                  <q-radio
                    v-model="input.dataBase"
                    val="all"
                    color="secondary"
                    @update:model-value="reloadCountry()"
                  />
                  <div align="left">
                    <div class="fontW500 font-16">All Data</div>
                  </div>
                </div>
              </div>
              <div class="row items-center q-pt-md font-16">
                <div class="col-4" align="left">
                  <div class="font-16 fontW700">Level of disaggregation</div>
                  <div class="font-14">
                    Include all previous disaggregation levels
                  </div>
                </div>
                <div class="col-2 fontW500">
                  <q-radio
                    v-model="input.disaggregation"
                    val="pair"
                    label="Pair"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
                <div class="col-2 fontW500">
                  <q-radio
                    v-model="input.disaggregation"
                    val="dimension"
                    label="Dimension"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
                <div class="col-2 fontW500">
                  <q-radio
                    v-model="input.disaggregation"
                    val="indicator"
                    label="Indicator"
                    color="secondary"
                    @update:model-value="resetStartBtn()"
                  />
                </div>
              </div>
              <div class="q-pt-md">
                <div class="font-18 fontW700">
                  <b>Reporting economy</b>
                </div>
                <div>
                  Select one, many or pre-selected group of patner economies of
                  interest.
                </div>
              </div>
              <div>
                <q-select
                  v-model="input.reporting"
                  :options="countryOptionsReporter"
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
                        v-if="
                          !scope.opt.disable &&
                          /^[A-Z]{3}$/.test(scope.opt.value)
                        "
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

              <div class="q-pt-md">
                <div class="font-18 fontW700">Partner economy</div>
                <div class="font-14">
                  Select one, many or a pre-selected group of partner economies
                  of interest.
                </div>
              </div>
              <div class="q-pb-lg">
                <q-select
                  v-model="input.partner"
                  :options="countryOptionsPartner"
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
                        v-if="
                          !scope.opt.disable &&
                          /^[A-Z]{3}$/.test(scope.opt.value)
                        "
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
              <div class="selectedBox q-pa-sm" style="height: 140px">
                <div class="font-16 fontW700">Selected reporting economy</div>

                <div class="q-pt-sm">
                  <div class="row">
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
              <br />
              <div class="selectedBox q-pa-sm" style="height: 180px">
                <div class="font-16 fontW700">Selected partner economy</div>

                <div class="q-pt-sm">
                  <div class="row">
                    <div
                      class="countryTag q-mr-sm q-px-md q-mb-sm"
                      v-for="(item, index) in countryPartnerList"
                      :key="index"
                    >
                      {{ item.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <div class="q-py-lg row justify-center" align="center" style="width: 100%">
      <div class="clearAllBtnDiv" @click="clearAllBtn()">Clear all</div>
      <div style="width: 150px"></div>
      <div class="startBtnDiv" @click="startBtnSendInput()">Start</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { serverSetup } from "../../pages/server";
import { countryGroupListRiva2 } from "../../pages/countryGroupList";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const props = defineProps({
  dataSend: Object,
});

const { serverData } = serverSetup();
const countryOptions = ref([]);
const countryOptionsPartner = ref([]);
const countryTempReporter = ref([]);
const countryTempPartner = ref([]);
const countryOptionsReporter = ref([]);
const countryPartnerList = ref([]);
const countryReportList = ref([]);
const countryEconomyList = ref([]);

const input = ref({
  integration: "sustainable",
  dataBase: "digi",
  compareType: "group",
  disaggregation: "pair",
  partner: [],
  reporting: [],
  economy: [],
  type: "Economy group",
});

const emit = defineEmits(["reset-start-btn", "start-btn"]);

onBeforeMount(() => {
  if (props.dataSend.length != 0) {
    input.value = props.dataSend.input;
  }
});

onMounted(async () => {
  await loadCountry();

  if (props.dataSend && props.dataSend.length != 0) {
    loadInput();
  }
});

const clearAllBtn = () => {
  router.push("/reloadpage/ridataavail");
};

const startBtnSendInput = () => {
  if (input.value.compareType == "group") {
    emit("start-btn", {
      input: input.value,
      partner: countryEconomyList.value,
      report: countryEconomyList.value,
    });
  } else {
    emit("start-btn", {
      input: input.value,
      partner: countryPartnerList.value,
      report: countryReportList.value,
    });
  }
};
const changeCompareType = () => {
  reloadCountry();
};
const reloadCountry = () => {
  countryEconomyList.value = [];
  input.value.economy = [];
  input.value.reporting = [];
  input.value.partner = [];
  countryPartnerList.value = [];
  countryReportList.value = [];

  loadCountry();
  resetStartBtn();
};

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};

const loadCountry = async () => {
  if (props.dataSend.compareType) {
    input.value.compareType = props.dataSend.compareType;
  } else {
    // console.log(input.value.compareType);
    // input.value.compareType = "group"; // หรือค่า default ที่คุณต้องการ
  }

  if (input.value.compareType == "group") {
    let tableGroup = "";
    countryOptions.value = [];
    if (input.value.dataBase == "digi") {
      if (input.value.integration == "sustainable") {
        tableGroup = "ri_data_digi_sus";
      } else {
        tableGroup = "ri_data_digi_con";
      }
    } else {
      if (input.value.integration == "sustainable") {
        tableGroup = "ri_data_all_sus";
      } else {
        tableGroup = "ri_data_all_con";
      }
    }

    let dataTemp = {
      table: tableGroup,
    };
    let url = serverData.value + "ri/data_load_country.php";
    let res = await axios.post(url, JSON.stringify(dataTemp));

    res.data.forEach((element) => {
      let tempData = {
        label: element.country,
        value: element.iso,
        disable: element.disable ? true : false,
      };
      countryOptions.value.push(tempData);
    });
  } else {
    let tableReporter = "";
    let tablePartner = "";
    countryOptionsPartner.value = [];
    countryOptionsReporter.value = [];
    if (input.value.dataBase == "digi") {
      if (input.value.integration == "sustainable") {
        tableReporter = "ri_data_spec_digi_report_sus";
        tablePartner = "ri_data_spec_digi_partner_sus";
      } else {
        tableReporter = "ri_data_spec_digi_report_con";
        tablePartner = "ri_data_spec_digi_partner_con";
      }
    } else {
      if (input.value.integration == "sustainable") {
        tableReporter = "ri_data_spec_all_report_sus";
        tablePartner = "ri_data_spec_all_partner_sus";
      } else {
        tableReporter = "ri_data_spec_all_report_con";
        tablePartner = "ri_data_spec_all_partner_con";
      }
    }

    let url = serverData.value + "ri/data_load_country.php";
    let dataReporter = {
      table: tableReporter,
    };
    let dataPartner = {
      table: tablePartner,
    };
    let resReporter = await axios.post(url, JSON.stringify(dataReporter));
    resReporter.data.forEach((element) => {
      let tempData = {
        label: element.country,
        value: element.iso,
        disable: element.disable ? true : false,
      };
      countryOptionsReporter.value.push(tempData);
    });

    let resPartner = await axios.post(url, JSON.stringify(dataPartner));
    resPartner.data.forEach((element) => {
      let tempData = {
        label: element.country,
        value: element.iso,
        disable: element.disable ? true : false,
      };
      countryOptionsPartner.value.push(tempData);
    });
  }
};
const showSelectedEconomyList = () => {
  resetStartBtn();
  countryEconomyList.value = [];
  let countryPartyTemp = [];
  let iso = input.value.economy.map((x) => x.value);

  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let test = [...new Set(countryPartyTemp)];

  test.forEach((x) => {
    let temp = countryOptions.value.filter((y) => y.value == x);
    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].label,
        iso: temp[0].value,
      };

      countryEconomyList.value.push(inputCountry);
    }
  });
  countryEconomyList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
};

const showSelectedPartnerList = () => {
  resetStartBtn();

  countryPartnerList.value = [];
  let countryPartyTemp = [];
  let iso = input.value.partner.map((x) => x.value);

  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let test = [...new Set(countryPartyTemp)];

  test.forEach((x) => {
    let temp = countryOptionsPartner.value.filter((y) => y.value == x);

    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].label,
        iso: temp[0].value,
      };
      countryPartnerList.value.push(inputCountry);
    }
  });
  countryPartnerList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
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
    let temp = countryOptionsReporter.value.filter((y) => y.value == x);
    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].label,
        iso: temp[0].value,
      };
      countryReportList.value.push(inputCountry);
    }
  });
  countryReportList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
};

const resetStartBtn = () => {
  emit("reset-start-btn");
};

const loadInput = () => {
  input.value.integration = props.dataSend.input.type.toLowerCase();
  if (props.dataSend.compareType == "group") {
    input.value.economy = props.dataSend.input.partner;
    showSelectedEconomyList();
  } else if (props.dataSend.type == "Specific") {
    input.value.compareType = "specific";
    input.value.partner = props.dataSend.input.partner;
    input.value.reporting = props.dataSend.input.reporting;

    showSelectedPartnerList();
    showSelectedReportList();
  } else if (props.dataSend.type == "SpecificAllData") {
    input.value.compareType = "specific";
    input.value.partner = props.dataSend.input.partner;
    input.value.reporting = props.dataSend.input.reporting;
    input.value.disaggregation = "dimension";
    input.value.dataBase = "all";
    showSelectedPartnerList();
    showSelectedReportList();
  }
};

const showSelectedGroupList = () => {
  resetStartBtn();
  countryPartnerList.value = [];
  let countryPartyTemp = [];
  let iso = input.value.partner.map((x) => x.value);
  iso.forEach((isoData) => {
    let tempList = countryGroupListRiva2(isoData);
    countryPartyTemp = countryPartyTemp.concat(tempList);
  });
  let test = [...new Set(countryPartyTemp)];

  test.forEach((x) => {
    let temp = countryOptions.value.filter((y) => y.value == x);
    if (temp.length > 0) {
      let inputCountry = {
        label: temp[0].label,
        iso: temp[0].value,
      };
      countryPartnerList.value.push(inputCountry);
    }
    countryPartnerList.value.sort((a, b) => (a.label > b.label ? 1 : -1));
  });
};
</script>

<style lang="scss" scoped>
.fontW500 {
  font-weight: 500;
}
.fontW700 {
  font-weight: 700;
}
.cardBox {
  border: 2px solid #c4c4c4;
  width: 90%;
  height: 950px;
}
.selectedBox {
  width: 100%;
  height: 220px;
  border: 1px dashed #c4c4c4;
  overflow-y: auto;
}
.countryTag {
  background-color: #dedede;
  color: #626262;
  display: inline;
  border-radius: 50px;
}
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
.bgInput {
  width: 100%;
}
</style>
