const { Server } = require('./server-class.js');
const fs = require('fs');

async function createNewServer(version,title='Server',desc='A minecraft server'){
    let promise = new Promise((result,reject)=>{
        let s = new Server({
            title: title,
            desc: desc,
            version: version,
            pid: 'na'
        });
        s.commit().then(m => {
            result(m);
        }).catch(e => {
            reject(e);
        });
    });
    return await promise;
}

async function listServers(){
    let promise = new Promise((result,reject)=>{
        try{
            let master = fs.readFileSync(`${documentRoot}/mojang/master.json`,{ encoding: "utf8", flag: "r" });
            master = JSON.parse(master);
            result(master);
        }catch(e){
            reject(e.message);
        }
        
    });
    return await promise;
}

exports.createNewServer = createNewServer;
exports.listServers = listServers;