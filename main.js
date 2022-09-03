const { Frontend } = require('./frontend/frontend.js');
const fs = require('fs');
const path = require('path');
const H = require('./modules/aide.js');
global.documentRoot = path.resolve(__dirname);
global.Spools = {};
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

