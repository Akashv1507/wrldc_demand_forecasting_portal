import Plotly from "plotly.js-dist";

export interface PlotTrace {
  name: string;
  data: [Date, number][];
  line?: { color?: string; width?: number };
  visible?: string | boolean;
}

export interface PlotData {
  title: string;
  traces: PlotTrace[];
}

export const getPlotXYArrays = (
  measData: PlotTrace["data"]
): { timestamps: Date[]; vals: number[] } => {
  let timestamps: Date[] = [];
  let vals: number[] = [];
  for (var i = 0; i < measData.length; i = i + 1) {
    timestamps.push(new Date(measData[i][0]));
    vals.push(measData[i][1] as number);
  }
  return { timestamps: timestamps, vals: vals };
};

export const setPlotTraces = (divId: string, plotData: PlotData) => {
  if (divId === "wrDemandDiv") {
    let traceData = [];
    const layout = {
      title: {
        text: plotData.title,
        font: {
          size: 24,
        },
      },
      // plot_bgcolor:"black",
      // paper_bgcolor:"#FFF3",
      showlegend: true,
      legend: {
        orientation: "h",
        y: -0.5,
        x: 0.4,
        font: {
          family: "sans-serif",
          size: 15,
        },
      },

      autosize: true,
      // height: 700,
      // width: 700,
      xaxis: {
        showgrid: false,
        zeroline: true,
        showspikes: true,
        spikethickness: 1,
        showline: true,
        titlefont: { color: "#000", size: 22 },
        tickfont: { color: "#000", size: 16 },
        tickmode: "linear",
        // tick0: startTime,
        dtick: 60 * 60 * 1000,
        automargin: true,
        tickangle: 283,
      },
      yaxis: {
        title: "MW ",
        showgrid: true,
        zeroline: true,
        showspikes: true,
        spikethickness: 1,
        showline: true,
        titlefont: { color: "#000" },
        tickfont: { color: "#000", size: 18 },
        tickformat: "digits",
        // range: [46500, 58000],
      },
    };
    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
      const trace = plotData.traces[traceIter];
      const xyData = getPlotXYArrays(trace.data);
      let traceObj = {
        x: xyData.timestamps,
        y: xyData.vals,
        type: "scatter",
        mode: "lines",
        name: trace.name,
        width: 10,
        hovertemplate: "(%{x}" + ", %{y:.0f}Mw)",
      };
      if (trace.line != null) {
        traceObj["line"] = trace.line;
      }
      if (trace.visible != null) {
        traceObj["visible"] = trace.visible;
      }
      traceData.push(traceObj);

      Plotly.newPlot(divId, traceData, layout);
    }
  } else {
    let traceData = [];
    const layout = {
      //setting 2 horizontal line at 49.9 and 50.05
      shapes: [
        {
          type: "line",
          xref: "paper",
          x0: 0,
          y0: 49.9,
          x1: 1,
          y1: 49.9,
          line: {
            color: "rgb(255, 0, 0)",
            width: 2,
            dash: "dot",
          },
        },
        {
          type: "line",
          xref: "paper",
          x0: 0,
          y0: 50.05,
          x1: 1,
          y1: 50.05,
          line: {
            color: "rgb(255, 0, 0)",
            width: 2,
            dash: "dot",
          },
        },
      ],
      title: {
        text: plotData.title,
        font: {
          size: 24,
        },
      },
      // plot_bgcolor:"black",
      // paper_bgcolor:"#FFF3",
      showlegend: true,
      legend: {
        orientation: "h",
        y: -0.5,
        x: 0.4,
        font: {
          family: "sans-serif",
          size: 15,
        },
      },
      autosize: true,
      // height: 700,
      // width: 700,
      xaxis: {
        showgrid: false,
        zeroline: true,
        showspikes: true,
        spikethickness: 1,
        showline: true,
        titlefont: { color: "#000", size: 22 },
        tickfont: { color: "#000", size: 16 },
        tickmode: "linear",
        // tick0: startTime,
        dtick: 60 * 60 * 1000,
        automargin: true,
        tickangle: 283,
      },
      yaxis: {
        title: "Frequency (HZ)",
        showgrid: true,
        zeroline: true,
        showspikes: true,
        spikethickness: 1,
        showline: true,
        titlefont: { color: "#000" },
        tickfont: { color: "#000", size: 18 },
        // range: [49.7, 50.3],
        // tickformat: "digits",
      },
    };

    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
      const trace = plotData.traces[traceIter];
      const xyData = getPlotXYArrays(trace.data);
      let traceObj = {
        x: xyData.timestamps,
        y: xyData.vals,
        type: "scatter",
        mode: "lines",
        name: trace.name,
        width: 10,
        hovertemplate: "(%{x}" + ", %{y}Hz)",
      };
      if (trace.line != null) {
        traceObj["line"] = trace.line;
      }
      if (trace.visible != null) {
        traceObj["visible"] = trace.visible;
      }
      traceData.push(traceObj);

      Plotly.newPlot(divId, traceData, layout);
    }
  }
};
