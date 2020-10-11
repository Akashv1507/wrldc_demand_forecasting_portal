import Plotly from 'plotly.js-dist';

export interface PlotTrace{
    name : string;
    data : [Date, number][];
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
        autosize: true,
        xaxix:{
            showgrid: false,
            zeroline: true,
            showspikes: true,
            spikethickness:1,
            showline: true,
            // tickformat: '%H:%M:%S',
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            // showticklabels: true,
            // type: 'category'
            // tickmode:'linear',
            // dtick: 1   
        },
        yaxis: {
            title: 'MW ', 
            showgrid: false, 
            zeroline: true, 
            showspikes:true,
            spikethickness:1,
            showline: true,
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            tickformat: "digits",
            // hovermode: "closest",
            
       },
        yaxis2: {
            title: 'Percentage Error',
            range: [-20, +20],
            titlefont: {color: 'rgb(148, 103, 189)'},
            tickfont: {color: 'rgb(148, 103, 189)'},
            overlaying: 'y',
            side: 'right',
            showgrid: false,
            zeroline: true,
            showspikes:true,
            spikethickness:1,
            showline: true
  }
    }

    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
        const trace = plotData.traces[traceIter];
        const xyData = getPlotXYArrays(trace.data)
        // creating different graph for bias error  , which is 2nd index of plotdata.traces
        if(traceIter != 2){
            let traceObj = {
                x: xyData.timestamps,
                y: xyData.vals,
                type: 'scatter',
                mode: 'lines',
                name: trace.name,
                // hoverinfo: 'x+y'
                hovertemplate: '(%{x}'+', %{y:.0f}Mw)' 

                
            };
            if (trace.line != null) {
                traceObj['line'] = trace.line
            }   
            traceData.push(traceObj); 
        }
        else{
            let traceObj = {
                x: xyData.timestamps,
                y: xyData.vals,
                yaxis: 'y2',
                type:'bar',
                width:0.5,
                marker:{
                    color: 'rgb(128,0,0)'
                  },
                name: trace.name
        };
        traceData.push(traceObj);
        }
        
        Plotly.newPlot(divId, traceData, layout);
    }
}
