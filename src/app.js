const http = require('http');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const config = require('./config/default.config');

const server = http.createServer((req, res) =>{
    const filepath = path.join(config.root, req.url);
    fs.stat(filepath,(err,stats)=>{
        if(err){
            res.statusCode = 404;
            res.setHeader('Content-Type','text/pan');
            res.end(`${filepath} is not a dirctory or file`);
            return;
        }
        if(stats.isFile()){
            res.statusCode = 200;
            res.setHeader('Content-Type','text/plan');
            fs.createReadStream(filepath).pipe(res);
        }else if(stats.isDirectory()){
            fs.readdir(filepath,(err,files)=>{
                if(err){
                    throw err;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plan');
                res.end(files.join(','));
            });
        }
    });
});

server.listen(config.port,config.hostname,()=>{
    const add = `http://${config.hostname}:${config.port}`;
    console.info(`server started at ${chalk.green(add)}`);
});
