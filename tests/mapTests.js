//api calls
function logStuff(objectArray) {
    console.clear()
    for (let i=0; i<objectArray.length; i++) {
        let search = objectArray[i]
        console.log(search.type, search.placeIds.length)
    }
}



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

async function fetchPlaces(latlng, criteriaType, radius) {
    let response = await fetch(`${config.proxy}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latlng}&radius=${radius}&type=${criteriaType}&keyword=&key=${config.apiKey}`)
    return await response.json()
}

class CriteriaOutput {
    constructor(type, radius, placeIds) {
        this.type = type
        this.radius = radius
        this.placeIds = placeIds
    }
}

async function getPlaces(address, criteriaArray, radiusArray) {
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
        radiusArray.forEach(radius => {
            let promise = fetchPlaces(latlng, criteriaType, radius)
            promisesCriteria.push([criteriaType, radius])
            promises.push(promise)
        })
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
            let searchRadius = promisesCriteria[i][1]
            let placeIds = pushPlaceIds(promiseArray[i])
            let criteriaOutputObj = new CriteriaOutput(criteriaType, searchRadius, placeIds)
            criteriaOutputObjs.push(criteriaOutputObj)
        }

    }).then(function(obj) {
        logStuff(criteriaOutputObjs)
        return criteriaOutputObjs 
    })
}


const goButton = document.getElementById('goButton')
const addressField = document.getElementById("addressField")


goButton.addEventListener('click', () => {

    let address = addressField.value
    addressField.value = ""
    

    let criteriaArray = [
        {
            type: "school",
        },
        {
            type: "bar",
        }
    ]
    let radiusArray = [1000]        // can enter more radii here


    getPlaces(address, criteriaArray, radiusArray)
})