<template>
  <div class="max-w-[1200px] w-[95%] mx-auto mt-[-100px] relative z-100">
    <div
      class="rounded-sm px-4 pt-4 pb-2"
      style="
        background: linear-gradient(
          -45deg,
          #113347 0%,
          #185172 57%,
          #133448 100%
        );
      "
    >
      <div class="">
        <div
          class="flex flex-col md:flex-row pt-4 md:pt-0 md:gap-8 justify-center"
        >
          <div class="lg:w-[350px] md:w-[300px]">
            <EcoSelect
              :label="t('gvc.exportingEconomy')"
              @update:selected="onUpdateExportISO"
              :initialValue="exportingISOInit"
            />
          </div>
          <div class="md:w-[150px]">
            <yearSelect
              :label="t('gvc.periodStart')"
              @update="onUpdateYearStart"
              :initialValue="yearStartInit"
            />
          </div>
          <div class="md:w-[150px]">
            <yearSelect
              :label="t('gvc.periodEnd')"
              @update="onUpdateYearEnd"
              :initialValue="yearEndInit"
            />
          </div>
        </div>
        <div class="flex justify-center pt-2">
          <div
            class="bg-[#FDC300] fblack h-10 px-4 rounded-sm inline-flex items-center cursor-pointer hover:scale-105 transition duration-300 ease-in-out w-full text-center justify-center md:w-[220px]"
            v-show="isInputApply"
            @click="onClickApply"
          >
            {{ t('gvc.apply') }}
          </div>
          <div
            class="bg-[#fdc20083] fblack h-10 px-4 rounded-sm inline-flex items-center w-full text-center justify-center md:w-[220px]"
            v-show="!isInputApply"
          >
            {{ t('gvc.apply') }}
          </div>
        </div>

        <div class="h-6">
          <div class="text-center text-yellow-300" v-show="showInvalidYear">
            {{ t('gvc.yearRangeError') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LocalStorage, Notify, Dialog } from "quasar";
import { serverSetup } from "../../pages/server";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { translateEconomy } from "../../i18n/economies";

import EcoSelect from "../VAEconomySelect.vue";
import yearSelect from "../VAYearSelect.vue";

// 🧭 Routing
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n({ useScope: "global" });

// 📌 Connection Database Server Info
const { serverData } = serverSetup();

// 📢 Emit
const emit = defineEmits(["updateInputData", "isShowGraph"]);

// 📌 Input data state
const inputData = ref({
  exporting: "",
  yearStart: "",
  yearEnd: "",
});
const exportingISOInit = ref(null);
const yearStartInit = ref("");
const yearEndInit = ref("");
const showInvalidYear = ref(false);
const economyList = ref([]);

const isInputApply = ref(false);

// 🧠 Update localStorage
const updateLocalStorage = (key, value) => {
  const keyName = "inputVA";
  let data = LocalStorage.getItem(keyName);

  if (!data) {
    data = {
      exportingISO: "",
      exportingName: "",
      importingISO: "",
      importingName: "",
      sourceISO: "",
      sourceName: "",
      yearStart: "",
      yearEnd: "",
      sector: "",
      year: "",
    };
  }

  data[key] = value;
  LocalStorage.set(keyName, data);
};

// 🌍 Exporting Economy updated
const onUpdateExportISO = (selected) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.exporting = selected;
  updateLocalStorage("exportingISO", selected.iso);
  updateLocalStorage("exportingName", selected.name);
  if (
    inputData.value.exporting &&
    inputData.value.yearStart &&
    inputData.value.yearEnd
  ) {
    checkApplyBtn();
  }
};

// 🌍 YearStart updated
const onUpdateYearStart = (year) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.yearStart = year;
  updateLocalStorage("yearStart", year);
  if (
    inputData.value.exporting &&
    inputData.value.yearStart &&
    inputData.value.yearEnd
  ) {
    checkApplyBtn();
  }
};

// 🌍 YearEnd updated
const onUpdateYearEnd = (year) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.yearEnd = year;
  updateLocalStorage("yearEnd", year);
  if (
    inputData.value.exporting &&
    inputData.value.yearStart &&
    inputData.value.yearEnd
  ) {
    checkApplyBtn();
  }
};

// 📌 Load Economy List
const loadEconomyList = async () => {
  try {
    const url = serverData.value + "va/get_economy.php";
    const res = await axios.get(url);
    economyList.value = res.data.map((data) => ({
      id: data.id,
      label: translateEconomy({ iso: data.iso, name: data.name }, locale.value),
      value: data.iso,
      disable: data.disable,
    }));
  } catch (error) {
    console.error("Error loading economy list:", error);
  }
};

const checkApplyBtn = () => {
  if (Number(inputData.value.yearStart) >= Number(inputData.value.yearEnd)) {
    showInvalidYear.value = true;
    return;
  } else {
    showInvalidYear.value = false;
  }

  if ("id" in inputData.value.exporting) {
    isInputApply.value = true;
    emit("updateInputData", inputData.value);
  }
};

const onClickApply = async () => {
  const payLoad = {
    exp_country: inputData.value.exporting.iso,
  };

  const url = serverData.value + "va/check_year_available.php";
  let res = await axios.post(url, JSON.stringify(payLoad));
  let yearStartAfter = res.data[0];
  let yearEndAfter = res.data[1];
  let checkYearPass = 0;

  if (res.data[0] > inputData.value.yearStart) {
    checkYearPass = 1;
  }
  if (res.data[1] < inputData.value.yearEnd) {
    checkYearPass = 1;
  }
  if (checkYearPass === 1) {
    alert(
      `${t('gvc.limitedData')}\n\n` +
        `${t('gvc.availability', { economy: inputData.value.exporting.name, start: yearStartAfter, end: yearEndAfter })}\n` +
        t('gvc.adjustPeriod')
    );
    return;
  }

  Notify.create({
    message: t('gvc.applied'),
    color: "positive",
    position: "center",
    timeout: 2000,
    icon: "fa-solid fa-circle-check",
  });
  emit("isShowGraph", true);
};

// 🧭 Watch for route param
// 🧠 Sync params.exp → exportingISOInit
watch(
  [() => route.params.exp, () => economyList.value],
  ([exp, ecoList]) => {
    if (ecoList.length === 0) return;

    let isoToUse = exp;

    // ❗ ถ้าไม่มีค่า exp จาก route → ลองใช้ค่าจาก localStorage
    if (!isoToUse) {
      const stored = LocalStorage.getItem("inputVA");
      if (stored && stored.exportingISO) {
        isoToUse = stored.exportingISO;
      }
    }

    if (!isoToUse) return;

    const matched = ecoList.find((item) => item.value === isoToUse);
    if (matched) {
      const expDataInput = {
        iso: matched.value,
        name: matched.label,
      };
      exportingISOInit.value = expDataInput;
      onUpdateExportISO(expDataInput);
      updateLocalStorage("exportingISO", matched.value);
      updateLocalStorage("exportingName", matched.label);
    }
  },
  { immediate: true }
);

// 🧭 Watch for route param
// 🧠 Sync params.yearStart → yearStartInit
watch(
  () => route.params.yearStart,
  (year) => {
    let yearToUse = year;

    // ถ้า param ไม่มี → ลองดึงจาก localStorage
    if (!yearToUse) {
      const stored = LocalStorage.getItem("inputVA");
      if (stored && stored.yearStart) {
        yearToUse = stored.yearStart;
      }
    }

    // แปลงเป็นตัวเลข แล้ว set
    if (yearToUse) {
      const parsedYear = Number(yearToUse);
      yearStartInit.value = parsedYear;
      onUpdateYearStart(parsedYear);
    }
  },
  { immediate: true }
);

// 🧭 Watch for route param
// 🧠 Sync params.yearEnd → yearEndInit
watch(
  () => route.params.yearEnd,
  (year) => {
    let yearToUse = year;

    // ถ้า param ไม่มี → ลองดึงจาก localStorage
    if (!yearToUse) {
      const stored = LocalStorage.getItem("inputVA");
      if (stored && stored.yearEnd) {
        yearToUse = stored.yearEnd;
      }
    }

    // แปลงเป็นตัวเลข แล้ว set
    if (yearToUse) {
      const parsedYear = Number(yearToUse);
      yearEndInit.value = parsedYear;
      onUpdateYearEnd(parsedYear);
    }
  },
  { immediate: true }
);

// 📥 Load Economy List
onMounted(async () => {
  await loadEconomyList();
});
</script>

<style lang="scss" scoped></style>
