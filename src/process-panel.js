import { formatFileSize, logTime } from "./util";

/**
 * 进度面板
 */
export class ProcessPanel {
    /** @type {HTMLElement} */
    #panel;
    /** @type {HTMLElement} */
    #titleEle;
    /** @type {ProcessStatusPanel} */
    #lastStatusPanel;

    /** @type {HTMLButtonElement } */
    #cancleBtn;
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(container) {
        let panel = document.createElement("div");
        container.insertAdjacentElement("afterbegin", panel);

        let titleEle = document.createElement("div");
        panel.appendChild(titleEle);

        this.#panel = panel;
        this.#titleEle = titleEle;
    }
    /**
     * 设置标题
     * @param {string} title 
     */
    setTitle(title) {
        let titleEle = this.#titleEle;
        titleEle.innerHTML = "";

        let timeEle = document.createElement("span");
        timeEle.className="time";
        timeEle.innerText =logTime();
        titleEle.appendChild(timeEle);

        let labelEle=document.createElement("span");
        labelEle.className="info";
        labelEle.innerText =title; 
        titleEle.appendChild(labelEle); 

    }
    /**
     * 发生异常
     * @param {string} label 
     * @param {string|Error} err 
     */
    stopError(label, err) {
        let panel = this.#panel;
        let lastStatusPanel = this.#lastStatusPanel;
        let cancleBtn = this.#cancleBtn;

        if (lastStatusPanel != null) {
            lastStatusPanel.stop();
        }
        if (cancleBtn != null) {
            cancleBtn.disabled = true;
        }

        let labelEle = document.createElement("div");
        labelEle.className="error";
        labelEle.innerText = label;
        panel.appendChild(labelEle);

        let errorEle = document.createElement("div");
        errorEle.className="error";
        errorEle.innerText = (err instanceof Error) ? err.message : err;
        panel.appendChild(errorEle);
    }
    /**
     * 开始进度循环
     * @param {import("ollama").AbortableAsyncIterator<import("ollama").ProgressResponse>} responses 
     */
    async startResponses(responses) {
        let panel = this.#panel;

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

        /**@type {string} */
        let lastStatus;
        /**@type {ProcessStatusPanel} */
        let lastStatusPanel;

        for await (let response of responses) {
            let status = response.status;
            if (status != lastStatus) {
                if (lastStatusPanel != null) {
                    lastStatusPanel.complete();
                }
                lastStatusPanel = new ProcessStatusPanel(panel, status);
                this.#lastStatusPanel = lastStatusPanel;
                lastStatus = status;
            }
            lastStatusPanel.update(response);
        }
        if (lastStatusPanel != null) {
            lastStatusPanel.complete();
        }
        cancleBtn.disabled = true;
    }
}
/**
 * 分布进度面板
 */
class ProcessStatusPanel {
    /** @type {HTMLElement} */
    #panel;
    /** @type {HTMLElement} */
    #titleEle;
    /** @type {HTMLElement} */
    #progressLabelEle;
    /** @type {HTMLProgressElement} */
    #progressEle;
    /** @type {boolean}*/
    #indeterminate = true;
    /**
     * 
     * @param {HTMLElement} container 
     * @param {string} title 
     */
    constructor(container, title) {
        let panel = document.createElement("div");
        container.appendChild(panel);

        let titleEle = document.createElement("span");
        titleEle.innerText = title;
        panel.appendChild(titleEle);

        let progressEle = document.createElement("progress");
        panel.appendChild(progressEle);

        let progressLabelEle = document.createElement("span");
        panel.appendChild(progressLabelEle);

        this.#panel = panel;
        this.#titleEle = titleEle;
        this.#progressLabelEle = progressLabelEle;
        this.#progressEle = progressEle;
    }
    /**
     * 更新进度
     * @param {import("ollama").ProgressResponse} response 进度 
     */
    update(response) {
        // console.log(response);
        let progressLabelEle = this.#progressLabelEle;
        let progressEle = this.#progressEle;
        if (response.completed == null) {
            this.#indeterminate = true;
            progressEle.removeAttribute("value");
            return;
        }
        this.#indeterminate = false;
        progressLabelEle.innerText = response.completed + "/" + response.total + " " + formatFileSize(response.completed) + "/" + formatFileSize(response.total);
        progressEle.max = response.total;
        progressEle.value = response.completed;
    }
    /**
     * 进度完成
     */
    complete() {
        if (this.#indeterminate) {
            this.#progressEle.style.display = "none";
        }
    }
    /**
     * 进度终止
     */
    stop() {
        if (this.#indeterminate) {
            this.#progressEle.style.display = "none";
        }
    }
}