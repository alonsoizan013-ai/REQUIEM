import React, { useEffect, useMemo, useState } from "react";
import "./Mind.css";

const STORAGE_KEY = "requiem-mind-data";

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
            (xpIntoLevel / xpForThisLevel) *
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

function Mind({ onBack }) {
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

  const completeMission = (
    mission
  ) => {
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
                  completedDate:
                    today,
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

  const deleteMission = (
    missionId
  ) => {
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
      description:
        cleanDescription,
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
    <main className="mind-screen">

      <div className="mind-background">
        <div className="mind-grid"></div>
        <div className="mind-glow"></div>
        <div className="mind-scanlines"></div>
      </div>

      <header className="mind-header">

        <button
          className="mind-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="mind-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="mind-header-center">

          <span className="mind-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="mind-header-title">
            MENTE
          </span>

        </div>

        <div className="mind-status">

          <span className="mind-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="mind-content">

        <div className="mind-intro">

          <span className="mind-intro-line"></span>

          <div>
            <p className="mind-intro-label">
              MENTAL ATTRIBUTE
            </p>

            <h1>
              MIND
            </h1>
          </div>

          <span className="mind-intro-line"></span>

        </div>

        <section className="mind-level-panel">

          <div className="mind-level-top">

            <div>
              <span className="mind-level-label">
                GENERAL LEVEL
              </span>

              <strong>
                {levelData.level}
              </strong>
            </div>

            <div className="mind-xp-display">
              <span>
                TOTAL XP
              </span>

              <b>
                {Math.floor(data.totalXp)}
              </b>
            </div>

          </div>

          <div className="mind-level-progress">

            <div className="mind-level-progress-info">

              <span>
                LEVEL {levelData.level}
              </span>

              <span>
                {Math.floor(
                  data.totalXp
                )} /{" "}
                {Math.floor(
                  levelData.nextLevelXP
                )} XP
              </span>

            </div>

            <div className="mind-progress-track">

              <div
                className="mind-progress-fill"
                style={{
                  width: `${levelData.percentage}%`,
                }}
              ></div>

              <span
                className="mind-progress-glow"
                style={{
                  left: `${levelData.percentage}%`,
                }}
              ></span>

            </div>

            <div className="mind-next-level">
              NEXT LEVEL{" "}
              {levelData.level + 1}
            </div>

          </div>

        </section>

        <div className="mind-stats-row">

          <div className="mind-mini-stat">
            <span>
              MISSIONS
            </span>

            <strong>
              {data.missions.length}
            </strong>
          </div>

          <div className="mind-mini-stat">
            <span>
              AVAILABLE
            </span>

            <strong>
              {availableMissions.length}
            </strong>
          </div>

          <div className="mind-mini-stat">
            <span>
              COMPLETED TODAY
            </span>

            <strong>
              {completedToday.length}
            </strong>
          </div>

        </div>

        <section className="mind-missions-section">

          <div className="mind-section-header">

            <div>
              <span>
                PLAYER MISSIONS
              </span>

              <h2>
                MENTAL CHALLENGES
              </h2>
            </div>

            <button
              className="mind-create-button"
              type="button"
              onClick={() =>
                setShowCreateForm(
                  !showCreateForm
                )
              }
            >
              <span>
                +
              </span>

              <span>
                CREATE MISSION
              </span>
            </button>

          </div>

          {showCreateForm && (
            <form
              className="mind-create-panel"
              onSubmit={
                handleCreateMission
              }
            >

              <div className="mind-form-header">
                <span>
                  NEW MISSION
                </span>

                <span>
                  CREATE // MANUAL
                </span>
              </div>

              <label className="mind-form-field">

                <span>
                  MISSION NAME
                </span>

                <input
                  type="text"
                  value={
                    missionName
                  }
                  onChange={(event) =>
                    setMissionName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ej. Leer 20 páginas"
                  maxLength={80}
                />

              </label>

              <label className="mind-form-field">

                <span>
                  DESCRIPTION
                </span>

                <textarea
                  value={
                    missionDescription
                  }
                  onChange={(event) =>
                    setMissionDescription(
                      event.target
                        .value
                    )
                  }
                  placeholder="Describe qué debes hacer..."
                  maxLength={200}
                  rows={3}
                />

              </label>

              <div className="mind-form-field">

                <span>
                  RARITY
                </span>

                <div className="mind-rarity-selector">

                  {Object.entries(
                    RARITIES
                  ).map(
                    ([
                      rarityId,
                      rarityData,
                    ]) => (
                      <button
                        key={
                          rarityId
                        }
                        type="button"
                        className={`mind-rarity-option rarity-${rarityId} ${
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
                          {
                            rarityData.name
                          }
                        </span>

                        <b>
                          +
                          {
                            rarityData.xp
                          } XP
                        </b>
                      </button>
                    )
                  )}

                </div>

              </div>

              <div className="mind-form-actions">

                <button
                  type="button"
                  className="mind-cancel-button"
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
                  className="mind-confirm-button"
                >
                  CREATE MISSION
                </button>

              </div>

            </form>
          )}

          <div className="mind-missions-list">

            {data.missions.length ===
              0 && (
              <div className="mind-empty">

                <span className="mind-empty-symbol">
                  +
                </span>

                <strong>
                  NO MISSIONS CREATED
                </strong>

                <p>
                  Crea tu primera misión
                  mental para comenzar
                  a desarrollar tu
                  MENTE.
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
                    className={`mind-mission-card rarity-${mission.rarity} ${
                      isCompletedToday
                        ? "completed"
                        : ""
                    }`}
                    key={mission.id}
                  >

                    <div className="mind-mission-rarity">
                      <span>
                        {rarityData.name}
                      </span>

                      <b>
                        +
                        {
                          rarityData.xp
                        } XP
                      </b>
                    </div>

                    <div className="mind-mission-main">

                      <h3>
                        {mission.name}
                      </h3>

                      {mission.description && (
                        <p>
                          {
                            mission.description
                          }
                        </p>
                      )}

                    </div>

                    <div className="mind-mission-actions">

                      {isCompletedToday ? (
                        <div className="mind-completed">

                          <span>
                            ✓
                          </span>

                          <strong>
                            COMPLETADA
                          </strong>

                          <small>
                            DISPONIBLE MAÑANA
                          </small>

                        </div>
                      ) : (
                        <button
                          className="mind-complete-button"
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
                        className="mind-delete-button"
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

      <footer className="mind-footer">

        <span>
          REQUIEM // MIND
        </span>

        <span>
          MENTAL DEVELOPMENT
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {levelUpData && (
        <div className="mind-level-up-overlay">

          <div className="mind-level-up-flash"></div>

          <div className="mind-level-up-panel">

            <span className="mind-level-up-small">
              MENTAL ATTRIBUTE
            </span>

            <span className="mind-level-up-title">
              LEVEL UP
            </span>

            <div className="mind-level-up-number">
              {levelUpData.level}
            </div>

            <div className="mind-level-up-line">
              <span></span>
              <b>×</b>
              <span></span>
            </div>

            <span className="mind-level-up-xp">
              +{levelUpData.xp} XP
            </span>

          </div>

        </div>
      )}

    </main>
  );
}

export default Mind;