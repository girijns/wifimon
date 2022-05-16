const axios = require('axios');
const cfg = require('../config/app_cfg');
const jsdom = require('jsdom');
module.exports = {
  getClientData, getSystemData
};

function getSystemData(res) {
  axios.get(cfg.systemurl)
  .then(function (response) {
    var sysInfo = parseSystemInfo(response.data);
    res.render("pages/system", {sysInfo : sysInfo });
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    res.render("pages/error", {err : error.data});
  });

}

function getGatewayData(res,clients) {
  axios.get(cfg.gatewayurl)
  .then(function (response) {
      var gtInfo = parseGatewayInfo(response.data);
      for(let c of clients) {
        if(c.ip == "Unknown") {
          var rec = gtInfo[c.mac.toLowerCase()];
          if(rec) {
             c.ip = rec.ip;
          }
        }
        if(c.name.includes(":") || c.name == "Unknown") {
                  var rec = gtInfo[c.mac.toLowerCase()];
                  if(rec) {
                     c.name = rec.name;
                  }
                }
      };
      res.render("pages/wificlients", {clients : clients});
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.render("pages/error", {err : error.data});
    });
}

function parseGatewayInfo(data) {
   var info = {};
   var dom = new jsdom.JSDOM(data);
   var tableRows = dom.window.document.querySelectorAll("table tr");
   var rec;
   for (var i=0; i<tableRows.length; i++) {
      if(tableRows[i].querySelector('th') != null && tableRows[i].querySelector('th').textContent == "MAC Address") {
         if(rec != null) {
            info[rec.macAddress] = rec;
         }
         rec = {};
         rec["macAddress"] = tableRows[i].querySelector('td').textContent.trim();
      } else {
         if(tableRows[i].querySelector('th') != null && tableRows[i].querySelector('th').textContent == "IPv4 Address / Name") {
           var ipnm = tableRows[i].querySelector('td').textContent.trim().replace(/\n/g,'').split("/");
           rec["ip"] = ipnm[0].trim();
           rec["name"]= ipnm[1].trim();
         }
      }
   }
   info[rec.macAddress] =  rec;
   return info;
}

function parseSystemInfo(sysData) {
   var sysInfo = {};
   const arr = sysData.replace(/\r\n/g,'\n').split('\n');
   var lines = [];
   found = false;
   var pars = ["oui_sn", "run_code_ver", "realtime_cpurate", "runtime", "realtime_memoryrate"];
   var found = false;
   for(let i of arr) {
     if(!found && i.includes("wan_count=wan_basic_info.length;")) {
       found = true;
       continue;
     }
     if(found) {
       if(i.includes("var wire_repeater_enable =1;")) {
          break;
       }
       for(let p of pars) {
         if(i.includes(p)) {
            sysInfo[p] = i.split('=')[1].replace(/\"/g,'').replace(/;/,'').replace(/\&#37/,'');
         }
       }
     }
   }
   var u = sysInfo.runtime.replace(/[^\x00-\x7F]/g, "").split(' ').filter(item => item !== "");
   var sysInfoNew = 
      {
        'Serial Number': sysInfo.oui_sn,
        'Firmware Version': sysInfo.run_code_ver, 
        'CPU Usage': sysInfo.realtime_cpurate + ' %',
        'Memory Usage': sysInfo.realtime_memoryrate + ' %', 
        'Uptime': u[0] + ' days ' + u[1] + ' hours ' + u[2] + ' mins ' + u[3] + ' secs' 
      };
   return sysInfoNew;
}

function getClientData(res) {
  axios.get(cfg.clientlisturl)
  .then(function (response) {
    const arr = response.data.replace(/\r\n/g,'\n').split('\n');
    var lines = [];
    found = false;
    for(let i of arr) {
        if(i.includes("dhcpd_client_list=new Array")) {
            found = true;
        } else {
        if(found && !i.includes(');')) {
            lines.push(i.replace(/,/g,'').replace(/\"/g,''));
        }
        if(found && i.includes(');')) {
          break;
        }
        }
    }
    var clients = [];
    for(let l of lines) {
        var vals = l.split(';');
        clients.push({ sernum: Number(vals[0])+1, mac: vals[1].length == 2 ? "Unknown" : vals[1], ip : vals[2].length == 2 ? "Unknown" : vals[2], 
        name: vals[3].length == 2 ? "Unknown" : vals[3], ssid: vals[4], bandchan: vals[5], rssi: vals[6], linkspeed: vals[7]});
    }
    getGatewayData(res,clients);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    res.render("pages/error", {err : error.data});
  });
}