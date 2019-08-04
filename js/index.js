let usersCollectionRef = db.collection('users')
let userRef = ""
let activeUserId = ""
var finalAddress = ""

firebase.auth().onAuthStateChanged(function(user) {        //KEEP ON THIS PAGE - variable names will be used lower in script

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

const errorMsg = document.getElementById('error-msg')

function showErrorMsg() {
    errorMsg.style.display = 'block'
    }


const seeResultsButton = document.getElementById('see-results-btn')
seeResultsButton.addEventListener('click', () => {
    
    let criteriaInputObjs = getCriteriaObjs()

    if(criteriaInputObjs.length !== 0) {
        renderLoader(preferencesDiv)
        runAll()
    } else {
        showErrorMsg()
        setInterval(() => {
            errorMsg.style.display = 'none'
        }, 2000)
    }

function runAll() {
    address = finalAddress
    let criteriaInputObjs = getCriteriaObjs()
    
    getPlaces(address, criteriaInputObjs,results => {
        reportObject = generateScoreObjects(address, results)

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                userRef = userRef
            } else {
                userRef = usersCollectionRef.doc('Guest')
            }

            userRef.collection('searches').doc('currentSearch').set(
                {
                address: reportObject.address,
                criteriaArray: criteriaArray,       // converts report obj to be firestore compatible
                score: reportObject.score,
                scale: reportObject.scale
                })
                .then(() => {
                window.location = "score.html"
            })
        })

        let criteriaArray = buildCritArray(reportObject.criteriaInfoArray)

    })
}

function buildCritArray(crits) {    // converts criteria custom objects to explicit json object for firestore save

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


//USER PROFILE NAV

const userNameButton = document.getElementById('userSpan')
userNameButton.addEventListener('click', () => {
    window.location = "userPage.html"
})