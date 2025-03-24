/**
 * 标签头容器
 * @type {HTMLElement}
 */
let tabsPanel = document.getElementById("tabsPanel");

/**
 * 显示标签
 * @param {number} index 
 */
export function showTab(index) {
    /**
    * 标签内容容器
    */
    let tabContentEles = document.querySelectorAll(".tabContent");
    for (let i = 0; i < tabContentEles.length; i++) {
        let tabContentEle = tabContentEles[i];
        
        let tabItemEle = tabsPanel.children[i];

        if (i !== index) {
            tabItemEle.classList.remove("ativite");
            tabContentEle.classList.remove("ativite");
            continue;
        }
        tabItemEle.classList.add("ativite");
        tabContentEle.classList.add("ativite");
    }
}
/**
 * 显示标签
 * @param {string} title 
 */
export function showTabByTitle(title) {
    let tabTitleEles = document.querySelectorAll(".tabContent>h2");
    let index = Array.from(tabTitleEles).findIndex(ele => ele.innerText == title);
    showTab(index);
}

/**
 * 初始化
 */
function init() {
    /**
     * 标签内容容器
     */
    let tabContentEles = document.querySelectorAll(".tabContent");

    for (let i = 0; i < tabContentEles.length; i++) {
        let tabContentEle = tabContentEles[i];

        let titleEle = tabContentEle.querySelector("h2");

        let tabItemEle = document.createElement("div");
        tabItemEle.innerText = titleEle.innerText;
        tabsPanel.appendChild(tabItemEle);

        tabItemEle.addEventListener("click", () => {
            showTab(i);
        });
    }
}


init();
showTab(0);