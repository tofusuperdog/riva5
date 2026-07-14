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
    path: "/sectoral-analysis/health",
    component: () => import("src/pages/HealthSector.vue"),
  },
  {
    path: "/about",
    component: () => import("src/pages/About.vue"),
  },
  {
    path: "/participationingvcs/:exp?/:imp?/:yearStart?/:yearEnd?/:sector?",
    component: () => import("src/pages/VAParticipationInGVCs.vue"),
  },

  {
    path: "/gvcoverview/:exp?/:yearStart?/:yearEnd?",
    component: () => import("src/pages/VAGVCRelationships.vue"),
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

  // Always leave this as last one,v
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
