<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div>
        <RIHeader :menu="6" />
        <div class="content">
          <div class="font-36 q-ma-lg" align="center">Country brief</div>
          <div class="box">
            <div class="row q-px-xl q-pt-md">
              <div class="col-6">
                <div class="q-pt-md font-16"><b>Economy</b></div>
                <div>
                  Please select a economy of interest or a pre-selected group.
                </div>
              </div>
              <div class="col6">
                <div class="q-pt-md">
                  <q-select
                    v-model="input.reporter"
                    :options="countryReportOption"
                    stack-label
                    dense
                    style="width: 400px"
                    outlined
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
                    <template v-slot:selected-item="scope">
                      <q-item v-if="scope.opt">
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
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>
            </div>
            <div class="text-center q-pt-md">
              <q-btn
                class="startBtnDiv"
                no-caps
                @click="generateCountryBrief()"
              >
                Generate
              </q-btn>
            </div>
          </div>
        </div>
        <footerMain />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
import { serverSetup } from "./server";
import axios from "axios";
const { serverData } = serverSetup();
const input = ref({
  reporter: [],
  type: "SI",
});
const countryReportOption = ref([]);

onMounted(() => {
  loadCountry();
});

const loadCountry = async () => {
  countryReportOption.value = [];
  let url = serverData.value + "ri/brief_geteco.php";
  let res = await axios.get(url);
  res.data.forEach((element) => {
    let temp = {
      label: element.name,
      value: element.iso,
      disable: element.disable ? true : false,
    };
    countryReportOption.value.push(temp);
  });
  input.value.reporter = countryReportOption.value[1];
};

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};

const generateCountryBrief = () => {
  let iso = input.value.reporter.value;
  window.open("#/ricountrybrief2/" + iso);
};
</script>

<style lang="scss" scoped>
.mainApp {
  width: 100%;
  max-width: 1400px;
  margin: auto;
  background-color: #fff;
}
.content {
  height: 318px;
}
.font-36 {
  font-size: 36px;
  font-weight: 700;
}
.box {
  border: 2px solid #c4c4c4;
  height: 200px;
  width: 1000px;
  margin: auto;
}
.startBtnDiv {
  cursor: pointer;
  width: 280px;
  background-color: #2d9687;
  height: 45px;

  font-size: 20px;
  color: white;
  border-radius: 5px;
  border: 3px solid #2d9687;
}
</style>
