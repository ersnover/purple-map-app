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

function calcChunks(criteriaOutputObjs, chunkType) {
    let highCount = 0
    let medCount = 0
    let lowCount = 0

    for (criteria in criteriaOutputObjs) {
        if (criteria.criteriaImportance == "high") {
            highCount ++
        } else if (criteria.criteriaImportance == "med") {
            medCount ++
        } else if (criteria.criteriaImportance == "low") {
            lowCount ++
        }
    }

    let scale = 100 / (10 * highCount + 5 * medCount + 1 * lowCount)

    let highChunk = 10 * scale
    let medChunk = 5 * scale
    let lowChunk = scale

    if (chunkType == 'high') {
        return highChunk
    } else if (chunkType == 'med') {
        return medChunk
    } else {
        return lowChunk
    }
}

function calcCriteriaScore(num, critObj) {
    let score
    if (num <= critObj.avg) {
        score = 70 * Math.pow((num / critObj.avg), 2)
    } else if (num > critObj.avg && num <= critObj.max) {
        score = 70 + 30 * num / (critObj.max - critObj.avg)
    } else {
        score = 100
    }

    return score
}

function findScore(criteria) {          // pass in criteriaOutputObject from kelseyCode.js
    let criteriaType = criteria.criteriaType
    let num = criteria.placeIds.length()

    let individualScore = calcCriteriaScore(num, criteriaStats[criteriaType])

    return individualScore
}

function findAllScores(criteriaOutputObjs) {
    let totalScore

    for (criteria in criteriaOutputObjs) {
        let score = findScore(criteria)     //out of 100
        let chunk = calcChunks(criteriaOutputObjs, criteria.criteriaImportance)     //also out of 100

        let adjustedScore = score * chunk / 100

        totalScore += adjustedScore

        //updateSearchObject(bunchOfShitIDontWannaFigureOutRightNow)
    }

    return totalScore
}