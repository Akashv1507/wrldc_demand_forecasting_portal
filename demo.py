import datetime as dt
epoch = dt.datetime.utcfromtimestamp(0)

def dt_from_ms(ms):
    return dt.datetime.utcfromtimestamp(ms / 1000.0)

def dt_to_ms(dts:dt.datetime):
    # delta = dt - epoch
    return dts.timestamp()

print(dt_to_ms(dt.datetime.now()))