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

//test data
class CriteriaType {
    constructor(type, importance) {
        this.type = type
        this.importance = importance
    }
}

// should we only create these object if the type is checked?
const typeObj1 = new CriteriaType('park', 'important')
const typeObj2 = new CriteriaType('cafe', 'important')
const typeObj3 = new CriteriaType('bus_station', 'important;')
let criteriaArray = [typeObj1, typeObj2, typeObj3]
//end test data


let addressInput = document.getElementById("addressInput")
let addressIntakeBtn = document.getElementById("addressIntakeBtn")
let addressRegEx = /^\d+\s[A-z]+\s[A-z]+/
let text = document.getElementById("text")


let autocomplete = new google.maps.places.Autocomplete(addressInput)
autocomplete.setFields(['address_components', 'place_id', 'name'])

addressIntakeBtn.addEventListener("click", validateAddress)

addressInput.addEventListener("keypress", event=>{
    if(event.keyCode == 13){
        validateAddress()
    }
})

let addressDiv = document.getElementById("addressIntakeDiv")
let addressDivParent = addressDiv.parentNode
let preferencesDiv = document.getElementById("search-criteria-div")
function replaceDiv(){
    preferencesDiv.style.display = "flex"
    addressDivParent.replaceChild(preferencesDiv, addressDiv)
}


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
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
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

const criteriaObjs = []

function getCriteriaObjs() {
    allPlaceTypeCheckboxes.forEach(box => {
        if(box.checked) {
            let placeType = box.previousElementSibling.id
            let selectId = box.dataset.selectid
            let placeTypeImportance = document.getElementById(selectId).value

            let obj = {
                placeType: placeType,
                placeTypeImportance: placeTypeImportance
            }

            criteriaObjs.push(obj)
        }
    })
    console.log(criteriaObjs)
    return criteriaObjs
}



//api calls
function getLatLng(address) {
    let geocoder = new google.maps.Geocoder()
    return new Promise(function(resolve, reject) {
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                resolve(results)
            } else {
                reject(status)
            }
        })
    })

}

async function fetchPlaces(latlng, criteriaType) {
    let response = await fetch(`${config.proxy}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latlng}&radius=1500&type=${criteriaType}&keyword=&key=${config.apiKey}`)
    return await response.json()
}

class CriteriaOutput {
    constructor(type, importance, placeIds) {
        this.type = type
        this.importance = importance
        this.placeIds = placeIds
    }
}



async function countPlaces(address, criteriaArray) {
    let latlng = await getLatLng(address)
    .then(function(results) {
        let latitude = results[0].geometry.location.lat()
        let longitude = results[0].geometry.location.lng()
        return `${latitude},${longitude}`
    })
    .catch(function(status) {
        //insert alert(status) here
    })

    //do i need to make the internal functions here async/await?
    criteriaArray.forEach(function(obj) {
        let criteriaType = obj['type']
        fetchPlaces(latlng, criteriaType).then(function(json) {
            console.log(json) //replace with actual code
        })
        //push to db
    })
}
//end api calls


function validateAddress(){
    let address = addressInput.value
    if(addressRegEx.test(address) == false){
        text.innerHTML = "Enter a valid address."
    }else{
        text.innerHTML =''
        getPlaces(address, criteriaArray) //actually move this to submit and pull address and criteria from firebase
        userRef.collection("addresses").add({
            address: address
        })
        replaceDiv()
    }
}

// // algorithm calculations (will need var names adjusted based on input)
// let address = "1200 richmond"
// let criteriaOutputObjs = [
//     {
//       criteriaType: 'restaurant',
//       criteriaImportance: 'high',
//       placeIds: [1,2,3,4,5,5,6,7,9]          please for the love of god don't delete this
//     },
//     {
//       criteriaType: 'park',
//       criteriaImportance: 'med',
//       placeIds: [1,2,3]
//     },
//     {
//       criteriaType: 'bar',
//       criteriaImportance: 'low',
//       placeIds: [1,4,5,5,6,7,9]
//     }
//   ]

function calcScoreScale(criteriaOutputObjs) {
    let highPriority = 0
    let medPriority = 0
    let lowPriority = 0

    for (i = 0; i < criteriaOutputObjs.length; i++) {
        let importance = criteriaOutputObjs[i].criteriaImportance

        if (importance == "high") {
            highPriority ++
        } else if (importance == "med") {
            medPriority ++
        } else if (importance == "low") {
            lowPriority ++
        }
    }

    let scale = 100 / (10 * highPriority + 5 * medPriority + 1 * lowPriority)           // edit score scaling and ALSO in findAllScores()

    return scale
}


function findScore(criteria) {          // pass in criteriaOutputObject from kelseyCode.js
    let criteriaType = criteria.criteriaType
    let critStatObj = criteriaStats[criteriaType]
    let num = criteria.placeIds.length

    if (num <= critStatObj.avg) {
        score = 70 * Math.pow((num / critStatObj.avg), 2)
    } else if (num > critStatObj.avg && num <= critStatObj.max) {
        score = 70 + 30 * num / (critStatObj.max - critStatObj.avg)
    } else {
        score = 100
    }

    return score
}

function generateScoreObjects(criteriaOutputObjs) {         // runs individual scores, calculates final score, builds and outputs Score Report object
    let totalScore = 0
    let parameterInfoArray = []

    let scoreScale = calcScoreScale(criteriaOutputObjs)

    for (j = 0; j < criteriaOutputObjs.length; j ++) {
        let criteria = criteriaOutputObjs[j]
        let num = criteriaOutputObjs[j].placeIds.length
        let score = findScore(criteria)     //out of 100
        let priorityScale

        if (criteria.criteriaImportance == "high") {
            priorityScale = 10
        } else if (criteria.criteriaImportance == "med") {      // priority scaling
            priorityScale = 5
        } else {
            priorityScale = 1
        }

        let adjustedScore = score * scoreScale * priorityScale / 100

        totalScore += adjustedScore
        
        let parameterObj = new ParameterInfo(criteria.CriteriaType, criteria.criteriaImportance, num, score, adjustedScore)
        parameterInfoArray.push(parameterObj)
        
    }

    totalScore = Math.round(totalScore)
    let reportObject = new ReportObject(address, parameterInfoArray, totalScore, scoreScale)

    return reportObject
}
