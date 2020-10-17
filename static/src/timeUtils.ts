
export const convertDateTimeToUrlStr = (inp: Date): string => {
    return `${inp.getFullYear()}-${ensureTwoDigits(inp.getMonth() + 1)}-${ensureTwoDigits(inp.getDate())}-${ensureTwoDigits(inp.getHours())}-${ensureTwoDigits(inp.getMinutes())}-${ensureTwoDigits(inp.getSeconds())}`;
}

const ensureTwoDigits = (num: number): string => {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

//subtracting 5 hrs and 30 min and converting to indian standard time.
export const convertToIst = (data:[Date, number][])=>{
    let ind =0;
    for(ind; ind< data.length; ind++ ){
        data[ind][0] = new Date(data[ind][0]);
        data[ind][0] = new Date(data[ind][0].getTime() - 330*60*1000);
    }
    
    return data;
}
export const addOneDayTime = (data:[Date, number][])=>{
    let ind =0;
    for(ind; ind< data.length; ind++ ){
        data[ind][0] = new Date(data[ind][0]);
        data[ind][0] = new Date(data[ind][0].getTime() + 24*60*60*1000);
    }
    
    return data;
}
export const subtractOneDayTime = (data:[Date, number][])=>{
    let ind =0;
    for(ind; ind< data.length; ind++ ){
        data[ind][0] = new Date(data[ind][0]);
        data[ind][0] = new Date(data[ind][0].getTime() - 24*60*60*1000);
    }
    
    return data;
}