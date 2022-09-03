const fs = require('fs');
const H = require('./aide.js');

class Server{
    constructor(properties={},uid=H.uniqeid()){
        this.props = properties;
        this.uid = uid;
        this.serialize = function(){
            return JSON.stringify(this.props)
        }
        this.commit = function () {
            return new Promise((results,reject)=>{
                if(!fs.existsSync(`${documentRoot}/mojang/${this.uid}`)){
                    console.log(`creating new dir at ${documentRoot}/mojang/${this.uid}`);
                    try{
                        fs.mkdirSync(`${documentRoot}/mojang/${this.uid}`);
                        console.log('ok');
                    }catch(e){
                        reject(`Error creating new directory, ${e.message}`);
                    }
                    
                }
                console.log('saving server metadata');
                try{
                    fs.writeFileSync(`${documentRoot}/mojang/${this.uid}/server.properties`,H.translate(
                        JSON.stringify({
                            'server-port': this.props.port,
                            motd: this.props.desc,
                        })
                    ));
                    console.log('ok');
                }catch(e){
                    reject(`Error writing to a file, ${e.message}`);
                }
                console.log('updating master list');
                H.updateMaster(this.uid,this.props)
                .then(()=>{
                    results('all ok');
                })
                .catch(e=>{
                    reject(`Error updating master list, ${e.message}`);
                })
            });
        }

    }

}
exports.Server = Server;
