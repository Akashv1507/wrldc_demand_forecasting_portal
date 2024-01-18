import cx_Oracle
import pandas as pd
import datetime as dt
from typing import List, Tuple, Union


class Dfm2DayaheadForecastedDemandFetchRepo():
    """block wise forecasted demand fetch repository for R0A
    """

    def __init__(self, con_string):
        """initialize connection string
        Args:
            con_string ([type]): connection string 
        """
        self.connString = con_string

    def toListOfTuple(self, df:pd.core.frame.DataFrame) -> List[Union[dt.datetime, float]]:
        """convert demand data to list of list [[timestamp, forecastedDemandValue],]
        Args:
            df (pd.core.frame.DataFrame): demand data dataframe
        Returns:
            List[Union[dt.datetime, float]]: list of list of demand data
        """   
        
        data:List[List] = []
        for ind in df.index:
            tempList = [df['TIME_STAMP'][ind], float(df['FORECASTED_DEMAND_VALUE'][ind]) ]
            data.append(tempList)
        return data


    def fetchForecastedDemand(self, startTime: dt.datetime, endTime: dt.datetime, entityTag:str) -> List[Union[dt.datetime, float]]:
        """fetch forecasted demand and return list of list [[timestamp, forecastedDemandValue],]
        Args:
            startTime (dt.datetime): start time
            endTime (dt.datetime): end time
            entityTag (str): entity tag
        Returns:
            List[Union[dt.datetime, float]]: list of list [[timestamp, forecastedDemandValue],]
        """        
        
        try:
            connection = cx_Oracle.connect(self.connString)

        except Exception as err:
            print('error while creating a connection', err)
        else:
            try:
                cur = connection.cursor()
                fetch_sql = "SELECT time_stamp,forecasted_demand_value FROM dfm2_forecast_revision_store WHERE time_stamp BETWEEN TO_DATE(:start_time,'YYYY-MM-DD HH24:MI:SS') and TO_DATE(:end_time,'YYYY-MM-DD HH24:MI:SS') and revision_no='R0A' and entity_tag =:entity ORDER BY time_stamp"
                cur.execute("ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS' ")
                forecastedDemandDf = pd.read_sql(fetch_sql, params={
                                 'start_time': startTime, 'end_time': endTime, 'entity':entityTag}, con=connection)
                
            except Exception as err:
                print('error while creating a cursor', err)
            else:
                connection.commit()
        finally:
            cur.close()
            connection.close()
            
        data: List[Union[dt.datetime, float]] = self.toListOfTuple(forecastedDemandDf)
        return data
