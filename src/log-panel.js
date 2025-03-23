import { logTime } from "./util";

/**
 * 日志面板
 */
export class LogPanel {
    /**
     * @type {HTMLElement}
     */
    #container;
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(container) {
        this.#container = container;
    }
    /**
     * 转换为消息
     * @param  {any[]} args 
     * @returns 
     */
    #toMessage(args) {
        if (args.length == 1) {
            return args[0];
        }
        if (args.length == 2) {
            let message = args[0] + ": ";
            let ex = args[1];
            if (ex instanceof Error) {
                message += ex.message;
            } else {
                message += ex + "";
            }
            return message;
        }
        if (args.length > 2) {
            let message = args[0] + ": " + Array.from(args).slice(1).join(",");
            return message;
        }
        return null;
    }
    
    /**
     * 输出日志
     * @param {string} message 内容
     * @param {string} style 颜色
     */
    log(message,style){
        let container=this.#container;
        
        let itemEle=document.createElement("div"); 
        container.insertAdjacentElement("afterbegin",itemEle); 

        let timeEle=document.createElement("span"); 
        timeEle.className="time";
        timeEle.innerText=logTime(); 
        itemEle.appendChild(timeEle);

        let msgEle=document.createElement("span"); 
        msgEle.className=style; 
        msgEle.innerText=message;
        itemEle.appendChild(msgEle);
    };
    /**
     * 正常消息
     */
    info() {
        this.log(this.#toMessage(arguments),"info");
    }
    /**
     * 警告消息
     */
    warn() {
        this.log(this.#toMessage(arguments),"warn");
    }
    /**
     * 错误消息
     */
    error() {
        this.log(this.#toMessage(arguments),"error");
    }
    /**
     * 清空日志
     */
    clear() {
        this.#container.innerHTML="";
    }
}
