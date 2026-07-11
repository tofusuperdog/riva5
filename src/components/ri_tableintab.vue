<template>
  <div style="width: 1200px" class="font-14">
    <div class="row font-14">
      <div class="col-5 headerTable q-pl-md" align="left">Indicator name</div>
      <div class="col-2 headerTable2">Maximum<br />(score = 1)</div>
      <div class="col-2 headerTable2">Minimum<br />(score = 0)</div>
      <div class="col-3 headerTable">Unit of measurement</div>
    </div>
    <!-- {{ dimension }} {{ type }} -->
    <div class="row q-pt-sm" v-for="(item, index) in dataGen" :key="index">
      <div class="col-5 q-pl-md" align="left">
        {{ item.indi }}
      </div>
      <div class="col-2">{{ item.max }}</div>
      <div class="col-2">{{ item.min }}</div>
      <div class="col-3">{{ item.unit }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
const props = defineProps({
  dimension: {
    type: Number,
    require: true,
  },
  type: {
    type: String,
    require: true,
  },
});

const dataGen = ref([]);

const setDataGen = () => {
  if (props.type == "Sustainable") {
    if (props.dimension == 1) {
      dataGen.value = [
        {
          indi: "Environmental goods exports to GDP",
          max: "≥ 0.44%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Environmental goods imports to GDP",
          max: "≥ 0.8%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Tariffs on environmental goods imports",
          max: "0.00%",
          min: "≥ 20.31%",
          unit: "Percentage (symmetric)",
        },
        {
          indi: "Employment created by DVA",
          max: "96.22%",
          min: "≤ 36.9%",
          unit: "Percentage",
        },
      ];
    } else if (props.dimension == 2) {
      dataGen.value = [
        {
          indi: "Real exchange rate volatility",
          max: "0.00%",
          min: "≥ 0.34",
          unit: "Unitless (symmetric)",
        },
        {
          indi: "Environmental goods imports to GDP",
          max: "≥ 0.8",
          min: "0.05",
          unit: "Unitless [between 0 and 1]",
        },
        {
          indi: "Tariffs on environmental goods imports",
          max: "1.04",
          min: "0.00",
          unit: "Unitless",
        },
      ];
    } else if (props.dimension == 3) {
      dataGen.value = [
        {
          indi: "Environmental goods export complementarity index",
          max: "≥ 0.74",
          min: "≤ 0.03",
          unit: "Unitless [between 0 and 1]",
        },
        {
          indi: "Sustainable Value Chain participation index",
          max: "≥ 0.2%",
          min: "0.00",
          unit: "Percentage",
        },
        {
          indi: "Exports of intermediates per unit of CO2",
          max: "≥ 8932.36",
          min: "161.96",
          unit: "USD $ / Tonne of CO2",
        },
      ];
    } else if (props.dimension == 4) {
      dataGen.value = [
        {
          indi: "Avg. rural access to electricity",
          max: "100%",
          min: "≤ 13.18%",
          unit: "Percentage",
        },
        {
          indi: "Sustainable trade facilitation implementation",
          max: "≥ 69.49%",
          min: "0.00%",
          unit: "Percentage",
        },
        {
          indi: "Avg. share of Internet users",
          max: "97.93%",
          min: "0.13%",
          unit: "Percentage",
        },
      ];
    } else if (props.dimension == 5) {
      dataGen.value = [
        {
          indi: "Avg. outward remittances per immigrant",
          max: "≥ 0.05",
          min: "0.00",
          unit: "USD $ / per immigrant",
        },
        {
          indi: "Avg. inward remittances per emigrant",
          max: "≥ 0.05",
          min: "0.00",
          unit: "USD $ / per emigrant",
        },
      ];
    } else if (props.dimension == 6) {
      dataGen.value = [
        {
          indi: "Sustainable FTA score",
          max: "≥ 10.79",
          min: "0.00%",
          unit: "Score between 0 and 25",
        },
        {
          indi: "Sustainable IIA score",
          max: "≥ 8.16",
          min: "0.00%",
          unit: "Score between 0 to 23",
        },
        {
          indi: "Avg. rule of law index score",
          max: "≥ 1.96",
          min: "≤ -2.08",
          unit: "Unitless [between -2.6 and +2.1]",
        },
        {
          indi: "SDG trade regulatory distance from partners",
          max: "0.01",
          min: "≥ 0.28",
          unit: "Unitless [between 0 and 1](symmetric)",
        },
      ];
    } else if (props.dimension == 7) {
      dataGen.value = [
        {
          indi: "Avg. secure Internet servers",
          max: "≥ 31912.16",
          min: "0.00",
          unit: "Secure internet serves / Million pop.",
        },
        {
          indi: "Avg. share of households with Internet access",
          max: "99.84%",
          min: "0.58%",
          unit: "Percentage",
        },
        {
          indi: "Avg. share of females with mobile or formal bank account",
          max: "99.72%",
          min: "0.94%",
          unit: "Percentage",
        },
        {
          indi: "Avg. share of female online shoppers",
          max: "≥ 66.05%",
          min: "0.2%",
          unit: "Percentage",
        },
      ];
    }
  } else {
    if (props.dimension == 1) {
      dataGen.value = [
        {
          indi: "Exports to GDP",
          max: "≥ 6.32%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Imports to GDP",
          max: "≥ 6.2%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Import tariffs",
          max: "0.00%",
          min: "≥ 35.3%",
          unit: "Percentage (symmetric)",
        },
        {
          indi: "FDI inflows to GDP",
          max: "≥ 1.49%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "FDI outflows to GDP",
          max: "≥ 0.23%",
          min: "0%",
          unit: "Percentage",
        },
      ];
    } else if (props.dimension == 2) {
      dataGen.value = [
        {
          indi: "Cross-border portfolio to GDP",
          max: "≥ 35.34%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Deposit rates dispersion",
          max: "0.00",
          min: "≥ 0.89",
          unit: "Unitless [between 0 and 1](symmetric)",
        },
        {
          indi: "Share price index correlation",
          max: "1.00",
          min: "0.00",
          unit: "Unitless [between 0 and 1]",
        },
      ];
    } else if (props.dimension == 3) {
      dataGen.value = [
        {
          indi: "Export complementarity index",
          max: "≥ 0.75",
          min: "0.00",
          unit: "Unitless [between 0 and 1]",
        },
        {
          indi: "Value Chains participation index",
          max: "≥ 1.8%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Intermediate goods exports to GDP",
          max: "≥ 1.86%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Intermediate goods imports to GDP",
          max: "≥ 1.86%",
          min: "0%",
          unit: "Percentage",
        },
      ];
    } else if (props.dimension == 4) {
      dataGen.value = [
        {
          indi: "Liner shipping connectivity index",
          max: "≥ 0.36",
          min: "0.05",
          unit: "Unitless [between 0 and 1]",
        },
        {
          indi: "Trade facilitation implementation",
          max: "0.95",
          min: "0.11",
          unit: "Unitless [between 0 and 1]",
        },
        {
          indi: "Average internet quality",
          max: "≥ 1899000.41",
          min: "326.29",
          unit: "Bandwidth per user",
        },
        {
          indi: "Average trade cost",
          max: "12%",
          min: "≥ 626.9%",
          unit: "Percentage (symmetric)",
        },
      ];
    } else if (props.dimension == 5) {
      dataGen.value = [
        {
          indi: "Stock of emigrants per capita",
          max: "≥ 1.94%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Stock of immigrants per capita",
          max: "≥ 2.32%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Remittances outflow to GDP",
          max: "≥ 0%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Remittances inflow to GDP",
          max: "≥ 0%",
          min: "0%",
          unit: "Percentage",
        },
      ];
    } else if (props.dimension == 6) {
      dataGen.value = [
        {
          indi: "Signed FTA",
          max: "≥ 4.04",
          min: "0.00",
          unit: "Unitless [between 0 and 5]",
        },
        {
          indi: "Signed IIA (Yes/No)",
          max: "1.00",
          min: "0.00",
          unit: "Binary",
        },
        {
          indi: "Embassy (Yes/No)",
          max: "1.00",
          min: "0.00",
          unit: "Binary",
        },
        {
          indi: "Trade regulatory similarity",
          max: "0.98",
          min: "≤ 0.73",
          unit: "Unitless [between 0 and 1]",
        },
      ];
    } else if (props.dimension == 7) {
      dataGen.value = [
        {
          indi: "ICT goods exports to GDP",
          max: "≥ 1.84%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "ICT goods imports to GDP",
          max: "≥ 4.4%",
          min: "0%",
          unit: "Percentage",
        },
        {
          indi: "Tariffs on ICT imports",
          max: "0%",
          min: "≥ 0.18",
          unit: "Percentage (symmetric)",
        },
        {
          indi: "Avg. share using digital financial services",
          max: "99.76%",
          min: "0.96%",
          unit: "Percentage",
        },
        {
          indi: "Avg. share of online shoppers",
          max: "≥ 66.05%",
          min: "0.2%",
          unit: "Percentage",
        },
        {
          indi: "Digital trade regulatory similarity",
          max: "≥ 0.86",
          min: "≤ 0.39",
          unit: "Unitless [between 0 and 1]",
        },
      ];
    }
  }
};
onMounted(() => {
  setDataGen();
});

watch([() => props.dimension, () => props.type], setDataGen);
</script>

<style lang="scss" scoped>
.headerTable2 {
  border-bottom: 1px solid #aeaeae;
  height: 55px;
  padding-top: 5px;
  font-weight: 600;
}
.headerTable {
  border-bottom: 1px solid #aeaeae;
  height: 55px;
  line-height: 55px;
  font-weight: 600;
}
</style>
