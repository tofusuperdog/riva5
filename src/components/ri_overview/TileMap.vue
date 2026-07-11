<template>
  <div class="row justify-center">
    <div
      ref="chartContainer"
      :style="{ width: '500px', height: '500px' }"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

export default {
  name: "HighchartsTilemap",
  props: {
    tilemapData: {
      type: Array,
      required: true,
    },
    dataScore: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chartContainer = ref(null);
    const partner = ref([
      "AFG",
      "ARM",
      "ASM",
      "AZE",
      "COK",
      "FJI",
      "FSM",
      "GEO",
      "GUM",
      "IRN",
      "KAZ",
      "KGZ",
      "KIR",
      "MDV",
      "MHL",
      "MNP",
      "NCL",
      "NIU",
      "NRU",
      "PAK",
      "PLW",
      "PYF",
      "SLB",
      "TJK",
      "TKM",
      "TLS",
      "TON",
      "TUR",
      "TUV",
      "UZB",
      "VUT",
      "WSM",
      "PNG",
      "RUS",
      "KHM",
      "IDN",
      "PHL",
      "LAO",
      "BTN",
      "NPL",
      "BGD",
      "IND",
      "LKA",
      "MMR",
      "THA",
      "AUS",
      "NZL",
      "BRN",
      "MYS",
      "SGP",
      "VNM",
      "MAC",
      "PRK",
      "HKG",
      "MNG",
      "CHN",
      "KOR",
      "JPN",
    ]);
    let chart = null;

    const getMergedData = () => {
      const scores = props.dataScore.map((score) =>
        parseFloat(score.avg_score)
      );
      const maxScore = Math.max(...scores);
      const interval = maxScore / 5;

      return props.tilemapData
        .filter((country) => partner.value.includes(country.alpha3))
        .map((country) => {
          const score = props.dataScore.find(
            (score) => score.partner === country.alpha3
          );
          return {
            ...country,
            value: score ? parseFloat(score.avg_score).toFixed(2) : "0",
            color: score ? null : "#AB8A64", // ถ้าไม่มี score ให้ใช้สีพิเศษ
          };
        });
    };

    const createChart = () => {
      const mergedData = getMergedData();
      const maxScore = Math.max(...mergedData.map((d) => parseFloat(d.value)));
      const interval = maxScore / 5;

      chart = Highcharts.chart(chartContainer.value, {
        chart: {
          type: "tilemap",
          inverted: true,
          width: 500,
          height: 500,
        },

        title: {
          text: "",
        },
        xAxis: {
          visible: false,
        },
        yAxis: {
          visible: false,
        },
        credits: {
          enabled: false,
        },
        exporting: {
          enabled: false,
        },
        colorAxis: {
          dataClasses: [
            {
              from: 0,
              to: interval,
              color: "#C25555",
              name: `< ${interval.toFixed(2)}`,
            },
            {
              from: interval,
              to: 2 * interval,
              color: "#E7A84A",
              name: `${interval.toFixed(2)} - ${(2 * interval).toFixed(2)}`,
            },
            {
              from: 2 * interval,
              to: 3 * interval,
              color: "#FBD49A",
              name: `${(2 * interval).toFixed(2)} - ${(3 * interval).toFixed(
                2
              )}`,
            },
            {
              from: 3 * interval,
              to: 4 * interval,
              color: "#D3CF5E",
              name: `${(3 * interval).toFixed(2)} - ${(4 * interval).toFixed(
                2
              )}`,
            },
            {
              from: 4 * interval,
              to: maxScore,
              color: "#65BA47",
              name: `> ${(4 * interval).toFixed(2)}`,
            },
            {
              from: -0.1, // ข้อมูลพิเศษ
              to: 0.1,
              color: "#AB8A64",
              name: "No data available",
            },
          ],
        },
        series: [
          {
            data: mergedData,
            dataLabels: {
              enabled: true,
              formatter: function () {
                return this.point.alpha3;
              },
            },
            name: "Average Score",
            states: {
              hover: {
                color: "#a4edba",
              },
            },
            tooltip: {
              headerFormat: "",
              pointFormatter: function () {
                return this.value === "0"
                  ? `No data available for <b>${this.name}</b>`
                  : `The average score for <b>${this.name}</b> is <b>${this.value}</b>`;
              },
            },
          },
        ],
      });
    };

    const destroyChart = () => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    };

    onMounted(createChart);

    watch(
      () => props.dataScore,
      () => {
        destroyChart();
        createChart();
      },
      { deep: true }
    );

    onBeforeUnmount(destroyChart);

    return {
      chartContainer,
    };
  },
};
</script>

<style scoped></style>
