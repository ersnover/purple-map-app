const regButton = document.getElementById('regButton')
const emailField = document.getElementById('regEmail')
const passwordField = document.getElementById('regPassword')
const confirmPasswordField = document.getElementById('regPassword2')

let usersRef = db.collection('users')

confirmPasswordField.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        regButton.click()
    }
})

regButton.addEventListener('click', () => {
    let email = emailField.value
    let password = passwordField.value
    let confirmPassword = confirmPasswordField.value

    if (email == "") {
        return
    } else if (password !== confirmPassword) {
        alert("Double check that, your passwords don't match!")
        return
    } else {
        registerUser(email, password)
        emailField.value = ""
        passwordField.value = ""
        confirmPasswordField.value = ""
    }
})

function registerUser(email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Error ${errorCode}\n\n${errorMessage}`)
      });

      window.open("index.html")
}
