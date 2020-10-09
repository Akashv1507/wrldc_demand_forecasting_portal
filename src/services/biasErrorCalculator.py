from typing import List, Union
import datetime as dt
def calculateBiasError(actualDemandData :List[Union[dt.datetime, float]], forecastedDemandData:List[Union[dt.datetime, float]])-> List[Union[dt.datetime, float]]:
    
    listIndex = 0
    percentageBiasErrorList :List[Union[dt.datetime, float]] =[]
    while(listIndex < len(actualDemandData)):
        timestamp = actualDemandData[listIndex][0]
        percentageBiasError = ((actualDemandData[listIndex][1]-(actualDemandData[listIndex][1]-400))/actualDemandData[listIndex][1])*100
        tempList = [timestamp, percentageBiasError]
        percentageBiasErrorList.append(tempList)
        listIndex = listIndex +1
    return percentageBiasErrorList

