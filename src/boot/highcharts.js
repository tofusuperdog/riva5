/**
 * Highcharts Boot File
 * Load Highcharts + modules from npm (local) instead of CDN
 * to avoid licence/fair-usage 429 errors from code.highcharts.com
 *
 * In Highcharts v12 ESM, importing a module auto-registers it
 * onto the Highcharts namespace when Highcharts is already imported.
 */
import Highcharts from "highcharts";
import "highcharts/highcharts-more";
import "highcharts/modules/exporting";
import "highcharts/modules/export-data";
import "highcharts/modules/heatmap";
import "highcharts/modules/treemap";
import "highcharts/modules/tilemap";
import "highcharts/modules/accessibility";
import "highcharts/modules/drilldown";

// Make Highcharts available globally (many components use window.Highcharts)
window.Highcharts = Highcharts;
