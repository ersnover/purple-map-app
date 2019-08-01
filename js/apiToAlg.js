// CONVERT ADDRESS TO LAT/LNG
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

//GENERATE URL
async function fetchPlaces(latlng, criteriaType) {
    let response = await fetch(`${config.proxy}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latlng}&radius=1500&type=${criteriaType}&keyword=&key=${config.apiKey}`)
    return await response.json()
}

// RUNS API CALL AND GENERATE OBJECTS
async function getPlaces(address, criteriaArray, completion) {
    let latlng = await getLatLng(address)
    .then(function(results) {
        let latitude = results[0].geometry.location.lat()
        let longitude = results[0].geometry.location.lng()
        return `${latitude},${longitude}`
    })
    .catch(function(status) {
        //insert alert(status) here
    })

    let criteriaOutputObjs = []

    let promises = []
    let promisesCriteria = []
    
    criteriaArray.forEach(function(obj) {
        let criteriaType = obj['type']
        let criteriaImportance = obj['importance']
        let promise = fetchPlaces(latlng, criteriaType, criteriaImportance)
        promisesCriteria.push([criteriaType, criteriaImportance])
        promises.push(promise)
    })

    Promise.all(promises).then(function(promiseArray) {  
        //use index loop to call the corresponding values for each promise
        function pushPlaceIds(json) {
            let placeIds = []
                json.results.forEach(function(obj) {
                    placeIds.push(obj.place_id)
                })
            return placeIds
        }
        for (let i = 0; i < promises.length; i++) {
            let criteriaType = promisesCriteria[i][0]
            let criteriaImportance = promisesCriteria[i][1]
            let placeIds = pushPlaceIds(promiseArray[i])
            let criteriaOutputObj = new CriteriaOutputObj(criteriaType, criteriaImportance, placeIds)
            criteriaOutputObjs.push(criteriaOutputObj)
        }

        completion(criteriaOutputObjs)
    })
}
                //end api calls


// SCORING ALGORITHM

// // algorithm calculations (will need var names adjusted based on input)
// let address = "1200 richmond"
// let criteriaOutputObjs = [
//     {
//       criteriaType: 'restaurant',
//       criteriaImportance: 'high',
//       placeIds: [1,2,3,4,5,5,6,7,9]          please for the love of god don't delete this
//     },
//     {
//       criteriaType: 'park',
//       criteriaImportance: 'med',
//       placeIds: [1,2,3]
//     },
//     {
//       criteriaType: 'bar',
//       criteriaImportance: 'low',
//       placeIds: [1,4,5,5,6,7,9]
//     }
//   ]


// DETERMINE IMPORTANCE SCALING BASED ON NUMBER OF CRITERIA
function calcScoreScale(criteriaOutputObjs) {
    let highPriority = 0
    let medPriority = 0
    let lowPriority = 0

    for (i = 0; i < criteriaOutputObjs.length; i++) {
        let importance = criteriaOutputObjs[i].importance

        if (importance == highImp) {
            highPriority ++
        } else if (importance == medImp) {
            medPriority ++
        } else if (importance == lowImp) {
            lowPriority ++
        }
    }

    let scale = 100 / (10 * highPriority + 5 * medPriority + 1 * lowPriority)           // edit score scaling HERE and ALSO in findAllScores()

    return scale
}

// FIND INDIVIDUAL CRITERIA SCORE
function findScore(criteria) {          // pass in criteriaOutputObject from kelseyCode.js
    let criteriaType = criteria.type
    let critStatObj = criteriaStats[criteriaType]
    let num = criteria.placeIds.length

    if (num <= critStatObj.avg) {
        score = 70 * Math.pow((num / critStatObj.avg), 2)
    } else if (num > critStatObj.avg && num <= critStatObj.max) {
        score = 70 + 30 * num / (critStatObj.max - critStatObj.avg)
    } else if (num >= critStatObj.max) {
        score = 100
    }

    return score
}

// runs individual scores, calculates final score, builds and outputs Score Report object
function generateScoreObjects(address, criteriaOutputObjs) {
    let totalScore = 0
    let parameterInfoArray = []

    let scoreScale = calcScoreScale(criteriaOutputObjs)

    for (j = 0; j < criteriaOutputObjs.length; j ++) {
        let criteria = criteriaOutputObjs[j]
        let num = criteriaOutputObjs[j].placeIds.length
        let score = findScore(criteria)     // individual score out of 100
        let priorityScale

        if (criteria.importance == highImp) {
            priorityScale = 10
        } else if (criteria.importance == medImp) {      // priority scaling
            priorityScale = 5
        } else if (criteria.importance == lowImp) {
            priorityScale = 1
        }

        let adjustedScore = score * scoreScale * priorityScale / 100    // scales individual score to percentage of total score

        totalScore += adjustedScore
        
        let parameterObj = new ParameterInfo(criteria.type, criteria.importance, num, score, adjustedScore)
        parameterInfoArray.push(parameterObj)
        
    }

    totalScore = Math.round(totalScore)
    let reportObject = new ReportObject(address, parameterInfoArray, totalScore, scoreScale)

    return reportObject
}