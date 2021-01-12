import { convertDateTimeToUrlStr } from "./timeUtils";
import {DataFromApi} from "./index"

export const getActualForecastedDemand = async (entityTag: string, startDate: Date, endDate: Date) => {
    try {
        const startDateStr = convertDateTimeToUrlStr(startDate);
        const endDateStr = convertDateTimeToUrlStr(endDate);
        const resp = await fetch(`/api/${entityTag}/${startDateStr}/${endDateStr}`, {
            method: 'get'
        });
        const respJSON = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return [];
    }
};