import { convertDateTimeToUrlStr } from "./timeUtils";
import { DataFromApi } from "./index";

export const getDemandFreq = async (startDate: Date, endDate: Date) => {
  try {
    const startDateStr = convertDateTimeToUrlStr(startDate);
    const endDateStr = convertDateTimeToUrlStr(endDate);
    const resp = await fetch(
      `/api/demandFrequency/${startDateStr}/${endDateStr}`,
      {
        method: "get",
      }
    );
    const respJSON = await resp.json();
    return respJSON;
  } catch (e) {
    console.error(e);
    return [];
  }
};
