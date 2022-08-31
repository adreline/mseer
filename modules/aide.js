const fs = require('fs');

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
function getMaster() {
    return new Promise((result, reject) => {
        try {
            let master = fs.readFileSync(`${documentRoot}/mojang/master.json`, { encoding: "utf8", flag: "r" });
            master = JSON.parse(master);
            result(master);
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
                delete master[key];
            }else{
                master[key] = val;
            }
            fs.writeFileSync(`${documentRoot}/mojang/master.json`, JSON.stringify(master));
            result('ok');
        })
        .catch(e=>{
            reject(e.message);
        })
    });
}
module.exports = {
    uniqeid: uniqeid,
    getMaster: getMaster,
    updateMaster: updateMaster,
    translate: translate
};
