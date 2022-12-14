const express = require("express");
const bodyParser = require("body-parser");
const { settings } = require('../config.json');
const Spawner = require("../modules/spawner.js");
const ServerJars = require('serverjars-api'); 
const forever = require('forever-monitor');

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
                return Promise.all([ServerJars.fetchAll('vanilla/vanilla'), servers]);       
            })
            .then((jars_and_servers)=>{
                res.render('index',{ code: 0, servers: jars_and_servers[1], jars: jars_and_servers[0]});
            })
            .catch( e => {
                console.error(e);
                res.render('index',{ code: 1, msg: e, servers: {} });
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
        this.app.get("/boot/:uid",(req,res)=>{
            Spawner.bootServer(req.params.uid)
            .then( m => {
                console.log(`Starting ${m.uid}`);
                m.start();
            })
            .catch( e => {
                console.error(e);
            })
            .finally(()=>{
                const backtrack = new URL(req.headers.referer);
                res.redirect(`${backtrack.pathname}`);
            });
        });
        this.app.get("/kill/:uid",(req,res)=>{
            Spawner.killServer(req.params.uid)
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