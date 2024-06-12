// Copyright (c) 2023 Brenden Adamczak, Pur3 Ltd. See the file LICENSE for copying permission. 
const fs = require('fs');
const fse = require('fs-extra'); 
const path = require('path');
const minify = require('./minify');

function same(file1,file2){
    if(!fs.existsSync(file1)) return false;
    if(!fs.existsSync(file2)) return false;
    const f1 = fs.readFileSync(file1, 'utf8');
    const f2 = fs.readFileSync(file2, 'utf8');
    return f1 === f2;
}

function older(file1,file2){
    if(!fs.existsSync(file1)) return false;
    if(!fs.existsSync(file2)) return false;
    return fs.statSync(file1).mtime > fs.statSync(file2).mtime;
}

const DIR= process.cwd();
const HOME = process.env.HOME;
const WEBSITE = `${HOME}/workspace/espruinowebsite`
const MODULEDIR= `${WEBSITE}/www/modules`;

var modules = [];
// Minify all modules
if(typeof process.env.npm_config_file === 'undefined'){
    const dirList = ["devices","modules","boards"];
    modules = dirList.map((dir)=>{return fs.readdirSync(dir).map((name)=>`${dir}/${name}`)}).flat();
    modules = modules.filter(name => name.endsWith('.js') );
}
else{
//mifify a single module
    modules[0] = process.env.npm_config_file;
}

modules.forEach(function (module) {
    console.log(module);
    if(!fs.existsSync(module)) {console.log(`${module} - doesn't exist`); return;}

    const BNAME = path.basename(module)              //'DS18B20.js'
    const MINJS = `${path.parse(BNAME).name}.min.js` // e.g. 'DS18B20.min.js'
    const FULL_NAME     = `${MODULEDIR}/${BNAME}`;
    const FULL_MINJS    = `${MODULEDIR}/${MINJS}`; 
    // An optional externs-file must be in the same directory as the module file.
    // Example devices/.../DS18B20.js → devices/.../DS18B20.externs
    const externsFile   = `${path.dirname(module)}/${path.parse(BNAME).name}.externs` // e.g. <module-path>/DS18B20.externs 

    // do nothing if ..
    //  .. the module code haven't changed and
    //  .. the target module file is newer than an existing externs file (or the externs file does not exist)
    if(same(module, FULL_NAME) && older(FULL_NAME, externsFile)){
        console.log("already made")
        return;
    }
    
    //console.log(`Module [${BNAME}] is different or doesn't exist`);
    fse.copySync(module, FULL_NAME);
    

    minify(FULL_NAME,FULL_MINJS,externsFile);
    console.log(FULL_MINJS)
    
    if (fs.existsSync(FULL_MINJS) && fs.statSync(FULL_MINJS).size > 0) {
        console.log(`${FULL_MINJS} compile successful`);
    } 
    else {
        if(fs.existsSync(FULL_MINJS)) fs.unlinkSync(FULL_MINJS);
        console.log(`${BNAME} compile FAILED.`);
        process.exit();
    }
});
