const loginButton = document.getElementById('loginButton')
const loginEmailField = document.getElementById('loginEmail')
const loginPasswordField = document.getElementById('loginPassword')

loginPasswordField.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        loginButton.click()
    }
})

loginButton.addEventListener('click', () => {
    let email = loginEmailField.value
    let password = loginPasswordField.value

    loginEmailField.value = ""
    loginPasswordField.value = ""

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Error ${errorCode}\n\n${errorMessage}`)
    });
})

// redirect on login
firebase.auth().onAuthStateChanged(user => {

    if (user) {     //if a user is logged in
        window.location = "index.html"  //redirects to index.html
    }
})