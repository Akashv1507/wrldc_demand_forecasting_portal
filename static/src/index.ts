import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getActualForecastedDemand} from './achtual&ForecastedApiUtils'
import {addOneDayTime, convertToIst, getBlockNo, subtractOneDayTime} from './timeUtils'

export interface DataFromApi{
todayActualDemand: [Date, number][];
prevDayActualDemand: [Date, number][];
intradayForecastedDemand: [Date, number][];
todayDaForecast:[Date, number][];
tommDaForecast:[Date, number][];
percentageBiasError : [Date, number][];
}

const wrTotal = { tagId: "WRLDCMP.SCADA1.A0047000" , tagName: "WR-Total Actual vs Forecasted Demand" , divName:'wrTotalDiv', spanName:'wrTotalSpan',infoName : 'WR'};
const maharastra = { tagId: "WRLDCMP.SCADA1.A0046980" , tagName: "Maharastra Actual vs Forecasted Demand" , divName:'mahDiv' , spanName:'mahSpan',infoName : 'Mah'};
const gujrat = { tagId: "WRLDCMP.SCADA1.A0046957" , tagName: "Gujrat Actual vs Forecasted Demand" , divName:'guzDiv', spanName:'guzSpan',infoName : 'Guz'};
const madhyaPradesh = { tagId: "WRLDCMP.SCADA1.A0046978" , tagName: "Madhya-Pradesh Actual vs Forecasted Demand" , divName:'mpDiv', spanName:'mpSpan',infoName : 'MP'};
const chattisgarh = { tagId: "WRLDCMP.SCADA1.A0046945" , tagName: "Chattisgarh Actual vs Forecasted Demand" , divName:'chattDiv' , spanName:'chattSpan',infoName : 'Chatt'};
const goa = { tagId: "WRLDCMP.SCADA1.A0046962" , tagName: "Goa Actual vs Forecasted Demand" , divName:'goaDiv', spanName:'goaSpan',infoName : 'Goa'};
const dd = { tagId: "WRLDCMP.SCADA1.A0046948" , tagName: "Daman & Diu Actual vs Forecasted Demand" , divName:'ddDiv', spanName:'ddSpan',infoName : 'DD'};
const dnh  = { tagId: "WRLDCMP.SCADA1.A0046953" , tagName: "Dadar Nagar Haweli Actual vs Forecasted Demand" , divName:'dnhDiv', spanName:'dnhSpan',infoName : 'DNH'};

let intervalID = null

window.onload = async () => {
    intervalID = setInterval(refreshData , 1000*60*6);
    (document.getElementById('refreshBtn') as HTMLButtonElement ).onclick = refreshData;
    // refreshData()
}

const refreshData = async () =>{
    const nowTime = new Date(); 
    const daysOffset = +((document.getElementById('daysOffsetInp') as HTMLInputElement).value);
    // console.log(daysOffset)
    let startTime = new Date(nowTime.getTime() - (daysOffset-1)*24*60*60*1000)
    startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0, 0, 0);
    const endTime = nowTime
    const tracePnt = [wrTotal, maharastra, gujrat, madhyaPradesh, chattisgarh, goa, dd, dnh]
    for(let traceInd=0; traceInd< tracePnt.length; traceInd++){

        let plotData : PlotData = {
            title : tracePnt[traceInd].tagName,
            traces : []
        }
        let fetchedData: DataFromApi = await getActualForecastedDemand(tracePnt[traceInd].tagId, startTime, endTime)
        let todayActualDemandTrace:PlotTrace ={
            name : "Actual Demand",
            data : convertToIst(fetchedData.todayActualDemand),
            line: {
                width: 3
              }  
        }
        let yestActualDemandTrace:PlotTrace ={
            name : "Yestrerday Actual Demand",
            data : addOneDayTime(convertToIst(fetchedData.prevDayActualDemand)),
            line: {
                width: 3
              },
            visible: "legendonly",  
        }
        let intradayForecastedDemandTrace:PlotTrace ={
            name : "Forecasted Demand",
            line: {
                width: 3
              },
            
            data : convertToIst(fetchedData.intradayForecastedDemand)   
        }
        let todayDaforecastedDemandTrace:PlotTrace ={
            name : " Today Day-Ahead Forecast",
            data : convertToIst(fetchedData.todayDaForecast),
            line: {
                width: 3
              },
            visible: "legendonly"    
        }
        let tommDaforecastedDemandTrace:PlotTrace ={
            name : " Tommorow Day-Ahead Forecast",
            line: {
                width: 3
              },
            visible: "legendonly",
            data : subtractOneDayTime(convertToIst(fetchedData.tommDaForecast))   
        }
        let percentageBiasErrorTrace:PlotTrace ={
            name: 'Percentage Error',
            line: {
                color: 'rgb(128,0,0)',
                width: 1000
              },
            // visible: false,
            data : convertToIst(fetchedData.percentageBiasError)
        }
        plotData.traces.push(todayActualDemandTrace);
        plotData.traces.push(intradayForecastedDemandTrace);
        plotData.traces.push(yestActualDemandTrace);
        plotData.traces.push(todayDaforecastedDemandTrace);
        plotData.traces.push(tommDaforecastedDemandTrace);
        plotData.traces.push(percentageBiasErrorTrace)
        setPlotTraces(tracePnt[traceInd].divName, plotData);

        //creating meta information of current demand and forecast
        const spanId = document.getElementById(tracePnt[traceInd].spanName)
        const blockNo = getBlockNo()

        const currDemand=fetchedData.todayActualDemand[fetchedData.todayActualDemand.length-1]
        const demand= Math.round(currDemand[1])

        const currForecastedDemand = fetchedData.intradayForecastedDemand[blockNo]
        const forecast = Math.round(currForecastedDemand[1])

        const infoName =tracePnt[traceInd].infoName
        spanId.innerHTML = `<b>At ${currDemand[0].getHours()}:${currDemand[0].getMinutes()} ${infoName} Demand = ${demand} Mw,  <br> At ${currForecastedDemand[0].getHours()}:${currForecastedDemand[0].getMinutes()} ${infoName} Forecast =${forecast} Mw.</b>`
    }
    

}