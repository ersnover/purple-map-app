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
        const searchesRef = userRef.collection('searches')
        
        userRef.get().then(function(obj) {
            let userProfile = obj.data()
            populateUserPage(userProfile)
        })

        searchesRef.get().then(function(searchesSnapshot) {
            grabSavedSearches(searchesSnapshot)
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

    <input type="checkbox" name="${googleId}Checkbox" id="${googleId}Checkbox" class="place-type-checkbox defaultCriteriaCheckbox"  data-selectid="${googleId}"> 

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

// check for default criteria in database
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(function(obj) {
            let userProfile = obj.data()
            if (userProfile.defaultSearchCriteria != null) {
                populateCriteriaFromDefaults(userProfile.defaultSearchCriteria)
            }
        })
    }
})

function populateCriteriaFromDefaults(defaultCriteriaObjs) {
    defaultCriteriaObjs.forEach(critObj => {
        let criteriaType = critObj.type
        let criteriaImportance = critObj.importance

        let checkbox = document.getElementById(`${criteriaType}Checkbox`)
        let select = document.getElementById(checkbox.dataset.selectid)

        checkbox.setAttribute('checked', 'true')
        select.value = criteriaImportance
        select.style.display = 'inline-block'
    })
}

function displaySelector(checkbox) {
    let selectorId = checkbox.dataset.selectid
    let selector = document.getElementById(selectorId)
    
    if (checkbox.checked) {
        selector.style.display = "inline-block"
    } else {
        selector.style.display = "none"
    }
}

//GO FUNCTION
updateDefaultsButton.addEventListener('click', () => {
    firebase.auth().onAuthStateChanged(function(user) {
        uid = user.uid
        let userRef = db.collection('users').doc(uid)
        updateDefaultSearchCriteria(userRef)
    })
})

function updateDefaultSearchCriteria(userRef) {

    let defaultCriteriaInputObjs = []

    defaultCriteriaCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            let criteriaType = checkbox.dataset.selectid

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

function grabSavedSearches(searchesSnapshot) {
    const searchesContainer = document.getElementById('savedSearchesDiv')
    let searchDivs = []

    searchesSnapshot.docs.forEach(search => {
       let searchObj = search.data()
       let div = buildFavSearchDiv(searchObj, search.id)
       searchDivs.push(div)
    })

    searchesContainer.innerHTML = searchDivs.join('')
}

function buildFavSearchDiv(searchObj, id) {
    let address = searchObj.address
    let score = searchObj.score
    let scoreColor = findScoreColor(score)
    let criteriaSpans = buildCriteriaSpans(searchObj.criteriaArray)

    let div = `<div id="${id}" class="savedSearchDiv">
                    <span class="savedSearchScore" style="color: ${scoreColor}">${score}</span>
                    <div class="savedSearchTextDiv">
                        <button class="addressText" onclick="pullScorePage(this)">${address}</button>
                        <div class="savedSearchCriteriaDiv">
                            ${criteriaSpans}
                        </div>
                    </div>
                    <button class="searchFavoriteButton"><i class="fas fa-heart"></i></button>
                </div>`

    return div
}

function buildCriteriaSpans(array) {
    let criteriaSpans = []
    array.forEach(criteria => {
        let color = findScoreColor(criteria.score)
        let displayName = criteriaStats[criteria.type].placeDisplayName
        let span = `<span class="savedSearchCriteriaSpan" style="color: ${color}">${displayName}</span>`
        criteriaSpans.push(span)
    })

    return criteriaSpans.join('')
}

function findScoreColor(score) {
    if (score < 50) {
        let decimal = Math.round(5.1 * score)
        let hex = decimal.toString(16)
        if (hex.length == 1) {
            hex = "0" + hex
        }
        return `#FF${hex}00`
    } else if (score >= 50) {
        let decimal = Math.round(5.1 * (100 - score))
        let hex = decimal.toString(16)
        if (hex.length == 1) {
            hex = "0" + hex
        }
        return `#${hex}FF00`
    }
}