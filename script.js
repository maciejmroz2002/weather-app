const colorModeButton = document.querySelector('[data-color-mode-button]')
const mainContainer = document.querySelector('[data-main-container]')
const weatherIcons = document.querySelectorAll("[class='info-icon']")
const gifPopUpButton = document.querySelector('[data-gif-for-today-button]')
const historyPopUpButton = document.querySelector('[data-history-button]')
const content = document.getElementById('content')
const popUpTemplate = document.getElementById('pop-up-template')
const gifTitleTemplate = document.getElementById('gif-title-template')
const menuButton = document.querySelector('[data-menu-button]')
const nav = document.getElementById('nav')
const menu = document.getElementById('menu')
const closeMenuButton = document.getElementById('close-menu-button')
const weatherInfo = document.getElementById('weather-info')
const cityInput = document.querySelector('[data-city-input]')
const citySearchButton = document.querySelector('[data-city-button]')
const cityForm = document.querySelector('[data-city-form]')
const menuWeatherTemplate = document.getElementById('menu-weather-template')
const navIcon = document.getElementById('nav-icon')
const infoTemp = document.getElementById('info-temp')
const infoCity = document.getElementById('info-city')
const infoTime = document.getElementById('info-time')
const infoDay = document.getElementById('info-day')
const cityTemplate = document.getElementById('city-template')


let colorMode = 'Light Mode'
let actualWeather = {}
let actualCity = ''
let actualTag = 'weather'


cityForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const inputValue = cityInput.value;
    if (inputValue !== '' || inputValue !== null) {
        getWeatherInfo(inputValue)
    }
    cityInput.value = ''
})

closeMenuButton.addEventListener('click', (e) => {
    closeMenu()
    showNav()
})

menuButton.addEventListener('click', (e) => {
    hideNav()
    showMenu()
})

colorModeButton.addEventListener('click', (e) => {
    changeMode()
})

gifPopUpButton.addEventListener('click', (e) => {
    createPopup()
    renderGifAddon()
})

historyPopUpButton.addEventListener('click', (e) => {
    createPopup()
    renderHistoryAddon()
})

function showNav() {
    nav.classList.remove('hide')
}

function closeMenu() {
    menu.style.width = '0'
}

function hideNav() {
    nav.classList.add('hide')
}

function showMenu() {
    menu.style.width = 'clamp(305px, 50vw, 400px)'
}

function createPopup() {
    const popTemplate = document.importNode(popUpTemplate.content, true)
    content.classList.add('blur')
    document.body.insertBefore(popTemplate, content)
    const closePopUpButton = document.getElementById('close-pop-up-button')
    const popUp = document.querySelector('[data-pop-up]')
    closePopUpButton.addEventListener('click', (e) => {
        document.body.removeChild(popUp)
        content.classList.remove('blur')
    })
    popUp.addEventListener('click', (e) => {
        if (e.target.id === 'pop-up-area') {
            document.body.removeChild(popUp)
            content.classList.remove('blur')
        }
    })
    
}

function renderHistoryAddon() {
    const title = document.getElementById('pop-up-title')
    title.innerText = 'This day in history'
    const content = document.getElementById('pop-up-content')
    content.classList.add('history-addon')
    renderHistory(content)
}

async function renderHistory(place){
    const response = await fetch("http://history.muffinlabs.com/date/4/30", {mode: 'cors'})
    const historyData = await response.json()
    const randomEvent = historyData.data.Events[Math.floor(Math.random() * historyData.data.Events.length)]
    console.log(historyData)
    place.innerHTML = ''

    const dateDOM = document.createElement('p')
    dateDOM.innerText = `${randomEvent.year} ${historyData.date}`

    const infoDOM = document.createElement('p')
    infoDOM.innerText = randomEvent.text
    console.log(randomEvent)

    place.appendChild(dateDOM)
    place.appendChild(infoDOM)
}

function renderGifAddon() {
    const title = document.getElementById('pop-up-title')
    const gifTitle = document.importNode(gifTitleTemplate.content, true)
    title.appendChild(gifTitle)

    const content = document.getElementById('pop-up-content')
    const gif  = document.getElementById('pop-up-img')

    const refreshGifButton = document.getElementById('refresh-gif-button')
    refreshGifButton.addEventListener('click', (e) => {
        showGif(gif, actualTag)
    })

    showGif(gif, actualTag)

    
    content.appendChild(gif)
}


async function showGif(place, tag){
    place.src = './img/load.svg'
    const response = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=6yeY3YPDG1OXiV29Hdz7OIzNoQblZ77p&s=${tag}`, {mode: 'cors'})
    const gifData = await response.json()
    place.src = gifData.data.images.original.url;
}

async function getWeatherInfo(city){
    weatherInfo.innerHTML = '<img src="./img/load.svg" class="weather-loading"></img>'
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=5d6de995ae2c0fcd78be086f3fd12ebd`)
    const weatherInformations = await response.json()
    await processWeather(weatherInformations)
    await renderWeather()
    console.log(weatherInformations)
}

function renderWeather() {
    weatherInfo.innerHTML = ''
    const template =  document.importNode(menuWeatherTemplate.content, true)
    const cityName = template.getElementById('city-name')
    const menuIcon = template.getElementById('menu-icon')
    const cityHour = template.getElementById('city-hour')
    if (actualWeather.error === true) {
        cityName.innerText = actualWeather.city
        navIcon.src = './img/err.gif'
        menuIcon.src = './img/err.gif'
        weatherInfo.appendChild(template)

        return
    }
    cityName.innerText = actualWeather.city
    console.log(actualWeather)
    cityHour.innerText = actualWeather.time
    navIcon.src = actualWeather.icon
    content.style.background = actualWeather.img
    actualTag = actualWeather.mood
    menuIcon.src = actualWeather.icon
    infoCity.innerText = actualWeather.city
    infoTemp.innerText = actualWeather.temp
    infoTime.innerText = actualWeather.time
    infoDay.innerText = actualWeather.date

    if (colorMode === 'Light Mode' && actualWeather.night) {
        changeMode()
    } else if (colorMode === 'Dark Mode' && actualWeather.night === false) {
        changeMode()
    }
    

    weatherInfo.appendChild(template)
}

function processWeather(obj) {
    if (obj.cod === '404') {
        actualWeather = { 
            city: 'City not found',
            error: true
        }
        return
    }
    console.log(obj.weather[0])
    let weather
    if (obj.weather[0].icon === '50d'){
        weather = 'clouds'
    } else if (obj.weather[0].main === 'Drizzle') {
        weather = 'rain'
    } else {
        weather = obj.weather[0].main.toLowerCase()
    }

    const now = getTimeFromCity(obj.timezone)
    const hoursAndMinutes =
  padTo2Digits(now.getHours()) + ':' + padTo2Digits(now.getMinutes());
    const date = now.getUTCDate() + '/' + (now.getUTCMonth() + 1) + '/' + now.getUTCFullYear()

    let mood
    let dayPart
    let nightOrDay
    const hhInit = parseInt(hoursAndMinutes)

    if (hhInit > 20 || hhInit < 5) {
        nightOrDay = 'night'
        dayPart = 'night'
    } else if (hhInit > 18) {
        nightOrDay = 'day'
        dayPart = 'evening'
    } else if (hhInit < 7) {
        nightOrDay = 'day'
        dayPart = 'morning'
    } else {
        nightOrDay = 'day'
        dayPart = 'day'
    }

    if (weather === 'storm') { mood = 'storm' 
    } else if (weather === 'snow') { mood = 'snow' 
    } else if (dayPart === 'night'){
        if (weather === 'rain') {
            mood = 'night-rain'
        } else {
            mood = 'night'
        }
    } else {
        mood = `${dayPart}-${weather}`
    }

    let night = false
    if (nightOrDay === 'night') {
        night = true
    }

    let icon
    if (mood === 'night') {
        icon = 'night'
    } else if (weather === 'clear'){
        icon = 'sun'
    } else {
        icon = weather
    }

    

    actualWeather = {
        city: obj.name,
        error: false,
        temp: `${Math.floor(obj.main.temp - 273.15)}°`,
        weather: weather,
        date: date,
        time: hoursAndMinutes,
        mood: icon,
        icon: `./img/weather-icons/${icon}-icon.gif`,
        img: `url(./img/${mood}.jpg)`,
        night: night
    }
}

function padTo2Digits(num) {
    return String(num).padStart(2, '0');
  }

function getTimeFromCity(timezone) {
    d = new Date()
    localTime = d.getTime()
    localOffset = d.getTimezoneOffset() * 60000
    utc = localTime + localOffset
    var atlanta = utc + (1000 * timezone)
    nd = new Date(atlanta)
    return nd
}

function changeMode() {
    if (colorMode === 'Light Mode') {
        colorMode = 'Dark Mode'
        renderModeButton('Light Mode')
        document.documentElement.style.setProperty('--background-color', 'black')
        document.documentElement.style.setProperty('--translucent-color', '#0000009f')
        document.documentElement.style.setProperty('--font-color', 'rgb(119, 119, 119)')
        document.documentElement.style.setProperty('--decoration-color', 'rgb(27, 56, 63)')
        mainContainer.style.background = '#000000a5'
        weatherIcons.forEach(element => {
            element.style.opacity = '70%'
        });
    } else {
        colorMode = 'Light Mode'
        renderModeButton('Dark Mode')
        document.documentElement.style.setProperty('--background-color', 'white')
        document.documentElement.style.setProperty('--translucent-color', '#ffffff54')
        document.documentElement.style.setProperty('--font-color', 'black')
        document.documentElement.style.setProperty('--decoration-color', 'rgb(97, 162, 179)')
        mainContainer.style.background = ''
        weatherIcons.forEach(element => {
            element.style.opacity = '100%'
        });
    }
}



function renderModeButton(nextMode) {
    colorModeButton.innerText = nextMode
}

function loadSearchPopup() {
    const popupTemplate = document.importNode(cityTemplate.content, true)
    content.classList.add('blur')
    
    document.body.insertBefore(popupTemplate, content)
    const cityPopupInput = document.querySelector('[data-popup-city-input]')
    const cityForm = document.querySelector('[data-pop-up-city-form]')
    
    cityForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const popUp = document.querySelector('[data-city-pop-up]')
        document.body.removeChild(popUp)
        content.classList.remove('blur')
        const inputValue = cityPopupInput.value;
        if (inputValue !== '' || inputValue !== null) {
            getWeatherInfo(inputValue)
        }
    })
}

loadSearchPopup()


// const img = document.querySelector('[data-image]');
// const tagForm = document.querySelector('[data-tag-form]')
// const tagInput = document.querySelector('[data-tag-input]')

// tagForm.addEventListener('submit', (e) => {
//     e.preventDefault()
//     showGif(tagInput.value)
// })

// async function showGif(tag){
//     img.src = './loading.gif'
//     const response = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=6yeY3YPDG1OXiV29Hdz7OIzNoQblZ77p&s=${tag}`, {mode: 'cors'})
//     const gifData = await response.json()
//     img.src = gifData.data.images.original.url;
// }

// showGif(tagInput.value)
