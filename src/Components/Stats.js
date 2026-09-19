import React, { useEffect, useState } from "react";
import "./Stats.css";

/* =========================================================
   CONFIGURACIÓN DE DATOS
========================================================= */

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
   CARGAR NIVEL DE FUERZA
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
   CARGAR NIVEL DE STAMINA
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
   CARGAR NIVEL DE FINANZAS
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

    /*
      La experiencia de Finanzas se obtiene
      directamente del dinero ganado.

      DINERO GANADO / 20 = XP
    */

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
   CARGAR NIVEL DE MENTE
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
   CARGAR NIVEL DE VOLUNTAD
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
   CARGAR NIVEL DE PRESENCIA
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
   COMPONENTE
========================================================= */

function Stats({
  onBack,
  onOpenStrength,
  onOpenStamina,
  onOpenFinance,
  onOpenMind,
  onOpenWillpower,
  onOpenPresence,
}) {
  const [
    statLevels,
    setStatLevels,
  ] = useState({
    strength: 1,
    stamina: 1,
    finance: 1,
    mind: 1,
    willpower: 1,
    presence: 1,
  });

  /* =======================================================
     CARGAR NIVELES REALES
  ======================================================= */

  useEffect(() => {
    const loadLevels = () => {
      setStatLevels({
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
      });
    };

    loadLevels();
  }, []);

  const stats = [
    {
      id: "strength",
      name: "FUERZA",
      description:
        "PODER FÍSICO Y CAPACIDAD MUSCULAR",
      level: statLevels.strength,
    },
    {
      id: "stamina",
      name: "STAMINA",
      description:
        "RESISTENCIA Y CAPACIDAD CARDIOVASCULAR",
      level: statLevels.stamina,
    },
    {
      id: "finance",
      name: "FINANZAS",
      description:
        "CAPITAL Y PROGRESO ECONÓMICO",
      level: statLevels.finance,
    },
    {
      id: "mind",
      name: "MENTE",
      description:
        "CONOCIMIENTO, ANÁLISIS Y ESTRATEGIA",
      level: statLevels.mind,
    },
    {
      id: "willpower",
      name: "VOLUNTAD",
      description:
        "DISCIPLINA, CONSTANCIA Y DETERMINACIÓN",
      level: statLevels.willpower,
    },
    {
      id: "presence",
      name: "PRESENCIA",
      description:
        "CARISMA, SEGURIDAD Y PRESENCIA PERSONAL",
      level: statLevels.presence,
    },
  ];

  /* =======================================================
     NAVEGACIÓN
  ======================================================= */

  const handleStatClick = (
    stat
  ) => {
    if (stat.id === "strength") {
      onOpenStrength();
      return;
    }

    if (stat.id === "stamina") {
      onOpenStamina();
      return;
    }

    if (stat.id === "finance") {
      onOpenFinance();
      return;
    }

    if (stat.id === "mind") {
      onOpenMind();
      return;
    }

    if (stat.id === "willpower") {
      onOpenWillpower();
      return;
    }

    if (stat.id === "presence") {
      onOpenPresence();
      return;
    }
  };

  return (
    <main className="stats-screen">

      <div className="stats-background">
        <div className="stats-grid"></div>
        <div className="stats-glow"></div>
        <div className="stats-scanlines"></div>
      </div>

      <header className="stats-header">

        <button
          className="stats-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="stats-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="stats-header-center">

          <span className="stats-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="stats-header-title">
            STATS
          </span>

        </div>

        <div className="stats-status">

          <span className="stats-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="stats-content">

        <div className="stats-intro">

          <span className="stats-intro-line"></span>

          <div>

            <p className="stats-intro-label">
              PLAYER ATTRIBUTES
            </p>

            <h1>
              STATUS
            </h1>

          </div>

          <span className="stats-intro-line stats-intro-line-right"></span>

        </div>

        <div className="stats-hud">

          <div className="stats-side stats-side-left">

            {stats
              .slice(0, 3)
              .map((stat) => (
                <button
                  key={stat.id}
                  className="stat-card"
                  type="button"
                  onClick={() =>
                    handleStatClick(
                      stat
                    )
                  }
                >

                  <span className="stat-card-main">

                    <span className="stat-card-name">
                      {stat.name}
                    </span>

                    <span className="stat-card-description">
                      {stat.description}
                    </span>

                  </span>

                  <span className="stat-card-level">
                    {stat.level}
                  </span>

                  <span className="stat-card-corner stat-card-corner-tl"></span>

                  <span className="stat-card-corner stat-card-corner-br"></span>

                </button>
              ))}

          </div>

          <div className="stats-center-panel">

            <span className="center-top-line"></span>

            <span className="center-system">
              REQUIEM
            </span>

            <span className="center-main">
              YOU VS YOU
            </span>

            <span className="center-divider">

              <span></span>

              <b>
                ×
              </b>

              <span></span>

            </span>

            <span className="center-description">
              SUPERA TUS LÍMITES
              <br />
              AQUÍ Y AHORA
            </span>

            <div className="center-corners center-corner-tl"></div>

            <div className="center-corners center-corner-tr"></div>

            <div className="center-corners center-corner-bl"></div>

            <div className="center-corners center-corner-br"></div>

          </div>

          <div className="stats-side stats-side-right">

            {stats
              .slice(3, 6)
              .map((stat) => (
                <button
                  key={stat.id}
                  className="stat-card"
                  type="button"
                  onClick={() =>
                    handleStatClick(
                      stat
                    )
                  }
                >

                  <span className="stat-card-main">

                    <span className="stat-card-name">
                      {stat.name}
                    </span>

                    <span className="stat-card-description">
                      {stat.description}
                    </span>

                  </span>

                  <span className="stat-card-level">
                    {stat.level}
                  </span>

                  <span className="stat-card-corner stat-card-corner-tl"></span>

                  <span className="stat-card-corner stat-card-corner-br"></span>

                </button>
              ))}

          </div>

        </div>

      </section>

      <footer className="stats-footer">

        <span>
          REQUIEM // PLAYER STATUS
        </span>

        <span>
          6 ATTRIBUTES
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

    </main>
  );
}

export default Stats;