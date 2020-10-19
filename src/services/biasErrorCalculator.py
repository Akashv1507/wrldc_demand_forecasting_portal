from typing import List, Union
import datetime as dt
def calculateBiasError(actualDemandData :List[Union[dt.datetime, float]], forecastedDemandData:List[Union[dt.datetime, float]])-> List[Union[dt.datetime, float]]:
    """calculate blockwise bias error

    Args:
        actualDemandData (List[Union[dt.datetime, float]]): actual demand data
        forecastedDemandData (List[Union[dt.datetime, float]]): forecasted demand data

    Returns:
        List[Union[dt.datetime, float]]: list of [[timestamp, bias error]]
    """    
    
    listIndex = 0
    percentageBiasErrorList :List[Union[dt.datetime, float]] =[]

     # getting time upto which data is present
    timeUptodataPresent: dt.datetime = actualDemandData[-1][0] 
    timeUptodataPresent = timeUptodataPresent.replace(second=0, microsecond=0)
    endBlockTime = timeUptodataPresent
    while (endBlockTime.minute % 15) != 14:
        endBlockTime = endBlockTime - dt.timedelta(minutes=1)

    # print(len(actualDemandData), len(forecastedDemandData))
    while(listIndex < len(actualDemandData)):
        timestamp:dt.datetime = actualDemandData[listIndex][0]
        if timestamp.minute % 15 == 0 and timestamp <= endBlockTime :
            percentageBiasError = ((actualDemandData[listIndex][1]- forecastedDemandData[listIndex][1])/actualDemandData[listIndex][1])*100
            tempList = [timestamp, percentageBiasError]
            percentageBiasErrorList.append(tempList)
        listIndex = listIndex +1
    return percentageBiasErrorList

