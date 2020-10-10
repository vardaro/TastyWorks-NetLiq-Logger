
'use strict';

const tw = require('tasty-works-api');
const mongo = require('mongodb').MongoClient;
const credentials = {
    username: process.env.TASTY_USERNAME || require('./secret/secret').TASTY_USERNAME,
    password: process.env.TASTY_PASSWORD || require('./secret/secret').TASTY_PASSWORD
};

const TASTY_ACCOUNT_ID = process.env.TASTY_ACCOUNT_ID || require('./secret/secret').TASTY_ACCOUNT_ID;
const DATABASE_URL = process.env.DATABASE_URL || require('./secret/secret').DATABASE_URL;

tw.setUser(credentials);
console.log(`TW: Connecting to TastyWorks`);
tw.authorization()
    .then(token => {
        tw.setAuthorizationToken(token);
        return true;
    })
    .then(() => tw.balances(TASTY_ACCOUNT_ID))
    .catch(err => console.log(err.status))
    .then(balances => {
        let netliq = Number(balances['net-liquidating-value']);
        console.log(`TW: Connected to TastyWorks. netliq = ${netliq}`);
        console.log(`TW: Connecting to DB`);
        mongo.connect(DATABASE_URL, { useUnifiedTopology: true }, function (err, client) {
            console.log("TW: Connecting successfully to DB");

            const db = client.db('account_value');

            const collection = db.collection('documents');
            // Insert some documents
            collection.insertOne(
                { account_value: netliq, date: new Date() },
                function (err, result) {
                    if (err)
                        throw err;

                    console.log(`TW: Insert successful`);
                    client.close();
                });
        });

    });