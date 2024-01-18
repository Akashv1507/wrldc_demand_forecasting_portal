
export const convertDateTimeToUrlStr = (inp: Date): string => {
    return `${inp.getFullYear()}-${ensureTwoDigits(inp.getMonth() + 1)}-${ensureTwoDigits(inp.getDate())}-${ensureTwoDigits(inp.getHours())}-${ensureTwoDigits(inp.getMinutes())}-${ensureTwoDigits(inp.getSeconds())}`;
}

export const ensureTwoDigits = (num: number): string => {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

export let startTime = new Date()
startTime = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), 0, 0, 0);
startTime = new Date(startTime.getTime()+ 15*60*1000)

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

export const getBlockNo = ():number=>{
    let currTime = new Date();
    let startTime = new Date(currTime.getFullYear(), currTime.getMonth(), currTime.getDate(), 0, 0, 0)
    let endTime = new Date(startTime.getTime() + 15*60*1000)
    let blockNo = 0;
    for(var i =1; i<=96 ; i++){
        if (startTime<=currTime && currTime<endTime){
            blockNo = i;
            break;
        }
        else{
            startTime = new Date(startTime.getTime()+ 15*60*1000)
            endTime = new Date(endTime.getTime()+ 15*60*1000)
        }
    }
    return blockNo;
}