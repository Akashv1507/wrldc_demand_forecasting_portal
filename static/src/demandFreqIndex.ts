import { PlotData, PlotTrace, setPlotTraces } from "./demandFreqPlotUtils";
import { getDemandFreq } from "./demandFreqFetchApiUtils";
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
  intradayforecastedDemand:[Date, number][];
  todayFreq: [Date, number][];
  prevdayFreq: [Date, number][];
}

let intervalID = null;

window.onload = async () => {
  intervalID = setInterval(refreshData, 1000 * 60 * 4);
  // (document.getElementById("refreshBtn") as HTMLButtonElement).onclick =
  //   refreshData;
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

  let demandPlotData: PlotData = {
    title: "WR-DEMAND",
    traces: [],
  };
  let freqPlotData: PlotData = {
    title: "FREQUENCY",
    traces: [],
  };
  let fetchedData: DataFromApi = await getDemandFreq(startTime, endTime);

  let todayActualDemandTrace: PlotTrace = {
    name: "Today Demand",
    data: convertToIst(fetchedData.todayActualDemand),
    line: {
      width: 4,
    },
  };

  let yestActualDemandTrace: PlotTrace = {
    name: "Yesterday Demand",
    data: addOneDayTime(convertToIst(fetchedData.prevDayActualDemand)),
    line: {
      width: 4,
    },
  };

  let IntradayFOrecastedDemandTrace: PlotTrace = {
    name: "Intraday Forecast",
    data: convertToIst(fetchedData.intradayforecastedDemand),
    line: {
      width: 4,
    },
    visible: "legendonly", 
  };


  let todayFreq: PlotTrace = {
    name: "Today Frequency",
    data: convertToIst(fetchedData.todayFreq),
    line: {
      width: 4,
    },
  };
  let prevdayFreq: PlotTrace = {
    name: "Yesterday Frequency",
    data: addOneDayTime(convertToIst(fetchedData.prevdayFreq)),
    line: {
      width: 4,
    },
  };

  //setting graph for demand
  demandPlotData.traces.push(todayActualDemandTrace);
  demandPlotData.traces.push(yestActualDemandTrace);
  demandPlotData.traces.push(IntradayFOrecastedDemandTrace);
  setPlotTraces("wrDemandDiv", demandPlotData);

  // setting graph for freq
  freqPlotData.traces.push(todayFreq);
  freqPlotData.traces.push(prevdayFreq);
  setPlotTraces("wrFreqDiv", freqPlotData);
};
