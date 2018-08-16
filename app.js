const http = require('http');
const chalk = require('chalk');
const path = require('path');
const config = require('./src/config/default.config');
const route = require('./src/helper/route');
const openUrl = require('./src/helper/openUrl');

class Server{
    constructor(conf){
        this.conf = Object.assign({}, config, conf);
    }
    start() {
        const server = http.createServer((req, res) => {
            const filepath = path.join(this.conf.root, req.url);
            route(req, res, filepath, this.conf);
        });

        server.listen(this.conf.port, this.conf.hostname, () => {
            const add = `http://${this.conf.hostname}:${this.conf.port}`;
            console.info(`server started at ${chalk.green(add)}`);
            openUrl(add);
        });
    }
}
module.exports = Server;


