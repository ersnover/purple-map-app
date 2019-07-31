//test data

//potentially restructure code so that we have an internal api name to display name conversion for the google nearby place types like 'park'

class AlgorithmObject {
    constructor(address, parameterInfoArray, score) {
        this.address = address
        this.parameterInfo = parameterInfoArray
        this.score = score
    }
}

class ParameterInfo {
    constructor(type, importance, number, score) {
        this.type = type
        this.importance = importance
        this.number = number
        this.score = score
    }
}

let obj1 = new ParameterInfo('park', 'important', 15, 90)
let obj2 = new ParameterInfo('bus_stop', 'important', 15, 85)
let parameterInfoArray = [obj1,obj2]
let algorithmObject = new AlgorithmObject('123 main st', parameterInfoArray, 98)

//end test data

let scoreAddress = algorithmObject['address']
let score = algorithmObject['score']
let parameterInfo = algorithmObject['parameterInfo']


//DOM
let addressHeader = document.getElementById('address-header')
addressHeader.innerHTML = `${scoreAddress}`
let scoreHeader = document.getElementById('score-header')
scoreHeader.innerHTML = `${score}`

//DOM2
let detailScoreContainer = document.getElementById('detail-score-container')

//add class "toTitleCase"

let detailScoreArray =[]
parameterInfo.forEach(function(parameterObj) { //change the type name
    function generateDiv(parameterObj) {
        let type = parameterObj['type']
        //remove underscores
        if (parameterObj['importance'] == 'very important') {
            return `<div class="parameter-container very-important">
                        <h3>${type}</h3>
                        <h2>${parameterObj['score']}</h2>
                    </div>`
        } else if (parameterObj['importance'] == 'important') {
            return `<div class="parameter-container important">
                        <h3>${type}</h3>
                        <h2>${parameterObj['score']}</h2>
                    </div>`
        } else if (parameterObj['importance'] == 'somewhat important') {
            return `<div class="parameter-container somewhat-important">
                        <h3>${type}</h3>
                        <h2>${parameterObj['score']}</h2>
                    </div>`
        }
    }
    let div = generateDiv(parameterObj)
    detailScoreArray.push(div)
})
detailScoreContainer.innerHTML = detailScoreArray.join('')


//maybe have visual indicator of importance of each parameter
//maybe have credit score circle with red to green scale
//would have to add classes to divs accordingly and popualte image accordingly