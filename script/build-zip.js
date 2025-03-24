import AdmZip from "adm-zip";
import fs from "node:fs";
/**打包忽略这些文件 */
const ignoreFileNames=["node_modules","bun.lock","package.json","www.zip","src","test","script","main","main.exe"];

let zipFile=new AdmZip();
let subFileNames=fs.readdirSync("./");

for(let subFileName of subFileNames){
    if(subFileName.startsWith(".")){
        //.svn .git
        continue;
    }
    if(ignoreFileNames.indexOf(subFileName)!==-1){
        continue;
    }
    let subFilePath="./"+subFileName; 
    if(fs.lstatSync(subFilePath).isFile()){
        console.log("打包文件",subFilePath);
        zipFile.addLocalFile(subFilePath);
        continue;
    }
    console.log("打包目录",subFilePath);
    await zipFile.addLocalFolderPromise(subFilePath,{zipPath:subFileName+"/"});
} 
await zipFile.writeZipPromise("./www.zip");