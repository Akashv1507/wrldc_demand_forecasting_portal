import requests
import json
import datetime as dt
from typing import List, Tuple


class ScadaApiFetcher():
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
        
    def fetchData(self, measId: str, startDt: dt.datetime, endDt: dt.datetime) -> List[Tuple[dt.datetime, float]]:
        """fetches data from scada archive api

        Args:
            measId (str): measurement Id
            startDt (dt.datetime): start date
            endDt (dt.datetime): end date

        Returns:
            List[Tuple[dt.datetime, float]]: data from scada archive api
        """        
        apiUrl: str = '{0}/api/scadadata/{1}/{2}/{3}'.format(self.apiBaseUrl, measId, dt.datetime.strftime(
            startDt, '%Y-%m-%d'), dt.datetime.strftime(endDt, '%Y-%m-%d'))

        # step A, B - single call with client credentials as the basic auth header - will return access_token
        data = {'grant_type': 'client_credentials'}

        access_token_response = requests.post(
            self.tokenUrl, data=data, verify=False, allow_redirects=False, auth=(self.clientId, self.clientSecret))

        # print(access_token_response.headers)
        # print(access_token_response.text)

        tokens = json.loads(access_token_response.text)

        # print("access token: " + tokens['access_token'])

        # step B - with the returned access_token we can make as many calls as we want

        api_call_headers = {
            'Authorization': 'Bearer ' + tokens['access_token']}
        respSegs = (requests.get(
            apiUrl, headers=api_call_headers, verify=False)).text[1:-1].split(',')
        # print('splitend = {0}'.format(dt.datetime.now()))
        scadaData: List[Tuple[dt.datetime, float]] = []
        try:
            for samplInd in range(0, int(len(respSegs)/2)):
                ts = self.convertEpochMsToDt(float(respSegs[2*samplInd]))
                val = float(respSegs[2*samplInd+1])
                scadaData.append((ts, val))
            return scadaData
        except Exception as inst:
            print(inst)
            return[]

    def convertEpochMsToDt(self, epochMs: float) -> dt.datetime:
        timeObj = dt.datetime.fromtimestamp(epochMs/1000)
        return timeObj

    def fetchScadaPntHistData(self, pntId: str, startTime: dt.datetime, endTime: dt.datetime, samplingSecs: int = 30) -> List[Tuple[str, float]]:
    
        pntId = pntId.strip()
        if pntId == "":
            return []
        urlStr = self.histDataUrlBase
        paramsObj = {"pnt": pntId,
                    "strtime": startTime.strftime("%d/%m/%Y/%H:%M:%S"),
                    "endtime": endTime.strftime("%d/%m/%Y/%H:%M:%S"),
                    "secs": samplingSecs,
                    "type": 'snap'}
        try:
            r = requests.get(url=urlStr, params=paramsObj)
            data = json.loads(r.text)
            r.close()
        except Exception as e:
            print("Error loading data from scada api")
            print(e)
            data = []
        dataRes: List[Tuple[str, float]] = []
        for sampl in data:
            dataRes.append((dt.datetime.strptime(sampl["timestamp"], "%Y-%m-%dT%H:%M:%S") , sampl["dval"]))
        return dataRes