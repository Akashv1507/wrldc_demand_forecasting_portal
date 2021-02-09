from flask import Blueprint, jsonify, render_template, request
from src.services.actualDemandFetch.todayActualDemandFetcher import DemandFetchFromApi
from src.services.actualDemandFetch.prevActualDemandFetcher import PreviousDayDemandFetchRepo
from src.services.dfm2Fetchers.dfm2DAForecastFetcher import Dfm2DayaheadForecastedDemandFetchRepo
from src.services.dfm2Fetchers.dfm2IntradayForecastedDemandFetcher import Dfm2IntradayForecastedDemandFetchRepo
from src.config.appConfig import getConfig
import datetime as dt
from typing import List, Union

# get application config
appConfig = getConfig()
tokenUrl: str = appConfig['tokenUrl']
apiBaseUrl: str = appConfig['apiBaseUrl']
clientId: str = appConfig['clientId']
clientSecret: str = appConfig['clientSecret']
conString: str = appConfig['con_string_mis_warehouse']
errorPortalUrl :str = appConfig['errorPortalUrl']

#dfm3 objects of fetchers
obj_demandFetchFromApi = DemandFetchFromApi(tokenUrl, apiBaseUrl, clientId, clientSecret)
obj_previousDayDemandFetchRepo = PreviousDayDemandFetchRepo(conString)
obj_dfm2DayaheadForecastedDemandFetchRepo = Dfm2DayaheadForecastedDemandFetchRepo(conString)
obj_dfm2IntradayForecastedDemandFetchRepo = Dfm2IntradayForecastedDemandFetchRepo(conString)


dfm3ApiController = Blueprint('dfm3ApiController', __name__, template_folder='templates')

@dfm3ApiController.route('/<entityTag>/<startTime>/<endTime>')
def dfm2DataApi(entityTag: str, startTime: str, endTime: str):
    startDt = dt.datetime.strptime(startTime, '%Y-%m-%d-%H-%M-%S')
    endDt = dt.datetime.strptime(endTime, '%Y-%m-%d-%H-%M-%S')
    
    todayActualDemandData: List[Union[dt.datetime, float]] = obj_demandFetchFromApi.fetchDemandDataFromApi(startDt, endDt, entityTag)


    # setting end time to last minute of a day in case of forecasted demand fetch
    startTime = startDt
    endTime = endDt.replace(hour=0, minute=0, second=0)
    endTime = endTime + dt.timedelta(hours= 23, minutes=59)
    # today intraday forecast fetch
    intradayforecastedDemand:  List[Union[dt.datetime, float]] = obj_dfm2IntradayForecastedDemandFetchRepo.fetchForecastedDemand(startTime, endTime, entityTag)
    
    #today dayahead forecast fetch
    todayDaForecast :List[Union[dt.datetime, float]] = obj_dfm2DayaheadForecastedDemandFetchRepo.fetchForecastedDemand(startTime, endTime, entityTag)
    
    #setting startTime and endTime for tomorrow day ahead forecast fetch.
    startTime = startDt + dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    tommDaForecast : List[Union[dt.datetime, float]] = obj_dfm2DayaheadForecastedDemandFetchRepo.fetchForecastedDemand(startTime, endTime, entityTag)
    # print(tommDaForecast[0][0], tommDaForecast[-1][0])

    # setting startTime and endTime for prev day actual demand fetch.
    startTime = startDt-dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    prevDayActualDemand : List[Union[dt.datetime, float]] = obj_previousDayDemandFetchRepo.fetchPrevDemand(startTime, endTime, entityTag)
    
    return jsonify({'todayActualDemand': todayActualDemandData, 'prevDayActualDemand':prevDayActualDemand, 'intradayForecastedDemand': intradayforecastedDemand, 'todayDaForecast':todayDaForecast, 'tommDaForecast':tommDaForecast} )
