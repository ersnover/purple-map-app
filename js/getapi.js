//move variable creation to the main js file
const proxy = 'https://cors-anywhere.herokuapp.com/'
const apiKey = 'AIzaSyC0pSQy9ruAU0odyeOJDsdoPf6Pfsn4gFg'


//add onclick function here that triggers the getlatlong, etc

async function getGeoCodeObject() {
    //let addressInput = document.getElementById('address-input')
    let addressInput = '1800 North New Hampshire Ave, Los Angeles, CA, 90027'
    //should i just throw this in a function
    //might need to do other symbol replacing for url
    //let addressFormatted = (addressInput.value).replace(' ', '+')
    let addressFormatted = (addressInput).replace(' ', '+')
    let response = await fetch(`${proxy}https://maps.googleapis.com/maps/api/geocode/json?address=${addressFormatted}&key=${apiKey}`)
    return await response.json()
}

async function getLatLng(fetchJSON) {
    fetchJSON().then(function(jsonRes) {
        //have some timing issues
        let results = jsonRes['results'][0]
        let location = results['geometry']['location']
        console.log(location)
        // let lat = location[lat]
        // let lng = location[lng]
        // console.log(lat)
        // console.log(lng)
    })
}

getLatLng(getGeoCodeObject)



//pull address and save val as variable
//use geocode api to get the location lat long
//save lat long as separate variables
//create lat,long variable

// async function getResults() {
//     await fetch(`${proxy}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=29.625396,%20-95.350923&radius=1500&type=park&keyword=&key=${key}`).then(function (res) {
//         return res.json()
//     })
//     .then(function (data) {
//         console.log(data.results)
//     })
    
// }

//create empty variables for all parameters for the nearby places api
//pull preferenes and save vals as variables
//use nearby api to get ids of all nearby places

//use ids and place details api to get information for every nearby place (maybe)