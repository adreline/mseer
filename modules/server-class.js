class Server{
    constructor(properties,uid){
        this.properties = properties;
        this.uid = uid;
    }
}
//encodes json file to minecraft prop file and vice versa
function translate(properties){
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

exports.Server = Server;