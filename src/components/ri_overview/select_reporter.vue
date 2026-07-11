<template>
  <div class="q-py-xl">
    <div class="row justify-center">
      <div>
        <div class="font-16"><b>Select a group or single economy</b></div>
        <div>To overview integration with the Asia-Pacific Region</div>
      </div>
      <div class="q-pl-xl">
        <q-select
          v-model="reporter"
          :options="countryOption"
          stack-label
          dense
          style="width: 400px"
          outlined
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
          <template v-slot:selected-item="scope">
            <q-item v-if="scope.opt">
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
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { serverSetup } from "../../pages/server.js";
import { countryGroupListRiva2 } from "../../pages/countryGroupList";
const { serverData } = serverSetup();
const countryOption = ref([]);
const reporter = ref([]);
const emit = defineEmits(["country"]);
const countryJsonInput = ref([]);

onMounted(async () => {
  loadData();
});

const loadData = async () => {
  const url = serverData.value + "ri/getEco.php";
  const res = await axios.get(url);
  countryJsonInput.value = res.data;
  countryJsonInput.value.forEach((element) => {
    let tempData = {
      label: element.name,
      value: element.iso,
      disable: element.disable,
    };
    countryOption.value.push(tempData);
    reporter.value = countryOption.value[1];
  });
};

const selectReporter = () => {
  let iso = reporter.value.value;

  let countryOutput = countryGroupListRiva2(iso);
  let dataSend = {
    countryOutput: countryOutput,
    ecoName: reporter.value.label,
  };
  emit("country", dataSend);
};

watch(reporter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    selectReporter();
  }
});

const getFlagUrl = (iso) => {
  return `images/flags/${iso}.png`;
};
</script>

<style lang="scss" scoped></style>
