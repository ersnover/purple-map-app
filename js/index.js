let usersRef = db.collection('users')
var activeUserId = ""
const proxy = 'https://cors-anywhere.herokuapp.com/'
const apiKey = 'AIzaSyC0pSQy9ruAU0odyeOJDsdoPf6Pfsn4gFg'

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


function getLatLng(address) {
    let geocoder = new google.maps.Geocoder()

    geocoder.geocode({ 'address': address }, function (results, status) {

        if (status == google.maps.GeocoderStatus.OK) {
            let latitude = results[0].geometry.location.lat()
            console.log(latitude)
            let longitude = results[0].geometry.location.lng()
            console.log(longitude)

        }
    })
}

function validateAddress(){
    let address = addressInput.value
    if(addressRegEx.test(address) == false){
        text.innerHTML = "Enter a valid address."
    }else{
        text.innerHTML =''
        getLatLng(address)
    }
}
