const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const mimeType = require('./mime');
const compress = require('./cpmpress');
const range = require('./range');
const isFresh = require('./cache');

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source =  fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async function(req, res, filepath,config){
    try{
        const stats = await stat(filepath);
        if (stats.isFile()) {
            const contentType = mimeType(filepath);
            res.setHeader('Content-Type', contentType+';charset=utf-8');
            if (isFresh(stats, req, res)){
                res.statusCode = 304;
                res.end();
                return;
            }
            let rs;
            const {code, start, end} = range(stats.size, req, res);
            if(code ===200){
                res.statusCode = 200;
                rs = fs.createReadStream(filepath);
            }else{
                res.statusCode = 206;
                rs = fs.createReadStream(filepath, {start,end});
            }
            if(filepath.match(config.compress)){
                rs = compress(rs, req, res);
            }
            rs.pipe(res);
        } else if (stats.isDirectory()) {
            const files = await readdir(filepath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const dir = path.relative(config.root, filepath);
            const data = {
                title:path.basename(filepath),
                dir:dir ? `${dir}` : '',
                files: files.map(file =>{
                    return {
                        file,
                        icon:mimeType(file)
                    };
                })
            };
            res.end(template(data));
        }
    } catch(ex){
        console.error(ex);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plan');
        res.end(`${filepath} is not a dirctory or file`);
    }
};
