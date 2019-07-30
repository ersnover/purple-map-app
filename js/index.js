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
    firebase.auth().signOut().then(function() {
        window.open("login.html")
      }).catch(error => {
      });
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
        console.log(userRef)
        console.log(activeUserId)
        userRef.collection("addresses").add({
            address: address
        })
        countPlaces(address, criteriaArray) //actually move this to submit and pull address and criteria from firebase
    }
}



const Likes = () => {
    // build likes model
}
