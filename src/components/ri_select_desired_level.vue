<template>
  <div class="q-py-md" align="center">
    <div class="font-36">Select desired level of disaggregation</div>
    <div class="row justify-center" v-if="selected == 'country'">
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

    <!-- Result of bydimension`` -->
    <div v-show="input.disaggregation == 'dimension'"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  input: {
    type: String,
    required: false,
  },
});
const selected = ref("dimension");
const emit = defineEmits(["change-disaggregation"]);

const selectedCountry = () => {
  selected.value = "country";
  emit("change-disaggregation", "country");
};

const selectedDimension = () => {
  selected.value = "dimension";
  emit("change-disaggregation", "dimension");
};

onMounted(() => {
  selected.value = props.input ? props.input : "dimension";
});

watch(
  () => props.input,
  (newValue) => {
    selected.value = newValue ? newValue : "dimension";
  }
);
</script>

<style lang="scss" scoped>
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
