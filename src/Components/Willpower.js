import React, { useEffect, useMemo, useState } from "react";
import "./Willpower.css";

const STORAGE_KEY = "requiem-willpower-data";

const XP_BASE = 100;
const XP_GROWTH = 1.12;

const RARITIES = {
  common: {
    name: "COMÚN",
    xp: 15,
  },
  rare: {
    name: "RARO",
    xp: 20,
  },
  epic: {
    name: "ÉPICO",
    xp: 25,
  },
  mythic: {
    name: "MÍTICO",
    xp: 30,
  },
  legendary: {
    name: "LEGENDARIO",
    xp: 35,
  },
};

const createInitialData = () => ({
  totalXp: 0,
  missions: [],
});

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createInitialData();
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return createInitialData();
    }

    return {
      totalXp: Number(parsed.totalXp) || 0,
      missions: Array.isArray(parsed.missions)
        ? parsed.missions
        : [],
    };
  } catch {
    return createInitialData();
  }
}

function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

function getXPRequiredForLevel(level) {
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
      XP_BASE *
      Math.pow(
        XP_GROWTH,
        currentLevel - 2
      );
  }

  return Math.floor(total);
}

function getLevel(totalXp) {
  let level = 1;

  while (
    totalXp >=
    getXPRequiredForLevel(level + 1)
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

function getLevelProgress(totalXp) {
  const level = getLevel(totalXp);

  const currentLevelXP =
    getXPRequiredForLevel(level);

  const nextLevelXP =
    getXPRequiredForLevel(level + 1);

  const xpIntoLevel =
    totalXp - currentLevelXP;

  const xpForThisLevel =
    nextLevelXP - currentLevelXP;

  const percentage =
    xpForThisLevel > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (xpIntoLevel /
              xpForThisLevel) *
              100
          )
        )
      : 100;

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpIntoLevel,
    xpForThisLevel,
    percentage,
  };
}

function getTodayKey() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createMissionId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function Willpower({ onBack }) {
  const [data, setData] = useState(
    loadData
  );

  const [missionName, setMissionName] =
    useState("");

  const [
    missionDescription,
    setMissionDescription,
  ] = useState("");

  const [rarity, setRarity] =
    useState("common");

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    levelUpData,
    setLevelUpData,
  ] = useState(null);

  const today = getTodayKey();

  const levelData = useMemo(
    () =>
      getLevelProgress(
        data.totalXp
      ),
    [data.totalXp]
  );

  const availableMissions =
    data.missions.filter(
      (mission) =>
        mission.completedDate !== today
    );

  const completedToday =
    data.missions.filter(
      (mission) =>
        mission.completedDate === today
    );

  useEffect(() => {
    saveData(data);
  }, [data]);

  const completeMission = (mission) => {
    if (
      mission.completedDate === today
    ) {
      return;
    }

    const previousLevel =
      getLevel(data.totalXp);

    const earnedXP =
      RARITIES[mission.rarity]?.xp ||
      0;

    const newTotalXP =
      data.totalXp + earnedXP;

    const newLevel =
      getLevel(newTotalXP);

    setData((previousData) => ({
      ...previousData,

      totalXp: newTotalXP,

      missions:
        previousData.missions.map(
          (item) =>
            item.id === mission.id
              ? {
                  ...item,
                  completedDate: today,
                  lastCompletedAt:
                    new Date().toISOString(),
                }
              : item
        ),
    }));

    if (newLevel > previousLevel) {
      setLevelUpData({
        level: newLevel,
        xp: earnedXP,
      });

      setTimeout(() => {
        setLevelUpData(null);
      }, 3200);
    }
  };

  const deleteMission = (missionId) => {
    setData((previousData) => ({
      ...previousData,

      missions:
        previousData.missions.filter(
          (mission) =>
            mission.id !== missionId
        ),
    }));
  };

  const handleCreateMission = (
    event
  ) => {
    event.preventDefault();

    const cleanName =
      missionName.trim();

    const cleanDescription =
      missionDescription.trim();

    if (!cleanName) {
      return;
    }

    const newMission = {
      id: createMissionId(),
      name: cleanName,
      description: cleanDescription,
      rarity,
      createdAt:
        new Date().toISOString(),
      completedDate: null,
      lastCompletedAt: null,
    };

    setData((previousData) => ({
      ...previousData,

      missions: [
        ...previousData.missions,
        newMission,
      ],
    }));

    setMissionName("");
    setMissionDescription("");
    setRarity("common");
    setShowCreateForm(false);
  };

  return (
    <main className="willpower-screen">

      <div className="willpower-background">
        <div className="willpower-grid"></div>
        <div className="willpower-glow"></div>
        <div className="willpower-diagonal"></div>
        <div className="willpower-scanlines"></div>
      </div>

      <header className="willpower-header">

        <button
          className="willpower-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="willpower-back-symbol">
            ‹
          </span>

          <span>RETURN</span>
        </button>

        <div className="willpower-header-center">
          <span className="willpower-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="willpower-header-title">
            VOLUNTAD
          </span>
        </div>

        <div className="willpower-status">
          <span className="willpower-status-dot"></span>
          <span>ONLINE</span>
        </div>

      </header>

      <section className="willpower-content">

        <div className="willpower-intro">

          <div className="willpower-intro-block">
            <span>WILLPOWER ATTRIBUTE</span>
            <h1>VOLUNTAD</h1>
          </div>

          <div className="willpower-intro-mark">
            <span>W</span>
            <small>07</small>
          </div>

        </div>

        <section className="willpower-level-panel">

          <div className="willpower-level-side">

            <span className="willpower-level-label">
              GENERAL LEVEL
            </span>

            <strong>
              {levelData.level}
            </strong>

            <span className="willpower-level-state">
              WILL // ACTIVE
            </span>

          </div>

          <div className="willpower-level-main">

            <div className="willpower-xp-header">
              <span>TOTAL EXPERIENCE</span>

              <b>
                {Math.floor(
                  data.totalXp
                )} XP
              </b>
            </div>

            <div className="willpower-progress-track">

              <div
                className="willpower-progress-fill"
                style={{
                  width: `${levelData.percentage}%`,
                }}
              ></div>

              <span
                className="willpower-progress-point"
                style={{
                  left: `${levelData.percentage}%`,
                }}
              ></span>

            </div>

            <div className="willpower-progress-info">

              <span>
                LVL {levelData.level}
              </span>

              <span>
                {Math.floor(
                  data.totalXp
                )} /{" "}
                {Math.floor(
                  levelData.nextLevelXP
                )} XP
              </span>

              <span>
                NEXT {levelData.level + 1}
              </span>

            </div>

          </div>

        </section>

        <div className="willpower-stats-row">

          <div className="willpower-stat-box">
            <span>MISSIONS</span>
            <strong>
              {data.missions.length}
            </strong>
          </div>

          <div className="willpower-stat-box">
            <span>READY</span>
            <strong>
              {availableMissions.length}
            </strong>
          </div>

          <div className="willpower-stat-box">
            <span>DONE TODAY</span>
            <strong>
              {completedToday.length}
            </strong>
          </div>

        </div>

        <section className="willpower-missions-section">

          <div className="willpower-section-header">

            <div>
              <span>DISCIPLINE PROTOCOL</span>
              <h2>WILLPOWER MISSIONS</h2>
            </div>

            <button
              className="willpower-create-button"
              type="button"
              onClick={() =>
                setShowCreateForm(
                  !showCreateForm
                )
              }
            >
              <span className="willpower-plus">
                +
              </span>

              <span>
                CREATE MISSION
              </span>
            </button>

          </div>

          {showCreateForm && (
            <form
              className="willpower-create-panel"
              onSubmit={
                handleCreateMission
              }
            >

              <div className="willpower-form-header">
                <span>
                  WILLPOWER PROTOCOL
                </span>

                <span>
                  MANUAL // CREATE
                </span>
              </div>

              <label className="willpower-form-field">

                <span>MISSION NAME</span>

                <input
                  type="text"
                  value={missionName}
                  onChange={(event) =>
                    setMissionName(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Entrenar aunque no tenga ganas"
                  maxLength={80}
                />

              </label>

              <label className="willpower-form-field">

                <span>OBJECTIVE</span>

                <textarea
                  value={
                    missionDescription
                  }
                  onChange={(event) =>
                    setMissionDescription(
                      event.target.value
                    )
                  }
                  placeholder="Define la acción que debes completar..."
                  maxLength={200}
                  rows={3}
                />

              </label>

              <div className="willpower-form-field">

                <span>MISSION RARITY</span>

                <div className="willpower-rarity-selector">

                  {Object.entries(
                    RARITIES
                  ).map(
                    ([
                      rarityId,
                      rarityData,
                    ]) => (
                      <button
                        key={rarityId}
                        type="button"
                        className={`willpower-rarity-option rarity-${rarityId} ${
                          rarity ===
                          rarityId
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setRarity(
                            rarityId
                          )
                        }
                      >
                        <span>
                          {rarityData.name}
                        </span>

                        <b>
                          +{rarityData.xp} XP
                        </b>
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="willpower-form-actions">

                <button
                  type="button"
                  className="willpower-cancel-button"
                  onClick={() =>
                    setShowCreateForm(
                      false
                    )
                  }
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="willpower-confirm-button"
                >
                  DEPLOY MISSION
                </button>

              </div>

            </form>
          )}

          <div className="willpower-missions-list">

            {data.missions.length ===
              0 && (
              <div className="willpower-empty">

                <div className="willpower-empty-symbol">
                  W
                </div>

                <strong>
                  NO WILLPOWER MISSIONS
                </strong>

                <p>
                  Crea una misión y demuestra
                  que tu voluntad está por
                  encima de tus excusas.
                </p>

              </div>
            )}

            {data.missions
              .slice()
              .reverse()
              .map((mission) => {

                const rarityData =
                  RARITIES[
                    mission.rarity
                  ];

                const isCompletedToday =
                  mission.completedDate ===
                  today;

                return (
                  <article
                    className={`willpower-mission-card rarity-${mission.rarity} ${
                      isCompletedToday
                        ? "completed"
                        : ""
                    }`}
                    key={mission.id}
                  >

                    <div className="willpower-mission-index">
                      <span>
                        {rarityData.name}
                      </span>

                      <b>
                        +{rarityData.xp}
                      </b>

                    </div>

                    <div className="willpower-mission-main">

                      <h3>
                        {mission.name}
                      </h3>

                      {mission.description && (
                        <p>
                          {mission.description}
                        </p>
                      )}

                    </div>

                    <div className="willpower-mission-actions">

                      {isCompletedToday ? (
                        <div className="willpower-completed">
                          <span>✓</span>

                          <strong>
                            COMPLETED
                          </strong>

                          <small>
                            AVAILABLE TOMORROW
                          </small>
                        </div>
                      ) : (
                        <button
                          className="willpower-complete-button"
                          type="button"
                          onClick={() =>
                            completeMission(
                              mission
                            )
                          }
                        >
                          COMPLETE
                        </button>
                      )}

                      <button
                        className="willpower-delete-button"
                        type="button"
                        onClick={() =>
                          deleteMission(
                            mission.id
                          )
                        }
                        aria-label={`Eliminar ${mission.name}`}
                      >
                        ×
                      </button>

                    </div>

                  </article>
                );
              })}

          </div>

        </section>

      </section>

      <footer className="willpower-footer">

        <span>
          REQUIEM // WILLPOWER
        </span>

        <span>
          RESIST // ENDURE // ADVANCE
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {levelUpData && (
        <div className="willpower-level-up-overlay">

          <div className="willpower-level-up-flash"></div>

          <div className="willpower-level-up-panel">

            <span className="willpower-level-up-small">
              WILLPOWER ATTRIBUTE
            </span>

            <span className="willpower-level-up-title">
              LEVEL UP
            </span>

            <div className="willpower-level-up-number">
              {levelUpData.level}
            </div>

            <div className="willpower-level-up-line">
              <span></span>
              <b>W</b>
              <span></span>
            </div>

            <span className="willpower-level-up-xp">
              +{levelUpData.xp} XP
            </span>

          </div>

        </div>
      )}

    </main>
  );
}

export default Willpower;