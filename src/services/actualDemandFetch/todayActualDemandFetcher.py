import pandas as pd
import datetime as dt
from typing import List, Union
from src.services.actualDemandFetch.scadaApiFetcher import ScadaApiFetcher

class DemandFetchFromApi():
    """class to fetch demand data frrom api, applly filtering, return blockwise demand data
    """   
    tokenUrl: str = ''
    apiBaseUrl: str = ''
    clientId: str = ''
    clientSecret: str = ''
    histDataUrlBase: str = ''

    def __init__(self, tokenUrl, apiBaseUrl, clientId, clientSecret, histDataUrlBase):
        self.tokenUrl = tokenUrl
        self.apiBaseUrl = apiBaseUrl
        self.clientId = clientId
        self.clientSecret = clientSecret
        self.histDataUrlBase = histDataUrlBase
    
    def toMinuteWiseData(self, demandDf:pd.core.frame.DataFrame)->pd.core.frame.DataFrame:
        """convert random secondwise demand dataframe to minwise demand dataframe and add entity column to dataframe.
        Args:
            demandDf (pd.core.frame.DataFrame): random secondwise demand dataframe
            entity (str): entity name
        Returns:
            pd.core.frame.DataFrame: minwise demand dataframe
        """    
        try:
            demandDf = demandDf.resample('1min', on='timestamp').agg({'demandValue': 'first'})  # this will set timestamp as index of dataframe
        except Exception as err:
            print('error while resampling', err)
        # demandDf.insert(0, "entityTag", entity)                      # inserting column entityName with all values of 96 block = entity
        demandDf.reset_index(inplace=True)
        return demandDf

    def filterAction(self, demandDf :pd.core.frame.DataFrame, minRamp:int)-> pd.core.frame.DataFrame:
        """ apply filtering action 
        Args:
            demandDf (pd.core.frame.DataFrame): unfiltered demand df
            minRamp (int): threshold deviation value for min-min ramping
        Returns:
            filtered dataframe
        """    
        for ind in demandDf.index.tolist()[1:]:
            if abs(demandDf['demandValue'][ind]-demandDf['demandValue'][ind-1]) > minRamp :
                demandDf['demandValue'][ind] = demandDf['demandValue'][ind-1]
        return demandDf
                
    def applyFilteringToDf(self, demandDf:pd.core.frame.DataFrame, entity:str) -> pd.core.frame.DataFrame:
        """applying filtering logic
        Args:
            demandDf (pd.core.frame.DataFrame): unfiltered demand dataframe
            entity (str): entityTag
        Returns:
            pd.core.frame.DataFrame: filtered demand dataframe
        """    

        #500,200,1000,2000 are min to min ramp of entities 
        if entity == 'WRLDCMP.SCADA1.A0046945':
            filteredDemandDf = self.filterAction(demandDf, 500)

        if entity == 'WRLDCMP.SCADA1.A0046948' or entity == 'WRLDCMP.SCADA1.A0046962' or entity == 'WRLDCMP.SCADA1.A0046953':
            filteredDemandDf = self.filterAction(demandDf, 200)
        
        if entity == 'WRLDCMP.SCADA1.A0046957' or entity == 'WRLDCMP.SCADA1.A0046978' or entity == 'WRLDCMP.SCADA1.A0046980':
            filteredDemandDf = self.filterAction(demandDf, 1000)
    
        if entity == 'WRLDCMP.SCADA1.A0047000':
            filteredDemandDf = self.filterAction(demandDf, 2000)
        return filteredDemandDf

    def toBlockwiseDemand(self, minwiseDemandDf: pd.core.frame.DataFrame) ->pd.core.frame.DataFrame :
        """convert minute wise demand data to block wise deamnd data
        Args:
            minwiseDemandDf (pd.core.frame.DataFrame): minute wise demand dataframe
        Returns:
            pd.core.frame.DataFrame: block wise demand dataframe
        """        
        try:
            blockwiseDemandDf = minwiseDemandDf.resample('15min', on='timestamp').mean()   # this will set timestamp as index of dataframe
        except Exception as err:
            print('error while resampling', err)
        # blockwiseDemandDf.insert(0, "entityTag", entityTag)                      # inserting column entityName with all values of 96 block = entity
        blockwiseDemandDf.reset_index(inplace=True)
        return blockwiseDemandDf

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

    def fetchDemandDataFromApi(self, startTime: dt.datetime, endTime: dt.datetime, entityTag:str)-> List[Union[dt.datetime, float]] :
        """fetch demand data from api for a particular entity and returns [[timestamp, demandValue],]
        Args:
            startTime (dt.datetime): startTime
            endTime (dt.datetime): endTime
            entityTag (str): entityTag
        Returns:
            List[Union[dt.datetime, float]]: list of list of demand data [[timestamp, demandValue],]
        """
        # print(startTime, endTime)    
        demandStorageDf = pd.DataFrame(columns = [ 'timestamp','demandValue']) 
              
        #creating object of ScadaApiFetcher class 
        obj_scadaApiFetcher = ScadaApiFetcher(self.tokenUrl, self.apiBaseUrl, self.clientId, self.clientSecret, self.histDataUrlBase)
        
        try:
            # fetching secondwise data from api for each entity(timestamp,value) and converting to dataframe
            # resData = obj_scadaApiFetcher.fetchData(entityTag, startTime, endTime)
            #Now using directly edna api 
            resData = obj_scadaApiFetcher.fetchScadaPntHistData(entityTag, startTime, endTime)
            # getting time upto which data is present, handling errors if actual demand is not fetched from api.
            timeUptodataPresent: dt.datetime = resData[-1][0] 
        except Exception as err:
            print("error while fetching current demand", err)
        else:
            timeUptodataPresent = timeUptodataPresent.replace(second=0, microsecond=0)
            endBlockTime = timeUptodataPresent

            while (endBlockTime.minute % 15) != 14:
                endBlockTime = endBlockTime - dt.timedelta(minutes=1)

            demandDf = pd.DataFrame(resData, columns =['timestamp','demandValue']) 

            #filtering demand between startTIme and endtime only
            demandDf = demandDf[(demandDf['timestamp'] >= startTime) & (demandDf['timestamp'] <= endTime)]
            #converting to minutewise data and adding entityName column to dataframe
            demandDf = self.toMinuteWiseData(demandDf)
        
        # handling missing values NANs
            demandDf['demandValue'].fillna(method='ffill', inplace= True)
            demandDf['demandValue'].fillna(method='bfill', inplace= True)

            #applying filtering logic, removed by mgmt
            # filteredDemandDf = self.applyFilteringToDf(demandDf,entityTag)
            

            # extra minutes from a complete block will remain as minutes else all converted to blockwise demand
            if startTime<endBlockTime:
                completeBlockDemandDf = demandDf[(demandDf['timestamp'] >= startTime) & (demandDf['timestamp'] <= endBlockTime)]
                xtraMinDemandDf = demandDf[(demandDf['timestamp'] > endBlockTime) & (demandDf['timestamp'] <= endTime)] 
                
                # resampling to blockwise demand
                blockwiseDf = self.toBlockwiseDemand(completeBlockDemandDf)
                demandStorageDf = pd.concat([blockwiseDf, xtraMinDemandDf ],ignore_index=True)
            else:
                #only valid in first block
                demandStorageDf = demandDf
        
        
        # demandDf.to_excel(r'D:\wrldc_projects\demand_forecasting\filtering demo\28-oct-after-Na.xlsx')
        finally:
            data : List[Union[dt.datetime, float]] = self.toListOfTuple(demandStorageDf)
       
        return data
    
