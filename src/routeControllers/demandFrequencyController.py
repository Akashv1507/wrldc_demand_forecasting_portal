from flask import Blueprint, jsonify, render_template, request
from src.config.appConfig import getConfig
import datetime as dt
from typing import List, Union
from src.services.demandFreqFetch.demandFetchService import DemandFetchFromApi
from src.services.demandFreqFetch.freqFetchService import FrequencyFetchFromApi
from src.services.dfm1Fetchers.intradayForecastedDemandFetcher import IntradayForecastedDemandFetchRepo

# get application config
appConfig = getConfig()
tokenUrl: str = appConfig['tokenUrl']
apiBaseUrl: str = appConfig['apiBaseUrl']
clientId: str = appConfig['clientId']
clientSecret: str = appConfig['clientSecret']
conString: str = appConfig['con_string_mis_warehouse']
errorPortalUrl :str = appConfig['errorPortalUrl']

obj_demandFetchFromApi = DemandFetchFromApi(tokenUrl, apiBaseUrl, clientId, clientSecret)
obj_frequencyFetchFromApi = FrequencyFetchFromApi(tokenUrl, apiBaseUrl, clientId, clientSecret)
obj_intradayForecastedDemandFetchRepo = IntradayForecastedDemandFetchRepo(
    conString)
demandFreqApiController = Blueprint('demandFreqApiController', __name__, template_folder='templates')

@demandFreqApiController.route('/demandFrequency/<startTime>/<endTime>')
def demandFreqDataApi(startTime: str, endTime: str):
    startDt = dt.datetime.strptime(startTime, '%Y-%m-%d-%H-%M-%S')
    endDt = dt.datetime.strptime(endTime, '%Y-%m-%d-%H-%M-%S')
    demandEntity = "WRLDCMP.SCADA1.A0047000"
    freqEntity =   "WRLDCMP.SCADA1.A0036324"
    
    todayActualDemandData: List[Union[dt.datetime, float]] = obj_demandFetchFromApi.fetchDemandFromApi(startDt, endDt, demandEntity)
    todayFreq:List[Union[dt.datetime, float]] = obj_frequencyFetchFromApi.fetchFreqFromApi(startDt, endDt, freqEntity)
    # today intraday forecast fetch
    intradayforecastedDemand:  List[Union[dt.datetime, float]] = obj_intradayForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, demandEntity)
    # setting startTime and endTime for prev day.
    startTime = startDt-dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59, seconds=59)

    prevDayActualDemand : List[Union[dt.datetime, float]] = obj_demandFetchFromApi.fetchDemandFromApi(startTime, endTime, demandEntity)
    prevdayFreq:List[Union[dt.datetime, float]] = obj_frequencyFetchFromApi.fetchFreqFromApi(startTime, endTime, freqEntity)

    return jsonify({'todayActualDemand': todayActualDemandData, 'prevDayActualDemand':prevDayActualDemand,'intradayforecastedDemand':intradayforecastedDemand, 'todayFreq': todayFreq, 'prevdayFreq': prevdayFreq} )
