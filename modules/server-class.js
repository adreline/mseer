const fs = require('fs');
const { uniqeid } = require('./aide.js');

class Server{
    constructor(properties={},uid=uniqeid()){
        this.props = properties;
        this.uid = uid;
        this.serialize = function(){
            return JSON.stringify({
                properties: this.props
            })
        }
        this.commit = async function () {
            let promise = new Promise((results,reject)=>{
                if(!fs.existsSync(`../mojang/${this.uid}`)){
                    console.log(`creating new dir at ../mojang/${this.uid}`);
                    try{
                        fs.mkdirSync(`../mojang/${this.uid}`);
                        console.log('ok');
                    }catch(e){
                        reject(`Error creating new directory, ${e.message}`);
                    }
                    
                }
                console.log('saving server metadata');
                try{
                    fs.writeFileSync(`../mojang/${this.uid}/server.properties`,this.serialize());
                    console.log('ok');
                }catch(e){
                    reject(`Error writing to a file, ${e.message}`);
                }
                console.log('updating master list');
                try{
                    let master = fs.readFileSync('../mojang/master.json',{ encoding: "utf8", flag: "r" });
                    master = JSON.parse(master);
                    master[this.uid]=this.props;
                    fs.writeFileSync('../mojang/master.json',JSON.stringify(master));
                    console.log('ok');
                }catch(e){
                    reject(`Error updating master list, ${e.message}`);
                }
                results('all ok');
            });
            return await promise;
        }
        //encodes json file to minecraft prop file and vice versa
        this.translate = function (properties){
            let json_or_prop = null;
            try{
                let json = JSON.parse(properties);
                json_or_prop = '';
                Object.getOwnPropertyNames(json).forEach(element=>{
                    json_or_prop+=`${element}=${json[element]}\n`;
                });
            } catch(e){
                let prop = properties.split('\n');
                json_or_prop = {};
                prop.forEach(element => {
                    if(element.startsWith('#')||element.trim()=='') return null;
                    let p = element.split('=');
                    json_or_prop[`${p[0]}`]=`${p[1]}`.trim();
                });
                
            }
            return json_or_prop;
        }
    }

}
exports.Server = Server;
