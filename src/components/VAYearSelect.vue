<template>
  <div style="height: 90px">
    <div style="font-size: 14px" class="text-white">{{ label }}</div>
    <div class="q-pt-xs">
      <q-select
        v-model="yearSelect"
        :options="yearList"
        filled
        @update:model-value="emitYear"
        dark
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { serverSetup } from "../pages/server.js";

// 🧾 Props
const props = defineProps({
  label: { type: String, required: true },
  initialValue: {
    type: [String, Number],
    default: "",
  },
});

// 📢 Emit
const emit = defineEmits(["update"]);

// 🌐 Server
const { serverData } = serverSetup();

// 📦 State
const yearList = ref([]);
const yearSelect = ref(null);

// 📥 Load year list
const loadYearList = async () => {
  try {
    const url = `${serverData.value}/va/get_year.php`.replace(
      /([^:]\/)\/+/g,
      "$1"
    );
    const res = await axios.get(url);
    const years = res.data.map((y) => Number(y)).sort((a, b) => a - b);
    yearList.value = years;

    // ถ้ามีค่า initialValue และมันอยู่ใน list ให้ตั้งค่า
    if (props.initialValue && years.includes(Number(props.initialValue))) {
      yearSelect.value = Number(props.initialValue);
      emitYear();
    }
  } catch (err) {
    console.error("❌ Error loading years:", err);
  }
};

// 📡 Emit ปีเมื่อเปลี่ยน
const emitYear = () => {
  emit("update", yearSelect.value);
};

// 🎯 ถ้า prop initialValue เปลี่ยนหลัง mount
watch(
  () => props.initialValue,
  (newVal) => {
    if (yearList.value.includes(Number(newVal))) {
      yearSelect.value = Number(newVal);
      emitYear();
    }
  },
  { immediate: true }
);

// 🚀 Load on mount
onMounted(() => {
  loadYearList();
});
</script>

<style lang="scss" scoped></style>
