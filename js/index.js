// user auth stuff
let usersCollectionRef = db.collection('users')
let userRef = ""

let activeUserId = ""
const signOutButton = document.getElementById("signOutButton")
signOutButton.addEventListener('click', () => {
    signOutUser()
})


//test data
class CriteriaType {
    constructor(type, importance) {
        this.type = type
        this.importance = importance
    }
}
const typeObj1 = new CriteriaType('park', 'important')
const typeObj2 = new CriteriaType('cafe', 'important')
const typeObj3 = new CriteriaType('bus_station', 'important;')
let criteriaArray = [typeObj1, typeObj2, typeObj3]
//end test data

//login algorithm
firebase.auth().onAuthStateChanged(user => {

    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        usersCollectionRef.doc(uid).get()     
        .then(snapshot => {
            if (!snapshot.exists) {     //checks whether user is already saved in database
                usersCollectionRef.doc(uid).set({
                    email: email,
                    uid: uid
                })
            }
        })

        activeUserId = uid
        userRef = usersCollectionRef.doc(uid)
    }    
})

//  sign out function (called from signout button)
function signOutUser() {
    firebase.auth().signOut()

    firebase.auth().onAuthStateChanged(user => {
      if (!user) {     //if a user is logged out, redirect to login
          window.location = "login.html"
      }
    })
}

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

async function getPlaces(address, criteriaArray) {
    let latlng = await getLatLng(address)
    .then(function(results) {
        let latitude = results[0].geometry.location.lat()
        let longitude = results[0].geometry.location.lng()
        return `${latitude},${longitude}`
    })
    .catch(function(status) {
        //insert alert(status) here
    })

    let criteriaOutputObjs = []

    let promises = []
    let promisesCriteria = []
    criteriaArray.forEach(function(obj) {
        let criteriaType = obj['type']
        let criteriaImportance = obj['importance']
        let promise = fetchPlaces(latlng, criteriaType, criteriaImportance)
        promisesCriteria.push([criteriaType, criteriaImportance])
        promises.push(promise)
    })

    Promise.all(promises).then(function(promiseArray) {  
        //use index loop to call the corresponding values for each promise
        function pushPlaceIds(json) {
            let placeIds = []
                json.results.forEach(function(obj) {
                    placeIds.push(obj.place_id)
                })
            return placeIds
        }
        for (let i = 0; i < promises.length; i++) {
            let criteriaType = promisesCriteria[i][0]
            let criteriaImportance = promisesCriteria[i][1]
            let placeIds = pushPlaceIds(promiseArray[i])
            let criteriaOutputObj = new CriteriaOutput(criteriaType, criteriaImportance, placeIds)
            criteriaOutputObjs.push(criteriaOutputObj)
        }

    }).then(function(obj) {
        return criteriaOutputObjs 
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
    }
}



const Likes = () => {
    // build likes model
}


// algorithm calculations (will need var names adjusted based on input)

// let criteriaOutputObjs = [
//     {
//       criteriaType: 'restaurant',
//       criteriaImportance: 'high',
//       placeIds: [1,2,3,4,5,5,6,7,9]
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

function findAllScores() {
    let totalScore = 0

    let scoreScale = calcScoreScale(criteriaOutputObjs)

    for (j = 0; j < criteriaOutputObjs.length; j ++) {
        let criteria = criteriaOutputObjs[j]
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
        console.log(score, adjustedScore)
        //updateSearchObject(bunchOfShitIDontWannaFigureOutRightNow)
    }
    totalScore = Math.round(totalScore)
    console.log(totalScore)
    return totalScore
}
