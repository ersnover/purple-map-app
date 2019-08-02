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

function generatePage(algorithmObject) {
    let scoreAddress = algorithmObject['address']
    let appendedScoreAddress = scoreAddress.substring(0,scoreAddress.lastIndexOf(','))
    let score = algorithmObject['score']
    let parameterInfo = algorithmObject['criteriaArray']

    //score
    let addressHeader = document.getElementById('address-header')
    addressHeader.innerHTML = `${appendedScoreAddress}`
    let scoreHeader = document.getElementById('score-header')
    scoreHeader.innerHTML = `${score}`


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
        let detailParameterImportanceBar = document.getElementById('detail-parameter-importance-bar')
        
        detailParameterImportanceBar.className = determineImportanceClass(parameterImportance)
        let content =  `<div>
                            <h2 class="toTitleCase">${formattedType}</h2>
                            <h1 id="detail-parameter-score">${parameterScore}</h1>
                        </div>
                        <h3>${parameterImportance}</h3>
                        <h3>${parameterNumber}</h3>`

        detailParameterContainer.innerHTML = content
        detailParameterImportanceBar.className = determineImportanceClass(parameterImportance)
        detailParameterModal.style.display = 'block'
    }

    let detailParameterModal = document.getElementById('detail-parameter-modal')
    let closeButton = document.getElementsByClassName('close')[0]
    closeButton.onclick = function(){
        detailParameterModal.style.display = "none";
    }