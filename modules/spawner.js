const { Server } = require('./server-class.js');

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

