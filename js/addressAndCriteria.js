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
    })
}

function goBack() {
    preferencesDiv.replaceWith(addressDiv)
    // addressDiv.classList.add('slide-right')
}

function generateCriteriaSection(criteriaStats) {

//parameter scores
let placeTypes = Object.keys(criteriaStats)
let searchCriteriaDiv = document.getElementById('search-crit-div')

let searchCriteriaArray =[]
let count = 1
let mainHeader = document.getElementById('pageTitle')
let mainHeaderHeight = mainHeader.clientHeight
placeTypes.forEach(function(placeType) {
    const googleId = criteriaStats[placeType].googleidname
    const placeDisplayName = criteriaStats[placeType].placeDisplayName

    let divDimension = mainHeaderHeight * 1.35

    let div =`<!-- <div id="search-criteria-element-${count}"  class="search-criteria-element" style="height:${divDimension}; width:200px"> -->
        <div id="search-criteria-element-${count}"  class="search-criteria-element">
            <label for="${googleId}Selection">${placeDisplayName}</label>
            <select  id="${googleId}" class="importance-selector">
                <option class="not-important" value="">&#160&#160&#160&#160--&#160 Select &#160--&#160</option>
                <option value="${googleId}&${highImp}">&#160&#160${highImp}</option>
                <option value="${googleId}&${medImp}">&#160&#160&#160&#160&#160&#160&#160${medImp}</option>
                <option value="${googleId}&${lowImp}">${lowImp}</option>
            </select>
        </div>`

    searchCriteriaArray.push(div)
    count += 1
})

searchCriteriaDiv.innerHTML = searchCriteriaArray.join('')
/* code for if we want to later update component to have flexible vertical height
let searchDivHeader = document.getElementById('search-top-bar')
let searchDivHeaderHeight = searchDivHeader.clientHeight
let searchElement = document.getElementById('search-criteria-element-1')
let searchElementWidth = searchElement.clientWidth + 20
let searchElementRowHeight = searchElement.clientHeight
let numCriterias = searchCriteriaArray.length
let searchElementTotalWidth = searchElementWidth*numCriterias
let searchDiv = document.getElementById('search-div')
let searchCriteriaDivWidth = searchCriteriaDiv.clientWidth


if ( searchElementTotalWidth > searchDivWidth) {
    let numCriteriasPerRow = (Math.floor(searchCriteriaDivWidth/searchElementWidth))
    let numRows = Math.ceil(numCriterias/numCriteriasPerRow)
    let searchElementTotalRowHeight = searchElementRowHeight * numRows
    searchDiv.style.height = searchDivHeaderHeight + searchElementTotalRowHeight + 50
} else {
    searchDiv.style.height = searchDivHeight + searchElementRowHeight + 50
}
*/
}

generateCriteriaSection(criteriaStats)

let allPlaceTypeSelections = document.querySelectorAll('.importance-selector') 

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

        let select = document.getElementById(criteriaType)

        select.value = `${criteriaType}&${criteriaImportance}`
        select.style.color = 'black'
    })
}

var base = document.querySelector('#search-crit-div');
var selector = '.importance-selector';

base.addEventListener('change', function(event) {
  var closest = event.target.closest(selector);
  if (closest && base.contains(closest)) {
    if (event.target.value == '') {
        event.target.style.color = 'grey'
    } else {
        event.target.style.color = 'black'
    }
  }
});

// SUBMIT CRITERIA AND GENERATE CRITERIA INPUT OBJECT

function getCriteriaObjs() {

    const criteriaInputObjs = []

    allPlaceTypeSelections.forEach(selection => {
        if (selection.value) {
            let selectionString = selection.value
            let ampersandIndex = (selectionString).indexOf('&')
            let placeType = (selectionString).substring(0,ampersandIndex)
            let placeTypeImportance = (selectionString).substring(ampersandIndex + 1, selectionString.length)

            let obj = new CriteriaInputObj(placeType, placeTypeImportance)
            criteriaInputObjs.push(obj)
        }

    })
    return criteriaInputObjs
}


function renderLoader(parent) {
    
    const loader = `
    <div id="overlay">
        <div class="loader">
        </div>
        <div class="gen-report-text">
            <h2>Generating your report!</h2>
        </div>
    </div>
    `
    // parent.insertAdjacentHTML('beforeend', loader)
    parent.innerHTML = loader
    document.getElementById("overlay").style.display = "block";
    window.scrollTo(0,0)
}