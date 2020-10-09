'''
This is the web server to display real time demand vs forecasted demand.
'''
from src.config.appConfig import getConfig
from flask import Flask, request, jsonify, render_template
import datetime as dt
from typing import List, Tuple, TypedDict, Union
from src.services.demandDataFetcher import DemandFetchFromApi
from src.services.forecastedDemandFetcher import ForecastedDemandFetchRepo

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

obj_demandFetchFromApi = DemandFetchFromApi(tokenUrl, apiBaseUrl, clientId, clientSecret)
obj_forecastedDemandFetchRepo = ForecastedDemandFetchRepo(conString)

@app.route('/api/<entityTag>/<startTime>/<endTime>')
def deviceDataApi(entityTag: str, startTime: str, endTime: str):
   
    startDt = dt.datetime.strptime(startTime, '%Y-%m-%d-%H-%M-%S')
    endDt = dt.datetime.strptime(endTime, '%Y-%m-%d-%H-%M-%S')
    
    actualDemandData: List[Union[dt.datetime, float]] = obj_demandFetchFromApi.fetchDemandDataFromApi(startDt, endDt, entityTag)

    #setting end time to last minute of a day in case of forecasted demand fetch
    endDt = endDt.replace(hour=0, minute=0, second=0)
    endDt = endDt + dt.timedelta(hours= 23, minutes=59)
    
    forecastedDemandData:  List[Union[dt.datetime, float]] = obj_forecastedDemandFetchRepo.fetchForecastedDemand(startDt, endDt, entityTag)
    return jsonify({'actualDemand': actualDemandData, 'forecastedDemand': forecastedDemandData} )

@app.route('/')
def home():
    return render_template('home.html.j2')

if __name__ == '__main__':
    serverMode: str = appConfig['mode']
    if serverMode.lower() == 'd':
        app.run(host="localhost", port=int(appConfig['flaskPort']), debug=True)
    else:
        serve(app, host='0.0.0.0', port=int(appConfig['flaskPort']), threads=1)