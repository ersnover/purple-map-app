//USER PROFILE NAV

const userNameButton = document.getElementById('userSpan')
userNameButton.addEventListener('click', () => {
    window.location = "userPage.html"
})

const signOutButton = document.getElementById("signOutButton")
signOutButton.addEventListener('click', () => {

    firebase.auth().signOut()

    firebase.auth().onAuthStateChanged(user => {
        if (!user) {                            //sign out clears username span and brings up modal
            usernameSpan.innerHTML = ""
            signOutButton.remove()
        }
    })
})