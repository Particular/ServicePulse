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
    valuesPath.value = new Path().startAt(coordinates[0]).followCoordinates(coordinates.slice(1)).toString();
    valuesArea.value = new Path().startAt([0, 0]).followCoordinates(coordinates).lineTo([100, 0]).close().toString();

    average.value = plotData.average;
    //TODO: why is this called minimumYaxis when it's only used to determine the maxYaxis?
    // should the graph actually set the min y value rather than leave it at 0?
    const minimumYaxis = !isNaN(toValue(minimumyaxis)) ? Number(toValue(minimumyaxis)) : 10;
    maxYaxis.value = Math.max(...[...values, average.value * 1.5, minimumYaxis]);

    averageLine.value = new Path().startAt([0, average.value]).lineTo([100, average.value]).toString();
  };

  watchEffect(() => createGraph());

  return { valuesPath, valuesArea, maxYaxis, average, averageLine };
}

class Path {
  #pathElements = [];
  #complete = false;

  startAt([x, y]) {
    if (this.#pathElements.length > 0) throw new Error("startAt must be the first call on a path");
    return this.moveTo([x, y]);
  }

  moveTo([x, y]) {
    if (this.#complete) throw new Error("Path is already closed");
    this.#pathElements.push(`M${x} ${y}`);
    return this;
  }

  lineTo([x, y]) {
    if (this.#complete) throw new Error("Path is already closed");
    this.#pathElements.push(`L${x} ${y}`);
    return this;
  }

  followCoordinates(coordinates) {
    for (const c of coordinates) {
      this.lineTo(c);
    }
    return this;
  }

  close() {
    if (this.#pathElements.length === 0) throw new Error("Cannot close an empty path");
    this.#pathElements.push("Z");
    this.#complete = true;
    return this;
  }

  toString() {
    return this.#pathElements.join(" ");
  }
}
