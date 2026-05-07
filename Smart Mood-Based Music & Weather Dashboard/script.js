// 1. UPDATE THIS: Replace with your actual OpenWeatherMap API Key
const API_KEY = "be870e909ef5b95a4eaea97193fa1095"; 

const DEFAULT_LAT = 34.0522; 
const DEFAULT_LON = -118.2437;
let currentMood = localStorage.getItem('lastMood') || null;
let currentWeatherData = null;

// 2. FIXED: All YouTube links converted to /embed/ format for iframe compatibility
const musicRecommendations = {
    happy: {
        Clear: { playlist: "https://www.youtube.com/embed/vMfGJXKj6CY", theme: "theme-happy-clear", quote: "The sun always shines above the clouds." },
        Clouds: { playlist: "https://www.youtube.com/embed/1G57MBYrnlE", theme: "theme-happy-clouds", quote: "Joy is an inner sunshine." },
        Rain: { playlist: "https://www.youtube.com/embed/THQmE5CKDGw", theme: "theme-happy-rain", quote: "Life's not about waiting for the storm to pass, it's about learning to dance in the rain." },
        Snow: { playlist: "https://www.youtube.com/embed/H2fRcQquKsA", theme: "theme-happy-snow", quote: "Make your own little winter wonderland." },
        Default: { playlist: "https://www.youtube.com/embed/hJq3f83xI44", theme: "theme-happy-default", quote: "Every moment is a fresh beginning." }
    },
    sad: {
        Clear: { playlist: "https://www.youtube.com/embed/Jy-dLvnJaw8", theme: "theme-sad-clear", quote: "Tough times never last, but tough people do." },
        Clouds: { playlist: "https://www.youtube.com/embed/J1GerpUssss", theme: "theme-sad-clouds", quote: "A little time and distance changes everything." },
        Rain: { playlist: "https://www.youtube.com/embed/0zpy1V5OW9c", theme: "theme-sad-rain", quote: "The best way out is always through." },
        Snow: { playlist: "https://www.youtube.com/embed/ErYu_T3yM4Y", theme: "theme-sad-snow", quote: "Even the darkest night will end and the sun will rise." },
        Default: { playlist: "https://www.youtube.com/embed/-h_8ln2ms3g", theme: "theme-sad-default", quote: "It's okay to not be okay." }
    },
    relaxed: {
        Clear: { playlist: "https://www.youtube.com/embed/HCWvgoTfUjg", theme: "theme-relaxed-clear", quote: "Slow living and quiet moments." },
        Clouds: { playlist: "https://www.youtube.com/embed/m70d24MiCPA", theme: "theme-relaxed-clouds", quote: "Breathe. Nothing is urgent." },
        Rain: { playlist: "https://www.youtube.com/embed/A3NTY8AjzK8", theme: "theme-relaxed-rain", quote: "The sound of rain is music itself." },
        Snow: { playlist: "https://www.youtube.com/embed/CmHfWSxt0UQ", theme: "theme-relaxed-snow", quote: "Silence is a source of great strength." },
        Default: { playlist: "https://www.youtube.com/embed/dH6WRk3dafo", theme: "theme-relaxed-default", quote: "Find peace in the present moment." }
    },
    energetic: {
        Clear: { playlist: "https://www.youtube.com/embed/bD4kyNfzbgo", theme: "theme-energetic-clear", quote: "Go confidently in the direction of your dreams." },
        Clouds: { playlist: "https://www.youtube.com/embed/Ezsb5afVXQQ", theme: "theme-energetic-clouds", quote: "Energy flows where attention goes." },
        Rain: { playlist: "https://www.youtube.com/embed/TBP5kFOsqO8", theme: "theme-energetic-rain", quote: "The only way to do great work is to love what you do." },
        Snow: { playlist: "https://www.youtube.com/embed/6SFfS9QMloU", theme: "theme-energetic-snow", quote: "Turn the volume up and attack the day." },
        Default: { playlist: "https://www.youtube.com/embed/a7UvE2JxbPo", theme: "theme-energetic-default", quote: "Hustle and heart will set you apart." }
    }
};

const weatherIconMap = {
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Thunderstorm: '⛈️', Snow: '❄️', Drizzle: '🌦️', Mist: '🌫️', Default: '❓'
};

const elements = {
    city: document.getElementById('city-name'),
    temp: document.getElementById('temperature'),
    icon: document.getElementById('weather-icon'),
    desc: document.getElementById('weather-description'),
    musicPlayer: document.getElementById('music-player'),
    message: document.getElementById('recommendation-message'),
    quote: document.getElementById('daily-quote'),
    moodButtons: document.querySelectorAll('.mood-btn'),
    body: document.body
};

async function getStateFromCoordinates(lat, lon) {
    // Use Nominatim API (free reverse geocoding) to get state/province
    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        const response = await fetch(nominatimUrl);
        const data = await response.json();
        
        // Extract state/province from address components
        const address = data.address || {};
        const state = address.state || address.province || 'N/A';
        const country = address.country || 'N/A';
        
        return { state, country };
    } catch (error) {
        console.error("Failed to get state info:", error);
        return { state: 'N/A', country: 'N/A' };
    }
}

async function fetchWeather(lat, lon) {
    // 3. FIXED: URL construction with correct API_KEY variable
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Invalid API Response");
        
        const data = await response.json();
        
        // Get state and country information from reverse geocoding
        const { state, country } = await getStateFromCoordinates(lat, lon);
        
        currentWeatherData = {
            city: data.name,
            state: state,
            country: country,
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            main: data.weather[0].main,
            desc: data.weather[0].description,
            icon: weatherIconMap[data.weather[0].main] || weatherIconMap.Default,
            lat: data.coord.lat,
            lon: data.coord.lon
        };
        updateWeatherUI();
        updateDashboard();
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        handleWeatherError(error);
    }
}

function handleWeatherError(error) {
    elements.city.textContent = "Location Unavailable";
    // Fallback data for testing if API fails
    currentWeatherData = { 
        city: "Los Angeles", 
        state: "California",
        country: "United States",
        temp: 20, 
        feelsLike: 19,
        humidity: 65,
        windSpeed: 10,
        main: 'Clear', 
        desc: 'clear sky', 
        icon: '☀️',
        lat: 34.0522,
        lon: -118.2437
    };
    updateWeatherUI();
    updateDashboard();
}

function updateWeatherUI() {
    if (!currentWeatherData) return;
    
    // Display complete location: City, State, Country
    const locationText = currentWeatherData.state && currentWeatherData.state !== 'N/A' 
        ? `${currentWeatherData.city}, ${currentWeatherData.state}, ${currentWeatherData.country}`
        : `${currentWeatherData.city}, ${currentWeatherData.country}`;
    
    elements.city.textContent = locationText;
    elements.temp.textContent = `${currentWeatherData.temp}°C`;
    elements.icon.textContent = currentWeatherData.icon;
    elements.desc.textContent = `${currentWeatherData.desc} | Humidity: ${currentWeatherData.humidity}% | Wind: ${currentWeatherData.windSpeed} km/h`;
}

function getGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(DEFAULT_LAT, DEFAULT_LON)
        );
    } else {
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
    }
}

function updateDashboard() {
    if (!currentMood || !currentWeatherData) return;

    localStorage.setItem('lastMood', currentMood);
    const weatherKey = musicRecommendations.happy[currentWeatherData.main] ? currentWeatherData.main : 'Default';
    const recommendation = musicRecommendations[currentMood][weatherKey] || musicRecommendations[currentMood].Default;

    elements.musicPlayer.src = recommendation.playlist;
    elements.message.textContent = `Enjoy this ${currentMood} vibe in ${currentWeatherData.main.toLowerCase()} weather!`;
    elements.body.className = recommendation.theme;
    elements.quote.textContent = recommendation.quote;
}

function handleMoodSelection(selectedMood) {
    currentMood = selectedMood;
    elements.moodButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === selectedMood);
    });
    updateDashboard();
}

function init() {
    elements.moodButtons.forEach(btn => {
        btn.addEventListener('click', () => handleMoodSelection(btn.dataset.mood));
    });

    handleMoodSelection(currentMood || 'relaxed');
    getGeolocation();
}

init();