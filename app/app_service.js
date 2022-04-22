const axios = require('axios');
const cfg = require('../config/app_cfg')
module.exports = {
  getClientData, getSystemData
};

function getClientData(res) {
  axios.get(cfg.refreshurl)
  .then(function (response) {
    getClientList(res);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    res.render("pages/error", {err : error.data});
  });

}

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
       if(i.includes("var wire_repeater_enable =0;")) {
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

function getClientList(res) {
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
    res.render("pages/wificlients", {clients : clients});
  })
  .catch(function (error) {
    // handle error
    console.log(error);
    res.render("pages/error", {err : error.data});
  });
}