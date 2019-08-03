const regButton = document.getElementById('regButton')
const emailField = document.getElementById('regEmail')
const firstNameField = document.getElementById('regFirstName')
const lastNameField = document.getElementById('regLastName')
const passwordField = document.getElementById('regPassword')
const confirmPasswordField = document.getElementById('regPassword2')

confirmPasswordField.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
        regButton.click()
    }
})

regButton.addEventListener('click', (event) => {
    let email = emailField.value
    let password = passwordField.value
    let confirmPassword = confirmPasswordField.value
    let firstName = firstNameField.value
    let lastName = lastNameField.value


    if (password !== confirmPassword) {
        alert("Double check that, your passwords don't match!")
        event.preventDefault()
        return
    } else {
        registerUser(email, password, firstName, lastName)
    }
})

function registerUser(email, password, first, last) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .catch(error => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(`Error ${errorCode}\n\n${errorMessage}`)
      }).then(function() {
        firebase.auth().onAuthStateChanged(function(user) {
            let usersCollectionRef = db.collection('users')
            usersCollectionRef.doc(user.uid).set({
                firstName: first,
                lastName: last,
                email: email,
                uid: user.uid,
                profileURL: "./images/profilePic.jpg",
                defaultSearchCriteria: []
            }).then(function() {
                window.location = "index.html"
            })
        })
    })
}
