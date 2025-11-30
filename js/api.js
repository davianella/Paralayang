async function fetchWeather(dateString) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=-7.87&longitude=112.5283&timezone=Asia%2FJakarta&start_date=${dateString}&end_date=${dateString}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,visibility`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request gagal");

        return await res.json();

    } catch (err) {
        console.error(err);
        alert("❌ Gagal mengambil data cuaca.\nCoba lagi atau cek internet.");
        return null;
    }
}
