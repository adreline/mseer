const express = require("express");
const bodyParser = require("body-parser");
const { settings } = require('../config.json');
const { listServers, createNewServer } = require("../modules/spawner.js");

class Frontend{
    constructor(){
        this.app = express()
        this.app.set('views', `${documentRoot}/frontend/views`)
        this.app.use(express.static(`${documentRoot}/frontend/static`))
        this.app.set('view engine', 'pug')
        this.app.use(bodyParser.urlencoded({ extended: false }))

        this.app.get("/", (req, res) => {
            (async ()=>{
                    listServers().then( servers => {
                        res.render('index',{ code: 0, servers: servers});
                    }).catch( e => {
                        console.error(e);
                        res.render('index',{ code: 1, msg: e.message });
                    })
            })();
        })
        this.app.post("/create", (req, res) => {
            (async ()=>{
                createNewServer(req.body.version,req.body.title,req.body.desc)
                .then( m => {
                    console.log(m);
                })
                .catch( e => {
                    console.error(e);
                })
                .finally(()=>{
                    const backtrack = new URL(req.headers.referer);
                    console.log(backtrack.pathname);
                    res.redirect(`${backtrack.pathname}`);
                });

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