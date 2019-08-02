//load info before the rest of the things on the page happen
let usersCollectionRef = db.collection('users')
// let userRef = ""
// let activeUserId = ""

let userRefPromise = firebase.auth().onAuthStateChanged(user => {        //KEEP ON THIS PAGE - variable names will be used lower in script

    if (user) {     //if a user is logged in
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        var providerData = user.providerData;
//Might bring this back after we figure out the registration page. TBD.
        // usersCollectionRef.doc(uid).get()     
        // .then(snapshot => {
        //     if (!snapshot.exists) {     //checks whether user is already saved in database
        //         usersCollectionRef.doc(uid).set({
        //             email: email,
        //             uid: uid
        //         })
        //     }
        // })
        // usernameSpan.innerHTML = email

        let activeUserId = uid
        let userRef = usersCollectionRef.doc(uid)
        let algorithmObjectTest = userRef.collection('searches').doc('currentSearch')

        algorithmObjectTest.get().then(function(obj) {
            generatePage(obj.data())
        })
    }    
})

function determineImportanceClass(parameterImportance) {
    if (parameterImportance == highImp) {
        return 'very-important'
    } else if (parameterImportance == medImp) {
        return 'important'
    } else if (parameterImportance == lowImp) {
        return 'somewhat-important'
    }
}

function determineScoreColor(score) {
    if (score > 85) {
        return 'green'
    } else if (score > 50 && score < 85) {
        return 'yellow'
    } else if (score <= 50) {
        return 'red'
    }
}

function generatePage(algorithmObject) {
    let scoreAddress = algorithmObject['address']
    let appendedScoreAddress = scoreAddress.substring(0,scoreAddress.lastIndexOf(','))
    let score = algorithmObject['score']
    let scoreColor = determineScoreColor(score)
    let parameterInfo = algorithmObject['criteriaArray']

    //score
    let addressHeader = document.getElementById('address-header')
    addressHeader.innerHTML = `${appendedScoreAddress}`
    //change this so that it pull sthe score div and then creates the entire div interior and remove the score header thats already in my html file.
    //set up color variable too
    let scoreHeader = document.getElementById('score')
    //add variable for the importance value
    scoreHeader.innerHTML = `<svg viewBox ="0 0 40 40">
                                <path
                                d="M20 4.08449
                                    a 15.91551 15.91551 0 0 1 0 31.83102
                                    a 15.91551 15.91551 0 0 1 0 -31.83102"
                                fill="none"
                                stroke="#555";
                                stroke-width="3";
                            
                                />
                                    <path class="circle"
                                d="M20 4.08449
                                    a 15.91551 15.91551 0 0 1 0 31.83102
                                    a 15.91551 15.91551 0 0 1 0 -31.83102"
                                fill="none"
                                stroke=${scoreColor};
                                stroke-width="3";
                                stroke-dasharray="${score}, 100"
                                stroke-linecap="round"
                                />
                                <text x="12" y="25" class="score"><h1 id="score-header">${score}</h1></text>
                            </svg>`


    //parameter scores
    let detailScoreContainer = document.getElementById('detail-score-container')

    let detailScoreArray =[]
    parameterInfo.forEach(function(parameterObj) { //change the type name
        let parameterType = parameterObj['type']
        let parameterImportance = parameterObj['importance']
        let parameterNumber = parameterObj['number']
        let parameterScore = parameterObj['score']

        let importanceClass = determineImportanceClass(parameterImportance)
        let formattedType = parameterType.replace('_',' ')
        let detailScoreContainerHeight = detailScoreContainer.clientHeight
        let divDimension = (detailScoreContainerHeight/2.25)

        let div = `<div class="parameter-container ${importanceClass}" style="height:${divDimension}; width:${divDimension}" onclick="generateParameterDetailDiv('${parameterType}','${parameterImportance}','${parameterNumber}','${parameterScore}')">
                        <h3 class="toTitleCase">${formattedType}</h3>
                        <h2>${parameterScore}</h2>
                    </div>`

        detailScoreArray.push(div)
    })
    detailScoreContainer.innerHTML = detailScoreArray.join('')

    //style things

    //maybe have visual indicator of importance of each parameter
    //maybe have credit score circle with red to green scale
    //would have to add classes to divs accordingly and popualte image accordingly

}

    //parameter score details
    function generateParameterDetailDiv(parameterType, parameterImportance, parameterNumber, parameterScore) {
        let formattedType = parameterType.replace('_',' ')
        let detailParameterModal = document.getElementById('detail-parameter-modal')
        let detailParameterContainer = document.getElementById('detail-parameter-container')
        let disclaimer = ''
        let formattedParameterNumber = parameterNumber
        if (parameterNumber == 20) {
            disclaimer = `<p class="disclaimer">*The maximum number of nearby places per type used for our website is 20. There may be more than 20 ${formattedType}s within 1000 meters.</p>`
            formattedParameterNumber += '*'
        }
        // detailParameterImportanceBar.className = determineImportanceClass(parameterImportance)
        let content =  `<div id="detail-parameter-header">
                            <span><h2 class="toTitleCase">${formattedType}</h2></span>
                            <span><h1>${parameterScore}</h1></span>
                        </div>
                        <h4>Selected level of importance for ${formattedType}s:</h4>
                        <h3>${parameterImportance}</h3>
                        <h4>Number of ${formattedType}s within 1000 meters:</h4>
                        <h3>${formattedParameterNumber}</h3>
                        <h4>More information:</h4>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
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