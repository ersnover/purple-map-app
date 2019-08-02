let navBtn = document.getElementById("expand-nav")
let navItems = document.getElementsByClassName("nav-items")[0]

navBtn.addEventListener("click", expandNav)

function expandNav(){
    navItems.classList.toggle("nav-items-expand")
    navItems.scrollIntoView({behavior: "smooth", block:"end"})
}