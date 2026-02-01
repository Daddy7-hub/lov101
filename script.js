let CLIENT = null;

/* ================= LOAD CLIENT DATA ================= */
fetch("client.json")
    .then(res => res.json())
    .then(data => {
        CLIENT = data;
        initIntro();
        initTheme();
        initApp();
    });

/* ================= INTRO SCREEN ================= */
function initIntro() {
    const introScreen = document.getElementById("introScreen");
    const introTitle = document.getElementById("introTitle");
    const introDescription = document.getElementById("introDescription");
    const introFrom = document.getElementById("introFrom");
    const startGift = document.getElementById("startGift");

    introTitle.textContent = CLIENT.introTitle;
    introDescription.textContent = CLIENT.introDescription;
    introFrom.textContent = `От ${CLIENT.fromName} 💖`;

    startGift.addEventListener("click", () => {
        introScreen.classList.add("hide");
    });
}

/* ================= THEME ================= */
function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const saved = localStorage.getItem("theme");

    if (saved === "light") document.body.classList.add("light");

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        localStorage.setItem(
            "theme",
            document.body.classList.contains("light") ? "light" : "dark"
        );
    });
}

/* ================= MAIN APP ================= */
function initApp() {
    const TOTAL = 101;
    const DAILY_LIMIT = CLIENT.dailyLimit || 10;

    const grid = document.getElementById("grid");
    const openedCount = document.getElementById("openedCount");
    const title = document.getElementById("title");

    title.textContent = `101 причина, почему я люблю тебя, ${CLIENT.receiverName}`;

    const reasons = [...(CLIENT.reasons || [])];
    while (reasons.length < TOTAL - 1) {
        reasons.push("Потому что с тобой мир становится мягче.");
    }
    reasons.push(CLIENT.finalMessage);

    let state = JSON.parse(localStorage.getItem("love101")) || {
        opened: 0,
        openedToday: 0,
        lastDate: null
    };

    const today = new Date().toISOString().slice(0,10);

    if (state.lastDate && state.lastDate !== today) {
        state.openedToday = 0;
        state.lastDate = today;

        document.body.classList.add("fade-day");
        showNewDayModal();
        setTimeout(() => document.body.classList.remove("fade-day"), 1000);
    }

    if (!state.lastDate) {
        state.lastDate = today;
        localStorage.setItem("love101", JSON.stringify(state));
    }

    openedCount.textContent = state.opened;

    reasons.forEach((text, index) => {
        const card = document.createElement("div");
        card.className = "card";

        if (index < state.opened) card.classList.add("flipped");
        else card.classList.add("locked");

        card.innerHTML = `
      <div class="card-inner">
        <div class="face front">${index + 1}</div>
        <div class="face back">${text}</div>
      </div>
    `;

        card.addEventListener("click", () => {
            if (card.classList.contains("flipped")) return;

            if (state.openedToday >= DAILY_LIMIT) {
                showLimitModal();
                return;
            }

            if (index !== state.opened) return;

            card.classList.remove("locked");
            card.classList.add("flipped");

            state.opened++;
            state.openedToday++;

            const rect = card.getBoundingClientRect();
            spawnConfetti(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2
            );

            openedCount.textContent = state.opened;

            localStorage.setItem("love101", JSON.stringify(state));

            spawnHearts();

            if (state.opened === TOTAL) showFinalScreen();
        });

        grid.appendChild(card);
    });
}

/* ================= HEARTS ================= */
const heartsContainer = document.querySelector(".hearts");
const emojis = ["💖","💘","💝","💞","🏹","👼"];

function spawnHearts() {
    if (!heartsContainer) return;

    for (let i = 0; i < 6; i++) {
        const el = document.createElement("div");
        el.className = "heart";
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDuration = 4 + Math.random() * 4 + "s";
        heartsContainer.appendChild(el);
        setTimeout(() => el.remove(), 8000);
    }
}

/* ================= LIMIT MODAL + TIMER ================= */
const limitModal = document.getElementById("limitModal");
const limitText = document.getElementById("limitText");
const timerText = document.getElementById("timerText");
const closeLimitModal = document.getElementById("closeLimitModal");

let timerInterval = null;

function updateTimer() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24,0,0,0);

    const diff = tomorrow - now;
    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);

    timerText.textContent =
        `До новых причин осталось ${h}ч ${m}м ⏳`;
}

function showLimitModal() {
    limitText.innerHTML = `
    ${CLIENT.receiverName}, Продолжение следует 💖<br>
    Завтра можно открыть ещё <b>${CLIENT.dailyLimit}</b>
  `;

    updateTimer();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 60000);

    limitModal.classList.add("show");
}

closeLimitModal.addEventListener("click", () => {
    limitModal.classList.remove("show");
});

/* ================= NEW DAY MODAL ================= */
const newDayModal = document.getElementById("newDayModal");
const newDayText = document.getElementById("newDayText");
const startDay = document.getElementById("startDay");

function showNewDayModal() {
    newDayText.innerHTML = `
    ${CLIENT.receiverName}, сегодня доступны ещё <b>${CLIENT.dailyLimit}</b> причин ✨
  `;
    newDayModal.classList.add("show");
}

startDay.addEventListener("click", () => {
    newDayModal.classList.remove("show");
});

/* ================= FINAL SCREEN ================= */
const finalScreen = document.getElementById("finalScreen");
const finalText = document.getElementById("finalText");
const fromName = document.getElementById("fromName");

function showFinalScreen() {
    finalText.textContent = CLIENT.finalMessage;
    fromName.textContent = `— ${CLIENT.fromName}`;
    finalScreen.classList.add("show");
}

/* ================= CONFETTI ================= */
function spawnConfetti(x, y) {
    for (let i = 0; i < 14; i++) {
        const conf = document.createElement("div");
        conf.className = "confetti";

        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 60;

        conf.style.left = x + "px";
        conf.style.top = y + "px";
        conf.style.setProperty("--x", Math.cos(angle) * distance + "px");
        conf.style.setProperty("--y", Math.sin(angle) * distance - 60 + "px");

        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 900);
    }
}
