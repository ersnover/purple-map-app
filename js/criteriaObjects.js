const highImp = "Very Important"
const medImp = "Important"
const lowImp = "Slightly Important"
// edit importance displays here

class CriteriaInputObj {
    constructor(type, importance) {
        this.type = type
        this.importance = importance
    }
}
class CriteriaOutputObj {
    constructor(type, importance, placeIds) {
        this.type = type
        this.importance = importance
        this.placeIds = placeIds
    }
}

class ReportObject {                    // used in building of score report
    constructor(address, criteriaInfoArray, score, scale) {
        this.address = address
        this.criteriaInfoArray = criteriaInfoArray
        this.score = score
        this.scale = scale
    }
}

class ParameterInfo {
    constructor(type, importance, number, score, tSC) {
        this.type = type
        this.importance = importance
        this.number = number
        this.score = score
        this.totalScoreContribution = tSC
    }
}
const criteriaStats = {     ///// can potentially add radius modifiers to diving locations like grocery stores

    restaurant: 
    {
        googleidname: "restaurant",
        placeDisplayName: "Restaurants",
        avg: 13.16,
        max: 20
    },

    park:
    {
        googleidname: "park",
        placeDisplayName: "Parks",
        avg: 3.88,
        max: 20
    },
    
    bar:
    {
        googleidname: "bar",
        placeDisplayName: "Bars",
        avg: 7.28,
        max:20
    },
    gym:
    {
        googleidname: "gym",
        placeDisplayName: "Gyms",
        avg: 6.88,
        max: 20
    },
    atm:
    {
        googleidname: "atm",
        placeDisplayName: "ATMs",
        avg: 9.64,
        max: 20
    },
    convenience_store:
    {
        googleidname: "convenience_store",
        placeDisplayName: "Convenience Stores",
        avg: 4.92,
        max: 20
    },
    bus_station:
    {
        googleidname: "bus_station",
        placeDisplayName: "Bus Stations",
        avg: 13.4,
        max: 20
    },
    liquor_store:
    {
        googleidname: "liquor_store",
        placeDisplayName: "Liquor Stores",
        avg: 1.92,
        max: 15
    },
    post_office:
    {
        googleidname: "post_office",
        placeDisplayName: "Post Offices",
        avg: 0.4,
        max: 2
    },
    supermarket:
    {
        googleidname: "supermarket",
        placeDisplayName: "Supermarkets",
        avg: 0.8,
        max: 5
    }
}