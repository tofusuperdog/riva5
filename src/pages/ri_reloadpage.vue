<template>
  <div>reload page</div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const reloadPage = () => {
  let page = route.params.page;
  router.replace("/" + page);
};

onMounted(() => {
  reloadPage();
});
</script>

<style lang="scss" scoped></style>
