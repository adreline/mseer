const { Server } = require('./server-class.js');
const H = require('./aide.js');
const fs = require('fs');

function createNewServer(version,title='Server',desc='A minecraft server',port=1111){
    let s = new Server({
        title: title,
        desc: desc,
        version: version,
        port: port,
        pid: 'na'
    });
    return s.commit();
}

function listServers(){
    return H.getMaster();
}

function deleteServer(uid){
    return new Promise((result,reject)=>{
            console.log(`Deleting ${uid} from master record`);
            H.updateMaster(uid)
            .then(()=>{
                console.log(`Unlinking binaries`);
                //TODO
                console.log(`Purging the directory ${documentRoot}/mojang/${uid}`);
                fs.rmSync(`${documentRoot}/mojang/${uid}`,{recursive: true});
                result('ok');
            })
            .catch(e=>{
                reject(e);
            })

    });
}

module.exports = {
    createNewServer: createNewServer,
    listServers: listServers,
    deleteServer: deleteServer
};
