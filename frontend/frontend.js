const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const { settings } = require('config.json');

class Frontend{
    constructor(){
        this.app = express()
        this.root = path.resolve(__dirname)
        this.app.set('views', `${root}/frontend/views`)
        this.app.set('view engine', 'pug')
        this.app.use(bodyParser.urlencoded({ extended: false }))

        this.app.get("/", (req, res) => {
            (async ()=>{
                try{
                    res.render('index',{ code: 0 })
                }catch(e){
                    console.error(e);
                    res.render('index',{ code: 1, msg: e.message })
                }
            })();
        })
    }
    serve(){
        this.app.listen(settings.webInterfacePort, () => {
            console.log(`Server is running at port ${settings.webInterfacePort}`)
        })
    }
}

exports.Frontend = Frontend;