<template>
  <div class="max-w-[1200px] w-[95%] mx-auto mt-[-100px] relative z-100">
    <div
      class="rounded-sm pt-4 pb-2"
      style="
        background: linear-gradient(
          -45deg,
          #113347 0%,
          #185172 57%,
          #133448 100%
        );
      "
    >
      <div>
        <div class="flex fwhite px-2 lt-sm">
          <div>
            <div class="font-semibold">{{ t('forward.viewBy') }}</div>
          </div>
        </div>

        <div
          class="px-2 pb-2 text-white flex flex-col items-start md:w-[634px] md:mx-auto md:px-0 lg:flex-row lg:items-center lg:w-[732px]"
        >
          <div class="gt-xs md:w-full lg:w-auto">
            <div class="font-semibold">{{ t('forward.viewBy') }}</div>
            <div class="text-xs">
              {{ t('forward.chooseFocus') }}
            </div>
          </div>
          <div
            class="flex flex-col items-start w-full mt-1 lg:flex-row lg:items-center lg:w-auto lg:mt-0"
          >
            <div class="w-0 lg:w-2"></div>
            <div>
              <q-radio
                v-model="selectType"
                val="Exporting Sector"
                :label="t('forward.exportingSector')"
                color="warning"
                dark
                @update:model-value="onChangeRoute"
              />
            </div>
            <div class="w-0 lg:w-2"></div>
            <div>
              <q-radio
                v-model="selectType"
                val="Importing Economy"
                :label="t('forward.importingEconomyFocus')"
                color="warning"
                dark
                @update:model-value="onChangeRoute"
              />
            </div>
          </div>
        </div>

        <hr style="border: 0; height: 1px; background-color: #3b86b7" />
        <div
          class="flex flex-col md:flex-row pt-2 md:gap-8 justify-center px-2"
        >
          <div class="lg:w-[350px] md:w-[300px]">
            <EcoSelect
              :label="t('forward.exportingEconomy')"
              :initialValue="exportingISOInit"
              @update:selected="onUpdateExportISO"
            />
          </div>
          <div class="lg:w-[160px] md:w-[135px]">
            <yearSelect
              :label="t('forward.periodStart')"
              @update="onUpdateYearStart"
              :initialValue="yearStartInit"
            />
          </div>
          <div class="lg:w-[160px] md:w-[135px]">
            <yearSelect
              :label="t('forward.periodEnd')"
              @update="onUpdateYearEnd"
              :initialValue="yearEndInit"
            />
          </div>
        </div>
        <div
          class="flex flex-col md:flex-row md:mt-2 md:pt-0 md:gap-8 justify-center px-2"
        >
          <div class="lg:w-[350px] md:w-[300px]">
            <sectorSelect @update="onUpdateSector" :initialValue="sectorInit" />
          </div>
          <div class="lg:w-[350px] md:w-[300px]"></div>
        </div>
        <div class="flex justify-center pt-2 px-2">
          <div
            class="bg-[#FDC300] fblack h-10 px-4 rounded-sm inline-flex items-center cursor-pointer hover:scale-105 transition duration-300 ease-in-out w-full text-center justify-center md:w-[220px]"
            v-show="isInputApply"
            @click="onClickApply"
          >
            {{ t('forward.apply') }}
          </div>
          <div
            class="bg-[#fdc20083] fblack h-10 px-4 rounded-sm inline-flex items-center w-full text-center justify-center md:w-[220px]"
            v-show="!isInputApply"
          >
            {{ t('forward.apply') }}
          </div>
        </div>
        <div class="h-6 text-center text-yellow-300">
          <span v-show="showError">{{ t('backward.sameEconomyError') }}</span>
          <span v-show="showInvalidYear">
            {{ t('forward.yearRangeError') }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAutoApplyRoute } from "../../composables/useAutoApplyRoute";
import { LocalStorage, Notify } from "quasar";
import { serverSetup } from "../../pages/server";
import axios from "axios";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

import EcoSelect from "../VAEconomySelect.vue";
import yearSelect from "../VAYearSelect.vue";
import sectorSelect from "../VASectorSelect.vue";

// 🧭 Routing
const router = useRouter();
const route = useRoute();

// 📌 Select type: Single Year / Time Range

// 📌 Select type: Single Year / Time Range
const selectType = ref("Exporting Sector");

// 📌 Connection Database Server Info
const { serverData } = serverSetup();

// 📢 Emit
const emit = defineEmits(["updateInputData", "isPass", "isShowGraph"]);

// 📌 Input data state
const inputData = ref({
  exporting: "",
  importing: { id: 0, iso: "RoW", name: "World" },
  yearStart: "",
  yearEnd: "",
  sector: "",
});
const exportingISOInit = ref(null);
const importingISOInit = ref(null);
const yearStartInit = ref("");
const yearEndInit = ref("");
const sectorInit = ref(null);
const economyList = ref([]);
const sectorList = ref([]);
const showError = ref(false);
const showInvalidYear = ref(false);

const isInputApply = ref(false);

const onChangeRoute = () => {
  if (selectType.value === "Importing Economy") {
    router.push("/forwardlinkagesimport");
  }
};
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
    inputData.value.importing &&
    inputData.value.yearStart &&
    inputData.value.yearEnd &&
    inputData.value.sector
  ) {
    checkApplyBtn();
  }
};

// 🌍 Importing Economy updated
const onUpdateImportISO = (selected) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.importing = selected;
  updateLocalStorage("importingISO", selected.iso);
  updateLocalStorage("importingName", selected.name);
  if (
    inputData.value.exporting &&
    inputData.value.importing &&
    inputData.value.yearStart &&
    inputData.value.yearEnd &&
    inputData.value.sector
  ) {
    checkApplyBtn();
  }
};

// 🌍 Year Start updated
const onUpdateYearStart = (year) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.yearStart = year;
  updateLocalStorage("yearStart", year);
  if (
    inputData.value.exporting &&
    inputData.value.importing &&
    inputData.value.yearStart &&
    inputData.value.yearEnd &&
    inputData.value.sector
  ) {
    checkApplyBtn();
  }
};

// 🌍 Year End updated
const onUpdateYearEnd = (year) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  inputData.value.yearEnd = year;
  updateLocalStorage("yearEnd", year);
  if (
    inputData.value.exporting &&
    inputData.value.importing &&
    inputData.value.yearStart &&
    inputData.value.yearEnd &&
    inputData.value.sector
  ) {
    checkApplyBtn();
  }
};

// 🌍 Sector updated
const onUpdateSector = (selected) => {
  emit("isShowGraph", false);
  isInputApply.value = false;
  if (!sectorList.value.length) return; // รอ sectorList ให้โหลดเสร็จก่อน

  const sectorData = sectorList.value.find(
    (item) => Number(item.sectorID) === Number(selected)
  );

  if (!sectorData) return; // ป้องกันไม่ให้ set undefined

  inputData.value.sector = sectorData;
  updateLocalStorage("sector", selected);

  if (
    inputData.value.exporting &&
    inputData.value.importing &&
    inputData.value.yearStart &&
    inputData.value.yearEnd &&
    inputData.value.sector
  ) {
    checkApplyBtn();
  }
};

// 📌 Load Graph
const checkApplyBtn = () => {
  // console.clear();
  showError.value = false;
  showInvalidYear.value = false;
  let exportId = Number(inputData.value.exporting.id);
  let importId = Number(inputData.value.importing.id);
  if (exportId === importId && exportId !== 0) {
    showError.value = true;
    emit("isPass", false);
    return;
  }
  if (Number(inputData.value.yearStart) >= Number(inputData.value.yearEnd)) {
    showInvalidYear.value = true;
    emit("isPass", false);
    return;
  } else {
    showInvalidYear.value = false;
  }

  emit("isPass", true);
  emit("updateInputData", inputData.value);
  emit("isShowGraph", false);
  isInputApply.value = true;
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
      `${t('forward.limitedData')}\n\n` +
        `${t('forward.availability', {
          economy: inputData.value.exporting.name,
          start: yearStartAfter,
          end: yearEndAfter,
        })}\n` +
        t('forward.adjustPeriod')
    );
    return;
  }
  Notify.create({
    message: t('forward.applied'),
    color: "positive",
    position: "center",
    timeout: 2000,
    icon: "fa-solid fa-circle-check",
  });

  emit("updateInputData", inputData.value);
  emit("isPass", true);
  emit("isShowGraph", true);
};

useAutoApplyRoute({
  route,
  paramNames: ["exp", "yearStart", "yearEnd", "sector"],
  isReady: () =>
    isInputApply.value && inputData.value.exporting?.id != null,
  getInputValues: () => [
    inputData.value.exporting?.iso,
    inputData.value.yearStart,
    inputData.value.yearEnd,
    inputData.value.sector?.sectorID,
  ],
  onApply: onClickApply,
});

// 📌 Load Economy List
const loadEconomyList = async () => {
  try {
    const url = serverData.value + "va/get_economy.php";
    const res = await axios.get(url);
    economyList.value = res.data.map((data) => ({
      id: data.id,
      label: data.name,
      value: data.iso,
      disable: data.disable,
    }));
  } catch (error) {
    console.error("Error loading economy list:", error);
  }
};

// 📌 Load Sector List
const loadSectorList = async () => {
  try {
    const url = `${serverData.value}/va/get_sector.php`.replace(
      /([^:]\/)\/+/g,
      "$1"
    );
    const res = await axios.get(url);
    sectorList.value = res.data.map((data) => ({
      sectorName: data.category,
      sectorID: data.catID,
      sectorShortName: data.shortname,
      sectorGroup: data.sectiongroup,
    }));
  } catch (err) {
    console.error("❌ Error loading years:", err);
  }
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
// 🧠 Sync params.imp → importingISOInit
watch(
  [() => route.params.imp, () => economyList.value],
  ([imp, ecoList]) => {
    if (ecoList.length === 0) return;

    let isoToUse = imp;

    // ❗ ถ้าไม่มีค่า imp จาก route → ลองใช้ค่าจาก localStorage
    if (!isoToUse) {
      const stored = LocalStorage.getItem("inputVA");
      if (stored && stored.importingISO) {
        isoToUse = stored.importingISO;
      }
    }

    if (!isoToUse) return;

    const matched = ecoList.find((item) => item.value === isoToUse);
    if (matched) {
      const impDataInput = {
        iso: matched.value,
        name: matched.label,
      };
      importingISOInit.value = impDataInput;
      onUpdateImportISO(impDataInput);
      updateLocalStorage("importingISO", matched.value);
      updateLocalStorage("importingName", matched.label);
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

watch(
  () => route.params.sector,
  (sector) => {
    let sectorToUse = sector || LocalStorage.getItem("inputVA")?.sector;
    if (sectorToUse) sectorInit.value = Number(sectorToUse);
  },
  { immediate: true }
);

// ⏱️ Wait for both sectorList + sectorInit → then update
watch(
  [sectorList, sectorInit],
  ([list, initVal]) => {
    if (list.length > 0 && initVal !== null) {
      onUpdateSector(initVal);
    }
  },
  { immediate: true }
);

// 📥 Load Economy List
onMounted(async () => {
  await loadEconomyList();
  await loadSectorList();
});
</script>

<style lang="scss" scoped></style>
