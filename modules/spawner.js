const { Server } = require('./server-class.js');
const H = require('./aide.js');
const fs = require('fs');
const forever = require('forever-monitor');

function createNewServer(version, title = 'Server', desc = 'A minecraft server', port = 1111) {
    return new Promise((result, reject) => {
        let s = new Server({
            title: title,
            desc: desc,
            version: version,
            port: port,
            pid: '-'
        });
        s.commit()
            .then(m => {
                console.log(`Pushing EULA for ${s.uid}`);
                fs.writeFileSync(`/home/ubuntu/mseer/mojang/${s.uid}/eula.txt`, 'eula=true');
                result(m);
            })
            .catch(e => { reject(e) });
    })
}
function killServer(uid){
    return new Promise((result, reject)=>{
        console.log(`Attempting to kill ${uid}`);
        if(!Spools.hasOwnProperty(uid)){
            reject(`Process ${uid} does not exit`);
        }else{
            Spools[uid].stop();
        }   result(`Process ${uid} killed`);
    });
}
function bootServer(uid) {
    return new Promise((result, reject) => {
        H.getMaster(uid)
            .then(server => {
                console.log(`Booting ${server.title}`);
                return Promise.all([H.getJar(server.version), server]);
            })
            .then(tail => {
                let server = new Server(tail[1],uid);
                if (!fs.existsSync(`/home/ubuntu/mseer/mojang/${uid}/server.jar`)) {
                    console.log('Linking the binary');
                    fs.symlinkSync(`${documentRoot}/mojang/bins/${server.props.version}.jar`, `${documentRoot}/mojang/${uid}/server.jar`);
                }
                console.log('Spining up java')
                let spool = new (forever.Monitor)(['java -jar', `/home/ubuntu/mseer/mojang/${uid}/server.jar`], {
                    max: 1,
                    silent: true,
                    cwd: `/home/ubuntu/mseer/mojang/${uid}`
                });
                spool.on('exit', function () {
                    console.log(`${server.props.title} has exited (pid: ${spool.uid})`);
                    delete Spools[uid];
                    server.props.pid = '-';
                    server.commit();
                });
                spool.on('error', function () {
                    console.error(`${server.props.title} raised an error (pid: ${spool.uid})`);
                });
                Spools[uid] = spool;
                console.log(`Obtained pid ${spool.uid}`);
                console.log('updating master record');
                server.props.pid = spool.uid;
                return Promise.all([server.commit(), spool]);
            })
            .then(tail => {
                console.log('all ok');
                result(tail[1]);
            })
            .catch(e => {
                console.error(e);
                reject();
            })
    });
}
function listServers() {
    return H.getMaster();
}

function deleteServer(uid) {
    return new Promise((result, reject) => {
        console.log(`Deleting ${uid} from master record`);
        H.updateMaster(uid)
            .then(() => {
                console.log(`Unlinking binaries`);
                try{
                    fs.unlinkSync(`${documentRoot}/mojang/${uid}/server.jar`);
                }catch(e){
                    console.error(e.message);
                }
                console.log(`Purging the directory ${documentRoot}/mojang/${uid}`);
                fs.rmSync(`${documentRoot}/mojang/${uid}`, { recursive: true });
                result('ok');
            })
            .catch(e => {
                reject(e);
            })

    });
}

module.exports = {
    createNewServer: createNewServer,
    listServers: listServers,
    deleteServer: deleteServer,
    bootServer: bootServer,
    killServer: killServer
};
