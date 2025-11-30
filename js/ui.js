function renderCalendar() {
    const calendar = document.getElementById("calendar-grid");
    calendar.innerHTML = "";

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0=Min

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `<div class="grid grid-cols-7 gap-2 text-center font-bold">
        <div>Sen</div><div>Sel</div><div>Rab</div>
        <div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
    </div>`;

    let day = 1;
    html += `<div class="grid grid-cols-7 gap-2 mt-3">`;

    for (let i = 0; i < 42; i++) {
        if (i >= (startDay === 0 ? 6 : startDay - 1) && day <= daysInMonth) {
            html += `<button 
                onclick="selectDate(${year},${month},${day})"
                class="p-2 rounded bg-white shadow hover:bg-sky-200 transition">
                ${day}</button>`;
            day++;
        } else {
            html += `<div></div>`;
        }
    }

    html += `</div>`;
    calendar.innerHTML = html;
}

function showGraphBox() {
    const graphBox = document.getElementById("graph-box");
    const container = document.querySelector(".mobile-two-col");

    graphBox.classList.remove("hidden");
    graphBox.classList.add("fade-in");

    // untuk mobile: aktifkan layout 2 kolom setelah tanggal dipilih
    container.classList.add("active");
}

function renderHours(data) {
    const container = document.getElementById("hour-bars");
    container.innerHTML = "";

    data.forEach(item => {
        const bar = document.createElement("div");
        bar.className = "flex items-center gap-2";

        const label = document.createElement("div");
        label.className = "w-14 text-right";
        label.textContent = item.jam;

        const barBg = document.createElement("div");
        barBg.className = "flex-1 h-5 bg-slate-200 rounded overflow-hidden";

        const fill = document.createElement("div");
        fill.className = "h-full rounded";

        if (item.status === "good") fill.classList.add("bg-sky-500");
        else if (item.status === "medium") fill.classList.add("bg-amber-500");
        else fill.classList.add("bg-red-500");

        fill.style.width = "100%";

        barBg.appendChild(fill);

        bar.appendChild(label);
        bar.appendChild(barBg);

        container.appendChild(bar);
    });
}


