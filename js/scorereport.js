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

let obj1 = new ParameterInfo('park', 'very important', 15, 90)
let obj2 = new ParameterInfo('bus_stop', 'important', 15, 85)
let obj3 = new ParameterInfo('supermarket', 'somewhat important', 12, 75)
let obj4 = new ParameterInfo('atm', 'somewhat important', 20, 100)
let parameterInfoArray = [obj1,obj4,obj2,obj3]
let algorithmObject = new AlgorithmObject('123 main st, Houston TX', parameterInfoArray, 98)

//end test data

let scoreAddress = algorithmObject['address']
let score = algorithmObject['score']
let parameterInfo = algorithmObject['parameterInfo']

function determineImportanceClass(parameterImportance) {
    if (parameterImportance == 'very important') {
        return 'very-important'
    } else if (parameterImportance == 'important') {
        return 'important'
    } else if (parameterImportance == 'somewhat important') {
        return 'somewhat-important'
    }
}

//score
let addressHeader = document.getElementById('address-header')
addressHeader.innerHTML = `${scoreAddress}`
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
let closeBtn = document.getElementsByClassName('close')[0]
closeBtn.onclick = function(){
    detailParameterModal.style.display = "none";
}
//style things

//maybe have visual indicator of importance of each parameter
//maybe have credit score circle with red to green scale
//would have to add classes to divs accordingly and popualte image accordingly