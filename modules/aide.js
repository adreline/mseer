const fs = require('fs');
const ServerJars = require('serverjars-api'); 

function uniqeid() {
    return Date.now().toString(36) + Math.floor(Math.pow(10, 12) + Math.random() * 9 * Math.pow(10, 12)).toString(36);
}
//encodes json file to minecraft prop file and vice versa
function translate(properties) {
    let json_or_prop = null;
    try {
        let json = JSON.parse(properties);
        json_or_prop = '';
        Object.getOwnPropertyNames(json).forEach(element => {
            json_or_prop += `${element}=${json[element]}\n`;
        });
    } catch (e) {
        let prop = properties.split('\n');
        json_or_prop = {};
        prop.forEach(element => {
            if (element.startsWith('#') || element.trim() == '') return null;
            let p = element.split('=');
            json_or_prop[`${p[0]}`] = `${p[1]}`.trim();
        });

    }
    return json_or_prop;
}
function getMaster(uid) {
    return new Promise((result, reject) => {
        try {
            let master = fs.readFileSync(`${documentRoot}/mojang/master.json`, { encoding: "utf8", flag: "r" });
            master = JSON.parse(master);
            result((typeof uid === 'undefined')?master:master[uid]);
        } catch (e) {
            reject(e.message);
        }
    });
}
function updateMaster(key, val=false) {
    return new Promise((result, reject) => {
        getMaster()
        .then(master => {
            if(!val){ //calling the funct without val will prompt it to delete the record instead
                console.log(`removing key ${key}`);
                delete master[key];
                result();
            }else{
                console.log(`updating ${key} with ${val.pid}`);
                master[key] = val;
                result();
            }
            console.log('writing to a file');
            fs.writeFileSync(`${documentRoot}/mojang/master.json`, JSON.stringify(master));
        })
        .catch(e=>{
            reject(e.message);
        })
    });
}
function getJar(version){
    return new Promise((result,reject)=>{
        let bins = fs.readdirSync(`${documentRoot}/mojang/bins`);
        if(!bins.includes(`${version}.jar`)){
            console.log(`${version}.jar not found, downloading it`)
            ServerJars.downloadJar('vanilla/vanilla', version, `${documentRoot}/mojang/bins/${version}.jar`)
            .then(stream => {
                stream.on('finish', () => {
                    console.log(`Downloaded ${documentRoot}/mojang/bins/${version}.jar`);
                    result();
                })
            })
            .catch(e=>{
                reject(e);
            })
        }else{
            console.log(`Already exists ${documentRoot}/mojang/bins/${version}.jar`);
            result();
        }
    })
}
module.exports = {
    uniqeid: uniqeid,
    getMaster: getMaster,
    updateMaster: updateMaster,
    translate: translate,
    getJar: getJar
};
