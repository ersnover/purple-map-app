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

firebase.auth().onAuthStateChanged(user => {        //KEEP ON THIS PAGE - variable names will be used lower in script
    
    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        displayName = "Eric Snover"
        photoURL = "./images/profilePic.jpg"

        const usersCollectionRef = db.collection('users')
        const userRef = usersCollectionRef.doc(uid)

        populateUserPage(displayName, email, photoURL, uid)

    } else {
        window.location = "login.html"
    }
})



// BUILD DEFAULT CRITERIA DIV

const defaultContainer = document.getElementById('defaultCriteriaList')

let criterias = Object.keys(criteriaStats)
criterias.forEach(key => {
    let criteria = criteriaStats[key]
    let criteriaDiv = `<div class="defaultCriteriaDiv" id="${criteria.googleidname}DefaultDiv">
                            <input type="checkbox" id="${criteria.googleidname}DefaultCheckbox" class="defaultCriteriaCheckbox" data-selectorid="${criteria.googleidname}DefaultSelect" data-criteriatype="${criteria.googleidname}">
                            <span class="defaultCriteriaSpan">${criteria.placeDisplayName}</span>
                            <select id="${criteria.googleidname}DefaultSelect" class="defaultImportanceSelect" style="display: none">
                                <option value="${highImp}">${highImp}</option>
                                <option value="${medImp}">${medImp}</option>
                                <option value="${lowImp}">${lowImp}</option>
                            </select>
                        </div>`
    defaultContainer.insertAdjacentHTML('beforeend',criteriaDiv)
})


// SAVE DEFAULT SEARCH CRITERIA TO DATABASE
const defaultCriteriaCheckboxes = document.querySelectorAll('.defaultCriteriaCheckbox')
const updateDefaultsButton = document.getElementById('updateDefaultsButton')

defaultCriteriaCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateDefaultsButton.innerHTML = "Update Defaults"
        updateDefaultsButton.disabled = false       // enables update button once new criteria have been selected
        displaySelector(event.target)
    })
})

function displaySelector(checkbox) {
    let selectorId = checkbox.dataset.selectorid
    let selector = document.getElementById(selectorId)
    
    if (checkbox.checked) {
        selector.style.display = "inline-block"
    } else {
        selector.style.display = "none"
    }
}

//GO FUNCTION
updateDefaultsButton.addEventListener('click', () => {
    firebase.auth().onAuthStateChanged(user => {
        uid = user.uid
        let userRef = db.collection('users').doc(uid)
        updateDefaultSearchCriteria(userRef)
    })
})

function updateDefaultSearchCriteria(userRef) {

    let defaultCriteriaInputObjs = []

    defaultCriteriaCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            let criteriaType = checkbox.dataset.criteriatype

            let selectorId = checkbox.dataset.selectorid
            let selector = document.getElementById(selectorId)
            let criteriaImportance = selector.value

            let obj = {
                type: criteriaType,
                importance: criteriaImportance
            }
            defaultCriteriaInputObjs.push(obj)
        }
    })

    return userRef.update({
        defaultSearchCriteria: defaultCriteriaInputObjs
    }).then(() => {
        updateDefaultsButton.innerHTML = "Updated!"
        updateDefaultsButton.disabled = true        // disables update button until new criteria are selected
    })
}
// end default search criteria saving

// SAVED SEARCHES

