const appService = require("../app_service");
module.exports = function(app) {
  app.get('/', (req, res) => {
     res.render("pages/home", {name: "H3C BX54"});
  });
  app.get('/about', (req, res) => {
     res.render("pages/about", {name: "H3C BX54"});
  });

  app.get('/clients', (req, res) => {
     appService.getClientData(res);
  });
   app.get('/system', (req, res) => {
     appService.getSystemData(res);
  });
};
