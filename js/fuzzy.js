// ===============================================
// fuzzy.js
// Implementasi 1:1 dari logika fuzzy probabilistik
// (versi JavaScript dari kode Python yang kamu kirim)
// ===============================================

// Helper clamp 0-1
function clip01(x) {
    if (x < 0) return 0;
    if (x > 1) return 1;
    return x;
}

// ===============================
// 1. Fungsi Keanggotaan
// ===============================

// keanggotaan waktu terbang
function mu_waktu(jam) {
    jam = ((jam % 24) + 24) % 24; // normalisasi

    let terang;
    if (jam >= 5 && jam <= 17) {
        terang = 1.0;
    } else if (jam >= 4 && jam < 5) {
        terang = (jam - 4) / (5 - 4);
    } else if (jam > 17 && jam <= 18) {
        terang = (18 - jam) / (18 - 17);
    } else {
        terang = 0.0;
    }

    terang = clip01(terang);
    let gelap = clip01(1 - terang);

    return {
        terang: terang,
        gelap: gelap
    };
}

// keanggotaan kecepatan angin (km/h)
function mu_kecepatan(kmh) {
    kmh = Number(kmh) || 0;

    let rendah, cukup, tinggi;

    if (kmh <= 0) {
        rendah = 1.0;
    } else if (kmh > 0 && kmh < 4) {
        rendah = (4 - kmh) / 4;
    } else {
        rendah = 0.0;
    }

    if (kmh > 0 && kmh < 4) {
        cukup = (kmh - 0) / (4 - 0);
    } else if (kmh >= 4 && kmh < 16) {
        cukup = (16 - kmh) / (16 - 4);
    } else {
        cukup = 0.0;
    }

    if (kmh <= 15) {
        tinggi = 0.0;
    } else if (kmh > 15 && kmh < 20) {
        tinggi = (kmh - 15) / (20 - 15);
    } else {
        tinggi = 1.0;
    }

    return {
        rendah: clip01(rendah),
        cukup: clip01(cukup),
        tinggi: clip01(tinggi)
    };
}

// keanggotaan gust factor
function mu_gust(g) {
    g = Number(g) || 0;

    let stabil, fluktuatif, berbahaya;

    if (g <= 1.0) {
        stabil = 1.0;
    } else if (g > 1.0 && g < 1.2) {
        stabil = (1.2 - g) / (1.2 - 1.0);
    } else {
        stabil = 0.0;
    }

    if (g > 1.1 && g < 1.3) {
        fluktuatif = (g - 1.1) / (1.3 - 1.1);
    } else if (g >= 1.3 && g < 1.5) {
        fluktuatif = (1.5 - g) / (1.5 - 1.3);
    } else {
        fluktuatif = 0.0;
    }

    if (g <= 1.3) {
        berbahaya = 0.0;
    } else if (g > 1.3 && g < 1.5) {
        berbahaya = (g - 1.3) / (1.5 - 1.3);
    } else {
        berbahaya = 1.0;
    }

    return {
        stabil: clip01(stabil),
        fluktuatif: clip01(fluktuatif),
        berbahaya: clip01(berbahaya)
    };
}

// keanggotaan arah angin (derajat)
function mu_arah(deg) {
    deg = ((deg % 360) + 360) % 360;

    let headwind, crosswind, tailwind;

    // headwind
    if (deg >= 90 && deg <= 180) {
        if (deg <= 135) {
            headwind = (deg - 90) / (135 - 90);
        } else {
            headwind = (180 - deg) / (180 - 135);
        }
    } else {
        headwind = 0.0;
    }

    // crosswind
    if (deg >= 45 && deg <= 135) {
        if (deg <= 90) {
            crosswind = (deg - 45) / (90 - 45);
        } else {
            crosswind = (135 - deg) / (135 - 90);
        }
    } else if (deg >= 135 && deg <= 225) {
        if (deg <= 180) {
            crosswind = (deg - 135) / (180 - 135);
        } else {
            crosswind = (225 - deg) / (225 - 180);
        }
    } else {
        crosswind = 0.0;
    }

    // tailwind
    if (deg < 45) {
        tailwind = 1.0;
    } else if (deg >= 45 && deg < 90) {
        tailwind = (90 - deg) / (90 - 45);
    } else if (deg > 225 && deg <= 270) {
        tailwind = (deg - 225) / (270 - 225);
    } else {
        tailwind = 0.0;
    }

    return {
        headwind: clip01(headwind),
        crosswind: clip01(crosswind),
        tailwind: clip01(tailwind)
    };
}

// keanggotaan kode cuaca (WMO)
function mu_weather_code(code) {
    code = Number(code);

    const clear = (code === 0 || code === 1 || code === 2) ? 1.0 : 0.0;
    const cloudy = (code === 3 || code === 51 || code === 53 || code === 55) ? 1.0 : 0.0;
    const fog = (code === 45 || code === 48) ? 1.0 : 0.0;
    const not_flyable = (clear === 0 && cloudy === 0 && fog === 0) ? 1.0 : 0.0;

    return {
        cerah: clear,
        berawan: cloudy,
        berkabut: fog,
        not_flyable: not_flyable
    };
}

// keanggotaan visibilitas depan (m)
function mu_vis_depan(m) {
    m = Number(m) || 0;

    let rendah, sedang, tinggi;

    if (m <= 2000) {
        rendah = 1.0;
    } else if (m > 2000 && m < 3000) {
        rendah = (3000 - m) / (3000 - 2000);
    } else {
        rendah = 0.0;
    }

    if (m > 2500 && m < 5000) {
        sedang = (m - 2500) / (5000 - 2500);
    } else if (m >= 5000 && m < 6000) {
        sedang = (6000 - m) / (6000 - 5000);
    } else {
        sedang = 0.0;
    }

    if (m <= 5000) {
        tinggi = 0.0;
    } else if (m > 5000 && m < 6000) {
        tinggi = (m - 5000) / (6000 - 5000);
    } else {
        tinggi = 1.0;
    }

    return {
        rendah: clip01(rendah),
        sedang: clip01(sedang),
        tinggi: clip01(tinggi)
    };
}

// keanggotaan visibilitas atas (m)
function mu_vis_atas(m) {
    m = Number(m) || 0;

    let rendah, sedang, tinggi;

    if (m <= 200) {
        rendah = 1.0;
    } else if (m > 200 && m < 300) {
        rendah = (300 - m) / (300 - 200);
    } else {
        rendah = 0.0;
    }

    if (m > 250 && m < 500) {
        sedang = (m - 250) / (500 - 250);
    } else if (m >= 500 && m < 600) {
        sedang = (600 - m) / (600 - 500);
    } else {
        sedang = 0.0;
    }

    if (m <= 500) {
        tinggi = 0.0;
    } else if (m > 500 && m < 600) {
        tinggi = (m - 500) / (600 - 500);
    } else {
        tinggi = 1.0;
    }

    return {
        rendah: clip01(rendah),
        sedang: clip01(sedang),
        tinggi: clip01(tinggi)
    };
}

// ===============================
// 2. FUZZIFIKASI
// ===============================
function fuzzifikasi(input_data) {
    const fuzz_waktu = mu_waktu(input_data.jam);
    const fuzz_kecepatan = mu_kecepatan(input_data.kecepatan_angin);
    const fuzz_gust = mu_gust(input_data.gust_factor);
    const fuzz_arah = mu_arah(input_data.arah_angin);
    const fuzz_cuaca = mu_weather_code(input_data.kode_wmo);
    const fuzz_vis_depan = mu_vis_depan(input_data.vis_depan);
    const fuzz_vis_atas = mu_vis_atas(input_data.vis_atas);

    return {
        waktu: fuzz_waktu,
        kecepatan: fuzz_kecepatan,
        gust: fuzz_gust,
        arah: fuzz_arah,
        cuaca: fuzz_cuaca,
        vis_depan: fuzz_vis_depan,
        vis_atas: fuzz_vis_atas
    };
}

// ===============================
// 3. INFERENSI PROBABILISTIK
// ===============================
function inferensi_probabilistik(fuzz_output) {
    const w = fuzz_output.waktu;
    const k = fuzz_output.kecepatan;
    const g = fuzz_output.gust;
    const a = fuzz_output.arah;
    const c = fuzz_output.cuaca;
    const vd = fuzz_output.vis_depan;
    const va = fuzz_output.vis_atas;

    const omega = { KA: 0.0, KB: 0.0, KC: 0.0 };

    const rules = [

        // --- KC (Tidak Layak) ---
        { alpha: c.not_flyable, p: 0.996, cat: 'KC' },
        { alpha: a.tailwind, p: 0.999, cat: 'KC' },
        { alpha: k.tinggi, p: 0.999, cat: 'KC' },
        { alpha: w.gelap, p: 0.9993, cat: 'KC' },

        // --- KB (Waspada / Kurang Layak) ---
        { alpha: Math.min(w.terang, k.rendah, g.stabil, a.headwind, c.cerah, vd.rendah), p: 0.9655, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.cerah, va.rendah), p: 0.9823, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berawan, vd.rendah), p: 0.9818, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berawan, va.rendah), p: 0.9856, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, g.stabil, a.headwind, c.berawan, vd.tinggi), p: 0.2794, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, g.stabil, a.headwind, c.berkabut), p: 0.3448, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.crosswind, c.cerah), p: 0.5028, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.crosswind, c.berawan), p: 0.4554, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.crosswind, c.berkabut), p: 0.4219, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.cerah, vd.rendah), p: 0.96, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berkabut, vd.rendah), p: 0.9608, cat: 'KB' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berkabut, va.rendah), p: 0.9444, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.cerah, vd.rendah), p: 0.9806, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.cerah, va.rendah), p: 0.9828, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.berawan, vd.rendah), p: 0.9804, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.berawan, va.rendah), p: 0.9851, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.berkabut, vd.rendah), p: 0.9623, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.headwind, c.berkabut, va.rendah), p: 0.9474, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.crosswind, c.cerah), p: 0.4863, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.crosswind, c.berawan), p: 0.478, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, a.crosswind, c.berkabut), p: 0.4701, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, g.berbahaya, a.headwind, c.cerah), p: 0.978, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, g.berbahaya, a.headwind, c.berawan), p: 0.9737, cat: 'KB' },
        { alpha: Math.min(w.terang, k.cukup, g.berbahaya, a.headwind, c.berkabut), p: 0.9444, cat: 'KB' },

        // --- KA (Layak / Ideal) ---
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.cerah, vd.sedang, va.sedang), p: 0.8511, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.cerah, vd.sedang, va.tinggi), p: 0.8941, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.cerah, vd.tinggi, va.sedang), p: 0.8095, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.cerah, vd.tinggi, va.tinggi), p: 0.9348, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berawan, vd.sedang, va.sedang), p: 0.8367, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, a.headwind, c.berawan, vd.sedang, va.tinggi), p: 0.8462, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berawan, vd.tinggi, va.sedang), p: 0.9556, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berawan, vd.tinggi, va.tinggi), p: 0.9512, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berkabut, vd.sedang, va.sedang), p: 0.8571, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berkabut, vd.sedang, va.tinggi), p: 0.8571, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berkabut, vd.tinggi, va.sedang), p: 0.8667, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.fluktuatif, a.headwind, c.berkabut, vd.tinggi, va.tinggi), p: 0.9, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.cerah, va.sedang), p: 0.0278, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.cerah, va.tinggi), p: 0.0588, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berawan, vd.tinggi, va.sedang), p: 0.0909, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berawan, vd.tinggi, va.tinggi), p: 0.0714, cat: 'KA' },

        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berkabut, vd.sedang, va.sedang), p: 0.1667, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berkabut, vd.sedang, va.tinggi), p: 0.125, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berkabut, vd.tinggi, va.sedang), p: 0.1111, cat: 'KA' },
        { alpha: Math.min(w.terang, k.rendah, g.berbahaya, a.headwind, c.berkabut, vd.tinggi, va.tinggi), p: 0.1111, cat: 'KA' },

        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.cerah, vd.sedang, va.sedang), p: 0.95, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.cerah, vd.sedang, va.tinggi), p: 0.9706, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.cerah, vd.tinggi, va.sedang), p: 0.9608, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.cerah, vd.tinggi, va.tinggi), p: 0.9535, cat: 'KA' },

        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berawan, vd.sedang, va.sedang), p: 0.9649, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berawan, vd.sedang, va.tinggi), p: 0.96, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berawan, vd.tinggi, va.sedang), p: 0.9524, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berawan, vd.tinggi, va.tinggi), p: 0.9615, cat: 'KA' },

        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berkabut, vd.sedang, va.sedang), p: 0.875, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berkabut, vd.sedang, va.tinggi), p: 0.9231, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berkabut, vd.tinggi, va.sedang), p: 0.9231, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.stabil, a.headwind, c.berkabut, vd.tinggi, va.tinggi), p: 0.8, cat: 'KA' },

        { alpha: Math.min(w.terang, k.cukup, g.fluktuatif, a.headwind, c.cerah, vd.sedang, va.sedang), p: 0.9583, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.fluktuatif, a.headwind, c.cerah, vd.sedang, va.tinggi), p: 0.9444, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.fluktuatif, a.headwind, c.cerah, vd.tinggi, va.sedang), p: 0.9091, cat: 'KA' },
        { alpha: Math.min(w.terang, k.cukup, g.fluktuatif, a.headwind, c.cerah, vd.tinggi, va.tinggi), p: 0.9429, cat: 'KA' }
    ];

    for (const r of rules) {
        const alpha = clip01(r.alpha);
        const omega_i = alpha * r.p;
        if (omega_i > omega[r.cat]) {
            omega[r.cat] = omega_i;
        }
    }

    return omega;
}

// ===============================
// 4. DEFUZZIFIKASI PROBABILISTIK
// ===============================
function defuzzifikasi_probabilistik(omega) {
    const sentroids = {
        KC: 22.5,  // tidak layak
        KB: 65.0,  // waspada
        KA: 87.5   // layak
    };

    let numerator = 0.0;
    let denominator = 0.0;

    for (const cat of ['KC', 'KB', 'KA']) {
        const w_val = omega[cat] || 0;
        if (w_val > 0) {
            numerator += w_val * sentroids[cat];
            denominator += w_val;
        }
    }

    if (denominator === 0) {
        return 50.0; // netral
    }

    let score = numerator / denominator;
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    return score;
}

// ===============================
// 5. WRAPPER SISTEM (OPSIONAL)
// ===============================
function fuzzy_probabilistic_system(input_data) {
    const fuzz_output = fuzzifikasi(input_data);
    const omega = inferensi_probabilistik(fuzz_output);
    const pkc = defuzzifikasi_probabilistik(omega);

    let kesimpulan;
    if (pkc >= 75) {
        kesimpulan = "KA (Layak)";
    } else if (pkc >= 65) {
        kesimpulan = "KB (Waspada)";
    } else {
        kesimpulan = "KC (Tidak Layak)";
    }

    return {
        pkc_score: pkc,
        kategori: kesimpulan,
        omega: omega,
        fuzz_output: fuzz_output
    };
}
