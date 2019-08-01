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
        text.innerHTML = "Enter a valid address."
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

function replaceDiv(){
    preferencesDiv.style.display = "flex"
    addressDivParent.replaceChild(preferencesDiv, addressDiv)
}

// POPULATE SEARCH CRITERIA FROM CRITERIA STATS OBJECT
const searchCriteriaDiv = document.getElementById('search-criteria-div')

placeTypes = Object.keys(criteriaStats)

placeTypes.map((type, index) => {
    
    const googleId = criteriaStats[type].googleidname
    const placeDisplayName =criteriaStats[type].placeDisplayName

    const markup = `
    
    <label for="place-type-${index}" data-place = "${googleId}" id="${googleId}" class="place-type container">
    
    ${placeDisplayName}

    <input type="checkbox" name="place-type-${index}" id="place-type-${index}" class="place-type-checkbox"  data-selectid="select-${index}"> 

    <span class="checkmark"></span>

    </label>

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

// SUBMIT CRITERIA AND GENERATE CRITERIA INPUT OBJECT


function getCriteriaObjs() {

    const criteriaInputObjs = []

    allPlaceTypeCheckboxes.forEach(box => {
        if(box.checked) {
            let placeType = box.parentElement.id
            let selectId = box.dataset.selectid
            let placeTypeImportance = document.getElementById(selectId).value

            let obj = new CriteriaInputObj(placeType, placeTypeImportance)

            criteriaInputObjs.push(obj)
        }
    })
    return criteriaInputObjs        // array
}