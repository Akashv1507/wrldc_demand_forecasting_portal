import { PlotData, PlotTrace, setPlotTraces } from "./plotUtils";
import { getActualForecastedDemand } from "./dfm4Actual&ForecastedApiUtils";
import {
  addOneDayTime,
  convertToIst,
  getBlockNo,
  subtractOneDayTime,
  ensureTwoDigits,
} from "./timeUtils";

export interface DataFromApi {
  todayActualDemand: [Date, number][];
  prevDayActualDemand: [Date, number][];
  intradayForecastedDemand: [Date, number][];
  todayDaForecast: [Date, number][];
  tommDaForecast: [Date, number][];
  // percentageBiasError : [Date, number][];
}

const wrTotal = {
  tagId: "WRLDCMP.SCADA1.A0047000",
  tagName: "WR Actual vs Forecasted Demand (ANN)",
  divName: "wrTotalDiv",
  divNameActDem: "wrTotalActualDiv",
  spanName: "wrTotalSpan",
  blockNoSpan: "wrBlockNoSpan",
  infoName: "WR",
};
const maharastra = {
  tagId: "WRLDCMP.SCADA1.A0046980",
  tagName: "Maharastra Actual vs Forecasted Demand  (ANN)",
  divName: "mahDiv",
  divNameActDem: "mahActualhDiv",
  spanName: "mahSpan",
  blockNoSpan: "mahBlockNoSpan",
  infoName: "Mah",
};
const gujarat = {
  tagId: "WRLDCMP.SCADA1.A0046957",
  tagName: "Gujrat Actual vs Forecasted Demand (ANN)",
  divName: "gujDiv",
  divNameActDem: "gujActualDiv",
  spanName: "gujSpan",
  blockNoSpan: "gujBlockNoSpan",
  infoName: "Guj",
};
const madhyaPradesh = {
  tagId: "WRLDCMP.SCADA1.A0046978",
  tagName: "Madhya-Pradesh Actual vs Forecasted Demand (ANN)",
  divName: "mpDiv",
  divNameActDem: "mpActualDiv",
  spanName: "mpSpan",
  blockNoSpan: "mpBlockNoSpan",
  infoName: "MP",
};
const chattisgarh = {
  tagId: "WRLDCMP.SCADA1.A0046945",
  tagName: "Chattisgarh Actual vs Forecasted Demand (ANN)",
  divName: "chattDiv",
  divNameActDem: "chattActualDiv",
  spanName: "chattSpan",
  blockNoSpan: "chattBlockNoSpan",
  infoName: "Chatt",
};
const goa = {
  tagId: "WRLDCMP.SCADA1.A0046962",
  tagName: "Goa Actual vs Forecasted Demand (ANN)",
  divName: "goaDiv",
  divNameActDem: "goaActualDiv",
  spanName: "goaSpan",
  blockNoSpan: "goaBlockNoSpan",
  infoName: "Goa",
};
const dd = {
  tagId: "WRLDCMP.SCADA1.A0046948",
  tagName: "Daman & Diu Actual vs Forecasted Demand (ANN)",
  divName: "ddDiv",
  divNameActDem: "ddActualDiv",
  spanName: "ddSpan",
  blockNoSpan: "ddBlockNoSpan",
  infoName: "DD",
};
const dnh = {
  tagId: "WRLDCMP.SCADA1.A0046953",
  tagName: "Dadar Nagar Haweli Actual vs Forecasted Demand (ANN)",
  divName: "dnhDiv",
  divNameActDem: "dnhActualDiv",
  spanName: "dnhSpan",
  blockNoSpan: "dnhBlockNoSpan",
  infoName: "DNH",
};

let intervalID = null;

window.onload = async () => {
  intervalID = setInterval(refreshData, 1000 * 60 * 4);
  (document.getElementById("refreshBtn") as HTMLButtonElement).onclick =
    refreshData;
  refreshData();
};

const refreshData = async () => {
  const nowTime = new Date();
  // const daysOffset = +((document.getElementById('daysOffsetInp') as HTMLInputElement).value);
  // console.log(daysOffset)
  // let startTime = new Date(nowTime.getTime() - (daysOffset-1)*24*60*60*1000)
  let startTime = new Date(nowTime.getTime());
  startTime = new Date(
    startTime.getFullYear(),
    startTime.getMonth(),
    startTime.getDate(),
    0,
    0,
    0
  );
  const endTime = nowTime;
  // const tracePnt = [wrTotal, maharastra, gujrat, madhyaPradesh, chattisgarh, goa, dd, dnh]
  const tracePnt = [wrTotal, maharastra, gujarat, madhyaPradesh, chattisgarh];

  for (let traceInd = 0; traceInd < tracePnt.length; traceInd++) {
    let plotData: PlotData = {
      title: tracePnt[traceInd].tagName,
      traces: [],
    };
    let fetchedData: DataFromApi = await getActualForecastedDemand(
      tracePnt[traceInd].tagId,
      startTime,
      endTime
    );

    let todayActualDemandTrace: PlotTrace = {
      name: "Actual Demand",
      data: convertToIst(fetchedData.todayActualDemand),
      line: {
        width: 8,
      },
    };

    let yestActualDemandTrace: PlotTrace = {
      name: "Yesterday Actual Demand",
      data: addOneDayTime(convertToIst(fetchedData.prevDayActualDemand)),
      line: {
        width: 8,
      },
      visible: "legendonly",
    };
    let intradayForecastedDemandTrace: PlotTrace = {
      name: "Forecasted Demand",
      line: {
        width: 8,
      },

      data: convertToIst(fetchedData.intradayForecastedDemand),
    };
    let todayDaforecastedDemandTrace: PlotTrace = {
      name: " Today Day-Ahead Forecast",
      data: convertToIst(fetchedData.todayDaForecast),
      line: {
        width: 8,
      },
      visible: "legendonly",
    };
    let tommDaforecastedDemandTrace: PlotTrace = {
      name: " Tommorow Day-Ahead Forecast",
      line: {
        width: 8,
      },
      visible: "legendonly",
      data: subtractOneDayTime(convertToIst(fetchedData.tommDaForecast)),
    };
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
    const spanId = document.getElementById(tracePnt[traceInd].spanName);
    const blockNoSpanId = document.getElementById(
      tracePnt[traceInd].blockNoSpan
    );
    const blockNo = getBlockNo();
    const currDate = ensureTwoDigits(startTime.getDate());
    const currMonth = ensureTwoDigits(startTime.getMonth() + 1);
    const currYear = ensureTwoDigits(startTime.getFullYear());

    //checking data received from backend or not
    if (
      fetchedData.todayActualDemand.length > 0 &&
      fetchedData.intradayForecastedDemand.length > 0
    ) {
      const currDemand: [Date, number] =
        fetchedData.todayActualDemand[fetchedData.todayActualDemand.length - 1];
      const currHrs = ensureTwoDigits(currDemand[0].getHours());
      const currMin = ensureTwoDigits(currDemand[0].getMinutes());
      const demand = Math.round(currDemand[1]);
      const currForecastedDemand: [Date, number] =
        fetchedData.intradayForecastedDemand[blockNo - 1];
      const forecast = Math.round(currForecastedDemand[1]);

      const percentageError = (((demand - forecast) / demand) * 100).toFixed(2);
      const infoName = tracePnt[traceInd].infoName;

      blockNoSpanId.innerHTML = `<b>Date- ${currDate}-${currMonth}-${currYear} <br> Block No. - ${blockNo}<b>`;
      spanId.innerHTML = `<b>At ${currHrs}:${currMin} ${infoName} Demand = ${demand} MW  <br> At ${currHrs}:${currMin} ${infoName} Forecast = ${forecast} MW <br> Percentage Error = ${percentageError}%</b>`;
    }

    //previous day actual demand on another graph, removed by management
    // let actualPlotData : PlotData = {
    //     title : '',
    //     traces : []
    // };
    // let yesterdayActualDemandTrace:PlotTrace ={
    //     name : "Yestrerday Actual Demand",
    //     data : fetchedData.prevDayActualDemand ,
    //     line: {
    //         width: 8
    //       }
    // };

    // actualPlotData.traces.push(yesterdayActualDemandTrace);
    // setPlotTraces(tracePnt[traceInd].divNameActDem, actualPlotData );
  }
};
