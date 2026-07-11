<template>
  <div style="background-color: #7a7a7a">
    <div class="mainApp">
      <div><RIHeader :menu="10" /></div>
      <div class="q-pb-lg">
        <div style="font-size: 36px" class="q-py-md text-center">
          Download data
        </div>
        <div class="downloadBox">
          <!-- Integration type -->
          <div class="row q-pt-md q-px-lg">
            <div class="col-4">
              <div style="font-size: 20px"><b>Integration type</b></div>
              <div>Select the desired type of integration</div>
            </div>
            <div class="col-4" style="font-size: 20px">
              <q-item tag="label" v-ripple>
                <q-item-section avatar>
                  <q-radio
                    v-model="integrationType"
                    val="sustainable"
                    color="secondary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Sustainable Integration</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-4" style="font-size: 20px">
              <q-item tag="label" v-ripple>
                <q-item-section avatar>
                  <q-radio
                    v-model="integrationType"
                    val="conventional"
                    color="secondary"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Conventional Integration</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <!-- Database -->
          <div class="row q-pt-md q-px-lg">
            <div class="col-4">
              <div style="font-size: 20px"><b>Database</b></div>
              <div>Select database of interest</div>
            </div>
            <div class="col-4" style="font-size: 20px">
              <q-item tag="label" v-ripple>
                <q-item-section avatar>
                  <q-radio
                    v-model="database"
                    val="digisrii"
                    color="secondary"
                    @update:model-value="inputDatabase"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>DigiSRII</q-item-label>
                  <q-item-label caption
                    >Data restrictions for robustness apply</q-item-label
                  >
                </q-item-section>
              </q-item>
            </div>
            <div class="col-4" style="font-size: 20px">
              <q-item tag="label" v-ripple>
                <q-item-section avatar>
                  <q-radio
                    v-model="database"
                    val="alldata"
                    color="secondary"
                    @update:model-value="inputDatabase"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>All Data</q-item-label>
                  <q-item-label caption>No data restrictions</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <!-- Level of disaggregation -->
          <div class="row q-pt-md q-px-lg">
            <div class="col-4">
              <div style="font-size: 20px"><b>Level of disaggregation</b></div>
              <div>Include all previous disaggregation levels</div>
            </div>
            <div class="col" style="font-size: 20px">
              <q-item tag="label" v-ripple :disable="levelDisable">
                <q-item-section avatar>
                  <q-radio v-model="level" val="pair" color="secondary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Pair</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col" style="font-size: 20px">
              <q-item tag="label" v-ripple :disable="levelDisable">
                <q-item-section avatar>
                  <q-radio v-model="level" val="dimension" color="secondary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Dimension</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col" style="font-size: 20px">
              <q-item tag="label" v-ripple :disable="levelDisable">
                <q-item-section avatar>
                  <q-radio v-model="level" val="indicator" color="secondary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Indicator</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          <div class="row justify-center q-py-lg">
            <q-btn
              label="Download data"
              color="secondary"
              no-caps
              class="btnDownload"
              @click="downloadBtn()"
            />
          </div>
        </div>
      </div>
      <footerMain />
    </div>
  </div>
</template>

<script setup>
import { serverSetup } from "./server.js";
import { ref, onMounted } from "vue";
import RIHeader from "../components/RI_header.vue";
import footerMain from "../components/footer2.vue";
const { serverData } = serverSetup();

const integrationType = ref("sustainable");
const database = ref("digisrii");
const level = ref("pair");
const levelDisable = ref(false);

const inputDatabase = () => {
  if (database.value == "alldata") {
    levelDisable.value = true;
  } else {
    levelDisable.value = false;
  }
};

const downloadBtn = () => {
  const downloadFile = ref("");
  if (integrationType.value == "sustainable") {
    downloadFile.value = "sus-";
  } else {
    downloadFile.value = "con-";
  }

  if (database.value == "digisrii") {
    downloadFile.value += "digi-";
    if (level.value == "pair") {
      downloadFile.value += "pair.zip";
    } else if (level.value == "dimension") {
      downloadFile.value += "dimension.zip";
    } else {
      downloadFile.value += "indicator.zip";
    }
  } else {
    downloadFile.value += "all.zip";
  }
  const urlLoad = serverData.value + "ri_download/" + downloadFile.value;
  window.open(urlLoad);
};
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
  color: #757575;
}
.downloadBox {
  border: 2px solid #757575;
  width: 1000px;
  margin: auto;
  border-radius: 5px;
}

.btnDownload {
  width: 210px;
  font-size: 20px;
}
</style>
