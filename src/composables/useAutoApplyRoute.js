import { ref, watch } from "vue";

export const useAutoApplyRoute = ({
  route,
  paramNames,
  isReady,
  getInputValues,
  onApply,
}) => {
  const appliedRouteKey = ref("");

  watch(
    [
      () => paramNames.map((name) => route.params[name]),
      isReady,
      getInputValues,
    ],
    async ([routeValues, ready, inputValues]) => {
      const hasCompleteParams = routeValues.every(
        (value) => value !== undefined && value !== null && value !== "",
      );

      if (!hasCompleteParams || !ready) return;

      const inputsMatchRoute = routeValues.every(
        (value, index) => String(inputValues[index]) === String(value),
      );

      if (!inputsMatchRoute) return;

      const routeKey = routeValues.join("/");
      if (appliedRouteKey.value === routeKey) return;

      appliedRouteKey.value = routeKey;
      await onApply();
    },
    { immediate: true },
  );
};
