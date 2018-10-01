let userTypesConfig = require('../config/userTypes.json');
const Defines = require('../config/defines.json');
let jp = require('jsonpath');

//get detailed user data from config based on user type and update it's values based on jsonPaths
function getUserData(userValues) {
    let userData = userTypesConfig[userValues[Defines.users.userType]];
    let userTypePaths = Defines.users[userValues[Defines.users.userType]].jsonPaths;
    for (let i = 0; i < userTypePaths.length; i++) {
        jp.apply(userData, userTypePaths[i].path, function (value) {
            value = userValues[userTypePaths[i].propName];
            return value;
        });
    }
    return userData;
}


module.exports = {
    getUserData
}




