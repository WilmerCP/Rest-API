
/*
* This module defines the environment in which the app is working
*
*/


let environments = {};

environments.production = {

    envName: 'production',
    httpPort: 80,
    httpsPort:443,
    secret: "Venezuela libre"

};

environments.staging = {

    envName: 'staging',
    httpPort: 3000,
    httpsPort:3001,
    secret: "Venezuela libre"

};


let currentEnvName = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV : "staging";

let currentEnv = typeof(environments[currentEnvName]) === 'object' ? environments[currentEnvName] : environments.staging;

exports.currentEnv = currentEnv;