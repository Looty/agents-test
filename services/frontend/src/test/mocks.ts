export const mockWeatherData = {
    location: {
        name: 'London',
        region: 'City of London, Greater London',
        country: 'United Kingdom',
        lat: 51.52,
        lon: -0.11,
        tz_id: 'Europe/London',
        localtime_epoch: 1705939200,
        localtime: '2024-01-22 14:00',
    },
    current: {
        temp_c: 12.0,
        temp_f: 53.6,
        condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            code: 1003,
        },
        wind_kph: 20.2,
        wind_mph: 12.5,
        humidity: 82,
        uv: 2,
        feelslike_c: 10.5,
        feelslike_f: 50.9,
    },
    forecast: {
        forecastday: [
            {
                date: '2024-01-22',
                day: {
                    maxtemp_c: 14.0,
                    maxtemp_f: 57.2,
                    mintemp_c: 8.0,
                    mintemp_f: 46.4,
                    daily_chance_of_rain: 30,
                    condition: {
                        text: 'Partly cloudy',
                        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                    },
                },
            },
            {
                date: '2024-01-23',
                day: {
                    maxtemp_c: 13.0,
                    maxtemp_f: 55.4,
                    mintemp_c: 7.0,
                    mintemp_f: 44.6,
                    daily_chance_of_rain: 60,
                    condition: {
                        text: 'Rainy',
                        icon: '//cdn.weatherapi.com/weather/64x64/day/308.png',
                    },
                },
            },
            {
                date: '2024-01-24',
                day: {
                    maxtemp_c: 11.0,
                    maxtemp_f: 51.8,
                    mintemp_c: 6.0,
                    mintemp_f: 42.8,
                    daily_chance_of_rain: 10,
                    condition: {
                        text: 'Sunny',
                        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                    },
                },
            },
            {
                date: '2024-01-25',
                day: {
                    maxtemp_c: 15.0,
                    maxtemp_f: 59.0,
                    mintemp_c: 9.0,
                    mintemp_f: 48.2,
                    daily_chance_of_rain: 5,
                    condition: {
                        text: 'Clear',
                        icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
                    },
                },
            },
            {
                date: '2024-01-26',
                day: {
                    maxtemp_c: 16.0,
                    maxtemp_f: 60.8,
                    mintemp_c: 10.0,
                    mintemp_f: 50.0,
                    daily_chance_of_rain: 15,
                    condition: {
                        text: 'Partly cloudy',
                        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                    },
                },
            },
        ],
    },
};

export const mockSearchResults = [
    {
        id: 2801268,
        name: 'London',
        region: 'City of London, Greater London',
        country: 'United Kingdom',
        lat: 51.52,
        lon: -0.11,
        url: 'london-city-of-london-greater-london-united-kingdom',
    },
    {
        id: 315398,
        name: 'London',
        region: 'Ontario',
        country: 'Canada',
        lat: 42.98,
        lon: -81.25,
        url: 'london-ontario-canada',
    },
    {
        id: 2648245,
        name: 'Londonderry',
        region: 'Londonderry',
        country: 'United Kingdom',
        lat: 55.0,
        lon: -7.32,
        url: 'londonderry-londonderry-united-kingdom',
    },
];
