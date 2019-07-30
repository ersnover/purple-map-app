let usersRef = db.collection('users')
var activeUserId = ""
const proxy = 'https://cors-anywhere.herokuapp.com/'
const apiKey = 'AIzaSyC0pSQy9ruAU0odyeOJDsdoPf6Pfsn4gFg'

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
    let response = await fetch(`${proxy}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latlng}&radius=1500&type=${criteriaType}&keyword=&key=${apiKey}`)
    return await response.json()
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
        countPlaces(address, criteriaArray) //actually move this to submit and pull address and criteria from firebase
    }
}

