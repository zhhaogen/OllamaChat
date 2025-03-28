/**静态服务器 */
import wwwZip from "../www.zip";
import * as http from "node:http";
import AdmZip from "adm-zip";
import { file as readFile } from "bun";

/** */
let port = 8080;
let bind = "127.0.0.1"; 

if (process.env["port"] != null) {
    port = parseInt(process.env["port"]);
}

if (process.env["bind"] != null) {
    port = parseInt(process.env["bind"]);
}
/**
 * 初始化
 */
async function init() { 
    let zipFileBytes=await readFile(wwwZip).bytes();
    let zipFile=new AdmZip(Buffer.from(zipFileBytes));
    // zipFile.getEntries().forEach(item=>console.log(item.entryName));
    /**
     * 处理请求
     * @param {http.IncomingMessage} req 
     * @param {http.ServerResponse} res 
     */
    function onRequest(req, res) {
        // console.log("收到请求", req);
        if (!(req.method == "POST" || req.method == "GET")) {
            res.writeHead(405, "Method Not Allowed");
            res.end();
            return;
        }
        //解析路径
        let url = new URL("http://" + req.headers.host + req.url);
        let pathname = url.pathname;
        if (pathname.endsWith("/")) {
            pathname = pathname + "index.html";
        }
        if (pathname[0] == "/") {
            pathname = pathname.substring(1);
        } 
        console.log("文件路径", pathname);
        let zipEntry=zipFile.getEntry(pathname);
        if (zipEntry==null) {
            res.writeHead(404, "Not Found");
            res.end();
            return;
        }
        res.writeHead(200, { "Content-Type": getContentType(pathname) });
        res.write(zipEntry.getData());
        res.end();
        return;
    }
    let server = http.createServer(onRequest);
    server.addListener("clientError", (e, socket) => {
        console.log("客服端连接异常", e);
    });
    server.addListener("listening", () => {
        let iAddress = server.address();
        console.log("服务已启动,请访问:http://" + iAddress.address + ":" + iAddress.port);
    });
    server.addListener("error", (err) => {
        console.error("服务器异常", err);
        this.release();
    });
    server.addListener("close", () => {
        console.log("服务器关闭");
    });
    server.listen(port, bind);
}

/**
 * 获取content-type
 * @param {string} path 
 */
function getContentType(path) {
    path = path.toLocaleLowerCase();
    if (path.endsWith("js")) {
        return "application/javascript";
    }
    if (path.endsWith("json")) {
        return "application/javascript";
    }
    if (path.endsWith("htm") || path.endsWith("html")) {
        return "text/html";
    }
    if (path.endsWith("gif")) {
        return "image/gif";
    }
    if (path.endsWith("jpg") || path.endsWith("jpeg")) {
        return "image/jpeg";
    }
    if (path.endsWith("png")) {
        return "image/png";
    }
    if (path.endsWith("css")) {
        return "text/css";
    }
    if (path.endsWith("ttf")) {
        return "font/ttf";
    }
    if (path.endsWith("woff")) {
        return "font/woff";
    }
    if (path.endsWith("woff2")) {
        return "font/woff2";
    }
    // console.log("others");
    return "application/octet-stream";
}
init();