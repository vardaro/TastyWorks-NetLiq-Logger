'use strict';

const tw = require('tasty-works-api');
const MongoClient = require('mongodb').MongoClient;

/**
 * Check if the market is open right now. Returns true if market is open
 * Mon - Fri
 * 9:30 - 4:00 EST
 */
function marketIsOpen() {
    let easternISO = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    let date = new Date(easternISO);

    // Check if not weekend
    let weekend = date.getDay() === 6 || date.getDay() === 0;
    if (weekend)
        return false;

    // Check if within hour range
    let tradingHours = date.getHours() >= 9 && date.getHours() <= 16;
    if (!tradingHours)
        return false;

    // Check within minute range
    // (if hour 9 AM, make sure it's passed 9:30 AM)
    let open = (date.getHours() === 9) ? (date.getMinutes() >= 30) : true;

    return open;
}

/**
 * Get the net liq of a TW accouunt. Returns -1 if something wild happens
 * @param {string} username 
 * @param {string} password 
 * @param {string} id account id 
 */
async function getAccountValueTW(username, password, id) {
    tw.setUser({
        username, password
    });

    try {
        let authToken = await tw.authorization();
        await tw.setAuthorizationToken(authToken);

        let balances = await tw.balances(id);
        return Number(balances['net-liquidating-value']) || -1;
    } catch (err) {
        throw err;
    }

}

/**
 * Inserts a net liq value into a collection named 'documents'.
 * @param {number} netliq value to insert 
 * @param {string} uri mongo db uri 
 * @param {string} name name of db 
 */
async function insertDB(netliq, uri, name) {
    const client = await MongoClient.connect(uri, { useUnifiedTopology: true }).catch(err => { throw err });

    try {
        let db = client.db(name);
        let collection = db.collection('documents');

        let payload = { account_value: netliq, date: new Date() };

        await collection.insertOne(payload);
    } catch (err) {
        throw err;
    } finally {
        client.close();
    }
}

const DATABASE_NAME = "account_value";
const TASTY_ACCOUNT_ID = process.env.TASTY_ACCOUNT_ID || require('./secret/secret').TASTY_ACCOUNT_ID;
const DATABASE_URL = process.env.DATABASE_URL || require('./secret/secret').DATABASE_URL;
const USERNAME = process.env.TASTY_USERNAME || require('./secret/secret').TASTY_USERNAME;
const PASSWORD = process.env.TASTY_PASSWORD || require('./secret/secret').TASTY_PASSWORD;

async function main() {
    console.log(`TW NetLiq Logger`);

    let tradingHours = marketIsOpen();
    console.log(`Market is ${tradingHours ? "open" : "closed, aborting."}`);

    if (!tradingHours)
        return;

    let netliq = await getAccountValueTW(USERNAME, PASSWORD, 'klj');
    if (netliq == -1) {
        throw Error(`Error extracting account value from ${TASTY_ACCOUNT_ID}`);
    }
    console.log(`Extracted account value from TW, netliq = ${netliq}`);

    await insertDB(netliq, DATABASE_URL, DATABASE_NAME);
    console.log(`Insert successful`);
}

main();

