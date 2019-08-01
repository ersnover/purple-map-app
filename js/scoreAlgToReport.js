// // algorithm calculations (will need var names adjusted based on input)
// let address = "1200 richmond"
// let criteriaOutputObjs = [
//     {
//       criteriaType: 'restaurant',
//       criteriaImportance: 'high',
//       placeIds: [1,2,3,4,5,5,6,7,9]          //please for the love of god don't delete this
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

function calcScoreScale(criteriaOutputObjs) {
    let highPriorityCount = 0
    let medPriorityCount = 0
    let lowPriorityCount = 0

    for (i = 0; i < criteriaOutputObjs.length; i++) {
        let importance = criteriaOutputObjs[i].criteriaImportance

        if (importance == highImp) {
            highPriorityCount ++
        } else if (importance == medImp) {
            medPriorityCount ++
        } else if (importance == lowImp) {
            lowPriorityCount ++
        }
    }

    let scale = 100 / (10 * highPriorityCount + 5 * medPriorityCount + 1 * lowPriorityCount)           // edit score scaling here and ALSO in findAllScores()

    return scale
}


function findScore(criteria) {          // pass in criteriaOutputObject from kelseyCode.js
    let criteriaType = criteria.criteriaType
    let critStatObj = criteriaStats[criteriaType]
    let num = criteria.placeIds.length

    if (num <= critStatObj.avg) {
        score = 70 * Math.pow((num / critStatObj.avg), 2)
    } else if (num > critStatObj.avg && num <= critStatObj.max) {
        score = 70 + 30 * num / (critStatObj.max - critStatObj.avg)
    } else {
        score = 100
    }

    return score
}

function generateScoreObjects(criteriaOutputObjs) {         // runs individual scores, calculates final score, builds and outputs Score Report object
    let totalScore = 0
    let parameterInfoArray = []

    let scoreScale = calcScoreScale(criteriaOutputObjs)

    for (j = 0; j < criteriaOutputObjs.length; j ++) {
        let criteria = criteriaOutputObjs[j]
        let num = criteriaOutputObjs[j].placeIds.length
        let score = findScore(criteria)     //out of 100
        let priorityScale

        if (criteria.criteriaImportance == highImp) {
            priorityScale = 10
        } else if (criteria.criteriaImportance == medImp) {      // priority scaling
            priorityScale = 5
        } else if (criteria.criteriaImportance == lowImp) {
            priorityScale = 1
        }

        let adjustedScore = score * scoreScale * priorityScale / 100

        totalScore += adjustedScore
        
        let parameterObj = new ParameterInfo(criteria.criteriaType, criteria.criteriaImportance, num, score, adjustedScore)
        parameterInfoArray.push(parameterObj)
        
    }

    totalScore = Math.round(totalScore)
    let reportObject = new ReportObject(address, parameterInfoArray, totalScore, scoreScale)

    return reportObject
}