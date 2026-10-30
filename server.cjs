const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.cjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.woff':'font/woff','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.mp4':'video/mp4'};
http.createServer((req,res)=>{
 const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file = path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  if(range){const start=+range[1],end=range[2]?Math.min(+range[2],stat.size-1):stat.size-1;
   if(start> end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);
  }else{res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);}
 });
}).listen(process.env.PORT||4173,'127.0.0.1',()=>console.log('ÉPURE atelier: http://127.0.0.1:'+(process.env.PORT||4173)));
