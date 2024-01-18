import pandas as pd
import datetime as dt
from typing import List, Tuple, TypedDict, Union
from src.services.demandFreqFetch.scadaApiFetcher import ScadaApiFetcher

class DemandFetchFromApi():
    """class to fetch demand data
    """   

    def __init__(self, tokenUrl, apiBaseUrl, clientId, clientSecret):
        self.tokenUrl = tokenUrl
        self.apiBaseUrl = apiBaseUrl
        self.clientId = clientId
        self.clientSecret = clientSecret

    def toListOfTuple(self, df:pd.core.frame.DataFrame) -> List[Union[dt.datetime, float]]:
        """convert demand data to list of list [[timestamp, demandValue],]
        Args:
            df (pd.core.frame.DataFrame): demand data dataframe
        Returns:
            List[Union[dt.datetime, float]]: list of list of demand data [[timestamp, demandValue],]
        """    
        data:List[List] = []
        for ind in df.index:
            tempList = [df['timestamp'][ind], float(df['demandValue'][ind]) ]
            data.append(tempList)
        return data
    
    def fetchDemandFromApi(self, startTime: dt.datetime, endTime: dt.datetime, entityTag:str)-> List[Union[dt.datetime, float]] :
        """fetch demand data from api and returns [[timestamp, demandValue],]
        Args:
            startTime (dt.datetime): startTime
            endTime (dt.datetime): endTime
            entityTag (str): entityTag
        Returns:
            List[Union[dt.datetime, float]]: list of list of demand data [[timestamp, demandValue],]
        """

        demandDf = pd.DataFrame(columns = [ 'timestamp','demandValue'])      
        #creating object of ScadaApiFetcher class 
        obj_scadaApiFetcher = ScadaApiFetcher(self.tokenUrl, self.apiBaseUrl, self.clientId, self.clientSecret)
        
        try:
            resData = obj_scadaApiFetcher.fetchData(entityTag, startTime, endTime)
            demandDf = pd.DataFrame(resData, columns =['timestamp','demandValue'])
            demandDf = demandDf[demandDf['demandValue']>1000]
            # handling errors if actual demand is not fetched from api.
        except Exception as err:
            print("error while fetching current demand", err)   

        finally:
            data : List[Union[dt.datetime, float]] = self.toListOfTuple(demandDf)
        return data