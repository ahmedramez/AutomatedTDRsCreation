let newman = require('newman');
const stubsConfig = require('../config/env.json');
let serviceFlow = require('../controllers/service.controller');
let helperService = require('../helper/helper.js');
const Defines = require('../config/defines.json');
let newManFlowInfo = require('../config/flows/newman-flow-info.json');
let helper = require('../helper/helper');
const path = require('path');
const fs=require('fs');

let registerFlows = async (serviceData) => {
    let allServicesFlows = { item: [], info: newManFlowInfo.info };
    //delete first record as it contains empty object till refactoring parsing excel code
    delete serviceData[Defines.excelToJSON.recordKeyName + 0];
    let serviceDataKeys = Object.keys(serviceData);

    for (let key of serviceDataKeys) {
        let userLoginFlow = [];
        //get properties related to user and login only as serviceDetails is very big object
        let serviceRecordData = serviceData[key];
        let userData = helperService.getObjectWithoutProperties(serviceRecordData, [Defines.serviceDataDetails]);
        //register user login service     
        userLoginFlow = serviceFlow.registerUserLoginFlow(userData);
        //register service related to record i
        let customServiceFlow = await serviceFlow.registerServiceFlow(serviceRecordData.servicesDetails[0]);
        //append this service to userLogin flow to simulate full flow for the record
        userLoginFlow.push(customServiceFlow);

        allServicesFlows.item.push(...userLoginFlow);
    }

    return allServicesFlows;
}



let launchFlows = (serviceData, executeFunc) => {
    registerFlows(serviceData).then((response) => {
        // fs.writeFileSync('flow-request.json',JSON.stringify(response));
        newman.run({
            collection: response,
            reporters: stubsConfig.reporters,
            environment: stubsConfig.env
        }, function (err, response) {
            if (err) { throw err; }
            console.log('tdrs created successfully!');
            executeFunc();
        });
    })
}

module.exports = {
    launchFlows
}