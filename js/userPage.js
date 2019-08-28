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

let searchCriteriaArray =[]
let count = 1
let mainHeader = document.getElementById('defaultHeader')
let mainHeaderHeight = mainHeader.clientHeight

placeTypes.forEach(function(placeType) {
    const googleId = criteriaStats[placeType].googleidname
    const placeDisplayName = criteriaStats[placeType].placeDisplayName

    let divDimension = mainHeaderHeight * 1.35

    let div =`<!-- <div id="search-criteria-element-${count}"  class="search-criteria-element" style="height:${divDimension}; width:200px"> -->
        <div id="search-criteria-element-${count}"  class="search-criteria-element">
            <label for="${googleId}Selection">${placeDisplayName}</label>
            <select  id="${googleId}" class="importance-selector">
                <option class="not-important" value="">&#160&#160&#160&#160--&#160 Select &#160--&#160</option>
                <option value="${googleId}&${highImp}">&#160&#160${highImp}</option>
                <option value="${googleId}&${medImp}">&#160&#160&#160&#160&#160&#160&#160${medImp}</option>
                <option value="${googleId}&${lowImp}">${lowImp}</option>
            </select>
        </div>`

    searchCriteriaArray.push(div)
    count += 1
})

defaultContainer.innerHTML = searchCriteriaArray.join('')


// SAVE DEFAULT SEARCH CRITERIA TO DATABASE
const allSelections = document.querySelectorAll('.importance-selector')
const updateDefaultsButton = document.getElementById('updateDefaultsButton')

allSelections.forEach(selection => {
    selection.addEventListener('change', () => {
        updateDefaultsButton.innerHTML = "Update Defaults"
        updateDefaultsButton.disabled = false       // enables update button once new criteria have been selected
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

        let select = document.getElementById(criteriaType)

        select.value = `${criteriaType}&${criteriaImportance}`
        select.style.color = 'black'
    })
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

    allSelections.forEach(selection => {
        if (selection.value) {
            let selectionString = selection.value
            let ampersandIndex = (selectionString).indexOf('&')
            let placeType = (selectionString).substring(0,ampersandIndex)
            let placeTypeImportance = (selectionString).substring(ampersandIndex + 1, selectionString.length)

            let obj = {
                type: placeType,
                importance: placeTypeImportance
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

var base = document.querySelector('#defaultCriteriaList');
var selector = '.importance-selector';

base.addEventListener('change', function(event) {
  var closest = event.target.closest(selector);
  if (closest && base.contains(closest)) {
    if (event.target.value == '') {
        event.target.style.color = 'grey'
    } else {
        event.target.style.color = 'black'
    }
  }
});



// SAVED SEARCHES

function grabSavedSearches(searchesSnapshot) {
    const searchesContainer = document.getElementById('savedSearchesDiv')
    let searchDivs = []

    searchesSnapshot.docs.forEach(search => {
        if (search.id == 'currentSearch') {
        } else {
            let searchObj = search.data()
            let div = buildFavSearchDiv(searchObj, search.id)
            searchDivs.push(div)
        }
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
                    <button class="searchFavoriteButton" onclick="unfavoriteSearch(this)"><i class="fas fa-heart"></i></button>
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

// returns hex code based on number 1-100
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

// opens detailed score page for address
function pullScorePage(button) {
    let searchId = button.parentElement.parentElement.id
    firebase.auth().onAuthStateChanged(function(user) {
        let searchesCollectionRef = db.collection('users').doc(user.uid).collection('searches')
        let searchRef = searchesCollectionRef.doc(searchId)

        searchRef.get().then(function(obj) {
            let searchObj = obj.data()
            searchesCollectionRef.doc('currentSearch').set(searchObj).then(function() {
                window.location = "score.html"
            })
        })
    })
}

//removes search from saved list
function unfavoriteSearch() {
    let unfavButton = event.target.parentElement
    let searchId = unfavButton.parentElement.id
    firebase.auth().onAuthStateChanged(function(user) {
        let userRef = db.collection('users').doc(user.uid)
        userRef.collection('searches').doc(searchId).delete()
    })
    document.getElementById(searchId).style.display = "none"
}