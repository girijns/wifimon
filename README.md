# wifimon
WiFi Monitoring Application for H3C BX4 Whale router in Nodejs

A basic Node app to show H3C BX4 router system information and client information like (RSSI, Negotiated speed, Band/Channe etc).
The original web interface is in zh_CN so wanted to scrape the web interface and present basic details.
This is also Dockerized.

Build Image:
docker build . -t user/wifimon

Run It: 
docker run -p 4000:8000 -d user/wifimon