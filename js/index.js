let usersCollectionRef = db.collection('users')
let userRef = ""
let activeUserId = ""
var finalAddress = ""

firebase.auth().onAuthStateChanged(user => {        //KEEP ON THIS PAGE - variable names will be used lower in script

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
        usernameSpan.innerHTML = email

        activeUserId = uid

        userRef = usersCollectionRef.doc(uid)
    }    
})

const seeResultsButton = document.getElementById('see-results-btn')
seeResultsButton.addEventListener('click', () => {
    
    allPlaceTypeCheckboxes.forEach(box => {
        if(box.checked) {
            renderLoader(preferencesDiv)
            runAll()
    }
})

function runAll() {
    address = finalAddress
    let criteriaInputObjs = getCriteriaObjs()

    getPlaces(address, criteriaInputObjs,results => {
        reportObject = generateScoreObjects(address, results)

        if (!firebase.auth().currentUser) {
            userRef = usersCollectionRef.doc('Guest')
        }

        let criteriaArray = buildCritArray(reportObject.criteriaInfoArray)

        userRef.collection('searches').doc('currentSearch').set(
            {
            address: reportObject.address,
            criteriaArray: criteriaArray,
            score: reportObject.score,
            scale: reportObject.scale
            })
        .then(() => {
            window.location = "score.html"
        })
    })
}

function buildCritArray(crits) {

    let critArray = []

    crits.forEach(crit => {

        let critObj = {
            type: crit.type,
            importance: crit.importance,
            number: crit.number,
            score: crit.score,
            totalScoreContribution: crit.totalScoreContribution
        }

        critArray.push(critObj)
    })

    return critArray
}})