const loginButton = document.getElementById('loginButton')
const loginEmailField = document.getElementById('loginEmail')
const loginPasswordField = document.getElementById('loginPassword')

const usernameSpan = document.getElementById('userSpan')

loginPasswordField.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        loginButton.click()
    }
})

//login button
loginButton.addEventListener('click', () => {
    let email = loginEmailField.value
    let password = loginPasswordField.value

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Error ${errorCode}\n\n${errorMessage}`)
    });

    firebase.auth().onAuthStateChanged(user => {    //triggers when user state changes, clears fields and hides modal
        if (user) {
            loginEmailField.value = ""
            loginPasswordField.value = ""
            modal.style.display = "none"
        }
    })
})


//MODAL

let modal = document.getElementById("loginModal")
let userBtn = document.getElementById("userButton")
let closeBtn = document.getElementsByClassName("close")[0];



userBtn.onclick = function(){
    modal.style.display = "block";
}
closeBtn.onclick = function(){
    modal.style.display = "none";
}
window.onclick = function(event){
    if(event.target == modal){
        modal.style.display ="none";
    }
}


// SIGN OUT

const signOutButton = document.getElementById("signOutButton")
signOutButton.addEventListener('click', () => {

    firebase.auth().signOut()

    firebase.auth().onAuthStateChanged(user => {
        if (!user) {                            //sign out clears username span and brings up modal
            usernameSpan.innerHTML = ""
            modal.style.display = "block";
        }
    })
})