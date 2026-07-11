import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

export const useRegionalIntegrationNavigation = () => {
  const $q = useQuasar();
  const router = useRouter();

  const goToRegionalIntegration = () => {
    const isMobileOrTablet = $q.platform.is.mobile || $q.screen.lt.md;

    if (isMobileOrTablet) {
      $q.dialog({
        title: "Desktop only",
        message:
          "The Regional Integration Analyzer is designed for desktop screens and is not supported on mobile or tablet devices. Please use a PC to access this tool.",
        ok: {
          label: "OK",
          color: "primary",
        },
      });
      return;
    }

    router.push("/rioverview");
  };

  return { goToRegionalIntegration };
};
