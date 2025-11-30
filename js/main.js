async function selectDate(year, month, day) {
    const dateString = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    document.getElementById("selected-date").textContent =
        `Analisis jam terbang untuk ${dateString}`;

    const weather = await fetchWeather(dateString);
    if (!weather) return;

    const hourly = weather.hourly;
    const hours = hourly.time.map((t, i) => ({
        jam: t.split("T")[1],
        kecepatan: hourly.wind_speed_10m[i],
        arah: hourly.wind_direction_10m[i],
        gust: hourly.wind_gusts_10m[i],
        wmo: hourly.weather_code[i],
        vis: hourly.visibility[i]
    })).filter(h => parseInt(h.jam) >= 5 && parseInt(h.jam) <= 17);

    const results = hours.map(h => {
        const input = {
            jam: parseInt(h.jam),
            kecepatan_angin: h.kecepatan,
            gust_factor: h.gust / Math.max(h.kecepatan, 0.1),
            arah_angin: h.arah,
            kode_wmo: h.wmo,
            vis_depan: h.vis,
            vis_atas: h.vis / 100
        };

        const fuzz = fuzzifikasi(input);
        const omega = inferensi_probabilistik(fuzz);
        const pkc = defuzzifikasi_probabilistik(omega);

        let status = "bad";
        if (pkc >= 75) status = "good";
        else if (pkc >= 65) status = "medium";

        return {
            jam: h.jam,
            pkc,
            status
        };
    });

    renderHours(results);

    // 🔥 PENTING: munculkan grafik + ubah layout
    showGraphBox();
}

renderCalendar();
