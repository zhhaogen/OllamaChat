import { chatTime,formatDuration } from "./util";
import { marked,parse as parseMd } from "marked";
import katex from "katex"; 
/**
 * 
 * @param {string} s  
 */
function renderMd(s){
    s=s.replaceAll("\\(","<span class='latex'>").replaceAll("\\)","</span>").replaceAll("\\[","<div class='latex'>").replaceAll("\\]","</div>");
    return parseMd(s);
} 
/**
 * 有进度的聊天面板
 */
export class ChatPanel {
    /** @type {HTMLElement} */
    #container;
    constructor(container) {
        this.#container = container;
    }
    /**
     * 我发出的消息
     * @param {MessageOption} option 
     */
    sendMyMessage(option) {
        let container = this.#container;
        let panel = document.createElement("div");
        panel.className = "message-my";
        container.appendChild(panel);
        option.name = option.name ?? "我";
        return new ChatMessage(panel, option);
    }
    /**
     * 发送一条的消息
     * @param {MessageOption} option 
     * @return {ChatMessage}
     */
    sendMessage(option) {
        let container = this.#container;
        let panel = document.createElement("div");
        panel.className = "message";
        container.appendChild(panel);
        return new ChatMessage(panel, option);
    }
}
/**
 * 
 */
class MessageOption {
    /**
    * 消息作者
    * @type {string}
    */
    name;
    /**
     * `@`谁
     * @type {string?}
     */
    at;
    /**
     * 内容
     * @type {string?}
     */
    content;
    /**
     * 图片
     * @type {string?}
     */
    image;
    /**
    * 额外提示
    * @type {string?}
    */
    tips;
}
class ChatMessage {
    /**@type {HTMLElement} */
    #panel;
    /**@type {HTMLElement} */
    #contentContainer;
    /**@type {HTMLElement} */
    #tipsEle;
    /** @type {HTMLButtonElement } */
    #cancleBtn;
    /**markdown格式的消息内容 @type {string} */
    #fullContent;
    /**
     * 
     * @param {HTMLElement} panel 
     * @param {MessageOption} option 
     */
    constructor(panel, option) {
        //
        let nameTimeEle=document.createElement("div");
        panel.appendChild(nameTimeEle);
        //昵称
        let nameEle = document.createElement("span");
        nameEle.className = "message-name";
        nameEle.innerText = option.name;
        nameTimeEle.appendChild(nameEle);
        //创建时间
        let timeEle = document.createElement("span");
        timeEle.className = "message-time";
        timeEle.innerText = chatTime();
        nameTimeEle.appendChild(timeEle);

        //完整内容
        let contentContainer = document.createElement("div");
        contentContainer.className = "message-content";
        panel.appendChild(contentContainer); 
        //图片内容
        if(option.image!=null){
            let imgContainer = document.createElement("div"); 
            imgContainer.className = "message-image";
            panel.appendChild(imgContainer); 
            let imgEle=document.createElement("img");
            imgEle.src="data:image/*;base64,"+option.image;
            imgContainer.appendChild(imgEle);
        }       
        
        //提示内容
        let tipsEle = document.createElement("div");
        tipsEle.className = "message-tips";
        panel.appendChild(tipsEle); 

        this.#panel = panel;
        this.#contentContainer = contentContainer;
        this.#tipsEle = tipsEle;
        this.#fullContent="";

        //at
        if (option.at != null) {
            this.addContent("<a class='message-at' href='#"+option.at+"'>"+option.at+"</a>"); 
        }
        //
        if (option.content != null) {
            this.addContent(option.content);
        }
        if (option.tips != null) {
            this.setTips(option.tips);
        }
    }
    /**
     * 开始进度循环
     * @param {import("ollama").AbortableAsyncIterator<import("ollama").ChatResponse>} responses
     */
    async startResponses(responses){
        let panel=this.#panel;

        let cancleBtnContainer = document.createElement("div");
        panel.appendChild(cancleBtnContainer);
        let cancleBtn = document.createElement("button");
        cancleBtn.innerText = "取消";
        cancleBtnContainer.appendChild(cancleBtn);
        cancleBtn.addEventListener("click", () => {
            responses.abort();
            cancleBtn.disabled = true;
        });
        this.#cancleBtn = cancleBtn;
        /**合并所有消息 */
        let respMessage=null;
        for await (let response of responses) {
            // console.log(response);
            let partMessage=response.message;
            this.addContent(partMessage.content);
            if(response.done){ 
                this.setTips(response.eval_count+"步 "+formatDuration(response.total_duration/1000000000));
            }
            if(respMessage==null){
                respMessage=Object.assign({},partMessage);
                continue;
            }
            respMessage.content+=partMessage.content;
        } 

        cancleBtn.style.display = "none";
        return respMessage;
    }
    /**
     * 开始进度循环
     * @param {import("ollama").AbortableAsyncIterator<import("ollama").GenerateResponse>} responses
     */
    async startGenResponses(responses){
        let panel=this.#panel;

        let cancleBtnContainer = document.createElement("div");
        panel.appendChild(cancleBtnContainer);
        let cancleBtn = document.createElement("button");
        cancleBtn.innerText = "取消";
        cancleBtnContainer.appendChild(cancleBtn);
        cancleBtn.addEventListener("click", () => {
            responses.abort();
            cancleBtn.disabled = true;
        });
        this.#cancleBtn = cancleBtn; 

        for await (let response of responses) {
            // console.log(response); 
            this.addContent(response.response);
            if(response.done){ 
                this.setTips(response.eval_count+"步 "+formatDuration(response.total_duration/1000000000));
            }
            
        } 

        cancleBtn.style.display = "none";
        
    }
    /**
     * 追加内容
     * @param {string} content 
     */
    addContent(content) {
        this.#fullContent+=content;
        let contentContainer = this.#contentContainer;  
        let fullContent=this.#fullContent;
        
        contentContainer.innerHTML=renderMd(fullContent);
        let eles=contentContainer.querySelectorAll(".latex");
        for(let ele of eles){
            try {
                let s=katex.renderToString(ele.innerText,{output:"mathml",displayMode:false});
                ele.innerHTML=s;
            } catch (igr) {
                
            } 
        } 
    }
    /**
    * 设置额外提示
    * @param {string} content 
    */
    setTips(content) {
        let tipsEle = this.#tipsEle;
        tipsEle.innerText = content;
    }
    /**
     * 发生异常
     * @param {string|Error} ex 
     */
    stopError(ex) {
        let contentContainer = this.#contentContainer;
        let cancleBtn = this.#cancleBtn;

        let contentEle = document.createElement("div");
        contentEle.className = "error";
        contentEle.innerText = (ex instanceof Error) ? ex.message : ex;
        contentContainer.appendChild(contentEle);

        if (cancleBtn != null) {
            cancleBtn.style.display = "none";
        }
    }
}