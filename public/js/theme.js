document.addEventListener("DOMContentLoaded", ()=>{
            if((localStorage.getItem("theme") === null) || (localStorage.getItem("theme") === "auto")){
            localStorage.setItem("theme", "auto");
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if(prefersDark){
                    link.href = "./css/escuro.css"
                } else {
                    link.href = "./css/claro.css"
                }
        }})
        const urlSol = "https://png.pngtree.com/png-clipart/20190903/original/pngtree-flat-sun-icon-download-png-image_4440284.jpg"
        const urlLua = "https://media.istockphoto.com/id/1310981865/pt/vetorial/moon-and-star-yellow-icon-of-moon-for-night-pictogram-of-crescent-and-star-logo-for-sleep.jpg?s=2048x2048&w=is&k=20&c=6nyEly5IyVYEQyFz5NtJpUk53edJ3xF5351MDqhZJ88="
        const urlAuto = "https://cdn-icons-png.flaticon.com/512/10043/10043875.png"
        const btnTheme = document.getElementById("btn-theme");
        const imgIco = document.getElementById("img-ico");
        const link = document.querySelector("link")

        btnTheme.addEventListener("click", ()=>{
            const currentTheme = localStorage.getItem("theme");
            if(currentTheme === "auto"){
                localStorage.setItem("theme", "dark");
                imgIco.src = urlLua;
                link.href = "./css/escuro.css"
            }else if(currentTheme === "dark"){
                localStorage.setItem("theme", "light");
                imgIco.src = urlSol;
                link.href = "./css/claro.css"
            } else {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                localStorage.setItem("theme", "auto");
                imgIco.src = urlAuto;
                if(prefersDark){
                    link.href = "./css/escuro.css"
                } else {
                    link.href = "./css/claro.css"
                }
            }
        })