<template>
  <div style="height: 90px">
    <div style="font-size: 14px" class="text-white">Exporting Sector</div>

    <div class="q-pt-xs">
      <q-select
        v-model="sectorSelect"
        :options="sectorOptions"
        filled
        dark
        emit-value
        map-options
        @update:model-value="emitSector"
      >
        <!-- แสดงค่าที่เลือก (เหมือนเดิม) -->
        <template #selected-item="{ opt }">
          <div
            style="
              white-space: normal;
              word-break: break-word;
              line-height: 1.3;
            "
          >
            {{ opt.label }}
          </div>
        </template>

        <!-- ทำ header ให้เป็น block/หัวข้อ ที่เลือกไม่ได้ ดูชัดขึ้น -->
        <template #option="scope">
          <q-item v-bind="scope.itemProps" :disable="scope.opt.disable">
            <q-item-section>
              <q-item-label
                v-if="scope.opt.isHeader"
                class="text-[#FFFFFF] bg-[#3B6077] py-2 pl-2"
              >
                {{ scope.opt.label }}
              </q-item-label>

              <q-item-label class="pl-2" v-else>
                {{ scope.opt.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import axios from "axios";
import { serverSetup } from "../pages/server.js";

const props = defineProps({
  initialValue: { type: [String, Number], default: null },
});
const emit = defineEmits(["update"]);
const { serverData } = serverSetup();

/** รายการจาก API แบบ “จริง” (ไม่มี header) */
const sectorListRaw = ref([]);

/** v-model: เก็บเป็น "string" เสมอ */
const sectorSelect = ref(null);

function emitSector() {
  if (sectorSelect.value == null) return;
  emit("update", sectorSelect.value.toString());
}

function headerOpt(label, key) {
  return {
    label,
    value: `__header__${key}`, // ให้ unique และไม่ชนกับ value จริง
    disable: true,
    isHeader: true,
  };
}

function rangeStr(start, end) {
  const out = [];
  for (let i = start; i <= end; i++) out.push(String(i));
  return out;
}

/** สร้าง options: เรียง + แทรก block ที่เลือกไม่ได้ */
const sectorOptions = computed(() => {
  const list = sectorListRaw.value;
  if (!list.length) return [];

  const byValue = new Map(list.map((o) => [String(o.value), o]));

  const pick = (values) =>
    values
      .map((v) => byValue.get(String(v)))
      .filter(Boolean)
      .map((o) => ({ ...o, value: String(o.value) })); // กัน type เพี้ยน

  return [
    // 0,1,2,17,18
    ...pick(["0", "1", "2"]),

    // header: Manufacturing Low tech
    headerOpt("Manufacturing Low tech", "mfg_low"),

    // 3,4,5,6,7,10,16
    ...pick(["3", "4", "5", "6", "7", "10", "16"]),

    // header: Manufacturing High and medium tech
    headerOpt("Manufacturing High and medium tech", "mfg_high_med"),

    // 8,9,11,12,13,14,15
    ...pick(["8", "9", "11", "12", "13", "14", "15"]),

    // header: Services
    headerOpt("Services", "services"),

    // 19 ถึง 35
    ...pick(rangeStr(17, 35)),
  ];
});

async function loadSectorList() {
  const url = `${serverData.value}/va/get_sector.php`;
  const res = await axios.get(url);

  sectorListRaw.value = res.data.map((d) => ({
    label: d.category,
    value: String(d.catID),
  }));
}

watch(
  [sectorListRaw, () => props.initialValue],
  ([list, init]) => {
    if (!list.length || init == null) return;

    const initStr = String(init);
    const found = list.find((i) => String(i.value) === initStr);
    if (found) {
      sectorSelect.value = String(found.value);
      emitSector();
    }
  },
  { immediate: true }
);

onMounted(loadSectorList);
</script>
