import {PlotData, PlotTrace, setPlotTraces } from './plotUtils'
import {getActualForecastedDemand} from './achtual&ForecastedApiUtils'
import {addOneDayTime, convertToIst, getBlockNo, subtractOneDayTime} from './timeUtils'

export interface DataFromApi{
todayActualDemand: [Date, number][];
prevDayActualDemand: [Date, number][];
intradayForecastedDemand: [Date, number][];
todayDaForecast:[Date, number][];
tommDaForecast:[Date, number][];
// percentageBiasError : [Date, number][];
}

const wrTotal = { tagId: "WRLDCMP.SCADA1.A0047000" , tagName: "WR-Total Actual vs Forecasted Demand" , divName:'wrTotalDiv',divNameActDem:'wrTotalActualDiv', spanName:'wrTotalSpan',infoName : 'WR'};
const maharastra = { tagId: "WRLDCMP.SCADA1.A0046980" , tagName: "Maharastra Actual vs Forecasted Demand" , divName:'mahDiv' ,divNameActDem:'mahActualhDiv', spanName:'mahSpan',infoName : 'Mah'};
const gujrat = { tagId: "WRLDCMP.SCADA1.A0046957" , tagName: "Gujrat Actual vs Forecasted Demand" , divName:'gujDiv', divNameActDem:'gujActualDiv', spanName:'gujSpan',infoName : 'Guj'};
const madhyaPradesh = { tagId: "WRLDCMP.SCADA1.A0046978" , tagName: "Madhya-Pradesh Actual vs Forecasted Demand" , divName:'mpDiv', divNameActDem:'mpActualDiv',  spanName:'mpSpan',infoName : 'MP'};
const chattisgarh = { tagId: "WRLDCMP.SCADA1.A0046945" , tagName: "Chattisgarh Actual vs Forecasted Demand" , divName:'chattDiv' , divNameActDem:'chattActualDiv',  spanName:'chattSpan',infoName : 'Chatt'};
const goa = { tagId: "WRLDCMP.SCADA1.A0046962" , tagName: "Goa Actual vs Forecasted Demand" , divName:'goaDiv', divNameActDem:'goaActualDiv',  spanName:'goaSpan',infoName : 'Goa'};
const dd = { tagId: "WRLDCMP.SCADA1.A0046948" , tagName: "Daman & Diu Actual vs Forecasted Demand" , divName:'ddDiv', divNameActDem:'ddActualDiv',  spanName:'ddSpan',infoName : 'DD'};
const dnh  = { tagId: "WRLDCMP.SCADA1.A0046953" , tagName: "Dadar Nagar Haweli Actual vs Forecasted Demand" , divName:'dnhDiv', divNameActDem:'dnhActualDiv',  spanName:'dnhSpan',infoName : 'DNH'};

let intervalID = null

window.onload = async () => {
    intervalID = setInterval(refreshData , 1000*60*6);
    (document.getElementById('refreshBtn') as HTMLButtonElement ).onclick = refreshData;
    refreshData()
}

const refreshData = async () =>{
    const nowTime = new Date(); 
    // const daysOffset = +((document.getElementById('daysOffsetInp') as HTMLInputElement).value);
    // console.log(daysOffset)
    // let startTime = new Date(nowTime.getTime() - (daysOffset-1)*24*60*60*1000)
    let startTime = new Date(nowTime.getTime())
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
            name : "Yesterday Actual Demand",
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
        // let percentageBiasErrorTrace:PlotTrace ={
        //     name: 'Percentage Error',
        //     line: {
        //         color: 'rgb(128,0,0)',
        //         width: 1000
        //       },
        //     // visible: false,
        //     data : convertToIst(fetchedData.percentageBiasError)
        // }
        plotData.traces.push(todayActualDemandTrace);
        plotData.traces.push(intradayForecastedDemandTrace);
        plotData.traces.push(yestActualDemandTrace);
        plotData.traces.push(todayDaforecastedDemandTrace);
        plotData.traces.push(tommDaforecastedDemandTrace);
        // plotData.traces.push(percentageBiasErrorTrace)
        setPlotTraces(tracePnt[traceInd].divName, plotData);

        //creating meta information of current demand and forecast
        const spanId = document.getElementById(tracePnt[traceInd].spanName)
        const blockNo = getBlockNo()
        const currDate = startTime.getDate()
        const currMonth = startTime.getMonth()+1
        const currYear = startTime.getFullYear()

        const currDemand:[Date, number] =fetchedData.todayActualDemand[fetchedData.todayActualDemand.length-1]
        const demand= Math.round(currDemand[1])

        const currForecastedDemand:[Date, number] = fetchedData.intradayForecastedDemand[blockNo-1]
        const forecast = Math.round(currForecastedDemand[1])

        const percentageError = (((demand-forecast)/demand)*100).toFixed(2)
        const infoName =tracePnt[traceInd].infoName
        spanId.innerHTML = `<b>Date- ${currDate}-${currMonth}-${currYear}, Block No. - ${blockNo}, <br> At ${currDemand[0].getHours()}:${currDemand[0].getMinutes()} ${infoName} Demand = ${demand} MW,  <br> At ${currForecastedDemand[0].getHours()}:${currForecastedDemand[0].getMinutes()} ${infoName} Forecast =${forecast} MW,<br> Percentage Error =${percentageError}%</b>`

        //previous day actual demand on another graph
        let actualPlotData : PlotData = {
            title : '',
            traces : []
        };
        let yesterdayActualDemandTrace:PlotTrace ={
            name : "Yestrerday Actual Demand",
            data : fetchedData.prevDayActualDemand , 
            line: {
                width: 3
              } 
        };
        
        actualPlotData.traces.push(yesterdayActualDemandTrace);
        setPlotTraces(tracePnt[traceInd].divNameActDem, actualPlotData );

    }
    

}