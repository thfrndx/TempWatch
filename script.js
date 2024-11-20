const toggleBtn = document.querySelector('.toggle-btn')
const toggleBtnIcon = document.querySelector('.toggle-btn i')
const dropDownMenu = document.querySelector('.dropdown-menu')

toggleBtn.onclick = function () {
    dropDownMenu.classList.toggle('open')
    const isOpen = dropDownMenu.classList.contains('open')

    toggleBtnIcon.classList = isOpen
    ? 'fa-solid fa-xmark'
    : 'fa-solid fa-bars'
}

function getWeather() {
    const apiKey = '1cd57896802113e7b240f8d4c58ef4d7';
    const city = document.getElementById('city').value;
    const threshold = parseInt(document.getElementById('threshold').value); // Capture the threshold input

    if (!city) {
        alert('Please enter a city');
        return;
    }
    if (isNaN(threshold)) {
        alert('Please enter a valid temperature threshold');
        return;
    }

    document.getElementById('weather-info-box').style.display = 'block'; // Show weather info box

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    // Fetch and display current weather
    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data, threshold); // Pass the threshold to displayWeather
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    // Fetch and display forecast data
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data, threshold) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15); // Convert to Celsius
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `
            <p>${temperature}°C</p>
        `;

        const weatherHtml = `
            <p>${cityName}</p>
            <p>${description}</p>
        `;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;

        // Check if temperature exceeds threshold and notify
        if (temperature > threshold) {
            alert(`The temperature in ${cityName} has exceeded the ${threshold}°C threshold.`);
            
            // Request notification permission if not already granted
            if (Notification.permission === "granted") {
                showNotification(cityName, temperature, iconUrl);
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        showNotification(cityName, temperature, iconUrl);
                    }
                });
            }
        }

        showImage();
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    const next24Hours = hourlyData.slice(0, 8); // Display the next 24 hours (3-hour intervals)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hour = dateTime.getHours();
        const temperature = Math.round(item.main.temp - 273.15); // Convert to Celsius
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}

// Function to display the desktop notification
function showNotification(city, temp, icon) {
    const notification = new Notification("Temperature Alert!", {
        body: `The temperature in ${city} is now ${temp}°C, which exceeds your threshold.`,
        icon: icon
    });
}