export const convertDateTimeToUrlStr = (inp: Date): string => {
    return `${inp.getFullYear()}-${ensureTwoDigits(inp.getMonth() + 1)}-${ensureTwoDigits(inp.getDate())}-${ensureTwoDigits(inp.getHours())}-${ensureTwoDigits(inp.getMinutes())}-${ensureTwoDigits(inp.getSeconds())}`;
}

const ensureTwoDigits = (num: number): string => {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}