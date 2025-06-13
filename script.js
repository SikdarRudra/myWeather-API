const data = document.getElementById("name");
const btn = document.getElementById("search");
const display = document.getElementById('preview');
const container = document.querySelector('.container');
let weatherSummary = [];
let cities = [];


init();

async function init() {
    await loadCityData();
    setupAutocomplete();
}

async function loadCityData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json');
        cities = await response.json();
    } catch (error) {
        console.error("Couldn't load city data:", error);
    }
}

function setupAutocomplete() {
    data.addEventListener("input", function(e) {
        const val = this.value.trim();
        closeAllLists();
        
        if (!val) return false;
        
        const matches = cities.filter(city => 
            city.name.toLowerCase().includes(val.toLowerCase())
        ).slice(0, 5);
        
        if (matches.length) {
            const autocompleteList = document.createElement("div");
            autocompleteList.setAttribute("class", "autocomplete-items");
            autocompleteList.setAttribute("id", "autocomplete-list");
            
            matches.forEach(match => {
                const item = document.createElement("div");
                item.innerHTML = `<strong>${match.name}</strong>, ${match.country}`;
                item.addEventListener("click", function() {
                    data.value = match.name;
                    closeAllLists();

                    container.classList.add('hide-autocomplete');
                    call();
                });
                autocompleteList.appendChild(item);
            });
            
            this.parentNode.appendChild(autocompleteList);
        }
    });
    
    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt !== items[i] && elmnt !== data) {
                items[i].parentNode.removeChild(items[i]);
            }
        }
    }
    
    document.addEventListener("click", function(e) {
        closeAllLists(e.target);
    });
}

async function getWeather(city) {
    const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=06fe4643c554479599a45359251106&q=${city}&aqi=yes`
    );
    if (!response.ok) {
        throw new Error('City not found');
    }
    return await response.json();
}

async function call() {
    const Val = data.value.trim();
    if (!Val) return;
    
    
    container.classList.add('loading');
    display.innerHTML = `<div class="loading-text">Fetching weather data for ${Val}...</div>`;
    
    try {
        const weather = await getWeather(Val);
        weatherSummary = [
            {
                locals: {
                    location: weather.location.name,
                    Region: weather.location.region,
                    country: weather.location.country,
                    localTime: weather.location.localtime,
                },
                temperature: {
                    weatherIcon: weather.current.condition.icon,
                    temp_DC: weather.current.temp_c,
                    temp_DF: weather.current.temp_f,
                    feelsLike: weather.current.feelslike_c,
                    Humidity: weather.current.humidity,
                    wind: weather.current.wind_mph,
                    cloud: weather.current.cloud,
                    windSpeed: weather.current.wind_mph,
                    condition: weather.current.condition.text,
                },
                airQuality: weather.current.air_quality ? {
                    carbonMonoxide: {
                        label: "CO",
                        value: weather.current.air_quality.co.toFixed(2),
                        unit: "µg/m³",
                    },
                    nitrogenDioxide: {
                        label: "NO₂",
                        value: weather.current.air_quality.no2.toFixed(2),
                        unit: "µg/m³",
                    },
                    ozone: {
                        label: "O₃",
                        value: weather.current.air_quality.o3.toFixed(2),
                        unit: "µg/m³",
                    },
                    sulphurDioxide: {
                        label: "SO₂",
                        value: weather.current.air_quality.so2.toFixed(2),
                        unit: "µg/m³",
                    },
                    particulateMatter25: {
                        label: "PM2.5",
                        value: weather.current.air_quality.pm2_5.toFixed(2),
                        unit: "µg/m³",
                    },
                    particulateMatter10: {
                        label: "PM10",
                        value: weather.current.air_quality.pm10.toFixed(2),
                        unit: "µg/m³",
                    },
                } : null,
            },
        ];
        
        renderWeather();
    } catch (error) {
        display.innerHTML = `<p class="error">Error: ${error.message}. Please try another city.</p>`;
        console.error("Error fetching weather data:", error);
    } finally {
        
        container.classList.remove('loading');
        container.classList.add('hide-autocomplete');
    }
}

function renderWeather() {
    const weather = weatherSummary[0];
    const aqi = weather.airQuality;
    
    display.innerHTML = `
        <div class="weather-grid">
            <div class="weather-section">
                <h3>📍 Location</h3>
                <p><strong>City:</strong> ${weather.locals.location}</p>
                <p><strong>Region:</strong> ${weather.locals.Region}</p>
                <p><strong>Country:</strong> ${weather.locals.country}</p>
                <p><strong>Local Time:</strong> ${weather.locals.localTime}</p>
            </div>
            
            <div class="weather-section">
                <h3>🌡️ Current Weather</h3>
                <div style="display: flex; align-items: center;">
                    <img src="https:${weather.temperature.weatherIcon}" alt="Weather Icon">
                    <div style="margin-left: 15px;">
                        <p style="font-size: 2rem; font-weight: bold;">${weather.temperature.temp_DC}°C</p>
                        <p>${weather.temperature.condition}</p>
                    </div>
                </div>
                <p><strong>Feels Like:</strong> ${weather.temperature.feelsLike}°C</p>
                <p><strong>Humidity:</strong> ${weather.temperature.Humidity}%</p>
                <p><strong>Wind Speed:</strong> ${weather.temperature.windSpeed} mph</p>
                <p><strong>Cloud Cover:</strong> ${weather.temperature.cloud}%</p>
            </div>
            
            ${aqi ? `
            <div class="weather-section">
                <h3>🌬️ Air Quality</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <p><strong>${aqi.carbonMonoxide.label}:</strong> ${aqi.carbonMonoxide.value} ${aqi.carbonMonoxide.unit}</p>
                        <p><strong>${aqi.nitrogenDioxide.label}:</strong> ${aqi.nitrogenDioxide.value} ${aqi.nitrogenDioxide.unit}</p>
                        <p><strong>${aqi.ozone.label}:</strong> ${aqi.ozone.value} ${aqi.ozone.unit}</p>
                    </div>
                    <div>
                        <p><strong>${aqi.sulphurDioxide.label}:</strong> ${aqi.sulphurDioxide.value} ${aqi.sulphurDioxide.unit}</p>
                        <p><strong>${aqi.particulateMatter25.label}:</strong> ${aqi.particulateMatter25.value} ${aqi.particulateMatter25.unit}</p>
                        <p><strong>${aqi.particulateMatter10.label}:</strong> ${aqi.particulateMatter10.value} ${aqi.particulateMatter10.unit}</p>
                    </div>
                </div>
            </div>
            ` : '<div class="weather-section"><h3>🌬️ Air Quality</h3><p>Air quality data not available for this location</p></div>'}
        </div>
    `;
}

data.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        call();
    }
});

data.addEventListener("input", function() {

    container.classList.remove('hide-autocomplete');
});

btn.addEventListener("click", call);