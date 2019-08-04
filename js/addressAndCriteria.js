// GET ADDRESS
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

function validateAddress(){
    let address = addressInput.value
    if(addressRegEx.test(address) == false){
        text.innerHTML = "Please enter a valid address."
    }else{
        text.innerHTML =''
        replaceDiv()
        finalAddress = address
    }
}

// REPLACE DIV
let addressDiv = document.getElementById("addressIntakeDiv")
let addressDivParent = addressDiv.parentNode
let preferencesDiv = document.getElementById("search-div")
const goBackButton = document.getElementById('go-back-btn')

function replaceDiv(){
    preferencesDiv.style.display = "flex"
    addressDivParent.replaceChild(preferencesDiv, addressDiv)
    goBackButton.addEventListener('click', function() {
        goBack()
        console.log('hey')
    })
}

function goBack() {
    preferencesDiv.replaceWith(addressDiv)
    // addressDiv.classList.add('slide-right')
}

// POPULATE SEARCH CRITERIA FROM CRITERIA STATS OBJECT
const searchCriteriaDiv = document.getElementById('search-criteria-div')

placeTypes = Object.keys(criteriaStats)

placeTypes.map((type) => {
    
    const googleId = criteriaStats[type].googleidname
    const placeDisplayName =criteriaStats[type].placeDisplayName

    const markup = `
    
    <li>
    <label for="${googleId}Checkbox" class="place-type container">
    
    ${placeDisplayName}

    <input type="checkbox" name="${googleId}Checkbox" id="${googleId}Checkbox" class="place-type-checkbox"  data-selectid="${googleId}" required> 

    <span class="checkmark"></span>

    </label>

    <select  id="${googleId}" class="importance-selector">
        <option value="${highImp}">${highImp}</option>
        <option value="${medImp}">${medImp}</option>
        <option value="${lowImp}">${lowImp}</option>
    </select>
    </li>
    `

    searchCriteriaDiv.insertAdjacentHTML('beforeend', markup)
})

let allPlaceTypeCheckboxes = document.querySelectorAll('.place-type-checkbox')  //moved this up so i could use the array for my defaults function -es

// check for default criteria in database
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        let userRef = db.collection('users').doc(user.uid)
        userRef.get().then(function(obj) {
            let userProfile = obj.data()
            if (userProfile.defaultSearchCriteria != null) {
                populateCriteriaFromDefaults(userProfile.defaultSearchCriteria)
                document.getElementById('defaultsLoadedSpan').innerHTML = "Loaded custom search preferences"
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


// Show importance selector only if place type is checked


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

// SUBMIT CRITERIA AND GENERATE CRITERIA INPUT OBJECT


function getCriteriaObjs() {

    const criteriaInputObjs = []

    allPlaceTypeCheckboxes.forEach(box => {
        if(box.checked) {
            let placeType = box.dataset.selectid
            let placeTypeImportance = document.getElementById(placeType).value

            let obj = new CriteriaInputObj(placeType, placeTypeImportance)

            criteriaInputObjs.push(obj)
        }
    })
    return criteriaInputObjs        // array
}

function renderLoader(parent) {
    
    const loader = `
    <div id="overlay">
        <div class="loader">
        </div>
    </div>
    <h2 class='gen-report-text'>Generating your report!<h2>
    
    `
    parent.insertAdjacentHTML('beforeend', loader)
    document.getElementById("overlay").style.display = "block";
}