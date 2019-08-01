let usersCollectionRef = db.collection('users')
let userRef = ""
let activeUserId = ""

firebase.auth().onAuthStateChanged(user => {        //KEEP ON THIS PAGE - variable names will be used lower in script

    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
//Might bring this back after we figure out the registration page. TBD.
        // usersCollectionRef.doc(uid).get()     
        // .then(snapshot => {
        //     if (!snapshot.exists) {     //checks whether user is already saved in database
        //         usersCollectionRef.doc(uid).set({
        //             email: email,
        //             uid: uid
        //         })
        //     }
        // })
        usernameSpan.innerHTML = email

        activeUserId = uid

        userRef = usersCollectionRef.doc(uid)
    }    
})

// BUILD CRITERIA DIVS

// Get each place type category and populate them onto the search criteria page
const searchCriteriaDiv = document.getElementById('search-criteria-div')

placeTypes = Object.keys(criteriaStats)

placeTypes.map((type, index) => {
    
    const googleId = criteriaStats[type].googleidname
    const placeDisplayName =criteriaStats[type].placeDisplayName

    const markup = `
    
    <label for="place-type-${index}" data-place = "${googleId}" id="${googleId}" class="place-type">${placeDisplayName}</label>
    <input type="checkbox" name="place-type-${index}" id="place-type-${index}" class="place-type-checkbox"  data-selectid="select-${index}"> 
    <select  id="select-${index}" class="importance-selector">
        <option value="${highImp}">${highImp}</option>
        <option value="${medImp}">${medImp}</option>
        <option value="${lowImp}">${lowImp}</option>
    </select> <br>
    `

    searchCriteriaDiv.insertAdjacentHTML('beforeend', markup)
})      

// Show importance selector only if place type is checked
let allPlaceTypeCheckboxes = document.querySelectorAll('.place-type-checkbox')

allPlaceTypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        showPlaceTypeImportanceSelector(this)
    })
})

function showPlaceTypeImportanceSelector(checkbox) {
    let selectId = checkbox.dataset.selectid
    let select = document.getElementById(selectId)
    
    if (checkbox.checked) {
        select.style.display = 'inline-block'
    } else {
        select.style.display = 'none'
    }
}

// When user hits see results button they will be directed to their report based on the queries from the criteria objects

const seeResultsButton = document.getElementById('see-results-btn')
seeResultsButton.addEventListener('click', () => {
    getCriteriaObjs()
})

function getCriteriaObjs() {
    const criteriaInputObjs = []
    allPlaceTypeCheckboxes.forEach(box => {
        if(box.checked) {
            let placeType = box.previousElementSibling.id
            let selectId = box.dataset.selectid
            let placeTypeImportance = document.getElementById(selectId).value

            let obj = {
                placeType: placeType,
                placeTypeImportance: placeTypeImportance
            }

            criteriaInputObjs.push(obj)
        }
    })
    console.log(criteriaInputObjs)
    return criteriaInputObjs
}

// END BUILD CRITERIA DIVS
