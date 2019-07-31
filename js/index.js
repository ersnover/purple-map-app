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

// should we only create these object if the type is checked?
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



placeTypes = [
    {
        placeDisplayName: 'Restaurants',
        googleidname: 'restaurant'
    },
    {
        placeDisplayName: 'Parks',
        googleidname: 'park'
    },
    {
        placeDisplayName: 'Bars',
        googleidname: 'park'
    },
    {
        placeDisplayName: 'Schools',
        googleidname: 'school'
    },
    {
        placeDisplayName: 'Clubs',
        googleidname: 'club'
    }
]


const searchCriteriaDiv = document.getElementById('search-criteria-div')

const places = placeTypes.map((place, index) => {
    const markup = `
    
    <label for="place-type-${index}" id="${place.googleidname}">${place.placeDisplayName}</label>
    <input type="checkbox" name="place-type-${index}" id="place-type-${index}" class="place-type-checkbox" data-selectid="select-${index}"> 
    <select id="select-${index}" class="importance-selector">
        <option value="3">3</option>
        <option value="2">2</option>
        <option value="1">1</option>
    </select> <br>
    `

    searchCriteriaDiv.insertAdjacentHTML('beforeend', markup)
})









let placeTypeOne = document.getElementById('place-type-1')
let placeTypeTwo = document.getElementById('place-type-2')
let placeTypeThree = document.getElementById('place-type-3')
let placeTypeFour = document.getElementById('place-type-4')

let placeTypeOneImportance = document.getElementById('select-1')
let placeTypeTwoImportance = document.getElementById('select-2')
let placeTypeThreeImportance = document.getElementById('select-3')
let placeTypeFourImportance = document.getElementById('select-4')

const seeResultsButton = document.getElementById('see-results-btn')

seeResultsButton.addEventListener('click', () => {

    console.log(getPlaceCriteria(placeTypeOne, placeTypeOneImportance))
    console.log(getPlaceCriteria(placeTypeTwo, placeTypeTwoImportance))
    console.log(getPlaceCriteria(placeTypeThree, placeTypeThreeImportance))
    console.log(getPlaceCriteria(placeTypeFour, placeTypeFourImportance))


})

function getPlaceCriteria (placeTypeID, placeTypeImportance) {
    
    if ( placeTypeID.checked == true ) {
        
        let obj = {
            placeType: placeTypeID.previousElementSibling.id,
            placeTypeImportance: placeTypeImportance.value
        }

        return obj
    }    
}


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
