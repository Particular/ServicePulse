import { ref, toValue, watchEffect } from "vue";

export function useGraph(plotdata, minimumyaxis) {
  const valuesPath = ref(""),
    valuesArea = ref(""),
    maxYaxis = ref(10),
    average = ref(0),
    averageLine = ref("");

  const createGraph = () => {
    const plotData = toValue(plotdata) ?? { points: [], average: 0 };
    const values = (() => {
      let result = plotData.points;
      if (result.length === 0) {
        result = new Array(10).fill(0);
      }
      return result;
    })();
    const xTick = 100 / (values.length - 1);
    const coordinates = values.reduce((points, yValue, i) => [...points, [i * xTick, yValue]], []);
    valuesPath.value = `${coordinates.map((c, i) => (i ? lineTo(c) : moveTo(c))).join(" ")}`;
    valuesArea.value = `${moveTo([0, 0])} ${coordinates.map((c) => lineTo(c)).join(" ")} ${lineTo([100, 0])} Z`;

    average.value = plotData.average;
    //TODO: why is this called minimumYaxis when it's only used to determine the maxYaxis?
    const minimumYaxis = !isNaN(toValue(minimumyaxis)) ? Number(toValue(minimumyaxis)) : 10;
    maxYaxis.value = Math.max(...[...values, average.value * 1.5, minimumYaxis]);

    averageLine.value = `M0 ${average.value} L100 ${average.value}`;
  };

  watchEffect(() => createGraph());

  return { valuesPath, valuesArea, maxYaxis, average, averageLine };
}

function moveTo([x, y]) {
  return `M${x} ${y}`;
}

function lineTo([x, y]) {
  return `L${x} ${y}`;
}
