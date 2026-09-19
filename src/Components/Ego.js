import React, { useEffect, useState } from "react";
import "./Ego.css";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const EGO_STORAGE_KEY = "requiem-ego-data";

const STRENGTH_STORAGE_KEY =
  "requiem-strength-data";

const STAMINA_STORAGE_KEY =
  "requiem_stamina_data_v1";

const FINANCE_STORAGE_KEY =
  "requiem-finance-data";

const MIND_STORAGE_KEY =
  "requiem-mind-data";

const WILLPOWER_STORAGE_KEY =
  "requiem-willpower-data";

const PRESENCE_STORAGE_KEY =
  "requiem-presence-data";

const STAMINA_XP_BASE = 100;
const STAMINA_XP_GROWTH = 1.12;

const STRENGTH_XP_BASE = 100;
const STRENGTH_XP_GROWTH = 1.12;

const FINANCE_XP_BASE = 100;
const FINANCE_XP_GROWTH = 1.12;

const MIND_XP_BASE = 100;
const MIND_XP_GROWTH = 1.12;

const WILLPOWER_XP_BASE = 100;
const WILLPOWER_XP_GROWTH = 1.12;

const PRESENCE_XP_BASE = 100;
const PRESENCE_XP_GROWTH = 1.12;

const STRENGTH_MUSCLES = [
  "ESPALDA",
  "PECHO",
  "HOMBRO",
  "TRÍCEPS",
  "BÍCEPS",
  "ABDOMEN",
  "FEMORAL",
  "ABDUCTORES",
  "CUADRÍCEPS",
  "GEMELO",
];

/* =========================================================
   NIVELES DE FUERZA
========================================================= */

function getStrengthXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (
    let currentLevel = 2;
    currentLevel <= level;
    currentLevel++
  ) {
    total +=
      STRENGTH_XP_BASE *
      Math.pow(
        STRENGTH_XP_GROWTH,
        currentLevel - 2
      );
  }

  return total;
}

function getStrengthLevel(totalXP) {
  let level = 1;

  while (
    totalXP >=
    getStrengthXPRequiredForLevel(
      level + 1
    )
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

/* =========================================================
   NIVELES DE STAMINA
========================================================= */

function getStaminaXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  return Math.ceil(
    STAMINA_XP_BASE *
      (Math.pow(
        STAMINA_XP_GROWTH,
        level - 1
      ) -
        1) /
      (STAMINA_XP_GROWTH - 1)
  );
}

function getStaminaLevel(totalXP) {
  if (!totalXP || totalXP <= 0) {
    return 1;
  }

  let level =
    Math.floor(
      Math.log(
        1 +
          (totalXP *
            (STAMINA_XP_GROWTH - 1)) /
            STAMINA_XP_BASE
      ) /
        Math.log(
          STAMINA_XP_GROWTH
        )
    ) + 1;

  while (
    getStaminaXPRequiredForLevel(
      level + 1
    ) <= totalXP
  ) {
    level++;
  }

  while (
    level > 1 &&
    getStaminaXPRequiredForLevel(
      level
    ) > totalXP
  ) {
    level--;
  }

  return level;
}

/* =========================================================
   NIVELES DE FINANZAS
========================================================= */

function getFinanceXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (
    let currentLevel = 2;
    currentLevel <= level;
    currentLevel++
  ) {
    total +=
      FINANCE_XP_BASE *
      Math.pow(
        FINANCE_XP_GROWTH,
        currentLevel - 2
      );
  }

  return total;
}

function getFinanceLevel(totalXP) {
  if (!totalXP || totalXP <= 0) {
    return 1;
  }

  let level = 1;

  while (
    totalXP >=
    getFinanceXPRequiredForLevel(
      level + 1
    )
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

/* =========================================================
   NIVELES DE MENTE
========================================================= */

function getMindXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (
    let currentLevel = 2;
    currentLevel <= level;
    currentLevel++
  ) {
    total +=
      MIND_XP_BASE *
      Math.pow(
        MIND_XP_GROWTH,
        currentLevel - 2
      );
  }

  return Math.floor(total);
}

function getMindLevel(totalXP) {
  if (!totalXP || totalXP <= 0) {
    return 1;
  }

  let level = 1;

  while (
    totalXP >=
    getMindXPRequiredForLevel(
      level + 1
    )
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

/* =========================================================
   NIVELES DE VOLUNTAD
========================================================= */

function getWillpowerXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (
    let currentLevel = 2;
    currentLevel <= level;
    currentLevel++
  ) {
    total +=
      WILLPOWER_XP_BASE *
      Math.pow(
        WILLPOWER_XP_GROWTH,
        currentLevel - 2
      );
  }

  return Math.floor(total);
}

function getWillpowerLevel(totalXP) {
  if (!totalXP || totalXP <= 0) {
    return 1;
  }

  let level = 1;

  while (
    totalXP >=
    getWillpowerXPRequiredForLevel(
      level + 1
    )
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

/* =========================================================
   NIVELES DE PRESENCIA
========================================================= */

function getPresenceXPRequiredForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  let total = 0;

  for (
    let currentLevel = 2;
    currentLevel <= level;
    currentLevel++
  ) {
    total +=
      PRESENCE_XP_BASE *
      Math.pow(
        PRESENCE_XP_GROWTH,
        currentLevel - 2
      );
  }

  return Math.floor(total);
}

function getPresenceLevel(totalXP) {
  if (!totalXP || totalXP <= 0) {
    return 1;
  }

  let level = 1;

  while (
    totalXP >=
    getPresenceXPRequiredForLevel(
      level + 1
    )
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

/* =========================================================
   CARGAR FUERZA
========================================================= */

function loadStrengthLevel() {
  try {
    const saved =
      localStorage.getItem(
        STRENGTH_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const muscles =
      parsed.muscles || {};

    const muscleLevels =
      STRENGTH_MUSCLES.map(
        (muscle) => {
          const xp =
            Number(
              muscles[muscle]?.xp
            ) || 0;

          return getStrengthLevel(
            xp
          );
        }
      );

    const generalLevel =
      Math.floor(
        muscleLevels.reduce(
          (total, level) =>
            total + level,
          0
        ) /
          muscleLevels.length
      );

    return Math.max(
      1,
      generalLevel
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR STAMINA
========================================================= */

function getCurrentMonthKey() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
}

function loadStaminaLevel() {
  try {
    const saved =
      localStorage.getItem(
        STAMINA_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const currentMonth =
      getCurrentMonthKey();

    const monthData =
      parsed.months?.[
        currentMonth
      ];

    const totalXP =
      Number(
        monthData?.totalXp
      ) || 0;

    return getStaminaLevel(
      totalXP
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR FINANZAS
========================================================= */

function loadFinanceLevel() {
  try {
    const saved =
      localStorage.getItem(
        FINANCE_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const totalEarned =
      Number(
        parsed.totalEarned
      ) || 0;

    const totalXP =
      totalEarned / 20;

    return getFinanceLevel(
      totalXP
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR MENTE
========================================================= */

function loadMindLevel() {
  try {
    const saved =
      localStorage.getItem(
        MIND_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const totalXP =
      Number(
        parsed.totalXp
      ) || 0;

    return getMindLevel(
      totalXP
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR VOLUNTAD
========================================================= */

function loadWillpowerLevel() {
  try {
    const saved =
      localStorage.getItem(
        WILLPOWER_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const totalXP =
      Number(
        parsed.totalXp
      ) || 0;

    return getWillpowerLevel(
      totalXP
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR PRESENCIA
========================================================= */

function loadPresenceLevel() {
  try {
    const saved =
      localStorage.getItem(
        PRESENCE_STORAGE_KEY
      );

    if (!saved) {
      return 1;
    }

    const parsed =
      JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return 1;
    }

    const totalXP =
      Number(
        parsed.totalXp
      ) || 0;

    return getPresenceLevel(
      totalXP
    );
  } catch {
    return 1;
  }
}

/* =========================================================
   CARGAR TODAS LAS STATS
========================================================= */

function loadStats() {
  return {
    strength:
      loadStrengthLevel(),

    stamina:
      loadStaminaLevel(),

    finance:
      loadFinanceLevel(),

    mind:
      loadMindLevel(),

    willpower:
      loadWillpowerLevel(),

    presence:
      loadPresenceLevel(),
  };
}

/* =========================================================
   CALCULAR EGO
========================================================= */

function calculateEgoLevel(stats) {
  const total =
    stats.strength +
    stats.stamina +
    stats.finance +
    stats.mind +
    stats.willpower +
    stats.presence;

  const average =
    total / 6;

  return Math.round(
    average
  );
}

/* =========================================================
   SONIDO DE LEVEL UP
========================================================= */

function playEgoLevelUpSound() {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const audioContext =
      new AudioContext();

    const now =
      audioContext.currentTime;

    const masterGain =
      audioContext.createGain();

    masterGain.gain.setValueAtTime(
      0.0001,
      now
    );

    masterGain.gain.exponentialRampToValueAtTime(
      0.18,
      now + 0.03
    );

    masterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 2.4
    );

    masterGain.connect(
      audioContext.destination
    );

    /* =========================
       NOTA PRINCIPAL
    ========================= */

    const oscillator =
      audioContext.createOscillator();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
      180,
      now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      720,
      now + 0.65
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      1100,
      now + 1.15
    );

    oscillator.connect(
      masterGain
    );

    oscillator.start(now);
    oscillator.stop(
      now + 1.5
    );

    /* =========================
       NOTA DE IMPACTO
    ========================= */

    const impact =
      audioContext.createOscillator();

    const impactGain =
      audioContext.createGain();

    impact.type = "square";

    impact.frequency.setValueAtTime(
      70,
      now + 0.55
    );

    impact.frequency.exponentialRampToValueAtTime(
      35,
      now + 1.2
    );

    impactGain.gain.setValueAtTime(
      0.0001,
      now + 0.55
    );

    impactGain.gain.exponentialRampToValueAtTime(
      0.22,
      now + 0.58
    );

    impactGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 1.4
    );

    impact.connect(
      impactGain
    );

    impactGain.connect(
      audioContext.destination
    );

    impact.start(
      now + 0.55
    );

    impact.stop(
      now + 1.4
    );

    /* =========================
       CHIMES
    ========================= */

    const frequencies = [
      523.25,
      659.25,
      783.99,
      1046.5,
    ];

    frequencies.forEach(
      (frequency, index) => {
        const chime =
          audioContext.createOscillator();

        const chimeGain =
          audioContext.createGain();

        const start =
          now +
          0.8 +
          index * 0.12;

        chime.type =
          "sine";

        chime.frequency.setValueAtTime(
          frequency,
          start
        );

        chimeGain.gain.setValueAtTime(
          0.0001,
          start
        );

        chimeGain.gain.exponentialRampToValueAtTime(
          0.12,
          start + 0.02
        );

        chimeGain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 1
        );

        chime.connect(
          chimeGain
        );

        chimeGain.connect(
          audioContext.destination
        );

        chime.start(start);
        chime.stop(
          start + 1
        );
      }
    );

    setTimeout(() => {
      audioContext.close();
    }, 3500);
  } catch {
    // El sonido no debe impedir el funcionamiento del sistema.
  }
}

/* =========================================================
   COMPONENTE
========================================================= */

function Ego({
  onBack,
}) {
  const [
    stats,
    setStats,
  ] = useState({
    strength: 1,
    stamina: 1,
    finance: 1,
    mind: 1,
    willpower: 1,
    presence: 1,
  });

  const [
    egoLevel,
    setEgoLevel,
  ] = useState(1);

  const [
    previousEgoLevel,
    setPreviousEgoLevel,
  ] = useState(1);

  const [
    isLevelingUp,
    setIsLevelingUp,
  ] = useState(false);

  const [
    levelUpFrom,
    setLevelUpFrom,
  ] = useState(1);

  /* =======================================================
     CARGAR EGO
  ======================================================= */

  useEffect(() => {
    const currentStats =
      loadStats();

    const currentEgoLevel =
      calculateEgoLevel(
        currentStats
      );

    setStats(
      currentStats
    );

    setEgoLevel(
      currentEgoLevel
    );

    let savedEgo = null;

    try {
      const saved =
        localStorage.getItem(
          EGO_STORAGE_KEY
        );

      if (saved) {
        savedEgo =
          JSON.parse(saved);
      }
    } catch {
      savedEgo = null;
    }

    /*
      Primera vez:
      guardamos el nivel actual,
      pero no mostramos animación.
    */

    if (
      !savedEgo ||
      typeof savedEgo.level !==
        "number"
    ) {
      localStorage.setItem(
        EGO_STORAGE_KEY,
        JSON.stringify({
          level:
            currentEgoLevel,
        })
      );

      setPreviousEgoLevel(
        currentEgoLevel
      );

      return;
    }

    const oldLevel =
      savedEgo.level;

    setPreviousEgoLevel(
      oldLevel
    );

    /*
      Si el nivel actual es superior
      al último nivel registrado,
      activamos el level up.
    */

    if (
      currentEgoLevel >
      oldLevel
    ) {
      setLevelUpFrom(
        oldLevel
      );

      setIsLevelingUp(
        true
      );

      playEgoLevelUpSound();

      localStorage.setItem(
        EGO_STORAGE_KEY,
        JSON.stringify({
          level:
            currentEgoLevel,
        })
      );

      setPreviousEgoLevel(
        currentEgoLevel
      );

      const timer =
        setTimeout(() => {
          setIsLevelingUp(
            false
          );
        }, 4200);

      return () => {
        clearTimeout(
          timer
        );
      };
    }

    /*
      Si por cualquier motivo
      el nivel ha cambiado a la baja,
      sincronizamos el registro.
    */

    if (
      currentEgoLevel !==
      oldLevel
    ) {
      localStorage.setItem(
        EGO_STORAGE_KEY,
        JSON.stringify({
          level:
            currentEgoLevel,
        })
      );

      setPreviousEgoLevel(
        currentEgoLevel
      );
    }
  }, []);

  const statItems = [
    {
      name: "FUERZA",
      value: stats.strength,
    },
    {
      name: "MENTE",
      value: stats.mind,
    },
    {
      name: "VOLUNTAD",
      value: stats.willpower,
    },
    {
      name: "STAMINA",
      value: stats.stamina,
    },
    {
      name: "PRESENCIA",
      value: stats.presence,
    },
    {
      name: "FINANZAS",
      value: stats.finance,
    },
  ];

  const statTotal =
    statItems.reduce(
      (total, stat) =>
        total + stat.value,
      0
    );

  const statAverage =
    statTotal / 6;

  return (
    <main className="ego-screen">

      <div className="ego-background">
        <div className="ego-grid"></div>
        <div className="ego-glow"></div>
        <div className="ego-scanlines"></div>
      </div>

      <header className="ego-header">

        <button
          className="ego-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="ego-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="ego-header-center">

          <span className="ego-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="ego-header-title">
            EGO
          </span>

        </div>

        <div className="ego-status">

          <span className="ego-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="ego-content">

        <div className="ego-intro">

          <span className="ego-intro-line"></span>

          <div>
            <p className="ego-intro-label">
              INTERNAL POWER
            </p>

            <h1>
              EGO
            </h1>
          </div>

          <span className="ego-intro-line"></span>

        </div>

        <div className="ego-main">

          <section className="ego-level-panel">

            <div className="ego-level-label">
              CURRENT EGO LEVEL
            </div>

            <div className="ego-level-number">
              {egoLevel}
            </div>

            <div className="ego-level-name">
              EGO
            </div>

            <div className="ego-level-description">
              DEVORA Y MEJORA
            </div>

            <div className="ego-panel-corner ego-panel-corner-tl"></div>
            <div className="ego-panel-corner ego-panel-corner-tr"></div>
            <div className="ego-panel-corner ego-panel-corner-bl"></div>
            <div className="ego-panel-corner ego-panel-corner-br"></div>

          </section>

          <section className="ego-average-panel">

            <div className="ego-average-header">
              <span>
                EGO CALCULATION
              </span>

              <span>
                6 ATTRIBUTES
              </span>
            </div>

            <div className="ego-average-main">

              <span className="ego-average-label">
                STAT AVERAGE
              </span>

              <strong>
                {statAverage.toFixed(1)}
              </strong>

              <span className="ego-average-arrow">
                →
              </span>

              <span className="ego-average-result">
                EGO {egoLevel}
              </span>

            </div>

            <div className="ego-average-formula">
              {statTotal} TOTAL
              <span> / </span>
              6 STATS
            </div>

          </section>

        </div>

        <section className="ego-stats-section">

          <div className="ego-section-header">

            <span></span>

            <h2>
              ATTRIBUTE SYNCHRONIZATION
            </h2>

            <span></span>

          </div>

          <div className="ego-stat-grid">

            {statItems.map(
              (stat) => (
                <div
                  className="ego-stat-card"
                  key={stat.name}
                >

                  <span className="ego-stat-name">
                    {stat.name}
                  </span>

                  <strong className="ego-stat-value">
                    {stat.value}
                  </strong>

                  <span className="ego-stat-line"></span>

                </div>
              )
            )}

          </div>

        </section>

      </section>

      <footer className="ego-footer">

        <span>
          REQUIEM // EGO SYSTEM
        </span>

        <span>
          INTERNAL POWER
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {isLevelingUp && (
        <div className="ego-levelup-overlay">

          <div className="ego-levelup-energy ego-energy-one"></div>
          <div className="ego-levelup-energy ego-energy-two"></div>
          <div className="ego-levelup-energy ego-energy-three"></div>

          <div className="ego-levelup-content">

            <div className="ego-levelup-system">
              REQUIEM SYSTEM
            </div>

            <div className="ego-levelup-line"></div>

            <div className="ego-levelup-title">
              EGO LEVEL UP
            </div>

            <div className="ego-levelup-levels">

              <span>
                {levelUpFrom}
              </span>

              <b>
                →
              </b>

              <strong>
                {egoLevel}
              </strong>

            </div>

            <div className="ego-levelup-message">
              YOUR EGO HAS EVOLVED
            </div>

            <div className="ego-levelup-submessage">
              YOUR POWER GROWS WITH YOU
            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Ego;