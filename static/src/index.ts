import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getActualForecastedDemand} from './achtual&ForecastedApiUtils'

export interface DataFromApi{
actualDemand: [Date, number];
forecastedDemand: [Date, number];
}

const wrTotal = { tagId: "WRLDCMP.SCADA1.A0047000" , tagName: "WR-TOATAL Actual vs Forecasted Demand" , divName:'wrTotalDiv'};
const maharastra = { tagId: "WRLDCMP.SCADA1.A0046980" , tagName: "MAHARASTRA Actual vs Forecasted Demand" , divName:'mahDiv'};
const gujrat = { tagId: "WRLDCMP.SCADA1.A0046957" , tagName: "GUJRAT Actual vs Forecasted Demand" , divName:'guzDiv'};
const madhyaPradesh = { tagId: "WRLDCMP.SCADA1.A0046978" , tagName: "MADHYA-PRADESH Actual vs Forecasted Demand" , divName:'mpDiv'};
const chattisgarh = { tagId: "WRLDCMP.SCADA1.A0046945" , tagName: "CHATTISGARH Actual vs Forecasted Demand" , divName:'chattDiv' };
const goa = { tagId: "WRLDCMP.SCADA1.A0046962" , tagName: "GOA Actual vs Forecasted Demand" , divName:'goaDiv'};
const dd = { tagId: "WRLDCMP.SCADA1.A0046948" , tagName: "DAMAN & DIU Actual vs Forecasted Demand" , divName:'ddDiv'};
const dnh  = { tagId: "WRLDCMP.SCADA1.A0046953" , tagName: "DADAR NAGAR HAWELI Actual vs Forecasted Demand" , divName:'dnhDiv'};

let intervalID = null

window.onload = async () => {
    intervalID = setInterval(refreshData , 1000*60*3);
    (document.getElementById('refreshBtn') as HTMLButtonElement ).onclick = refreshData;
    refreshData()
}

const refreshData = async () =>{
    const nowTime = new Date(); 
    const daysOffset = +((document.getElementById('daysOffsetInp') as HTMLInputElement).value);
    console.log(daysOffset)
    const startTime = new Date(nowTime.getTime() - daysOffset*24*60*60*1000)
    const endTime = nowTime
    const tracePnt = [wrTotal, maharastra, gujrat, madhyaPradesh, chattisgarh, goa, dd, dnh]
    for(let traceInd=0; traceInd< tracePnt.length; traceInd++){

        let plotData : PlotData = {
            title : tracePnt[traceInd].tagName,
            traces : []
        }
        let fetchedData:DataFromApi = await getActualForecastedDemand(tracePnt[traceInd].tagId, startTime, endTime)
        let actualDemandTrace:PlotTrace ={
            name : "Actual Demand",
            data : fetchedData.actualDemand
        }
        let forecastedDemandTrace:PlotTrace ={
            name : "Forecasted Demand",
            data : fetchedData.forecastedDemand
        }
        plotData.traces.push(actualDemandTrace);
        plotData.traces.push(forecastedDemandTrace);
        setPlotTraces(tracePnt[traceInd].divName, plotData);
    }
    

}