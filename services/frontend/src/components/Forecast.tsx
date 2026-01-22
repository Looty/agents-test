"use client";

type Props = {
    data: any;
    unit: "metric" | "imperial";
};

export default function Forecast({ data, unit }: Props) {
    if (!data || !data.forecast) return null;

    const days = data.forecast.forecastday || [];

    return (
        <section aria-labelledby="forecast" className="w-full">
            <h3 id="forecast" className="text-2xl font-bold text-white mb-4">5-Day Forecast</h3>
            <div className="grid grid-cols-1 gap-4">
                {days.map((d: any) => (
                    <div key={d.date} className="flex items-center justify-between rounded-xl bg-white/20 p-4 backdrop-blur-lg text-white">
                        <div className="w-1/4 font-semibold">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'long' })}</div>
                        <div className="w-1/4 flex items-center justify-center">
                            <img src={d.day.condition.icon} alt={d.day.condition.text} className="w-10 h-10" />
                        </div>
                        <div className="w-1/4 text-center text-sm hidden sm:block">{d.day.condition.text}</div>
                        <div className="w-1/4 text-right font-semibold">{unit === "metric" ? `${Math.round(d.day.maxtemp_c)}° / ${Math.round(d.day.mintemp_c)}°` : `${Math.round(d.day.maxtemp_f)}° / ${Math.round(d.day.mintemp_f)}°`}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
