const { services, serviceBaseUrl } = require('./services.json');


//mocking stubs server as if it return service details by service url 
module.exports = {
    getServiceDetailsByUrl: function (url, callback) {
        //removing baseUrl
        url = url.replace('{baseURL}', '');
        let service = services.find(e => e.url == url);
        service.url = serviceBaseUrl + service.name;
        callback(service);
    }
}