/*
*   Library to store data in the .data folder
*/

const fs = require('fs').promises;
const path = require('path');
const helpers = require('./helpers');

let base = path.join(__dirname,'/../.data/');

const lib = {};

lib.create = async function(dir,name,data){

    try{

        let filehandle = await fs.open(base+dir+'/'+name+'.json','wx');

        await filehandle.writeFile(JSON.stringify(data));

        filehandle.close();

    }catch(err){

        return err;

    }

};

lib.update = async function(dir,name,data){

    try{

        let filehandle = await fs.open(base+dir+'/'+name+'.json','r+');

        await filehandle.truncate();

        await filehandle.writeFile(JSON.stringify(data));
        
        filehandle.close();

    }catch(err){

        return err;

    }

};

lib.read = async function(dir,name){

    try{

       let info = await fs.readFile(base+dir+'/'+name+'.json');

       return helpers.parseJSON(info.toString());

    }catch(err){

        return false;

    }

};

lib.delete = async function(dir,name){

    try{

       await fs.unlink(base+dir+'/'+name+'.json');

    }catch(err){

        return err;

    }

};

module.exports = lib;