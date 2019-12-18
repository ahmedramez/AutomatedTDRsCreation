process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
let helper = require('./helper/helper');
let { convertExcelToJSON } = require('./controllers/excel.to.json.controller');
let flowsLauncher = require('./controllers/flow.launcher.controller');

let app = express();
app.use(fileUpload());

app.post('/api/tdrs/upload', (req, res) => {
    let sampleFile = req.files.sampleFile;
    fs.writeFileSync('./target.xlsx', sampleFile.data);
    convertExcelToJSON().then((response) => {
        require('fs').writeFileSync('demoWithomarAndmai.json', JSON.stringify(response));
        flowsLauncher.launchFlows(response, () => {
            res.sendFile(path.resolve(__dirname, './newman/' + helper.getNewestFileInDir(path.resolve(__dirname, './newman'))));
        });
    })
})

app.listen(3000, () => console.log("SERVER IS RUNING ON PORT 3000"));

