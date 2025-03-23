/**
 * 修正url
 * @param {string} url 
 */
export function fixUrl(url) {
    if (url == null || url == "") {
        return url;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }
    if (url.startsWith("://")) {
        return location.protocol + url.substring(1);
    }
    if (url.startsWith("//")) {
        return location.protocol + url;
    }
    if (url.startsWith("/")) {
        let u = new URL(location.protocol + "//" + location.host + url);
        return u.href;
    }
    let dirname = location.pathname;
    if (dirname.lastIndexOf("/") !== -1) {
        dirname = dirname.substring(0, dirname.lastIndexOf("/"));
    }
    let u = new URL(location.protocol + "//" + location.host + "/" + dirname + "/" + url);
    return u.href;
}
/**
 * 格式化为x时x分x秒
 * @param {number} s 秒
 */
export function formatDuration(s) {
    if (s <= 0) {
        return s;
    }
    //天
    let day = Math.floor(s / 86400);
    //剩余时分秒
    let ds = s - day * 86400;
    //时
    let hour = Math.floor(ds / 3600);
    //剩余分和秒
    ds = ds - hour * 3600;
    //分
    let min = Math.floor(ds / 60);
    //剩余秒
    ds = ds - min * 60;
    ds= toMaxFixed(ds,2);
    if (day > 0) {
        return day + "天" + hour + "时" + min + "分" + ds + "秒";
    }
    if (hour > 0) {
        return hour + "时" + min + "分" + ds + "秒";
    }
    if (min > 0) {
        return min + "分" + ds + "秒";
    }
    return ds + "秒";
}
/**
 * 格式文件大小
 * @param {number} s 单位b
 */
export function formatFileSize(s) {
    if (s <= 0) {
        return s;
    } 
    let units=["B","KB","MB","GB","TB","PB","EB"];
    let ds=s;
    for(let unit of units){
        if(ds<1024){
            return toMaxFixed(ds,2)+unit;
        }
        ds=ds/1024;
    } 
    return toMaxFixed(ds,2)+units[units.length-1];
}
/**
 * 最大保留小数点数
 * @param {number} n
 * @param {number} t
 * @return {string}
 */
export function toMaxFixed(n, t) {
    if (n == null) {
        return null;
    }
    if (t == null || t < 1) {
        return n + "";
    }
    let k = Math.pow(10, t);
    let a = Math.round(n * k) / k;
    return a + "";
}
/**
 * 是否为今天
 * @param {Date} da 
 * @returns 
 */
export function isToday(da){
    let now=new Date();
    return (da.getFullYear()===now.getFullYear())&&(da.getMonth()===now.getMonth())&&(da.getDate()===now.getDate());
}
/**
 * 2位整数
 * @param {number} l 
 * @returns 
 */
function z0(l){
    return l<10?("0"+l):l;
}
/**
 * 3位整数
 * @param {number} n 
 * @returns 
 */
function z00(n){
    if(n<10){
        return "00"+n;
    }
    if(n<100){
        return "0"+n;
    }
    return n;
}
/**
 * 格式为yyyy-MM-dd HH:mm或 HH:mm
 * @param {number} l 
 */
export function formateDateTime(l){
    let da=new Date(l); 
    let s=z0(da.getHours())+":"+z0(da.getMinutes());
    if(isToday(da)){
        return s;
    }
    s=da.getFullYear()+"-"+z0(da.getMonth()+1)+"-"+z0(da.getDate())+" "+s;
    return s;
}
/**
 * 聊天时间 
 */
export function chatTime(){
    let da=new Date(); 
    let s=z0(da.getHours())+":"+z0(da.getMinutes())+":"+z0(da.getSeconds());
    //今天
    if(isToday(da)){
        return s;
    } 
    //今年
    s=z0(da.getMonth()+1)+"-"+z0(da.getDate())+" "+s;
    if(da.getFullYear()===new Date().getFullYear()){
        return s;
    }
    s=da.getFullYear()+"-"+s;
    return s;
}
/**
 * 日志时间 
 */
export function logTime(){
    let da=new Date();
    return z0(da.getHours())+":"+z0(da.getMinutes())+":"+z0(da.getSeconds())+"."+z00(da.getMilliseconds());
}
/**
* 获取单选框值
* @param {string} name 
*/
export function getRadioValue(name) {
    let eles = document.querySelectorAll("input[name=" + name + "]");
    for (let ele of eles) {
        if (ele.checked) {
            return ele.value;
        }
    }
}
/**
 * 添加标签和内容
 * @param {HTMLElement} container
 * @param {string} label 
 * @param {string|string[]} value 短内容
 */
export function addKeyValue(container,label,value){
    let itemEle=document.createElement("div");
    container.appendChild(itemEle);
    let labelEle=document.createElement("span");
    labelEle.className="key"; 
    labelEle.innerText=label; 
    itemEle.appendChild(labelEle);
    if(value==null){
        value="";
    }
    let values=Array.isArray(value)?value:[value];
    for(let content of values){
        let contentELe=document.createElement("span"); 
        contentELe.className="value";
        contentELe.innerText=content;
        itemEle.appendChild(contentELe);
    } 
    return;
}
/**
 * 计算欧式空间距离
 * @param {number[]} arr1 
 * @param {number[]} arr2 
 */
export function calcDistance(arr1,arr2){
    let dd=0;
    for(let i=0;i<arr1.length;i++){
        let dif=arr1[i]-arr2[i];
        dd+=dif*dif;
    } 
    let d=Math.sqrt(dd);
    return d;
}
/**
 * 计算余弦值
 * @param {number[]} arr1 
 * @param {number[]} arr2 
 */
export function calcCos(arr1,arr2){
    let ab=0;
    for(let i=0;i<arr1.length;i++){ 
        ab+=arr1[i]*arr2[i];
    }
    let aa=0;
    for(let i=0;i<arr1.length;i++){ 
        aa+=arr1[i]*arr1[i];
    }
    let bb=0;
    for(let i=0;i<arr2.length;i++){ 
        bb+=arr2[i]*arr2[i];
    }
    if(aa===0||bb===0){
        return 0;
    }
    let d=aa/(Math.sqrt(aa)*Math.sqrt(bb));
    return d;
}
/**
 * 文件转为base64
 * @param {File} file 
 */
export async function readFileBase64(file){
    return new Promise((okCallback,errCallback)=>{
        let reader=new FileReader();
        reader.onload=()=>{
            let dataUrl=reader.result; 
            // console.log(dataUrl);
            dataUrl=dataUrl.substring(dataUrl.indexOf(",")+1);
            okCallback(dataUrl);
        };
        reader.onerror=()=>{
            errCallback("读取文件异常");
        };
        reader.readAsDataURL(file);
    });
}