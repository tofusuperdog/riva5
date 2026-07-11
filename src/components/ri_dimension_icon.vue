<template>
  <div class="q-pa-md">
    <div class="font-16 row">
      <div>
        <b>{{ type }} Integration dimensions (all included)</b>
      </div>
      <div class="q-px-md">
        <q-icon name="fas fa-question-circle" size="24px">
          <q-tooltip>
            In DigiSRII 2.0 all dimensions are included <br />by default. To
            peruse specific dimensions <br />
            head on to the section “Build you own”
          </q-tooltip>
        </q-icon>
      </div>
    </div>
    <div>Hover to reveal included indicators.</div>
    <!-- Sustainable integration icon -->
    <div class="q-pt-sm" style="width: 400px; margin: auto">
      <div class="q-pt-sm row justify-start">
        <div
          class="col-4 q-pt-sm"
          v-for="(item, index) in indicatorData"
          :key="index"
        >
          <q-img :src="filePic(item.icon)" alt="" class="iconDimension">
            <q-tooltip>
              {{ item.name }} integration<br />
              <div v-for="(item2, index2) in item.indicator" :key="index2">
                - {{ item2 }}
              </div>
            </q-tooltip>
          </q-img>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { serverSetup } from "../pages/server";
import axios from "axios";

const { serverData } = serverSetup();
// Props
const props = defineProps({
  type: String,
});

const indicatorData = ref([]);
// Replace with your actual API base URL

const filePic = (fileName) => `${serverData.value}pic/${fileName}`;

const loadData = async () => {
  indicatorData.value = [];
  let data = { type: props.type };
  let url = serverData.value + "ri/dimension_icon.php";
  let res = await axios.post(url, JSON.stringify(data));
  indicatorData.value = res.data;
};

// Watch for changes in type prop
watch(
  () => props.type,
  () => {
    loadData();
  }
);

// Load data on component mount
onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.iconDimension {
  width: 120px;
  border: 3px solid #2d9687;
}
</style>
