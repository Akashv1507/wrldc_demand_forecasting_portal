import Plotly from 'plotly.js-dist';



export interface PlotTrace{
    name : string;
    data : [Date, number][];
    line?: { color?: string, width?: number };
    visible?:string|boolean;
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
        title:{
            text:plotData.title,
            font: {
              size: 24
            }
          }, 
        // plot_bgcolor:"black",
        // paper_bgcolor:"#FFF3",
        showlegend: true,
        legend: { "orientation": "h" ,
        y:-0.2,
        font: {
            family: 'sans-serif',
            size: 15,
          }},

        autosize: false,
        height: 600,
        width: 1500,
        xaxis:{
            showgrid: false,
            zeroline: true,
            showspikes: true,
            spikethickness:1,
            showline: true,
            titlefont: {color: '#000', size: 22},
            tickfont: {color: '#000'},
            tickmode: "linear",
            // tick0: today,
           dtick: 15 * 60 * 1000 ,
           automargin: true
              
        },
        yaxis: {
            title: 'MW ', 
            showgrid: true, 
            zeroline: true, 
            showspikes:true,
            spikethickness:1,
            showline: true,
            titlefont: {color: '#000'},
            tickfont: {color: '#000'},
            tickformat: "digits",       
       },
    
//         yaxis2: {
//             title: 'Percentage Error',
//             range: [-20, +20],
//             titlefont: {color: 'rgb(148, 103, 189)'},
//             tickfont: {color: 'rgb(148, 103, 189)'},
//             overlaying: 'y',
//             side: 'right',
//             showgrid: false,
//             zeroline: true,
//             showspikes:true,
//             spikethickness:1,
//             showline: true
//   }
    }

    for (var traceIter = 0; traceIter < plotData.traces.length; traceIter++) {
        const trace = plotData.traces[traceIter];
        const xyData = getPlotXYArrays(trace.data)
        // creating different graph for bias error  , which is 2nd index of plotdata.traces
        if(traceIter != 5){
            let traceObj = {
                x: xyData.timestamps,
                y: xyData.vals,
                type: 'scatter',
                mode: 'lines',
                name: trace.name,
                width:10,
                hovertemplate: '(%{x}'+', %{y:.0f}Mw)' 
                
            };
            if (trace.line != null) {
                traceObj['line'] = trace.line
            } 
            if(trace.visible!= null){
                traceObj['visible']= trace.visible
            } 
            traceData.push(traceObj); 
        }
        else{
            let traceObj = {
                x: xyData.timestamps,
                y: xyData.vals,
                yaxis: 'y2',
                type:'bar',
                width:1,
                marker:{ 
                    color: 'rgb(178,34,34)'
                  },
                name: trace.name
        };
        traceData.push(traceObj);
        }
        
        Plotly.newPlot(divId, traceData, layout);
    }
}
