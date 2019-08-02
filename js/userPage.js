var usersCollectionRef = db.collection('users')

firebase.auth().onAuthStateChanged(user => {        //KEEP ON THIS PAGE - variable names will be used lower in script
    

    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        var userRef = usersCollectionRef.doc(uid)
        displayName = "Eric Snover"
        photoURL = "./images/profilePic.jpg"

        populateUserPage(displayName, email, photoURL, uid)

    } else {
        window.location = "login.html"
    }
})

// ADD USER INFO

const profilePic = document.getElementById("profileImg")
const fullNameSpan = document.getElementById("userFullNameSpan")
const emailSpan = document.getElementById("userEmailSpan")

const defaultSearchPrefsContainer = document.getElementById('defaultCriteriaList')
const savedSearchesDiv = document.getElementById('savedSearchesDiv')

function populateUserPage(displayName, email, photoURL, uid) {
    profilePic.setAttribute('src', photoURL)
    fullNameSpan.innerHTML = displayName
    emailSpan.innerHTML = email
}

// BUILD DEFAULT CRITERIA DIV

const defaultContainer = document.getElementById('defaultCriteriaList')

let criterias = Object.keys(criteriaStats)
criterias.forEach(key => {
    let criteria = criteriaStats[key]
    let criteriaDiv = `<div class="defaultCriteriaDiv" id="${criteria.googleidname}DefaultDiv">
                            <span class="defaultCriteriaSpan">${criteria.placeDisplayName}</span>
                            <select id="${criteria.googleidname}DefaultSelect" class="importance-slider">
                                <option value="${highImp}">${highImp}</option>
                                <option value="${medImp}">${medImp}</option>
                                <option value="${lowImp}">${lowImp}</option>
                            </select>
                        </div>`
    defaultContainer.insertAdjacentHTML('beforeend',criteriaDiv)
})
