call nssm.exe install mis_forecast_dashboard "%cd%\run_server.bat"
rem call nssm.exe edit mis_forecast_dashboard
call nssm.exe set mis_forecast_dashboard AppStdout "%cd%\logs\mis_forecast_dashboard.log"
call nssm.exe set mis_forecast_dashboard AppStderr "%cd%\logs\mis_forecast_dashboard.log"
call sc start mis_forecast_dashboard