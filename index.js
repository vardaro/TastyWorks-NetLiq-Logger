
'use strict';

const TastyWorks = require('tasty-works-api');
const credentials = {
    username: process.env.TASTY_USERNAME || require('./secret/secret').TASTY_USERNAME,
    password: process.env.TASTY_PASSWORD || require('./secret/secret').TASTY_PASSWORD
};

let TASTY_ACCOUNT_ID = process.env.TASTY_ACCOUNT_ID || require('./secret/secret').TASTY_ACCOUNT_ID;

TastyWorks.setUser(credentials);

TastyWorks.authorization()
    .then(token => {
        // Set the authorization in the headers
        TastyWorks.setAuthorizationToken(token);
        console.log('Session is active, continue with other calls.');
        return true;
    })
    .then(() => TastyWorks.balances(TASTY_ACCOUNT_ID))
    .catch(err => console.log(err.status))
    .then(balances => {
        let netliq = balances['net-liquidating-value'];
        console.log(netliq);
    });