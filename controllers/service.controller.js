let stubsServer = require('../stubs-server-mocking/service-mapper');
let jp = require('jsonpath');
let userService = require('./user.service.controller');
let loginServiceFlow = require('../config/flows/login-flow.json');
let serviceFlow = require('../config/flows/default-service-flow.json');
let loginServiceRequest = require('../config/login-service-request.json');
let userServiceRequest = require('../config/user-service-request.json');
let Defines = require('../config/defines.json');

//getting the service mapped with the new values  [this is the final response when we call the service from stubs].
function mapToStubService(service, responseCallback) {
    //simulating stubs server that it will return serviceUrl
    stubsServer.getServiceDetailsByUrl(service.url, function (serviceData) {
        for (let i = 0; i < service.paths.length; i++) {
            //handling jsonPath Format and remove spaces in path if found
            let jpKey = '$.' + service.paths[i].key.replace(/\s/g, '');
            jp.apply(serviceData.defaultResponse, jpKey, function (value) {
                value = service.paths[i].value;
                return value;
            });
        }

        // serviceData.url = replaceIdentifersByValues(serviceData.url, service.identifiers);
        //simulating nodejs Like error handler way and pass error as null
        responseCallback(null, serviceData);
    })
}


//replace url identifiers by its values
function replaceIdentifersByValues(url, identifiers) {
    for (let i = 0; i < identifiers.length; i++) {
        let identifersKeys = Object.keys(identifiers[i]);
        //replcaing identifiers placeholder with it's values
        url = url.replace(identifersKeys[0], identifiers[i][identifersKeys[0]]);
    }
    return url.replace(/[{}]/g, '');
}

/**
 * register user and login services as they have special handling flows 
 * @param user represents user simple info that placed in TDRs Excel Sheet
 */
function registerUserLoginFlow(user) {
    let collectionFlow = [];
    let userData = userService.getUserData(user);
    collectionFlow.push(registerLoginFlow(user));
    collectionFlow.push(registerUserFlow(userData));
    return collectionFlow;
}

function registerLoginFlow(userData) {
    let rawBody = { ...loginServiceRequest };
    //i've made this twik to copy the object value without the reference
    let loginFlow = JSON.parse(JSON.stringify(serviceFlow));
    loginFlow.event = loginServiceFlow.event;
    rawBody.stubName = userData[Defines.props.loginName]
    rawBody.identifiers.username = userData[Defines.props.loginName]
    rawBody.identifiers.password = userData[Defines.props.loginName]
    rawBody.cookiesData[Defines.props.sessionId] = userData[Defines.props.loginName];

    loginFlow = updateServiceFlowDetails(loginFlow, {
        name: loginServiceFlow.name,
        rawBody: rawBody,
        urlRaw: Defines.urls.loginStubServiceUrl,
    });

    return loginFlow;
}

function registerServiceFlow(service) {
    let customServiceFlow = JSON.parse(JSON.stringify(serviceFlow));
    let rawBody = { ...userServiceRequest };

    return new Promise((resolve, reject) => {
        mapToStubService(service, function (err, response) {
            if (err) reject(err);
            let identiferDetials = getIdentfierDetails(service.identifiers);
            rawBody = updateRawBody(rawBody, {
                stubName: Defines.identifersBase + identiferDetials.identDesc,
                bodyData: response.defaultResponse,
                identifiers: identiferDetials.identiferAsObj
            })
            let serviceDataDetails = updateServiceFlowDetails(customServiceFlow, {
                name: response.name,
                rawBody: rawBody,
                urlRaw: response.url,
            });
            resolve(serviceDataDetails);
        })
    })
}


function getLastUrlSegment(url) {
    return url.substr(url.lastIndexOf('/') + 1);
}



function registerUserFlow(userData) {
    let rawBody = { ...userServiceRequest },
        //i've made this twik to copy the object value without the reference
        userFlow = JSON.parse(JSON.stringify(serviceFlow));
    rawBody = updateRawBody(rawBody, {
        stubName: userData.userName,
        bodyData: userData
    })
    rawBody.identifiers[Defines.props.sessionId] = userData.userName;
    userFlow = updateServiceFlowDetails(userFlow, {
        name: Defines.services.NilUser,
        rawBody: rawBody,
        urlRaw: Defines.urls.userStubsServiceUrl,
    });
    return userFlow;
}

//here how to create description for the automated Stub
function getIdentfierDetails(identifiers) {
    let identDesc = '', identObj = {};
    for (let i = 0; i < identifiers.length; i++) {
        //check if identifer is not empty
        if (identifiers[i] && !(Object.keys(identifiers[i]).length === 0) && identifiers[i].constructor === Object) {
            //get the value of the object key 
            identObj[Object.keys(identifiers[i])[0]] = identifiers[i][Object.keys(identifiers[i])[0]];
            if (identifiers[i][Object.keys(identifiers[i])[0]]) {
                identDesc += ' | ' + identifiers[i][Object.keys(identifiers[i])[0]];
            }
        }
    }
    return {
        identDesc: identDesc,
        identiferAsObj: identObj
    }
}

function updateServiceFlowDetails(serviceFlow, data) {
    serviceFlow.name = data.name;
    serviceFlow.request.body.raw = JSON.stringify(data.rawBody);
    serviceFlow.request.url.raw = Defines.host + data.urlRaw;
    serviceFlow.request.url.path.push(getLastUrlSegment(data.urlRaw));
    return serviceFlow;
}

function updateRawBody(rawBody, data) {
    rawBody.stubName = data.stubName;
    rawBody.data = data.bodyData;
    if (data.identifiers) {
        rawBody.identifiers = data.identifiers;
    }
    return rawBody;
}


module.exports = {
    registerUserLoginFlow,
    registerServiceFlow
}




















