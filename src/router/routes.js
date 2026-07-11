const routes = [
  {
    path: "/",
    component: () => import("src/pages/Home.vue"),
  },
  {
    path: "/va",
    component: () => import("src/pages/VADashboard.vue"),
  },
  {
    path: "/participationingvcs/:exp?/:imp?/:yearStart?/:yearEnd?/:sector?",
    component: () => import("src/pages/VAParticipationInGVCs.vue"),
  },

  {
    path: "/gvcoverview/:exp?/:yearStart?/:yearEnd?",
    component: () => import("src/pages/VAGVCrelationships.vue"),
  },
  {
    path: "/backwardlinkages/:exp?/:imp?/:yearStart?/:yearEnd?/:sector?",
    component: () => import("src/pages/VABackwardSector.vue"),
  },
  {
    path: "/backwardlinkagessource/:exp?/:imp?/:source?/:yearStart?/:yearEnd?",
    component: () => import("src/pages/VABackwardSource.vue"),
  },
  {
    path: "/forwardlinkages/:exp?/:yearStart?/:yearEnd?/:sector?",
    component: () => import("src/pages/VAForwardSector.vue"),
  },
  {
    path: "/forwardlinkagesimport/:exp?/:imp?/:yearStart?/:yearEnd?",
    component: () => import("src/pages/VAForwardImport.vue"),
  },

  {
    path: "/directindirect/:exp?/:imp?/:yearStart?/:yearEnd?/:sector?",
    component: () => import("src/pages/VADirectIndirect.vue"),
  },
  {
    path: "/countrybriefs/:exp?",
    component: () => import("src/pages/VAEconomyBrief.vue"),
  },

  // RI Page
  {
    path: "/rioverview",
    component: () => import("pages/ri_overview.vue"),
  },
  {
    path: "/riintragroup",
    component: () => import("pages/ri_intraGroup.vue"),
    name: "riintragroup",
  },
  {
    path: "/riecopartner/:key?",
    component: () => import("pages/ri_ecopartner.vue"),
    name: "rieconomypartner",
  },
  {
    path: "/riecopartner_clear",
    component: () => import("pages/ri_ecopartner.vue"),
    name: "rieconomypartner_clear",
  },
  {
    path: "/ribuildyourown",
    component: () => import("pages/ri_buildYourOwn.vue"),
    name: "ribuildyourown",
  },
  {
    path: "/ribuildyourown_clear",
    component: () => import("pages/ri_buildYourOwn.vue"),
    name: "ribuildyourown_clear",
  },
  {
    path: "/ridownload",
    component: () => import("pages/ri_download.vue"),
  },
  {
    path: "/reloadpage/:page",
    component: () => import("pages/ri_reloadpage.vue"),
    name: "reloadpage",
  },
  {
    path: "/ridataavail/:key?",
    component: () => import("pages/ri_dataAvail.vue"),
  },
  {
    path: "/ricountrybrief",
    component: () => import("pages/ri_countrybrief.vue"),
    name: "ricountrybrief",
  },
  {
    path: "/ricountrybrief2/:iso",
    component: () => import("pages/ri_countrybrief2.vue"),
    name: "ricountrybrief2",
  },

  // Always leave this as last one,v
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
