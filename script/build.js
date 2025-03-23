import fs from "node:fs";
//复制Katex
function copyKatex(){
    let distDir="./katex";
    let sourceDir="./node_modules/katex/dist";
    if(!fs.existsSync(distDir)){
        fs.mkdirSync(distDir);
    }
    fs.cpSync(sourceDir+"/katex.min.css",distDir+"/katex.min.css");
   
    if(fs.existsSync(distDir+"/fonts")){
        fs.rmSync(distDir+"/fonts",{recursive:true});
    }
    fs.cpSync(sourceDir+"/fonts",distDir+"/fonts",{recursive:true});
}
copyKatex();
await Bun.build({
    entrypoints: ["./src/index.js"],
    outdir: "./js",
    sourcemap: "linked",
    minify:true,
    compile:true
});