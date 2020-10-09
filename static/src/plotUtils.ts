import Plotly from 'plotly.js-dist';

export interface PlotTrace{
    name : string;
    data : [Date, number];
    line?: { color?: string, width?: string };
}

export interface PlotData{
    title: string;
    traces: PlotTrace[];
}

export const getPlotXYArrays = (measData: PlotTrace["data"]): { timestamps: Date[], vals: number[] } => {
    let timestamps: Date[] = [];
    let vals: number[] = [];
    for (var i = 0; i < measData.length; i = i + 1) {
        timestamps.push(new Date(measData[i][0]));
        vals.push(measData[i][1] as number);
    }
    return { timestamps: timestamps, vals: vals }
}

export const setPlotTraces = (divId: string, plotData: PlotData) => {
    let traceData = [];
    const layout = {
        title: plotData.title,
        showlegend: true,
        legend: { "orientation": "h" },
        autosize: true
    }

    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
        const trace = plotData.traces[traceIter];
        const xyData = getPlotXYArrays(trace.data)
        let traceObj = {
            x: xyData.timestamps,
            y: xyData.vals,
            mode: 'lines',
            name: trace.name
        };
        if (trace.line != null) {
            traceObj['line'] = trace.line
        }

        traceData.push(traceObj);
        Plotly.newPlot(divId, traceData, layout);
    }
}