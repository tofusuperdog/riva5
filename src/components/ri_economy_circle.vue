<template>
  <div class="q-px-md">
    <br />
    <div class="font-16"><b>Data availability</b></div>
    <div>
      Based on your selection, this group’s integration score will be based on
    </div>
    <br />
    <div class="q-px-md" align="center">
      <div class="notShowCircular" v-if="!isShowChart">
        <div style="height: 40%"></div>
        <div class="" align="center" style="width: 80%">
          Select your desired group of economies to<br />
          check data availability.
        </div>
      </div>
      <div class="showCircular" v-else>
        <q-circular-progress
          show-value
          font-size="36px"
          :value="score"
          size="200px"
          :thickness="0.36"
          color="orange"
          track-color="grey-5"
        >
          {{ score }}%
        </q-circular-progress>
      </div>
    </div>
    <br />
    <div align="center">of all possible reporter-partner pairs.</div>
    <div
      align="center"
      class="q-pb-md cursor-pointer"
      v-if="isShowChart"
      @click="goToURL"
    >
      <u>Click here to see this group’s availabilitiy matrix</u>
    </div>
    <div v-else class="q-pb-md">&nbsp;</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
// import { useRoute, useRouter } from "vue-router";
import { defineProps } from "vue";

const props = defineProps({
  score: Number,
  isShowChart: Boolean,
});

const $q = useQuasar();
// const router = useRouter();
const id = ref("");

const goToURL = () => {
  let dataGet = $q.localStorage.getItem("dataAvail");
  id.value = dataGet.key;
  window.open(`#/ridataavailability/${id.value}`).focus();
};
</script>

<style lang="scss" scoped>
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
</style>
