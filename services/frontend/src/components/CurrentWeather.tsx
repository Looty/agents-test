"use client";

type Props = {
    data: any;
    unit: "metric" | "imperial";
};

export default function CurrentWeather({ data, unit }: Props) {
    if (!data) return null;

    const current = data.current;
    const temp = unit === "metric" ? `${current.temp_c}°C` : `${current.temp_f}°F`;
    const wind = unit === "metric" ? `${current.wind_kph} km/h` : `${current.wind_mph} mph`;

    return (
        <section aria-labelledby="current-weather" className="w-full rounded-3xl bg-white/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white">
            <h2 id="current-weather" className="sr-only">Current Weather</h2>
            <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-center sm:text-left">
                    <div className="text-7xl sm:text-8xl font-bold tracking-tighter">{temp}</div>
                    <div className="mt-2 text-xl sm:text-2xl font-medium">{current.condition.text}</div>
                    <p className="mt-4 text-md text-white/80">{`Feels like ${unit === "metric" ? `${current.feelslike_c}°C` : `${current.feelslike_f}°F`}`}</p>
                </div>
                <div className="mt-6 sm:mt-0 sm:ml-8 flex-shrink-0">
                    <img src={current.condition.icon} alt={current.condition.text} width={120} height={120} />
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-md text-white/80 grid grid-cols-3 gap-4 text-center">
                <div>
                    <span className="font-semibold">Wind</span>
                    <span className="block">{wind}</span>
                </div>
                <div>
                    <span className="font-semibold">Humidity</span>
                    <span className="block">{current.humidity}%</span>
                </div>
                <div>
                    <span className="font-semibold">UV Index</span>
                    <span className="block">{current.uv}</span>
                </div>
            </div>
        </section>
    );
}
