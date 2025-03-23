import { Ollama } from "ollama";
import { fixUrl, formateDateTime, formatFileSize, getRadioValue, addKeyValue, calcDistance, calcCos, readFileBase64 } from "./util";
import { ProcessPanel } from "./process-panel";
import { LogPanel } from "./log-panel";
import { ChatPanel } from "./chat-panel";

/**
 * @type {HTMLInputElement}
 */
let urlText = document.getElementById("urlText");
let setUrlBtn = document.getElementById("setUrlBtn");
let abortAllBtn = document.getElementById("abortAllBtn");

/**
 * @type {HTMLInputElement}
 */
let downModelNameText = document.getElementById("downModelNameText");
let downModelBtn = document.getElementById("downModelBtn");

let modelListBtn = document.getElementById("modelListBtn");
let modelListPanel = document.getElementById("modelListPanel");
let modelListLabelText = document.getElementById("modelListLabelText");

/**
 * @type {HTMLInputElement}
 */
let showModelNameText = document.getElementById("showModelNameText");
let showModelBtn = document.getElementById("showModelBtn");
let showModelPanel = document.getElementById("showModelPanel");
/**
 * @type {HTMLDetailsElement}
 */
let showModelContainer = document.getElementById("showModelContainer");

/**
 * @type {HTMLInputElement}
 */
let embedModelNameText = document.getElementById("embedModelNameText");
/**
 * @type {HTMLInputElement}
 */
let embedContent1Text = document.getElementById("embedContent1Text");
/**
 * @type {HTMLInputElement}
 */
let embedContent2Text = document.getElementById("embedContent2Text");
let embedDistanceBtn = document.getElementById("embedDistanceBtn");
let embedResultText = document.getElementById("embedResultText");

/**
 * @type {HTMLInputElement}
 */
let knowledgeModelNameText = document.getElementById("knowledgeModelNameText");
/**
 * @type {HTMLInputElement}
 */
let knowledgeFileInput = document.getElementById("knowledgeFileInput");
/**
 * @type {HTMLInputElement}
 */
let knowledgeContentText = document.getElementById("knowledgeContentText");
/**
 * @type {HTMLInputElement}
 */
let knowledgeSplitSizeText = document.getElementById("knowledgeSplitSizeText");
/**
 * @type {HTMLInputElement}
 */
let knowledgePromptText = document.getElementById("knowledgePromptText");
let knowledgeAddBtn = document.getElementById("knowledgeAddBtn");
let knowledgeListPanel = document.getElementById("knowledgeListPanel");
let knowledgeFileClearBtn = document.getElementById("knowledgeFileClearBtn");
let knowledgeClearBtn = document.getElementById("knowledgeClearBtn");
let knowledgeSetPromptBtn = document.getElementById("knowledgeSetPromptBtn");
/**
 * @type {HTMLInputElement}
 */
let chatKnowledgeModeNameText = document.getElementById("chatKnowledgeModeNameText");

/**
 * @type {HTMLInputElement}
 */
let chatModelNameText = document.getElementById("chatModelNameText");
/**
 * @type {HTMLInputElement}
 */
let chatContentText = document.getElementById("chatContentText");
let chatViewPanel = document.getElementById("chatViewPanel");
/**
 * @type {HTMLInputElement}
 */
let chatFileInput = document.getElementById("chatFileInput");
let chatFileClearBtn = document.getElementById("chatFileClearBtn");
/**
 * @type {HTMLDetailsElement}
 */
let chatContainer = document.getElementById("chatContainer");
let chatSendBtn = document.getElementById("chatSendBtn");
let chatClearBtn = document.getElementById("chatClearBtn");
let chatPanel = new ChatPanel(chatViewPanel);
/**
 * @type {HTMLInputElement}
 */
let chatGenerateCheck = document.getElementById("chatGenerateCheck");
/**
 * @type {HTMLInputElement}
 */
let chatKnowledgeCheck = document.getElementById("chatKnowledgeCheck");

let logPanel = document.getElementById("logPanel");

let logger = new LogPanel(logPanel);
/**
 * @type {Ollama}
 */
let ollama = new Ollama();
/**
 * 历史消息记录
 * @type {import("ollama").Message[]}
 */
let historyMessages = [];
/**
 * @typedef KnowledgeDoc
 * @property {string} model 模型名称
 * @property {string} content 内容
 * @property {number[]} embedding 向量
 */
/**
 * 知识库储存
 * @type {KnowledgeDoc[]}
 */
let knowledges = [];
/**使用知识库时的提示语 @type {string} */
let knowledgePrompt = "请根据以下内容回答问题:\n${knowledge}";
/**
 * 设置模型名称下拉框
 * @param {ModelResponse[]} models 
 */
function setModelsSelects(models) {
    setModelsSelect(showModelNameText, models);
    setModelsSelect(embedModelNameText, models);
    setModelsSelect(knowledgeModelNameText, models);
    setModelsSelect(chatModelNameText, models);
    setModelsSelect(chatKnowledgeModeNameText, models);
}
/**
 * 设置模型名称下拉框
 * @param {HTMLSelectElement} selectEle 
 * @param {ModelResponse[]} models 
 */
function setModelsSelect(selectEle, models) {
    selectEle.innerHTML = "";
    if (models == null) {
        return;
    }
    for (let model of models) {
        let opEle = document.createElement("option");
        selectEle.appendChild(opEle);
        opEle.value = model.model;
        opEle.innerText = model.name;
    }
}
/**
 * 设置ollama服务地址
 */
function doSetUrl() {
    let host = fixUrl(urlText.value);
    if (host == "") {
        urlText.setCustomValidity("服务地址不能为空");
        urlText.reportValidity();
        return;
    }
    ollama = new Ollama({ host });
    init();
}
/**
 * 下载模型
 */
async function doDownModel() {
    let model = downModelNameText.value;
    if (model == "") {
        downModelNameText.setCustomValidity("模型名称不能为空");
        downModelNameText.reportValidity();
        return;
    }
    let insecure = getRadioValue("downModelInsecureCheck");

    let request = { model, stream: true };
    if (insecure == "true") {
        request.insecure = true;
    } else if (insecure == "false") {
        request.insecure = true;
    }

    let processPanel = new ProcessPanel(logPanel);
    processPanel.setTitle("下载模型[" + model + "]");

    try {
        let responses = await ollama.pull(request);
        await processPanel.startResponses(responses);
        doListModel();
    } catch (ex) {
        console.error("下载模型[" + model + "]异常", ex);
        processPanel.stopError("下载模型[" + model + "]异常", ex);
    }
}
/**列出模型 */
async function doListModel() {
    modelListPanel.innerHTML = "";
    modelListLabelText.innerHTML = "";

    let list = await ollama.list();
    console.log(list);
    let runList = await ollama.ps();
    console.log(runList);

    let models = list.models;
    let runModels = runList.models; 

    modelListLabelText.innerText = "共计" + models.length + "个模型";

    for (let model of models) {
        let trEle = document.createElement("tr");
        modelListPanel.appendChild(trEle);
        //名称
        let tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let nameEle = document.createElement("span");
        nameEle.innerText = model.name;
        tdEle.appendChild(nameEle);
        //家族
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        for (let family of model.details.families) {
            let familyEle = document.createElement("span");
            familyEle.className = "badge";
            familyEle.innerText = family;
            tdEle.appendChild(familyEle);
        }
        //参数大小
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let pSizeEle = document.createElement("span");
        pSizeEle.innerText = model.details.parameter_size;
        tdEle.appendChild(pSizeEle);
        //文件大小
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let fSizeEle = document.createElement("span");
        fSizeEle.innerText = formatFileSize(model.size);
        tdEle.appendChild(fSizeEle);
        //格式
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let formatEle = document.createElement("span");
        formatEle.innerText = model.details.format;
        tdEle.appendChild(formatEle);
        //量化级别
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let qLevelEle = document.createElement("span");
        qLevelEle.innerText = model.details.quantization_level;
        tdEle.appendChild(qLevelEle);
        //更新时间
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let dateEle = document.createElement("span");
        dateEle.innerText = formateDateTime(Date.parse(model.modified_at));
        tdEle.appendChild(dateEle);
        //状态
        let isRunning=runModels.find(it=>it.model===model.model)!=null;
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let statusEle = document.createElement("span");
        statusEle.innerText = isRunning?"运行中":"未运行";
        tdEle.appendChild(statusEle);
        //操作
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        //删除
        let delBtnEle = document.createElement("button");
        delBtnEle.innerText = "删除";
        tdEle.appendChild(delBtnEle);
        delBtnEle.addEventListener("click", async () => {
            let modelName = model.name;
            try {
                let response = await ollama.delete({ model: modelName });
                console.log("删除模型[" + modelName + "]结果", response);
                logger.info("删除模型[" + modelName + "]结果", response.status);
                doListModel();
            } catch (ex) {
                console.error("删除模型[" + modelName + "]异常", ex);
                logger.error("删除模型[" + modelName + "]异常", ex);
            }

        });
        //详情
        let showBtnEle = document.createElement("button");
        showBtnEle.innerText = "详情";
        tdEle.appendChild(showBtnEle);
        showBtnEle.addEventListener("click", async () => {
            let modelName = model.name;
            showModelNameText.value = modelName;
            showModelContainer.open = true;
            showModelPanel.scrollIntoView({ behavior: "smooth", block: "start" });
            _doShowModel(modelName);
        });
        //复制
        let copyBtnEle = document.createElement("button");
        copyBtnEle.innerText = "复制";
        tdEle.appendChild(copyBtnEle);
        copyBtnEle.addEventListener("click", async () => {
            let modelName = model.name;
            let newModelName = window.prompt("请输入新模型名称", modelName + "_copy");
            if (newModelName == null) {
                //取消
                return;
            }
            if (newModelName == "") {
                copyBtnEle.setCustomValidity("模型名称不能为空");
                copyBtnEle.reportValidity();
                return;
            }
            try {
                let response = await ollama.copy({ source: modelName, destination: newModelName });
                console.log("复制模型[" + modelName + "]=>[" + newModelName + "]结果", response);
                logger.info("复制模型[" + modelName + "]=>[" + newModelName + "]结果", response.status);
                doListModel();
            } catch (ex) {
                console.error("复制模型[" + modelName + "]=>[" + newModelName + "]异常", ex);
                logger.error("复制模型[" + modelName + "]=>[" + newModelName + "]异常", ex);
            }
        });
        //更新
        let updateBtnEle = document.createElement("button");
        updateBtnEle.innerText = "更新";
        tdEle.appendChild(updateBtnEle);
        updateBtnEle.addEventListener("click", async () => {
            let modelName = model.name;
            let processPanel = new ProcessPanel(logPanel);
            processPanel.setTitle("更新模型[" + modelName + "]");
            try {
                let responses = await ollama.pull({ model: modelName, stream: true });
                await processPanel.startResponses(responses);
                doListModel();
            } catch (ex) {
                console.error("更新模型[" + modelName + "]异常", ex);
                processPanel.stopError("更新模型[" + modelName + "]异常", ex);
            }
        });
        //对话
        let chatBtnEle = document.createElement("button");
        chatBtnEle.innerText = "对话";
        tdEle.appendChild(chatBtnEle);
        chatBtnEle.addEventListener("click", async () => {
            let modelName = model.name;
            chatModelNameText.value = modelName;
            chatContainer.open = true;
            chatViewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    setModelsSelects(models);
}
/**
 * 显示模型详情
 */
async function doShowModel() {
    let model = showModelNameText.value;
    if (model == "") {
        showModelNameText.setCustomValidity("模型名称不能为空");
        showModelNameText.reportValidity();
        return;
    }
    _doShowModel(model);
}
/**
 * 显示模型详情
 * @param {string} model 模型名称
 */
async function _doShowModel(model) {
    showModelPanel.innerHTML = "";
    /**
     * 添加标签和内容
     * @param {string} label 
     * @param {string} content 长内容
     */
    function addLabelContent(label, content) {
        let itemELe = document.createElement("details");
        showModelPanel.appendChild(itemELe);
        let labelEle = document.createElement("summary");
        labelEle.innerText = label;
        itemELe.appendChild(labelEle);
        let contentEle = document.createElement("div");
        contentEle.innerText = content ?? "";
        itemELe.appendChild(contentEle);
    }
    try {
        let response = await ollama.show({ model });
        console.log("获取模型[" + model + "]详情", response);
        //
        addLabelContent("开源协议(license)", response.license);
        addLabelContent("模型文件(modelfile)", response.modelfile);
        addLabelContent("模板(template)", response.template);
        addLabelContent("系统(system)", response.system);
        addLabelContent("参数(parameters)", response.parameters);

        //浓缩详情
        let itemEle = document.createElement("details");
        showModelPanel.appendChild(itemEle);
        let labelEle = document.createElement("summary");
        labelEle.innerText = "基本信息";
        itemEle.appendChild(labelEle);
        let contentEle = document.createElement("div");
        contentEle.className = "flex";
        itemEle.appendChild(contentEle);
        addKeyValue(contentEle, "更新时间(modified_at)", formateDateTime(Date.parse(response.modified_at)));
        let details = response.details;
        addKeyValue(contentEle, "家族(family)", details.family);
        addKeyValue(contentEle, "族群(families)", details.families);
        addKeyValue(contentEle, "格式(format)", details.format);
        addKeyValue(contentEle, "参数大小(parameter_size)", details.parameter_size);
        addKeyValue(contentEle, "量化级别(quantization_level)", details.quantization_level);
        addKeyValue(contentEle, "父级模型(parent_model)", details.parent_model);

        //模型信息
        if (response.model_info != null) {
            let model_info = response.model_info;
            itemEle = document.createElement("details");
            showModelPanel.appendChild(itemEle);
            labelEle = document.createElement("summary");
            labelEle.innerText = "模型信息(model_info)-" + Object.keys(model_info).length;
            itemEle.appendChild(labelEle);
            contentEle = document.createElement("div");
            contentEle.className = "flex";
            itemEle.appendChild(contentEle);
            for (let key in model_info) {
                let value = model_info[key];
                addKeyValue(contentEle, key, value);
            }
        }

        //tensor信息
        if (response.tensors != null) {
            let tensors = response.tensors;
            itemEle = document.createElement("details");
            showModelPanel.appendChild(itemEle);
            labelEle = document.createElement("summary");
            labelEle.innerText = "张量信息(tensors)-" + tensors.length;
            itemEle.appendChild(labelEle);
            contentEle = document.createElement("div");
            contentEle.className = "flex";
            itemEle.appendChild(contentEle);
            for (let tensor of tensors) {
                let value = [tensor.type].concat(tensor.shape);
                addKeyValue(contentEle, tensor.name, value);
            }
        }
        if (response.messages != null) {
            let messages = response.messages;
            itemEle = document.createElement("details");
            showModelPanel.appendChild(itemEle);
            labelEle = document.createElement("summary");
            labelEle.innerText = "消息信息(messages)-" + messages.length;
            itemEle.appendChild(labelEle);
            contentEle = document.createElement("div");
            contentEle.className = "flex";
            itemEle.appendChild(contentEle);
            for (let i = 0; i < messages.length; i++) {
                let message = messages[i];
                addKeyValue(contentEle, "content[" + i + "]", message.content);
            }
        }
        if (response.projector_info != null) {
            let projector_info = response.projector_info;
            itemEle = document.createElement("details");
            showModelPanel.appendChild(itemEle);
            labelEle = document.createElement("summary");
            labelEle.innerText = "项目信息(projector_info)-" + Object.keys(projector_info).length;
            itemEle.appendChild(labelEle);
            contentEle = document.createElement("div");
            contentEle.className = "flex";
            itemEle.appendChild(contentEle);
            for (let key in projector_info) {
                let value = projector_info[key];
                addKeyValue(contentEle, key, value);
            }
        }
    } catch (ex) {
        console.error("获取模型[" + model + "]详情异常", ex);
        logger.error("获取模型[" + model + "]详情异常", ex);
    }
}
/**
 * 向量化距离计算
 */
async function doEmbedDistanc() {
    let modelName = embedModelNameText.value;
    if (modelName == "") {
        embedModelNameText.setCustomValidity("模型名称不能为空");
        embedModelNameText.reportValidity();
        return;
    }
    let content1 = embedContent1Text.value;
    if (content1 == "") {
        embedContent1Text.setCustomValidity("内容1不能为空");
        embedContent1Text.reportValidity();
        return;
    }
    let content2 = embedContent2Text.value;
    if (content2 == "") {
        embedContent2Text.setCustomValidity("内容2不能为空");
        embedContent2Text.reportValidity();
        return;
    }
    embedResultText.innerHTML = "";
    try {
        let response = await ollama.embed({ model: modelName, input: [content1, content2] });
        console.log("模型[" + modelName + "]embed结果", content1, content2, response);
        let embeddings = response.embeddings;
        addKeyValue(embedResultText, "向量大小", embeddings[0].length);
        //计算距离
        //欧式距离
        addKeyValue(embedResultText, "欧式距离", calcDistance(embeddings[0], embeddings[1]));
        addKeyValue(embedResultText, "余弦值", calcCos(embeddings[0], embeddings[1]));
    } catch (ex) {
        console.error("模型[" + modelName + "]向量计算异常", content, ex);
        logger.error("模型[" + modelName + "]向量计算异常", ex);
    }
}
/**
 * 获取知识库输入
 */
async function getKnowledgeInput() {
    let file = knowledgeFileInput.files[0];
    if (file != null) {
        return file.text();
    }
    let content = knowledgeContentText.value;
    if (content == "") {
        knowledgeContentText.setCustomValidity("输入内容不能为空");
        knowledgeContentText.reportValidity();
        return;
    }
    return content;
}
/**
 * 分割文档
 * @param {string} content 
 */
function getSplitContent(content) {
    let knowledgeSplit = getRadioValue("knowledgeSplit");
    switch (knowledgeSplit) {
        case "no":
            {
                return [content];
            }
        case "line":
            {
                let splits = content.split("\n");
                let arr = [];
                for (let i = 0; i < splits.length; i++) {
                    let s = splits[i].trim();
                    if (s === "") {
                        continue;
                    }
                    arr.push(s);
                }
                return arr;
            }
        case "size":
            {
                if (knowledgeSplitSizeText.value == "") {
                    knowledgeSplitSizeText.setCustomValidity("分割长度不能为空");
                    knowledgeSplitSizeText.reportValidity();
                    return;
                }
                let splitSize = knowledgeSplitSizeText.valueAsNumber;
                let arr = [];
                for (let i = 0; i < content.length; i = i + splitSize) {
                    arr.push(content.slice(i, i + splitSize));
                }
                return arr;
            }
    }
}
/**
 * 设置提示语
 */
function doKnowledgeSetPrompt() {
    if (knowledgePromptText.value == "") {
        knowledgePromptText.setCustomValidity("提示语不能为空");
        knowledgePromptText.reportValidity();
        return;
    }
    knowledgePrompt = knowledgePromptText.value;
    return knowledgePrompt;
}
/**
 * 添加知识库
 */
async function doKnowledgeAdd() {
    if (doKnowledgeSetPrompt() == null) {
        return;
    }
    let model = knowledgeModelNameText.value;
    if (model == "") {
        knowledgeModelNameText.setCustomValidity("模型名称不能为空");
        knowledgeModelNameText.reportValidity();
        return;
    }
    let fullContent = await getKnowledgeInput();
    if (fullContent == null) {
        return;
    }
    let splitContents = getSplitContent(fullContent);
    if (splitContents == null) {
        return;
    }
    //全部向量化
    try {
        let response = await ollama.embed({ model, input: splitContents });
        console.log("模型[" + model + "]添加知识库成功", splitContents, response);
        let embeddings = response.embeddings;
        for (let i = 0; i < splitContents.length; i++) {
            let content = splitContents[i];
            let embedding = embeddings[i];
            knowledges.push({ model, content, embedding });
        }
        doListKnowages();
    } catch (ex) {
        console.error("模型[" + model + "]添加知识库异常", splitContents, ex);
        logger.error("模型[" + model + "]添加知识库异常", ex);
    }
}
/**
 * 列出知识库
 */
async function doListKnowages() {
    knowledgeListPanel.innerHTML = "";
    for (let i = 0; i < knowledges.length; i++) {
        let knowledge = knowledges[i];

        let { model, content, embedding } = knowledge;

        let trEle = document.createElement("tr");
        knowledgeListPanel.appendChild(trEle);
        //模型
        let tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let modelEle = document.createElement("span");
        modelEle.innerText = model;
        tdEle.appendChild(modelEle);
        //内容长度
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let cSizeEle = document.createElement("span");
        cSizeEle.innerText = content.length;
        tdEle.appendChild(cSizeEle);
        //向量长度
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let eSizeEle = document.createElement("span");
        eSizeEle.innerText = embedding.length;
        tdEle.appendChild(eSizeEle);
        //内容预览
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        let contentEle = document.createElement("span");
        if (content.length > 20) {
            contentEle.innerText = content.substring(0, 20) + "..";
        } else {
            contentEle.innerText = content;
        }
        tdEle.appendChild(contentEle);

        //操作
        tdEle = document.createElement("td");
        trEle.appendChild(tdEle);
        //删除
        let delBtnEle = document.createElement("button");
        delBtnEle.innerText = "删除";
        tdEle.appendChild(delBtnEle);
        delBtnEle.addEventListener("click", async () => {
            knowledges.splice(i, 1);
            doListKnowages();
        });
    }
}
/**
 * 清空知识库
 */
async function doKnowledgeClear() {
    knowledges = [];
    doListKnowages();
}
/**
 * 查找知识库内容
 * @param {string} content 
 * @return {Promise<string>}
 */
async function getKnowledgeContent(content) {
    if (knowledgePrompt == null) {
        knowledgePromptText.setCustomValidity("提示语句不能为空");
        knowledgePromptText.reportValidity();
        return;
    }
    let knowledgeMode = chatKnowledgeModeNameText.value;
    if (knowledgeMode == "") {
        chatKnowledgeModeNameText.setCustomValidity("知识库名称不能为空");
        chatKnowledgeModeNameText.reportValidity();
        return;
    }
    /**查询文档列表 */
    let queryKnowledges = [];
    for (let doc of knowledges) {
        if (doc.model === knowledgeMode) {
            queryKnowledges.push(doc);
            continue;
        }
    }
    if (queryKnowledges.length == 0) {
        logger.warn("没有模型[" + knowledgeMode + "]的知识库");
        return;
    }
    try {
        let response = await ollama.embed({ model: knowledgeMode, input: content });
        console.log("模型[" + knowledgeMode + "]向量化成功", response);
        let embedding = response.embeddings[0];
        //计算距离
        for (let i = 0; i < queryKnowledges.length; i++) {
            let knowledge = queryKnowledges[i];
            knowledge.distance = calcDistance(embedding, knowledge.embedding);
            queryKnowledges[i] = knowledge;
        }
        queryKnowledges.sort((a, b) => {
            if (a.distance === b.distance) {
                return 0;
            }
            return a.distance > b.distance ? -1 : 1;
        });
        // console.log(queryKnowledges);
        let knowledgeContent = queryKnowledges.slice(0, 5).map(item => item.content).join("\n");
        return knowledgePrompt.replace("${knowledge}", knowledgeContent);
    } catch (ex) {
        console.error("模型[" + knowledgeMode + "]向量化异常", ex);
        logger.error("模型[" + knowledgeMode + "]向量化异常", ex);
    }
}
/**
 * 发送聊天
 */
async function doChatSend() {
    let modelName = chatModelNameText.value;
    if (modelName == "") {
        chatModelNameText.setCustomValidity("模型名称不能为空");
        chatModelNameText.reportValidity();
        return;
    }
    let content = chatContentText.value;
    let file = chatFileInput.files[0];
    let image;
    if (file != null) {
        image = await readFileBase64(file);
    }
    /**提示内容 */
    let knowledgeContent = null;

    if (chatKnowledgeCheck.checked) {
        knowledgeContent = await getKnowledgeContent(content);
        // console.log(knowledgeContent);
        if (knowledgeContent == null) {
            return;
        }
    }
    //生成模式
    if (chatGenerateCheck.checked) {
        await sendGenerateMessage(modelName, content, image, knowledgeContent);
        return;
    }
    await sendChatMessage(modelName, content, image, knowledgeContent);
}
/**
 * 发送生成消息
 * @param {string} model 模型名称
 * @param {string} content 内容
 * @param {string?} image 图片 
 * @param {string?} knowledgeContent 知识库内容
 */
async function sendGenerateMessage(model, content, image, knowledgeContent) {
    /** @type {import("ollama").GenerateRequest} */
    let message = { stream: true, model, prompt: content };
    if (image != null) {
        message.images = [image];
    }
    if (knowledgeContent != null) {
        message.system = knowledgeContent;
    }

    chatPanel.sendMyMessage({ content, at: model, image });
    let chatMessage = chatPanel.sendMessage({ name: model });
    try {
        console.log("请求消息", message);
        let responses = await ollama.generate(message);
        let respMessage = await chatMessage.startGenResponses(responses);
        console.log("响应消息", respMessage);
    } catch (ex) {
        console.error("模型[" + model + "]聊天生成异常", content, ex);
        logger.error("模型[" + model + "]聊天生成异常", ex);
        chatMessage.stopError(ex);
    }
}
/**
 * 发送聊天消息
 * @param {string} model 模型名称
 * @param {string} content 内容
 * @param {string?} image 图片
 * @param {string?} knowledgeContent 知识库内容
 */
async function sendChatMessage(model, content, image, knowledgeContent) {
    let messages = historyMessages.concat();
    /** @type {import("ollama").Message} */
    let knowledgeMessage = null;
    if (knowledgeContent != null) {
        knowledgeMessage = { role: "system", content: knowledgeContent };
        messages = messages.concat(knowledgeMessage);
    }
    /** @type {import("ollama").Message} */
    let reqMessage = { role: "user", content };
    if (image != null) {
        reqMessage.images = [image];
    }
    messages = messages.concat(reqMessage);

    chatPanel.sendMyMessage({ content, at: model, image });
    let chatMessage = chatPanel.sendMessage({ name: model });
    try {
        console.log("请求消息", messages);
        let responses = await ollama.chat({ model, stream: true, messages });
        let respMessage = await chatMessage.startResponses(responses);
        console.log("响应消息", respMessage);

        if (knowledgeMessage != null) {
            historyMessages = historyMessages.concat(knowledgeMessage);
        }
        historyMessages = historyMessages.concat(reqMessage, respMessage);
    } catch (ex) {
        console.error("模型[" + model + "]聊天异常", content, ex);
        logger.error("模型[" + model + "]聊天异常", ex);
        chatMessage.stopError(ex);
    }
}
/**
 * 清空聊天
 */
async function doChatClear() {
    chatViewPanel.innerHTML = "";
    historyMessages = [];
}
/**
 * 终止全部请求
 */
async function doAbortAll() {
    logger.info("终止全部请求");
    ollama.abort();
}
/**
 * 进行初始化
 */
async function init() {
    console.log("初始化");
    logger.info("初始化");
    knowledgePromptText.value = knowledgePrompt;
    doListModel();
}

init();

setUrlBtn.addEventListener("click", doSetUrl);
abortAllBtn.addEventListener("click", doAbortAll);
downModelBtn.addEventListener("click", doDownModel);
modelListBtn.addEventListener("click", doListModel);
showModelBtn.addEventListener("click", doShowModel);
embedDistanceBtn.addEventListener("click", doEmbedDistanc);
chatSendBtn.addEventListener("click", doChatSend);
chatClearBtn.addEventListener("click", doChatClear);
chatFileClearBtn.addEventListener("click", () => {
    chatFileInput.value = null;
});
knowledgeFileClearBtn.addEventListener("click", () => {
    knowledgeFileInput.value = null;
});
knowledgeAddBtn.addEventListener("click", doKnowledgeAdd);
knowledgeClearBtn.addEventListener("click", doKnowledgeClear);
knowledgeSetPromptBtn.addEventListener("click", doKnowledgeSetPrompt);
