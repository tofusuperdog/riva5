<template>
  <div>
    <div style="font-size: 36px" class="text-center">
      Select desired level of disaggregation
    </div>
    <div class="q-pb-md">
      <div class="row justify-center" v-if="disaggregation == 'country'">
        <q-btn class="unSelectedBtn" no-caps @click="selectedDimension()">
          <q-icon left size="40px" class="fas fa-chart-pie" />
          <div class="font-24">By dimension</div>
        </q-btn>

        <div style="width: 5px"></div>
        <q-btn class="selectedBtn" no-caps>
          <q-icon color="" left size="40px" class="fas fa-globe" />
          <div class="font-24">By economy</div>
        </q-btn>
      </div>
      <div class="row justify-center" v-else>
        <q-btn class="selectedBtn" no-caps>
          <q-icon left size="40px" class="fas fa-chart-pie" />
          <div class="font-24">By dimension</div>
        </q-btn>
        <div style="width: 5px"></div>

        <q-btn class="unSelectedBtn" no-caps @click="selectedCountry()">
          <q-icon color="" left size="40px" class="fas fa-globe" />
          <div class="font-24">By economy</div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  disaggregation: {
    type: String,
    required: true,
  },
});
const selected = ref("dimension");
const emit = defineEmits(["change-disaggregation"]);

const selectedDimension = () => {
  selected.value = "dimension";
  emit("change-disaggregation", "dimension");
};

const selectedCountry = () => {
  selected.value = "country";
  emit("change-disaggregation", "country");
};
</script>

<style lang="scss" scoped>
.font-24 {
  font-size: 24px;
}
.selectedBtn {
  color: white;
  font-weight: 400;
  width: 335px;
  height: 65px;
  background: #2d9687;
}
.unSelectedBtn {
  width: 335px;
  height: 65px;
  background: white;
  border: 2px solid #2d9687;
  color: #2d9687;
}
</style>
