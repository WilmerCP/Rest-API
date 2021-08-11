/**
 *   Utility file
 * 
 */

const crypto = require('crypto');
const config = require('../src/config');

const helpers = {};


helpers.hash = function(password){

    try{

        let hashedPassword = crypto.createHmac('sha256',config.currentEnv.secret).update(password).digest('hex');
        return hashedPassword;

    }catch(e){

        console.log("Error hashing the password");

        return false;

    }

}

helpers.parseJSON = function(payload){

    try{

        let parsed = JSON.parse(payload);

        return parsed;

    }catch(e){

        console.log("Payload was not in JSON format");

        return {};

    }   

}

helpers.validPassword = function(password){

    if(typeof password === "string" && password.length > 7 && password.length < 16){

        return password;

    }else{

        return false;

    }


}

helpers.validToken = function(tokenId){

    if(typeof tokenId === "string" && tokenId.length === 20){

        return tokenId;

    }else{

        return false;

    }


}

helpers.validName = function(name){

    if(typeof name === "string" && name.length > 0 && name.length < 50){

        return name;

    }else{

        return false;

    }

}

helpers.validPhoneNumber = function(phoneNumber){

    if(typeof phoneNumber === "string" && phoneNumber.length === 10 && parseInt(phoneNumber,10) == phoneNumber ){

        return phoneNumber;

    }else{

        return false;

    }

}

helpers.createToken = function(length){

    if(typeof(length) === 'number' && length > 0){

        let token = '';
        let characters = 'abcdefghijklmnñopqrstuvwxyz1234567890'

        for (let index = 1; index <= length; index++) {

            random = characters.charAt(Math.random()*characters.length);

            token +=random;
        }


        return token;

    }else{

        return false;

    }


}

module.exports = helpers;