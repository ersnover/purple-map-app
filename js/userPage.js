// ADD USER INFO

const profilePic = document.getElementById("profileImg")
const fullNameSpan = document.getElementById("userFullNameSpan")
const emailSpan = document.getElementById("userEmailSpan")

const defaultSearchPrefsContainer = document.getElementById('defaultCriteriaList')
const savedSearchesDiv = document.getElementById('savedSearchesDiv')

function populateUserPage(userObj) {
    profilePic.setAttribute('src', userObj.profileURL)
    fullNameSpan.innerHTML = userObj.firstName + " " + userObj.lastName
    emailSpan.innerHTML = userObj.email
}

firebase.auth().onAuthStateChanged(function(user) {        //KEEP ON THIS PAGE - variable names will be used lower in script
    
    if (user) {     //if a user is logged in

        const usersCollectionRef = db.collection('users')
        const userRef = usersCollectionRef.doc(user.uid)
        
        userRef.get().then(function(obj) {
            let userProfile = obj.data()
            populateUserPage(userProfile)
        })

    } else {
        window.location = "login.html"
    }
})



// BUILD DEFAULT CRITERIA DIV

const defaultContainer = document.getElementById('defaultCriteriaList')

placeTypes = Object.keys(criteriaStats)

placeTypes.map((type) => {
    
    const googleId = criteriaStats[type].googleidname
    const placeDisplayName =criteriaStats[type].placeDisplayName

    const criteriaDiv = `
    
    <li>
    <label for="${googleId}Checkbox" class="place-type container">
    
    ${placeDisplayName}

    <input type="checkbox" name="${googleId}Checkbox" id="${googleId}Checkbox" class="place-type-checkbox defaultCriteriaCheckbox"  data-selectorid="${googleId}"> 

    <span class="checkmark"></span>

    </label>

    <select  id="${googleId}" class="importance-selector">
        <option value="${highImp}">${highImp}</option>
        <option value="${medImp}">${medImp}</option>
        <option value="${lowImp}">${lowImp}</option>
    </select>
    </li>
    `

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
            let criteriaType = checkbox.dataset.selectorid

            let selector = document.getElementById(criteriaType)
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

