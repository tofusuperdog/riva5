<template>
  <div style="height: 90px">
    <div style="font-size: 14px" class="text-white">{{ label }}</div>

    <div class="q-pt-xs">
      <q-select
        v-model="selectedValue"
        :options="economyList"
        option-label="label"
        option-value="value"
        map-options
        emit-value
        filled
        dark
        @update:model-value="onUpdateValue"
      >
        <!-- option row -->
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section v-if="showFlag(scope.opt)" avatar>
              <img
                :src="getFlagUrl(scope.opt.value)"
                alt="flag"
                style="width: 24px; height: 16px"
              />
            </q-item-section>
            <q-item-section>{{ scope.opt.label }}</q-item-section>
          </q-item>
        </template>

        <!-- selected item -->
        <template #selected-item="scope">
          <q-item v-if="scope.opt">
            <q-item-section v-if="showFlag(scope.opt)" avatar>
              <img
                :src="getFlagUrl(scope.opt.value)"
                alt="flag"
                style="width: 24px; height: 16px"
              />
            </q-item-section>
            <q-item-section>{{ scope.opt.label }}</q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, watch } from "vue";
import { serverSetup } from "../pages/server";

// 🧾 Props / Emits
const props = defineProps({
  label: { type: String, required: true },
  initialValue: {
    type: Object,
    default: () => ({ iso: "", name: "" }),
  },
});
const emit = defineEmits(["update:selected"]);

// 🌐 Server
const { serverData } = serverSetup();

// 🗂️ State
const economyList = ref([]);
const selectedValue = ref(null);
const optionsReady = ref(false);

// ⚙️ Utils
const DENY_FLAG = new Set(["RoW", "RoLAC", "TWN", "HKG"]);
const showFlag = (opt) =>
  opt && !opt.disable && opt.id !== 0 && !DENY_FLAG.has(opt.value);

const getFlagUrl = (iso) => `images/flags/${iso}.png`;

// 📥 Load options
async function loadOptions() {
  const url = `${serverData.value}/va/get_economy.php`.replace(
    /([^:]\/)\/+/g,
    "$1"
  );
  const { data = [] } = await axios.get(url);

  economyList.value = data.map((opt) => ({
    id: opt.id,
    label: opt.name,
    value: opt.iso,
    disable: !!opt.disable,
  }));

  optionsReady.value = true;
}

// 📌 Apply initial selection (safe after options are ready)
function applyInitial(val) {
  if (!val?.iso) return;
  const found = economyList.value.find((i) => i.value === val.iso);
  if (found) {
    selectedValue.value = found.value;
    emitSelected(found);
  } else {
    // ถ้าไม่มีในลิสต์ ก็อย่างน้อย emit iso ให้ผู้ใช้ด้านนอกทราบ
    emit("update:selected", { name: val.name || "", iso: val.iso, id: null });
  }
}

// 🔁 เมื่อผู้ใช้เลือกค่า
function onUpdateValue(value) {
  const found = economyList.value.find((i) => i.value === value);
  if (!found) {
    // กัน error กรณีเรียกก่อน options มาหรือหาไม่เจอ
    emit("update:selected", { name: "", iso: value, id: null });
    return;
  }
  emitSelected(found);
}

function emitSelected(item) {
  emit("update:selected", {
    name: item.label,
    iso: item.value,
    id: item.id,
  });
}

// 🔄 ถ้า parent เปลี่ยน initialValue ภายหลัง
watch(
  () => props.initialValue,
  (val) => {
    if (!optionsReady.value) return; // รอให้ options มา
    applyInitial(val);
  },
  { deep: true } // ไม่ใส่ immediate เพื่อไม่ให้ยิงก่อนโหลด options
);

// 🚀 Init
onMounted(async () => {
  try {
    await loadOptions();
    applyInitial(props.initialValue); // ตั้งค่าเริ่มหลังโหลด options เสร็จ
  } catch (e) {
    console.error("❌ Error loading options:", e);
  }
});
</script>

<style scoped></style>
