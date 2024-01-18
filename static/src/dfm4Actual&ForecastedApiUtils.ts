import { convertDateTimeToUrlStr } from "./timeUtils";


export const getActualForecastedDemand = async (entityTag: string, startDate: Date, endDate: Date) => {
    try {
        const startDateStr = convertDateTimeToUrlStr(startDate);
        const endDateStr = convertDateTimeToUrlStr(endDate);
        const resp = await fetch(`/api/dfm4/${entityTag}/${startDateStr}/${endDateStr}`, {
            method: 'get'
        });
        const respJSON = await resp.json();
        return respJSON;
    } catch (e) {
        console.error(e);
        return [];
    }
};