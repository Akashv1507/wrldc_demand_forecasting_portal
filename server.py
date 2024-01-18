'''
This is the web server to display real time demand vs forecasted demand.
'''
from src.config.appConfig import getConfig
from flask import Flask, request, jsonify, render_template
from waitress import serve
import datetime as dt
from typing import List, Tuple, TypedDict, Union
from src.services.actualDemandFetch.todayActualDemandFetcher import DemandFetchFromApi
from src.services.dfm1Fetchers.intradayForecastedDemandFetcher import IntradayForecastedDemandFetchRepo
from src.services.dfm1Fetchers.dayaheadForecastFetcher import DayaheadForecastedDemandFetchRepo
from src.services.actualDemandFetch.prevActualDemandFetcher import PreviousDayDemandFetchRepo
from src.services.dfm2Fetchers.dfm2DAForecastFetcher import Dfm2DayaheadForecastedDemandFetchRepo
from src.services.dfm2Fetchers.dfm2IntradayForecastedDemandFetcher import Dfm2IntradayForecastedDemandFetchRepo
from src.routeControllers.dfm3ApiController import dfm3ApiController
from src.routeControllers.dfm4ApiController import dfm4ApiController
from src.routeControllers.demandFrequencyController import demandFreqApiController
# from src.services.biasErrorCalculator import calculateBiasError

app = Flask(__name__)

# get application config
appConfig = getConfig()

# Set the secret key to some random bytes
app.secret_key = appConfig['flaskSecret']
tokenUrl: str = appConfig['tokenUrl']
apiBaseUrl: str = appConfig['apiBaseUrl']
clientId: str = appConfig['clientId']
clientSecret: str = appConfig['clientSecret']
conString: str = appConfig['con_string_mis_warehouse']
errorPortalUrl: str = appConfig['errorPortalUrl']

# dfm1 objects of fetchers
obj_demandFetchFromApi = DemandFetchFromApi(
    tokenUrl, apiBaseUrl, clientId, clientSecret)
obj_intradayForecastedDemandFetchRepo = IntradayForecastedDemandFetchRepo(
    conString)
obj_dayaheadForecastedDemandFetchRepo = DayaheadForecastedDemandFetchRepo(
    conString)
obj_previousDayDemandFetchRepo = PreviousDayDemandFetchRepo(conString)

# dfm2 objects of fetchers
obj_dfm2DayaheadForecastedDemandFetchRepo = Dfm2DayaheadForecastedDemandFetchRepo(
    conString)
obj_dfm2IntradayForecastedDemandFetchRepo = Dfm2IntradayForecastedDemandFetchRepo(
    conString)

# registering blueprints
app.register_blueprint(dfm3ApiController, url_prefix='/api/dfm3')
app.register_blueprint(dfm4ApiController, url_prefix='/api/dfm4')
app.register_blueprint(demandFreqApiController, url_prefix='/api')



@app.route('/api/<entityTag>/<startTime>/<endTime>')
def deviceDataApi(entityTag: str, startTime: str, endTime: str):

    startDt = dt.datetime.strptime(startTime, '%Y-%m-%d-%H-%M-%S')
    endDt = dt.datetime.strptime(endTime, '%Y-%m-%d-%H-%M-%S')

    todayActualDemandData: List[Union[dt.datetime, float]
                                ] = obj_demandFetchFromApi.fetchDemandDataFromApi(startDt, endDt, entityTag)
    # setting end time to last minute of a day in case of forecasted demand fetch
    startTime = startDt
    endTime = endDt.replace(hour=0, minute=0, second=0)
    endTime = endTime + dt.timedelta(hours=23, minutes=59)
    
    # today intraday forecast fetch
    intradayforecastedDemand:  List[Union[dt.datetime, float]] = obj_intradayForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)
    
    # today dayahead forecast fetch
    todayDaForecast: List[Union[dt.datetime, float]] = obj_dayaheadForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)
    
    # setting startTime and endTime for tomorrow day ahead forecast fetch.
    startTime = startDt + dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    tommDaForecast: List[Union[dt.datetime, float]] = obj_dayaheadForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)
    # print(tommDaForecast[0][0], tommDaForecast[-1][0])

    # setting startTime and endTime for prev day actual demand fetch.
    startTime = startDt-dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    prevDayActualDemand: List[Union[dt.datetime, float]] = obj_previousDayDemandFetchRepo.fetchPrevDemand(
        startTime, endTime, entityTag)

    # calculating percentage bias error
    # percentageBiasError: List[Union[dt.datetime, float]] = calculateBiasError(todayActualDemandData, intradayforecastedDemand)
    # print(intradayforecastedDemand)
    return jsonify({'todayActualDemand': todayActualDemandData, 'prevDayActualDemand': prevDayActualDemand, 'intradayForecastedDemand': intradayforecastedDemand, 'todayDaForecast': todayDaForecast, 'tommDaForecast': tommDaForecast})


@app.route('/api/dfm2/<entityTag>/<startTime>/<endTime>')
def dfm2DataApi(entityTag: str, startTime: str, endTime: str):
    startDt = dt.datetime.strptime(startTime, '%Y-%m-%d-%H-%M-%S')
    endDt = dt.datetime.strptime(endTime, '%Y-%m-%d-%H-%M-%S')

    todayActualDemandData: List[Union[dt.datetime, float]
                                ] = obj_demandFetchFromApi.fetchDemandDataFromApi(startDt, endDt, entityTag)

    # setting end time to last minute of a day in case of forecasted demand fetch
    startTime = startDt
    endTime = endDt.replace(hour=0, minute=0, second=0)
    endTime = endTime + dt.timedelta(hours=23, minutes=59)

    # today intraday forecast fetch
    intradayforecastedDemand:  List[Union[dt.datetime, float]] = obj_dfm2IntradayForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)

    # today dayahead forecast fetch
    todayDaForecast: List[Union[dt.datetime, float]] = obj_dfm2DayaheadForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)

    # setting startTime and endTime for tomorrow day ahead forecast fetch.
    startTime = startDt + dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    tommDaForecast: List[Union[dt.datetime, float]] = obj_dfm2DayaheadForecastedDemandFetchRepo.fetchForecastedDemand(
        startTime, endTime, entityTag)
    # print(tommDaForecast[0][0], tommDaForecast[-1][0])

    # setting startTime and endTime for prev day actual demand fetch.
    startTime = startDt-dt.timedelta(days=1)
    endTime = startTime + dt.timedelta(hours=23, minutes=59)
    prevDayActualDemand: List[Union[dt.datetime, float]] = obj_previousDayDemandFetchRepo.fetchPrevDemand(
        startTime, endTime, entityTag)

    return jsonify({'todayActualDemand': todayActualDemandData, 'prevDayActualDemand': prevDayActualDemand, 'intradayForecastedDemand': intradayforecastedDemand, 'todayDaForecast': todayDaForecast, 'tommDaForecast': tommDaForecast})


@app.route('/')
def home():
    return render_template('home.html.j2', errorPortalUrl=errorPortalUrl)


@app.route('/dfm2Home')
def dfm2Home():
    return render_template('dfm2Home.html.j2')


@app.route('/dfm3Home')
def dfm3Home():
    return render_template('dfm3Home.html.j2')

@app.route('/dfm4Home')
def dfm4Home():
    return render_template('dfm4Home.html.j2')

@app.route('/demandFrequency')
def demandFrequency():
    return render_template('demandFrequency.html.j2')


if __name__ == '__main__':
    serverMode: str = appConfig['mode']
    if serverMode.lower() == 'd':
        app.run(host="localhost", port=int(appConfig['flaskPort']), debug=True)
    else:
        serve(app, host='0.0.0.0', port=int(appConfig['flaskPort']), threads=1)
