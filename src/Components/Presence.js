import React, { useEffect, useMemo, useState } from "react";
import "./Presence.css";

const STORAGE_KEY = "requiem-presence-data";

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
    const saved =
      localStorage.getItem(STORAGE_KEY);

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

function Presence({ onBack }) {
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
    <main className="presence-screen">

      <div className="presence-background">
        <div className="presence-grid"></div>
        <div className="presence-halo"></div>
        <div className="presence-ring presence-ring-one"></div>
        <div className="presence-ring presence-ring-two"></div>
        <div className="presence-scanlines"></div>
      </div>

      <header className="presence-header">

        <button
          className="presence-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="presence-back-symbol">
            ‹
          </span>

          <span>RETURN</span>
        </button>

        <div className="presence-header-center">

          <span className="presence-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="presence-header-title">
            PRESENCIA
          </span>

        </div>

        <div className="presence-status">
          <span className="presence-status-dot"></span>
          <span>ONLINE</span>
        </div>

      </header>

      <section className="presence-content">

        <div className="presence-intro">

          <div className="presence-intro-line"></div>

          <div className="presence-intro-core">

            <span>
              SOCIAL ATTRIBUTE
            </span>

            <div className="presence-symbol">
              P
            </div>

            <h1>PRESENCIA</h1>

            <small>
              IMPACT // CONTROL // AURA
            </small>

          </div>

          <div className="presence-intro-line"></div>

        </div>

        <section className="presence-level-panel">

          <div className="presence-level-core">

            <div className="presence-orbit"></div>

            <span>
              GENERAL
            </span>

            <strong>
              {levelData.level}
            </strong>

            <small>
              LEVEL
            </small>

          </div>

          <div className="presence-level-data">

            <div className="presence-data-header">

              <span>
                PRESENCE DEVELOPMENT
              </span>

              <b>
                {Math.floor(
                  data.totalXp
                )} XP
              </b>

            </div>

            <div className="presence-progress">

              <div
                className="presence-progress-fill"
                style={{
                  width: `${levelData.percentage}%`,
                }}
              ></div>

            </div>

            <div className="presence-progress-info">

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
                LVL {levelData.level + 1}
              </span>

            </div>

          </div>

        </section>

        <div className="presence-stats-row">

          <div className="presence-stat">
            <span>TOTAL</span>
            <strong>
              {data.missions.length}
            </strong>
            <small>MISSIONS</small>
          </div>

          <div className="presence-stat">
            <span>ACTIVE</span>
            <strong>
              {availableMissions.length}
            </strong>
            <small>AVAILABLE</small>
          </div>

          <div className="presence-stat">
            <span>TODAY</span>
            <strong>
              {completedToday.length}
            </strong>
            <small>COMPLETED</small>
          </div>

        </div>

        <section className="presence-missions-section">

          <div className="presence-section-header">

            <div>
              <span>PLAYER DEVELOPMENT</span>

              <h2>
                PRESENCE MISSIONS
              </h2>
            </div>

            <button
              className="presence-create-button"
              type="button"
              onClick={() =>
                setShowCreateForm(
                  !showCreateForm
                )
              }
            >
              <span>+</span>
              <span>
                CREATE MISSION
              </span>
            </button>

          </div>

          {showCreateForm && (
            <form
              className="presence-create-panel"
              onSubmit={
                handleCreateMission
              }
            >

              <div className="presence-form-header">

                <span>
                  NEW PRESENCE MISSION
                </span>

                <span>
                  MANUAL // SYSTEM
                </span>

              </div>

              <label className="presence-form-field">

                <span>MISSION NAME</span>

                <input
                  type="text"
                  value={missionName}
                  onChange={(event) =>
                    setMissionName(
                      event.target.value
                    )
                  }
                  placeholder="Ej. Hablar con seguridad"
                  maxLength={80}
                />

              </label>

              <label className="presence-form-field">

                <span>DESCRIPTION</span>

                <textarea
                  value={
                    missionDescription
                  }
                  onChange={(event) =>
                    setMissionDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe la conducta que quieres desarrollar..."
                  maxLength={200}
                  rows={3}
                />

              </label>

              <div className="presence-form-field">

                <span>RARITY</span>

                <div className="presence-rarity-selector">

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
                        className={`presence-rarity-option rarity-${rarityId} ${
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

              <div className="presence-form-actions">

                <button
                  type="button"
                  className="presence-cancel-button"
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
                  className="presence-confirm-button"
                >
                  CREATE MISSION
                </button>

              </div>

            </form>
          )}

          <div className="presence-missions-list">

            {data.missions.length ===
              0 && (
              <div className="presence-empty">

                <div className="presence-empty-core">
                  P
                </div>

                <strong>
                  NO MISSIONS CREATED
                </strong>

                <p>
                  Crea misiones para desarrollar
                  tu presencia, seguridad e
                  impacto personal.
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
                    className={`presence-mission-card rarity-${mission.rarity} ${
                      isCompletedToday
                        ? "completed"
                        : ""
                    }`}
                    key={mission.id}
                  >

                    <div className="presence-mission-rarity">

                      <div>
                        <span>
                          {rarityData.name}
                        </span>

                        <b>
                          +{rarityData.xp} XP
                        </b>
                      </div>

                    </div>

                    <div className="presence-mission-main">

                      <h3>
                        {mission.name}
                      </h3>

                      {mission.description && (
                        <p>
                          {mission.description}
                        </p>
                      )}

                    </div>

                    <div className="presence-mission-actions">

                      {isCompletedToday ? (
                        <div className="presence-completed">

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
                          className="presence-complete-button"
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
                        className="presence-delete-button"
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

      <footer className="presence-footer">

        <span>
          REQUIEM // PRESENCE
        </span>

        <span>
          STAND // SPEAK // COMMAND
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {levelUpData && (
        <div className="presence-level-up-overlay">

          <div className="presence-level-up-flash"></div>

          <div className="presence-level-up-panel">

            <div className="presence-level-up-orbit"></div>

            <span className="presence-level-up-small">
              PRESENCE ATTRIBUTE
            </span>

            <span className="presence-level-up-title">
              LEVEL UP
            </span>

            <div className="presence-level-up-number">
              {levelUpData.level}
            </div>

            <div className="presence-level-up-line">
              <span></span>
              <b>P</b>
              <span></span>
            </div>

            <span className="presence-level-up-xp">
              +{levelUpData.xp} XP
            </span>

          </div>

        </div>
      )}

    </main>
  );
}

export default Presence;