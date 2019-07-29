const loginButton = document.getElementById('loginButton')
const loginEmailField = document.getElementById('loginEmail')
const loginPasswordField = document.getElementById('loginPassword')

loginButton.addEventListener('click', () => {
    email = loginEmailField.value
    password = loginPasswordField.value

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Error ${errorCode}\n\n${errorMessage}`)
    });
    window.open("index.html")
})