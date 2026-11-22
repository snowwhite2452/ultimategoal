(function () {
  const DEFAULT_CONFIG = {
    title: "แล้วบอกว่าพวกกัน",
    url: "./M6IX - แล้วบอกว่าพวกกัน.mp3",
    volume: 0.5
  };

  function injectStyles() {
    if (document.getElementById("ug-music-player-style")) return;
    const style = document.createElement("style");
    style.id = "ug-music-player-style";
    style.textContent = `
      .ug-music-player {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 999;
        display: inline-flex;
        align-items: center;
        gap: 14px;
        padding: 8px 18px 8px 8px;
        border-radius: 999px;
        background: rgba(12, 13, 16, 0.88);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
        user-select: none;
      }

      .ug-play-btn {
        width: 38px;
        height: 38px;
        border-radius: 999px;
        border: none;
        background: #ebe7de;
        color: #111317;
        display: grid;
        place-items: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: transform 0.15s ease, background 0.15s ease;
      }

      .ug-play-btn:hover {
        background: #ffffff;
        transform: scale(1.04);
      }

      .ug-play-btn:active {
        transform: scale(0.96);
      }

      .ug-track-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 78px;
      }

      .ug-track-label {
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 2.2px;
        color: #7c828d;
        text-transform: uppercase;
      }

      .ug-track-title {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.6px;
        color: #f3f4f6;
        white-space: nowrap;
      }

      .ug-volume-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 76px;
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(
          to right,
          #ebe7de 0%,
          #ebe7de var(--vol, 50%),
          rgba(255, 255, 255, 0.2) var(--vol, 50%),
          rgba(255, 255, 255, 0.2) 100%
        );
        outline: none;
        cursor: pointer;
      }

      .ug-volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 11px;
        height: 11px;
        border-radius: 999px;
        background: #ebe7de;
        cursor: pointer;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
        transition: transform 0.12s ease;
      }

      .ug-volume-slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }

      .ug-volume-slider::-moz-range-thumb {
        width: 11px;
        height: 11px;
        border: none;
        border-radius: 999px;
        background: #ebe7de;
        cursor: pointer;
      }

      @media (max-width: 540px) {
        .ug-music-player {
          right: 14px;
          bottom: 14px;
          gap: 10px;
          padding: 7px 14px 7px 7px;
        }
        .ug-volume-slider {
          width: 56px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const PAUSE_ICON = `
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1.5" width="2.6" height="9" rx="0.6"></rect>
      <rect x="7.4" y="1.5" width="2.6" height="9" rx="0.6"></rect>
    </svg>
  `;

  const PLAY_ICON = `
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M3 1.8C3 1.35 3.49 1.07 3.87 1.31L9.87 5.11C10.22 5.33 10.22 5.87 9.87 6.09L3.87 9.89C3.49 10.13 3 9.85 3 9.4V1.8Z"></path>
    </svg>
  `;

  async function initPlayer() {
    let config = { ...DEFAULT_CONFIG };
    try {
      const res = await fetch("./members.json");
      if (res.ok) {
        const data = await res.json();
        if (data.music) {
          config = { ...config, ...data.music };
        }
      }
    } catch (_) {}

    injectStyles();

    const audio = new Audio(config.url);
    audio.loop = true;
    const savedVol = parseFloat(localStorage.getItem("ug_music_vol"));
    const initVol = Number.isFinite(savedVol) ? savedVol : config.volume;
    audio.volume = Math.min(1, Math.max(0, initVol));

    const wrap = document.createElement("div");
    wrap.className = "ug-music-player";
    wrap.innerHTML = `
      <button type="button" class="ug-play-btn" aria-label="Play or Pause music">${PLAY_ICON}</button>
      <div class="ug-track-info">
        <span class="ug-track-label">MUSIC</span>
        <span class="ug-track-title">"${config.title}"</span>
      </div>
      <input type="range" class="ug-volume-slider" min="0" max="100" aria-label="Volume" />
    `;
    document.body.appendChild(wrap);

    const playBtn = wrap.querySelector(".ug-play-btn");
    const slider = wrap.querySelector(".ug-volume-slider");

    function syncVolumeUI() {
      const pct = Math.round(audio.volume * 100);
      slider.value = pct;
      slider.style.setProperty("--vol", `${pct}%`);
    }

    function syncPlayUI() {
      playBtn.innerHTML = audio.paused ? PLAY_ICON : PAUSE_ICON;
    }

    syncVolumeUI();
    syncPlayUI();

    // ลองเล่นอัตโนมัติ (ถ้าเบราว์เซอร์บล็อก จะรอให้คลิกครั้งแรก)
    audio.play().then(syncPlayUI).catch(() => {
      syncPlayUI();
      const unlockOnce = () => {
        audio.play().then(syncPlayUI).catch(() => {});
        document.removeEventListener("click", unlockOnce);
      };
      document.addEventListener("click", unlockOnce, { once: true });
    });

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio.paused) {
        audio.play().then(syncPlayUI).catch(() => {});
      } else {
        audio.pause();
        syncPlayUI();
      }
    });

    slider.addEventListener("input", () => {
      const pct = Number(slider.value);
      audio.volume = pct / 100;
      localStorage.setItem("ug_music_vol", String(audio.volume));
      slider.style.setProperty("--vol", `${pct}%`);
    });

    audio.addEventListener("play", syncPlayUI);
    audio.addEventListener("pause", syncPlayUI);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlayer);
  } else {
    initPlayer();
  }
})();