
//Dependencies

const http =  require('http');
const { StringDecoder } = require('string_decoder');
const config = require('./config');
const https = require('https');
const fs = require('fs');
const handler = require('./handlers');
const helpers = require('../lib/helpers');

//Creating an http server and passing him the behaviour we defined for servers
const httpServer =http.createServer(handlerHttp);


//Defining a config object with the key and certificate for https

let httpsConfig = {

    key: fs.readFileSync('https/key.pem'),
    cert: fs.readFileSync('https/cert.pem')

}

//Creating an https server and passing him the behaviour we defined for servers

const httpsServer =https.createServer(httpsConfig,handlerHttps);

//Handler functions that allows us to call the behaviour function knowing which protocol it is

function handlerHttp(req,res){

    behaviour(req,res,'http');
}

function handlerHttps(req,res){

    behaviour(req,res,'https');
}

//Function that defines the behaviour of the server

function behaviour(req,res,protocol){

    let myUrl = new URL(protocol + '://' + req.headers.host + req.url);

    let method = req.method.toUpperCase();

    let headers = req.headers

    let payload = '';

    const decoder = new StringDecoder('utf-8');

    req.on('data',(chunk)=>{

        payload += decoder.write(chunk);

    });

    req.on('end',()=>{

        payload += decoder.end();

        let data = {

            content: payload.length > 0 ? helpers.parseJSON(payload) : {},
            url: myUrl,
            method: method,
            headers: headers

        }

        let currentHandler = router[myUrl.pathname] !== undefined ? router[myUrl.pathname] : handler.notFound ;

        currentHandler(data,(statusCode, answer)=>{

            let resCode = typeof(statusCode) ===  'number' ? statusCode : 200;          

            let resAnswer = typeof(answer) === 'object' ? answer : {};

            
            res.setHeader('Content-Type','application/json');
            res.writeHead(resCode);
            res.end(JSON.stringify(resAnswer));

        })

    });

};

//Putting both servers to listen on the port specified

httpServer.listen(config.currentEnv.httpPort, ()=>{

    console.log("server on port " + config.currentEnv.httpPort);

})

httpsServer.listen(config.currentEnv.httpsPort, ()=>{

    console.log("server on port " + config.currentEnv.httpsPort);

})


let router = {
    '/ping': handler.ping,
    '/users': handler.users,
    '/tokens': handler.tokens
}