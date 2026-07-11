<template>
  <div>
    <div
      class="text-black"
      style="font-weight: 400; font-size: 18px; width: 650px; margin: auto"
      align="center"
    >
      <div v-if="ecoName == 'Asia-Pacific'">
        How have different integration dimensions in {{ ecoName }} progressed
        across periods?<br />
        Conventional and sustainable integration ({{ year1 }} vs {{ year2 }})
      </div>
      <div v-if="ecoName != 'Asia-Pacific'">
        How have different dimensions in {{ ecoName }}'s integration with
        Asia-Pacific progressed across periods?<br />
        Conventional and sustainable integration (2010-14 vs 2015-19)
      </div>
    </div>
    <div class="row q-pt-md">
      <div class="col q-pt-sm" align="right">
        <div v-for="n in 7" :key="n">
          <dim-line-left
            :topValue="con2010_14C[n - 1]"
            :LowerValue="con2015_19C[n - 1]"
          />

          <div class="brakeChart"></div>
        </div>
      </div>

      <div style="width: 80px">
        <img src="images/dimicon.svg" alt="" />
      </div>
      <div class="col q-pt-sm" align="right">
        <div v-for="n in 7" :key="n">
          <dim-line-right
            :topValue="con2010_14[n - 1]"
            :LowerValue="con2015_19[n - 1]"
          />
          <div class="brakeChart"></div>
        </div>
      </div>
    </div>
    <div class="row" style="width: 600px; margin: auto">
      <div class="col-6 row justify-center">
        <div class="row">
          <div class="box1"></div>
          <div class="q-pl-md">{{ year1 }} Conventional Integration</div>
        </div>
        <div class="row">
          <div class="box2"></div>
          <div class="q-pl-md">{{ year2 }}Conventional Integration</div>
        </div>
      </div>

      <div class="col-6 row justify-center">
        <div class="row">
          <div class="box3"></div>
          <div class="q-pl-md">{{ year1 }} Sustainable Integration</div>
        </div>
        <div class="row">
          <div class="box4"></div>
          <div class="q-pl-md">{{ year2 }} Sustainable Integration</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
// import { yearInputShow } from "../../pages/server.js";
import dimLineLeft from "./dim_lineleft.vue";
import dimLineRight from "./dim_lineright.vue";
import { serverSetup } from "../../pages/server.js";
import axios from "axios";
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  data1: {
    type: Array,
    required: true,
  },
  data2: {
    type: Array,
    required: true,
  },
  data3: {
    type: Array,
    required: true,
  },
  data4: {
    type: Array,
    required: true,
  },
  ecoName: {
    type: String,
    required: true,
  },
});
// const { yearInput } = yearInputShow();
const { serverData } = serverSetup();
const yearInput = ref({ min: 2010, max: 2020 });
const ampChart = ref(200);
const con2010_14 = ref([]);
const con2015_19 = ref([]);
const con2010_14C = ref([]);
const con2015_19C = ref([]);
const year1 = ref("");
const year2 = ref("");

// เพิ่ม watch เพื่อตรวจสอบการเปลี่ยนแปลง
watch(
  () => ({
    data: props.data,
    data1: props.data1,
    data2: props.data2,
    data3: props.data3,
    data4: props.data4,
    ecoName: props.ecoName,
  }),
  (newVal) => {
    const { data, data1, data2, data3, data4, ecoName } = newVal;

    if (
      data.length > 0 &&
      data1.length > 0 &&
      data2.length > 0 &&
      data3.length > 0 &&
      data4.length > 0 &&
      ecoName.length > 0
    ) {
      con2010_14.value = props.data1;
      con2015_19.value = props.data2;
      con2010_14C.value = props.data3;
      con2015_19C.value = props.data4;
    }
  },
  { deep: true, immediate: true }
);

onMounted(async () => {
  yearLabel();
});

const yearLabel = async () => {
  let url = serverData.value + "ri/getYear.php";
  let result = await axios.get(url);
  yearInput.value.min = result.data[0].yearStart;
  yearInput.value.max = result.data[0].yearEnd;

  let yearStart = Number(yearInput.value.min);
  let yearEnd = Number(yearInput.value.max);
  let yearHL = Math.floor((yearStart + yearEnd) / 2);
  let yearHH = Math.ceil((yearStart + yearEnd) / 2);
  year1.value = yearStart + "-" + yearHL.toString().substr(2);
  year2.value = yearHH + "-" + yearEnd.toString().substr(2);
};
</script>

<style lang="scss" scoped>
.brakeChart {
  height: 21px;
}
.box1 {
  width: 20px;
  height: 20px;
  background-color: #1f81b8;
}
.box2 {
  width: 20px;
  height: 20px;
  background-color: #113f5a;
}
.box3 {
  width: 20px;
  height: 20px;
  background-color: #f5b283;
}
.box4 {
  width: 20px;
  height: 20px;
  background-color: #c55a0f;
}
</style>
