const { Frontend } = require('./frontend/frontend.js');
const fs = require('fs');
const path = require('path');
const H = require('./modules/aide.js');
global.documentRoot = path.resolve(__dirname);
global.Spools = {};
//verify if directory tree is intact 
if(!fs.existsSync(`${documentRoot}/mojang`)){
    console.log('Creating directory tree');
    fs.mkdirSync(`${documentRoot}/mojang`);
    fs.mkdirSync(`${documentRoot}/mojang/bins`);
    fs.writeFileSync(`${documentRoot}/mojang/master.json`,'{}');
}
//on setup, clear 'online' status of all servers
H.getMaster()
    .then(master => {
        for (const uid in master) {
            console.log(`clearing ${uid}`);
            master[uid].pid = '-';
        }
        fs.writeFileSync(`${documentRoot}/mojang/master.json`, JSON.stringify(master));
    })
    .then(() => {
        const webInterface = new Frontend();
        webInterface.serve();
    })

