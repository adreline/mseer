const { Server } = require('./server-class.js');
const H = require('./aide.js');
const fs = require('fs');
const ServerJars = require('serverjars-api'); 
const forever = require('forever-monitor');

function createNewServer(version,title='Server',desc='A minecraft server',port=1111){
    let s = new Server({
        title: title,
        desc: desc,
        version: version,
        port: port,
        pid: 'na'
    });
    console.log(`Pushing EULA for ${s.uid}`);
    fs.writeFileSync('eula.txt','eula=true');
    return s.commit();
}
function bootServer(uid){
    return new Promise((result, reject)=>{
        H.getMaster(uid)
        .then( server =>{
            console.log(`Booting ${server.title}`);
            return Promise.all([H.getJar(server.version),server]);
        })
        .then(tail=>{
            let server = tail[1];
            if(!fs.existsSync(`/home/ubuntu/mseer/mojang/${uid}/server.jar`)){
                console.log('Linking the binary');
                fs.symlinkSync(`${documentRoot}/mojang/bins/${server.version}.jar`,`${documentRoot}/mojang/${uid}/server.jar`);    
            }
            console.log('Spining up java')
            let spool = new (forever.Monitor)([ 'java -jar', `/home/ubuntu/mseer/mojang/${uid}/server.jar` ], {
                max : 1,
                silent : true,
                cwd: `/home/ubuntu/mseer/mojang/${uid}`
            });
            spool.on('exit', function () {
                console.log(`${server.title} has exited (pid: ${spool.uid})`);
                server = new Server(server,uid);
                server.props.running = spool.running;
                server.commit();
            });
            spool.on('error', function () {
                console.error(`${server.title} raised an error (pid: ${spool.uid})`);
                server = new Server(server,uid);
                server.props.running = spool.running;
                server.commit();
            })
            console.log(`Obtained pid ${spool.uid}`);
            console.log('updating master record');
            server = new Server(server,uid);
            server.props.pid = spool.uid;
            server.props.running = spool.running;
            return Promise.all([server.commit(),spool]);
        })
        .then(tail => {
            console.log('all ok');
            result(tail[1]);
        })
        .catch(e=>{
            console.error(e);
            reject();
        })
    });
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
                fs.unlinkSync(`${documentRoot}/mojang/${uid}/server.jar`);
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
    deleteServer: deleteServer,
    bootServer: bootServer
};
