from typing import TypedDict


class IAppConfig(TypedDict):
    con_string_mis_warehouse:str
    tokenUrl: str
    apiBaseUrl: str
    clientId: str
    clientSecret: str
    flaskSecret: str
    flaskPort: str
    mode: str