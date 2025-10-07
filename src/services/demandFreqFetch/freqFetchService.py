import pandas as pd
import datetime as dt
from typing import List, Tuple, TypedDict, Union
from src.services.demandFreqFetch.scadaApiFetcher import ScadaApiFetcher

class FrequencyFetchFromApi():
    """class to fetch frequency data
    """   

    def __init__(self, tokenUrl, apiBaseUrl, clientId, clientSecret, histDataUrlBase):
        self.tokenUrl = tokenUrl
        self.apiBaseUrl = apiBaseUrl
        self.clientId = clientId
        self.clientSecret = clientSecret
        self.histDataUrlBase = histDataUrlBase
    
    def toListOfTuple(self, df:pd.core.frame.DataFrame) -> List[Union[dt.datetime, float]]:
        """convert freq data to list of list [[timestamp, freqValue],]
        Args:
            df (pd.core.frame.DataFrame): freq data dataframe
        Returns:
            List[Union[dt.datetime, float]]: list of list of freq data [[timestamp, freqValue],]
        """    
        data:List[List] = []
        for ind in df.index:
            tempList = [df['timestamp'][ind], float(df['freqValue'][ind]) ]
            data.append(tempList)
        return data
    
    def fetchFreqFromApi(self, startTime: dt.datetime, endTime: dt.datetime, entityTag:str)-> List[Union[dt.datetime, float]] :
        """fetch frequency data from api and returns [[timestamp, frequencyValue],]
        Args:
            startTime (dt.datetime): startTime
            endTime (dt.datetime): endTime
            entityTag (str): entityTag
        Returns:
            List[Union[dt.datetime, float]]: list of list of frequency data [[timestamp, frequencyValue],]
        """
        freqDf = pd.DataFrame(columns =['timestamp','freqValue'])      
        #creating object of ScadaApiFetcher class 
        obj_scadaApiFetcher = ScadaApiFetcher(self.tokenUrl, self.apiBaseUrl, self.clientId, self.clientSecret, self.histDataUrlBase)
        
        try:
            # resData = obj_scadaApiFetcher.fetchData(entityTag, startTime, endTime)
            resData = obj_scadaApiFetcher.fetchScadaPntHistData(entityTag, startTime, endTime, 60)
            freqDf = pd.DataFrame(resData, columns =['timestamp','freqValue'])
            freqDf= freqDf[(freqDf['freqValue']>48) & (freqDf['freqValue']<51.5)]
            # handling errors if actual frequency is not fetched from api.
        except Exception as err:
            print("error while fetching current freq", err)   

        finally:
            data : List[Union[dt.datetime, float]] = self.toListOfTuple(freqDf)
        return data