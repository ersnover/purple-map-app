let usersRef = db.collection('users')
var activeUserId = ""

firebase.auth().onAuthStateChanged(user => {

    if (user) {
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        usersRef.doc(uid).get()
        .then(snapshot => {
            if (!snapshot.exists) {
                console.log("new user")
                usersRef.doc(uid).set({
                    email: email,
                    uid: uid
                })
            }
        })

        activeUserId = uid
    }    
})