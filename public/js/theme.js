document.addEventListener("DOMContentLoaded", () => {
    if ((localStorage.getItem("theme") === null) || (localStorage.getItem("theme") === "auto")) {
        localStorage.setItem("theme", "auto");
        imgIco.src = urlAuto;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            link.href = "./css/escuro.css"
        } else {
            link.href = "./css/claro.css"
        }
    } else {
        if (localStorage.getItem("theme") === "dark") {
            imgIco.src = urlLua;
            link.href = "./css/escuro.css"
        } else {
            imgIco.src = urlSol;
            link.href = "./css/claro.css"
        }
    }
})
const urlSol = "./img/light.png"
const urlLua = "./img/dark.png"
const urlAuto = "./img/auto.png"
const btnTheme = document.getElementById("btn-theme");
const imgIco = document.getElementById("img-ico");
const link = document.querySelector("link")

btnTheme.addEventListener("click", () => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "auto") {
        localStorage.setItem("theme", "dark");
        imgIco.src = urlLua;
        link.href = "./css/escuro.css"
    } else if (currentTheme === "dark") {
        localStorage.setItem("theme", "light");
        imgIco.src = urlSol;
        link.href = "./css/claro.css"
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        localStorage.setItem("theme", "auto");
        imgIco.src = urlAuto;
        if (prefersDark) {
            link.href = "./css/escuro.css"
        } else {
            link.href = "./css/claro.css"
        }
    }
})