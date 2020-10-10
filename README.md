# TastyWorks NetLiq Logger
 
 Script to log net liq of my TastyWorks account in a Mongo db. I run this minutely, but it can be scheduled hourly, daily, or whatever.

 You can use this too, if you need a way to track NetLiq since they don't provide this info naturally. This script requires four environment variable configurations to function:

 ```
    TASTY_USERNAME: <LOGIN USER FOR TW>,
    TASTY_PASSWORD: <PASSWORD FOR TW ACCOUNT>,
    TASTY_ACCOUNT_ID: <ACCOUNT ID FOR TW ACCOUNT>,
    DATABASE_URL: <MONGODB URI>
 ```

 Run this with `node start`

 You'll need to `npm install` before running the first time.