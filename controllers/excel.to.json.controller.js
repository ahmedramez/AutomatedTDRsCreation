let convertExcel = require('excel-as-json').processFile;
let _ = require('lodash');
let fs = require('fs');
let Defines = require('../config/defines.json').excelToJSON;
const path = require('path');


let convertExcelToJSON = () => {
    return new Promise((resolve, reject) => {
        convertExcel(path.resolve(__dirname, '../target.xlsx'), './result2.json', {}, function (err, res) {
            if (err) { throw err; }

            let identifyRecordKey = Defines.recordKeyName;
            let excelTojsonArr = [];
            let responseProps = Object.keys(res[0]);
            let recordsLength = 0;

            //getting the records length
            for (let i = responseProps.length; i >= 0; i--) {
                if (responseProps[i] && responseProps[i].indexOf(identifyRecordKey) + 1) {
                    recordsLength = +responseProps[i].substr(identifyRecordKey.length, responseProps[i].length);
                    break;
                }
            };

            //looping over the converted excel sheet and generate well detailed object to make paths , services and  obvious enough.
            let records = {};
            res.forEach((item, i) => {
                for (let j = 0; j <= recordsLength; j++) {
                    //identify record key with index to generate the mapping object with record base
                    let recordWithIndex = identifyRecordKey + j;
                    records[recordWithIndex] = records[recordWithIndex] instanceof Object ? records[recordWithIndex] : {};
                    records[recordWithIndex][item[Defines.serviceIdentifierKey].toLowerCase()] = item[recordWithIndex];
                    records[recordWithIndex].servicesDetails = records[recordWithIndex].servicesDetails ? records[recordWithIndex].servicesDetails : [];
                    if (item[Defines.serviceUrl]) {
                        let service = records[recordWithIndex].servicesDetails.find(e => e.url == item[Defines.serviceUrl]);
                        if (!service) {
                            //getting 
                            let identifiers = item[Defines.serviceUrl].split('/').searchFor('{');
                            records[recordWithIndex].servicesDetails.push({
                                url: item[Defines.serviceUrl],
                                identifiers: identifiers.map((e) => {
                                    //removing identifer wrappers
                                    let key = e.replace(/[{}]/g, '');

                                    //check if it has multiple identifiers values
                                    // let identifersValues = records[recordWithIndex][key].split('|');
                                    // if (identifersValues.length > 1) {

                                    // }
                                    return {
                                        [key]: records[recordWithIndex][key]
                                    }
                                }),
                                paths: [{
                                    key: item[Defines.keyPath],
                                    value: item[recordWithIndex]
                                }]
                            })
                        } else {
                            service.paths.push({
                                key: item[Defines.keyPath],
                                value: item[recordWithIndex]
                            })
                        }
                    }
                }
            });
            //resolving record after all mapping processess
            resolve(records);
            fs.writeFileSync('./demo.json', JSON.stringify(records));
        });
    })
}


Array.prototype.searchFor = function (target) {
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }
    var retValues = [];
    for (var i = 0; i < this.length; i++) {
        if (this[i].startsWith(target)) { retValues.push(this[i]); }
    }
    return retValues;
};



module.exports = {
    convertExcelToJSON
}



