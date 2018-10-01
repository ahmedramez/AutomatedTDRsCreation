let newman = require('newman');
const stubsConfig = require('../config/env.json');
let serviceFlow = require('../controllers/service.controller');
let helperService = require('../helper/helper.js');
const Defines = require('../config/defines.json');

let registerFlows = async (serviceData) => {
    let allServicesFlows = [];
    //get properties related to user and login only as serviceDetails is very big object
    let userData = helperService.getObjectWithoutProperties(serviceData, [Defines.serviceDataDetails])
    // //register user login service     
    allServicesFlows = serviceFlow.registerUserLoginFlow(userData);
    let customServiceFlow = await serviceFlow.registerServiceFlow(serviceData.servicesDetails[0]);
    allServicesFlows.item.push(customServiceFlow);
    return allServicesFlows;
}



let launchFlows = (serviceData) => {
    registerFlows(serviceData).then((response) => {
        newman.run({
            collection: response,
            reporters: stubsConfig.reporters,
            environment: stubsConfig.env
        }, function (err, response) {
            if (err) { throw err; }
            console.log('tdrs created successfully!');
            // require('fs').writeFileSync('./summary.json', JSON.stringify(response));
        });
    })
}

module.exports = {
    launchFlows
}