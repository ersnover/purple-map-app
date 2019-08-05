//load info before the rest of the things on the page happen
let usersCollectionRef = db.collection('users')
//const usernameSpan = document.getElementById('userSpan')
var algorithmObject

firebase.auth().onAuthStateChanged(function(user) {

    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;

        var userRef = usersCollectionRef.doc(uid)
    } else {
        var userRef = usersCollectionRef.doc("Guest")   //if no user, checks "Guest" collection
    }
    
    let algorithmObjectDoc = userRef.collection('searches').doc('currentSearch')
    algorithmObjectDoc.get().then(function(obj) {
        algorithmObject = obj.data()
        generatePage(algorithmObject)
    })
})

function determineImportanceClass(parameterImportance) {
    if (parameterImportance == highImp) {
        return highImp
    } else if (parameterImportance == medImp) {
        return medImp
    } else if (parameterImportance == lowImp) {
        return lowImp
    }
}

function determineScoreColor(score) {
    if (score >= 85) {
        return 'green'
    } else if (score > 50 && score < 85) {
        return 'yellow'
    } else if (score <= 50) {
        return 'red'
    }
}

function generateMainScoreSection(algorithmObject) {
    let scoreAddress = algorithmObject['address']
    let appendedScoreAddress = scoreAddress.substring(0,scoreAddress.lastIndexOf(','))
    let score = algorithmObject['score']
    let scoreColor = determineScoreColor(score)

    let boxSize = 80
    let radius = 15.91551
    let diameter = radius / 2
    let xVal = boxSize/2
    let yVal = boxSize - (diameter/2)

    //score
    let addressHeader = document.getElementById('address-header')
    addressHeader.innerHTML = `${appendedScoreAddress}`

    let svgColor = document.getElementsByClassName("svg-color")[0]
    let scoreHeader = document.getElementsByClassName("score-header")[0]
    
    
    svgColor.style.strokeDashoffset = `${score}`
    svgColor.style.strokeDasharray = `${score}, 100`
    svgColor.style.stroke = `${scoreColor}`
   
    
    scoreHeader.innerHTML=`${score}`
}

function generateDetailScoreSection(algorithmObject) {
        //add variable for the importance value

    //parameter scores
    let parameterInfo = algorithmObject['criteriaArray']
    let detailScoreContainer = document.getElementById('detail-score-container')

    let detailScoreArray =[]
    let count = 1
    let factorsHeader = document.getElementById('factors-header')
    let factorsHeaderHeight = factorsHeader.clientHeight
    parameterInfo.forEach(function(parameterObj) { //change the type name
        let parameterType = parameterObj['type']
        let parameterImportance = parameterObj['importance']
        let parameterNumber = parameterObj['number']
        let parameterScore = parameterObj['score']

        let importanceClass = determineImportanceClass(parameterImportance)
<<<<<<< HEAD
        let formattedType = criteriaStats[parameterType].placeDisplayName
        let detailScoreContainerHeight = detailScoreContainer.clientHeight
        let divDimension = (detailScoreContainerHeight/2.25)
=======
        let formattedType = parameterType.replace('_',' ')
        let divDimension = factorsHeaderHeight * 3.75
>>>>>>> master

        let div = `<div class="parameter-container ${importanceClass}" id="parameter-container-${count}" style="height:${divDimension}; width:${divDimension}" onclick="generateParameterDetailDiv('${parameterType}','${parameterImportance}','${parameterNumber}','${parameterScore}')">
                        <h3 class="toTitleCase">${formattedType}</h3>
                        <h2>${parameterScore}</h2>
                    </div>`

        detailScoreArray.push(div)
        count += 1
    })
    detailScoreContainer.innerHTML = detailScoreArray.join('')
    let parameterContainer = document.getElementById('parameter-container-1')
    let parameterContainerDimension = parameterContainer.clientHeight
    let parameterContainerWidth = parameterContainerDimension + 40
    let parameterContainerRowHeight = parameterContainerDimension + 40
    let numParameters = detailScoreArray.length
    let parameterContainersTotalWidth = parameterContainerWidth*numParameters
    let secondScoreContainer = document.getElementById('second-score-container')
    // let secondScoreContainerWidth = secondScoreContainer.clientWidth
    let detailScoreContainerWidth = detailScoreContainer.clientWidth

    //change this whole thing into a do while loop
    if ( parameterContainersTotalWidth > detailScoreContainerWidth) {
        let numParametersPerRow = (Math.floor(detailScoreContainerWidth/parameterContainerWidth))
        let numRows = Math.ceil(numParameters/numParametersPerRow)
        let parameterContainerTotalRowHeight = parameterContainerRowHeight * numRows
        secondScoreContainer.style.height = factorsHeaderHeight + parameterContainerTotalRowHeight + 60
    } else {
        secondScoreContainer.style.height = factorsHeaderHeight + parameterContainerRowHeight + 60
    }
}

function generatePage(algorithmObject) {
    generateMainScoreSection(algorithmObject)
    generateDetailScoreSection(algorithmObject)
}

//parameter score details
<<<<<<< HEAD
function generateParameterDetailDiv(parameterType, parameterImportance, parameterNumber,parameterScore) {
    let formattedType = criteriaStats[parameterType].placeDisplayName
=======
function generateParameterDetailDiv(parameterType, parameterImportance, parameterNumber, parameterScore) {
    let formattedType = parameterType.replace('_',' ')
>>>>>>> master
    let detailParameterModal = document.getElementById('detail-parameter-modal')
    let detailParameterContainer = document.getElementById('detail-parameter-container')
    let disclaimer = ''
    let formattedParameterNumber = parameterNumber
    if (parameterNumber == 20) {
<<<<<<< HEAD
        disclaimer = `<p class="disclaimer">*The maximum number of nearby places per type used for our website is 20. There may be more than 20 ${formattedType} within 1000 meters.</p>`
=======
        disclaimer = `<p class="disclaimer">*The maximum number of nearby places per type used for our website is 20. There may be more than 20 ${formattedType}s within 1000 meters.</p>`
>>>>>>> master
        formattedParameterNumber += '*'
    }
    // detailParameterImportanceBar.className = determineImportanceClass(parameterImportance)
    let content =  `<div id="detail-parameter-header">
                        <span><h2 class="toTitleCase">${formattedType}</h2></span>
                        <span><h1>${parameterScore}</h1></span>
                    </div>
<<<<<<< HEAD
                    <h4>Selected level of importance for ${formattedType}:</h4>
                    <h3>${parameterImportance}</h3>
                    <h4>Number of ${formattedType} within 1000 meters:</h4>
                    <h3>${formattedParameterNumber}</h3>
                    <h4>More information:</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmodtempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodoconsequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillumdolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
=======
                    <h4>Selected level of importance for ${formattedType}s:</h4>
                    <h3>${parameterImportance}</h3>
                    <h4>Number of ${formattedType}s within 1000 meters:</h4>
                    <h3>${formattedParameterNumber}</h3>
                    <h4>More information:</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
>>>>>>> master
                    <img src="images/no-image-available.jpg">
                    ${disclaimer}`

    detailParameterContainer.innerHTML = content
    detailParameterModal.style.display = 'block'
}

let detailParameterModal = document.getElementById('detail-parameter-modal')
let closeButton = document.getElementsByClassName('close')[0]
closeButton.onclick = function(){
    detailParameterModal.style.display = "none";
}

<<<<<<< HEAD
const favoriteBtn = document.getElementById('favoriteBtn')
const favoriteSpan = document.getElementById('favoriteSpan')

// search saving


// favoriteBtn.addEventListener('mouseenter', () => {
//     if (favoriteBtn.classList.contains('far')) {
//         favoriteBtn.setAttribute('class', 'fas fa-heart')
//         favoriteSpan.innerHTML = "Saved!"
//         setTimeout(() => {
//             favoriteSpan.style.display = (favoriteSpan.style.display == 'none' ? '' : 'none')
//         }, 500)
//     } else {
//         favoriteBtn.setAttribute('class', 'far fa-heart')
//         favoriteSpan.innerHTML = "Removed!"
//         setTimeout(() => {
//             favoriteSpan.style.display = (favoriteSpan.style.display == 'none' ? '' : 'none')
//         }, 500)
//     }
// })

// to save: 


// #favoriteDiv {
//     display: flex;
//     flex-direction: column;
//     position: absolute;

//     i {
//         color: purple;
//         font-size: 55px;
//     }

//     span {
//         color: gray;
//         font-size: 25px;
//     }
// }
=======
window.addEventListener('resize', function() {
    generateDetailScoreSection(algorithmObject)
    })
>>>>>>> master
