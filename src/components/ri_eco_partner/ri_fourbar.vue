<template>
  <div class="q-pa-md">
    <!-- bar#1 -->
    <div class="q-pt-sm font-24 q-pl-md" align="center">
      {{ fourBarName }}'s <span v-if="type === 'Sustainable'">sustainable</span
      ><span v-else>conventional</span> integration score {{ partner }} in
      {{ year }} was
      <span class="text-green"
        ><b>{{ score }}</b></span
      >
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// Define props
const props = defineProps({
  dataSend: Object,
});
const data = ref([]);
const type = ref("");
const partner = ref("");
const year = ref("");
const fourBarName = ref("");
const score = ref(0);

// Methods
const calYourGroupScore = () => {
  const temp = data.value.filter((x) => x.own);
  if (temp.length > 0) {
    score.value = temp[0].value;
  }
};

// Watchers
watch(
  () => props.dataSend,
  (newValue) => {
    if (newValue) {
      data.value = props.dataSend.data;
      type.value = props.dataSend.type;
      partner.value = props.dataSend.partner;
      year.value = props.dataSend.year;
      fourBarName.value = props.dataSend.name;
      calYourGroupScore();
    }
  }
);
</script>

<style lang="scss" scoped>
.grayBar {
  height: 30px;
  width: 100%;
  background-color: #ededed;
}
.blueBar {
  height: 30px;
  width: 50%;
  background-color: #2381b8;
  line-height: 30px;
  color: white;
  text-align: right;
}
.greenBar {
  height: 30px;
  width: 50%;
  background-color: #ff9800;
  line-height: 30px;
  color: white;
  text-align: right;
}
.textOrange {
  font-weight: bold;
  color: #ff9800;
}
</style>
