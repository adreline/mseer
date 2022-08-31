const express = require("express");
const bodyParser = require("body-parser");
const { settings } = require('../config.json');
const Spawner = require("../modules/spawner.js");

class Frontend{
    constructor(){
        this.app = express()
        this.app.set('views', `${documentRoot}/frontend/views`)
        this.app.use(express.static(`${documentRoot}/frontend/static`))
        this.app.set('view engine', 'pug')
        this.app.use(bodyParser.urlencoded({ extended: false }))

        this.app.get("/", (req, res) => {
            Spawner.listServers()
            .then( servers => {
                res.render('index',{ code: 0, servers: servers});
            })
            .catch( e => {
                console.error(e);
                res.render('index',{ code: 1, msg: e });
            });
        })
        this.app.post("/create", (req, res) => {
            Spawner.createNewServer(req.body.version,req.body.title,req.body.desc,req.body.port)
            .then( m => {
                console.log(m);
            })
            .catch( e => {
                console.error(e);
            })
            .finally(()=>{
                const backtrack = new URL(req.headers.referer);
                res.redirect(`${backtrack.pathname}`);
            });
        })
        this.app.get("/delete/:uid",(req,res)=>{
            Spawner.deleteServer(req.params.uid)
            .then( m => {
                console.log(m);
            })
            .catch( e => {
                console.error(e);
            })
            .finally(()=>{
                const backtrack = new URL(req.headers.referer);
                res.redirect(`${backtrack.pathname}`);
            });
        });
    }
    serve(){
        this.app.listen(settings.webInterfacePort, () => {
            console.log(`Server is running at port ${settings.webInterfacePort}`)
        })
    }
}

exports.Frontend = Frontend;