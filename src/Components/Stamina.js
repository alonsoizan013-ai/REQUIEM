import React, { useEffect, useMemo, useState } from "react";
import "./Stamina.css";

const STORAGE_KEY = "requiem_stamina_data_v1";
const PLAYER_STORAGE_KEY = "requiem_player_data_v1";

const BASE_XP = 100;
const XP_GROWTH = 1.12;

const ACTIVITY_DEFINITIONS = {
  walking: {
    id: "walking",
    name: "CAMINATAS",
    shortName: "CAMINATA",
    description: "PASOS Y DISTANCIA",
    fields: ["steps", "km"],
    met: 3.5,
  },

  running: {
    id: "running",
    name: "CARRERA",
    shortName: "CARRERA",
    description: "DISTANCIA Y VELOCIDAD",
    fields: ["km", "minutes"],
    met: 9.8,
  },

  cycling: {
    id: "cycling",
    name: "BICICLETA",
    shortName: "BICICLETA",
    description: "DISTANCIA Y VELOCIDAD",
    fields: ["km", "minutes"],
    met: 7.5,
  },
};

const ACTIVITY_ORDER = [
  "walking",
  "running",
  "cycling",
];

function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date
    .toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}

function getPreviousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 2,
    1
  );

  return getMonthKey(date);
}

function createEmptyActivityData() {
  return {
    walking: {
      steps: 0,
      km: 0,
      calories: 0,
      xp: 0,
      records: [],
    },

    running: {
      km: 0,
      minutes: 0,
      calories: 0,
      xp: 0,
      records: [],
    },

    cycling: {
      km: 0,
      minutes: 0,
      calories: 0,
      xp: 0,
      records: [],
    },
  };
}

function createEmptyMonth() {
  return {
    activities: createEmptyActivityData(),
    totalXp: 0,
  };
}

function createInitialData() {
  return {
    months: {},
  };
}

/*
  NORMALIZA UN MES ANTIGUO

  El XP mensual siempre se reconstruye a partir
  del XP de sus actividades.

  Esto evita depender de un totalXp antiguo
  que pudiera estar desactualizado.
*/
function normalizeMonth(month) {
  const emptyMonth = createEmptyMonth();

  if (!month || typeof month !== "object") {
    return emptyMonth;
  }

  const oldActivities =
    month.activities &&
    typeof month.activities === "object"
      ? month.activities
      : {};

  const activities = {};

  ACTIVITY_ORDER.forEach((activity) => {
    const oldActivity =
      oldActivities[activity];

    if (
      !oldActivity ||
      typeof oldActivity !== "object"
    ) {
      activities[activity] =
        emptyMonth.activities[activity];

      return;
    }

    activities[activity] = {
      ...emptyMonth.activities[activity],
      ...oldActivity,

      steps:
        Number(oldActivity.steps) || 0,

      km:
        Number(oldActivity.km) || 0,

      minutes:
        Number(oldActivity.minutes) || 0,

      calories:
        Number(oldActivity.calories) || 0,

      xp:
        Number(oldActivity.xp) || 0,

      records:
        Array.isArray(oldActivity.records)
          ? oldActivity.records
          : [],
    };
  });

  const totalXp = Object.values(
    activities
  ).reduce(
    (total, activity) =>
      total + (Number(activity.xp) || 0),
    0
  );

  return {
    ...month,
    activities,
    totalXp,
  };
}

/*
  CARGA Y MIGRA LOS DATOS EXISTENTES.

  IMPORTANTE:
  No borra el progreso anterior.

  Cada mes conserva sus actividades y XP.
  Después podemos calcular el XP GLOBAL
  sumando todos los meses.
*/
function loadData() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createInitialData();
    }

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return createInitialData();
    }

    const oldMonths =
      parsed.months &&
      typeof parsed.months === "object"
        ? parsed.months
        : {};

    const normalizedMonths = {};

    Object.keys(oldMonths).forEach(
      (monthKey) => {
        normalizedMonths[monthKey] =
          normalizeMonth(
            oldMonths[monthKey]
          );
      }
    );

    return {
      months: normalizedMonths,
    };
  } catch {
    return createInitialData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error(
      "Error guardando datos de Stamina:",
      error
    );
  }
}

/*
  XP GLOBAL DE STAMINA

  Este es el cambio principal.

  El nivel NO depende del mes seleccionado.

  Se suma el XP de todos los meses existentes.
*/
function getGlobalXP(data) {
  if (
    !data ||
    !data.months ||
    typeof data.months !== "object"
  ) {
    return 0;
  }

  return Object.values(
    data.months
  ).reduce((total, month) => {
    const normalizedMonth =
      normalizeMonth(month);

    return (
      total +
      (Number(
        normalizedMonth.totalXp
      ) || 0)
    );
  }, 0);
}

function getRequiredXPForLevel(level) {
  if (level <= 1) {
    return 0;
  }

  return Math.ceil(
    BASE_XP *
      (Math.pow(
        XP_GROWTH,
        level - 1
      ) -
        1) /
      (XP_GROWTH - 1)
  );
}

function getLevelFromXP(xp) {
  if (!xp || xp <= 0) {
    return 1;
  }

  let level =
    Math.floor(
      Math.log(
        1 +
          (xp *
            (XP_GROWTH - 1)) /
            BASE_XP
      ) /
        Math.log(XP_GROWTH)
    ) + 1;

  while (
    getRequiredXPForLevel(
      level + 1
    ) <= xp
  ) {
    level += 1;
  }

  while (
    level > 1 &&
    getRequiredXPForLevel(level) >
      xp
  ) {
    level -= 1;
  }

  return level;
}

function getLevelProgress(xp) {
  const level =
    getLevelFromXP(xp);

  const currentLevelXP =
    getRequiredXPForLevel(level);

  const nextLevelXP =
    getRequiredXPForLevel(
      level + 1
    );

  const progressXP =
    xp - currentLevelXP;

  const requiredForNext =
    nextLevelXP -
    currentLevelXP;

  if (requiredForNext <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (progressXP /
        requiredForNext) *
        100
    )
  );
}

function roundNumber(
  value,
  decimals = 1
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor =
    Math.pow(10, decimals);

  return (
    Math.round(
      value * factor
    ) / factor
  );
}

function calculateXP(
  activity,
  values
) {
  if (activity === "walking") {
    return Math.floor(
      (values.steps *
        values.km) /
        10000
    );
  }

  if (activity === "running") {
    if (values.minutes <= 0) {
      return 0;
    }

    return Math.floor(
      (values.km /
        values.minutes) *
        120
    );
  }

  if (activity === "cycling") {
    if (values.minutes <= 0) {
      return 0;
    }

    return Math.floor(
      (values.km /
        values.minutes) *
        50
    );
  }

  return 0;
}

function getPlayerData() {
  try {
    const saved =
      localStorage.getItem(
        PLAYER_STORAGE_KEY
      );

    if (!saved) {
      return {
        weight: 70,
        height: 175,
        gender: "male",
        age: 20,
      };
    }

    const parsed =
      JSON.parse(saved);

    return {
      weight:
        Number(parsed.weight) || 70,

      height:
        Number(parsed.height) || 175,

      gender:
        parsed.gender || "male",

      age:
        Number(parsed.age) || 20,
    };
  } catch {
    return {
      weight: 70,
      height: 175,
      gender: "male",
      age: 20,
    };
  }
}

function calculateCalories(
  activity,
  values,
  player
) {
  const weight =
    Number(player.weight) || 70;

  if (activity === "walking") {
    const minutes =
      values.km > 0
        ? (values.km / 5) * 60
        : 0;

    return Math.round(
      ((ACTIVITY_DEFINITIONS
        .walking.met *
        3.5 *
        weight) /
        200) *
        minutes
    );
  }

  if (
    activity === "running" ||
    activity === "cycling"
  ) {
    const minutes =
      Number(values.minutes) || 0;

    const met =
      ACTIVITY_DEFINITIONS[
        activity
      ].met;

    return Math.round(
      ((met *
        3.5 *
        weight) /
        200) *
        minutes
    );
  }

  return 0;
}

function getSpeed(
  activity,
  values
) {
  if (
    activity !== "running" &&
    activity !== "cycling"
  ) {
    return 0;
  }

  if (
    !values.minutes ||
    values.minutes <= 0
  ) {
    return 0;
  }

  return (
    values.km /
    (values.minutes / 60)
  );
}

function createRecord(
  activity,
  values,
  player
) {
  const xp =
    calculateXP(
      activity,
      values
    );

  const calories =
    calculateCalories(
      activity,
      values,
      player
    );

  const speed =
    getSpeed(
      activity,
      values
    );

  return {
    id:
      Date.now().toString() +
      Math.random()
        .toString(36)
        .slice(2),

    activity,

    values: {
      ...values,
    },

    xp,

    calories,

    speed:
      activity === "walking"
        ? 0
        : roundNumber(
            speed,
            2
          ),

    date:
      new Date().toISOString(),
  };
}

function getActivityTotal(
  month,
  activity
) {
  if (
    !month ||
    !month.activities
  ) {
    return {
      steps: 0,
      km: 0,
      minutes: 0,
      calories: 0,
      xp: 0,
    };
  }

  const data =
    month.activities[
      activity
    ];

  if (!data) {
    return {
      steps: 0,
      km: 0,
      minutes: 0,
      calories: 0,
      xp: 0,
    };
  }

  return {
    steps:
      Number(data.steps) || 0,

    km:
      Number(data.km) || 0,

    minutes:
      Number(data.minutes) || 0,

    calories:
      Number(data.calories) || 0,

    xp:
      Number(data.xp) || 0,
  };
}

/*
  COMPARACIÓN MENSUAL

  Esto sigue funcionando con el XP
  exclusivo de cada mes.

  IMPORTANTE:
  La comparación mensual NO afecta
  al nivel global.
*/
function getMonthComparison(
  currentMonth,
  previousMonth
) {
  if (
    !currentMonth ||
    !previousMonth
  ) {
    return null;
  }

  const currentXP =
    Number(
      currentMonth.totalXp
    ) || 0;

  const previousXP =
    Number(
      previousMonth.totalXp
    ) || 0;

  if (previousXP <= 0) {
    return null;
  }

  return (
    ((currentXP -
      previousXP) /
      previousXP) *
    100
  );
}

function Stamina({
  onBack,
}) {
  const [data, setData] =
    useState(loadData);

  const [selectedMonth, setSelectedMonth] =
    useState(
      getMonthKey()
    );

  const [view, setView] =
    useState("dashboard");

  const [
    showActivityForm,
    setShowActivityForm,
  ] = useState(false);

  const [
    selectedActivity,
    setSelectedActivity,
  ] = useState(
    "walking"
  );

  const [
    formValues,
    setFormValues,
  ] = useState({
    steps: "",
    km: "",
    minutes: "",
  });

  const [levelUp, setLevelUp] =
    useState(null);

  const [
    playerData,
    setPlayerData,
  ] = useState(
    getPlayerData
  );

  /*
    CREA EL MES ACTUAL SI NO EXISTE.

    IMPORTANTE:
    Usamos la versión funcional de setData
    para no depender de "data" dentro
    del useEffect.

    Esto elimina el warning de ESLint.
  */
  useEffect(() => {
    const currentMonth =
      getMonthKey();

    setData((previousData) => {
      if (
        previousData.months[
          currentMonth
        ]
      ) {
        return previousData;
      }

      return {
        ...previousData,

        months: {
          ...previousData.months,

          [currentMonth]:
            createEmptyMonth(),
        },
      };
    });
  }, []);

  /*
    GUARDA LOS DATOS CADA VEZ QUE CAMBIAN.

    Como "data" está en las dependencias,
    ESLint no genera warning.
  */
  useEffect(() => {
    if (
      data &&
      data.months
    ) {
      saveData(data);
    }
  }, [data]);

  useEffect(() => {
    const refreshPlayerData =
      () => {
        setPlayerData(
          getPlayerData()
        );
      };

    window.addEventListener(
      "storage",
      refreshPlayerData
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshPlayerData
      );
    };
  }, []);

  const currentMonthData =
    data.months[
      selectedMonth
    ] ||
    createEmptyMonth();

  /*
    XP DEL MES SELECCIONADO

    Solo se utiliza para estadísticas
    y comparación mensual.
  */
  const currentMonthXP =
    Number(
      currentMonthData.totalXp
    ) || 0;

  /*
    XP GLOBAL

    ESTE es el XP que determina
    el nivel real de Stamina.
  */
  const globalXP =
    getGlobalXP(data);

  const currentLevel =
    getLevelFromXP(
      globalXP
    );

  const currentProgress =
    getLevelProgress(
      globalXP
    );

  const nextLevelXP =
    getRequiredXPForLevel(
      currentLevel + 1
    );

  const previousMonthKey =
    getPreviousMonthKey(
      selectedMonth
    );

  const previousMonthData =
    data.months[
      previousMonthKey
    ] || null;

  const monthComparison =
    getMonthComparison(
      currentMonthData,
      previousMonthData
    );

  const months = useMemo(() => {
    const keys =
      Object.keys(
        data.months
      );

    const currentKey =
      getMonthKey();

    if (
      !keys.includes(
        currentKey
      )
    ) {
      keys.push(
        currentKey
      );
    }

    return keys.sort(
      (a, b) =>
        new Date(
          b + "-01"
        ) -
        new Date(
          a + "-01"
        )
    );
  }, [data.months]);

  const walking =
    getActivityTotal(
      currentMonthData,
      "walking"
    );

  const running =
    getActivityTotal(
      currentMonthData,
      "running"
    );

  const cycling =
    getActivityTotal(
      currentMonthData,
      "cycling"
    );

  const totalRecords =
    ACTIVITY_ORDER.reduce(
      (
        total,
        activity
      ) => {
        const records =
          currentMonthData
            .activities[
            activity
          ]?.records ||
          [];

        return (
          total +
          records.length
        );
      },
      0
    );

  const handleActivityChange =
    (activity) => {
      setSelectedActivity(
        activity
      );

      setFormValues({
        steps: "",
        km: "",
        minutes: "",
      });
    };

  const handleInputChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setFormValues(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const handleAddActivity =
    (event) => {
      event.preventDefault();

      const values = {
        steps:
          Number(
            formValues.steps
          ) || 0,

        km:
          Number(
            formValues.km
          ) || 0,

        minutes:
          Number(
            formValues.minutes
          ) || 0,
      };

      if (
        selectedActivity ===
        "walking"
      ) {
        if (
          values.steps <= 0 ||
          values.km <= 0
        ) {
          alert(
            "Introduce pasos y kilómetros válidos."
          );

          return;
        }
      }

      if (
        selectedActivity ===
          "running" ||
        selectedActivity ===
          "cycling"
      ) {
        if (
          values.km <= 0 ||
          values.minutes <= 0
        ) {
          alert(
            "Introduce kilómetros y tiempo válidos."
          );

          return;
        }
      }

      const record =
        createRecord(
          selectedActivity,
          values,
          playerData
        );

      /*
        NIVEL GLOBAL ANTES
        DE AÑADIR LA ACTIVIDAD.
      */
      const oldGlobalXP =
        getGlobalXP(data);

      const oldLevel =
        getLevelFromXP(
          oldGlobalXP
        );

      const currentMonthCopy =
        data.months[
          selectedMonth
        ]
          ? normalizeMonth(
              data.months[
                selectedMonth
              ]
            )
          : createEmptyMonth();

      const currentActivity =
        currentMonthCopy
          .activities[
          selectedActivity
        ];

      const updatedActivity = {
        ...currentActivity,

        xp:
          currentActivity.xp +
          record.xp,

        calories:
          currentActivity.calories +
          record.calories,

        records: [
          ...currentActivity.records,
          record,
        ],
      };

      if (
        selectedActivity ===
        "walking"
      ) {
        updatedActivity.steps +=
          values.steps;

        updatedActivity.km +=
          values.km;
      }

      if (
        selectedActivity ===
          "running" ||
        selectedActivity ===
          "cycling"
      ) {
        updatedActivity.km +=
          values.km;

        updatedActivity.minutes +=
          values.minutes;
      }

      const updatedActivities = {
        ...currentMonthCopy.activities,

        [selectedActivity]:
          updatedActivity,
      };

      /*
        XP DEL MES
      */
      const newTotalXP =
        Object.values(
          updatedActivities
        ).reduce(
          (
            total,
            activity
          ) =>
            total +
            (Number(
              activity.xp
            ) || 0),
          0
        );

      const updatedMonth = {
        ...currentMonthCopy,

        activities:
          updatedActivities,

        totalXp:
          newTotalXP,
      };

      const updatedData = {
        ...data,

        months: {
          ...data.months,

          [selectedMonth]:
            updatedMonth,
        },
      };

      /*
        XP GLOBAL DESPUÉS
        DE AÑADIR LA ACTIVIDAD.
      */
      const newGlobalXP =
        getGlobalXP(
          updatedData
        );

      const newLevel =
        getLevelFromXP(
          newGlobalXP
        );

      setData(
        updatedData
      );

      setFormValues({
        steps: "",
        km: "",
        minutes: "",
      });

      setShowActivityForm(
        false
      );

      /*
        LEVEL UP GLOBAL

        Solo aparece cuando el nivel
        REAL de Stamina aumenta.
      */
      if (
        newLevel > oldLevel
      ) {
        setLevelUp({
          oldLevel,
          newLevel,
          xp: record.xp,
        });
      }
    };

  const closeLevelUp =
    () => {
      setLevelUp(null);
    };

  const getComparisonClass =
    () => {
      if (
        monthComparison ===
        null
      ) {
        return "empty";
      }

      if (
        monthComparison > 0
      ) {
        return "positive";
      }

      if (
        monthComparison < 0
      ) {
        return "negative";
      }

      return "neutral";
    };

  const getComparisonValue =
    () => {
      if (
        monthComparison ===
        null
      ) {
        return "—";
      }

      if (
        monthComparison > 0
      ) {
        return `+${roundNumber(
          monthComparison,
          1
        )}%`;
      }

      return `${roundNumber(
        monthComparison,
        1
      )}%`;
    };

  const getComparisonText =
    () => {
      if (
        monthComparison ===
        null
      ) {
        return "SIN DATOS DEL MES ANTERIOR";
      }

      return "VS MES ANTERIOR";
    };

  const renderActivityForm =
    () => {
      const definition =
        ACTIVITY_DEFINITIONS[
          selectedActivity
        ];

      return (
        <div className="stamina-modal-overlay">
          <div className="stamina-modal">
            <button
              className="stamina-modal-close"
              type="button"
              onClick={() =>
                setShowActivityForm(
                  false
                )
              }
            >
              ×
            </button>

            <div className="stamina-modal-header">
              <span>
                REQUIEM // ACTIVITY SYSTEM
              </span>

              <h2>
                AÑADIR ACTIVIDAD
              </h2>
            </div>

            <div className="stamina-activity-selector">
              {ACTIVITY_ORDER.map(
                (
                  activity
                ) => (
                  <button
                    key={
                      activity
                    }
                    type="button"
                    className={
                      selectedActivity ===
                      activity
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      handleActivityChange(
                        activity
                      )
                    }
                  >
                    {
                      ACTIVITY_DEFINITIONS[
                        activity
                      ].name
                    }
                  </button>
                )
              )}
            </div>

            <div className="stamina-selected-activity">
              <span>
                ACTIVIDAD SELECCIONADA
              </span>

              <strong>
                {
                  definition.name
                }
              </strong>
            </div>

            <form
              className="stamina-form"
              onSubmit={
                handleAddActivity
              }
            >
              {selectedActivity ===
                "walking" && (
                <>
                  <label>
                    <span>
                      PASOS
                    </span>

                    <input
                      type="number"
                      name="steps"
                      value={
                        formValues.steps
                      }
                      onChange={
                        handleInputChange
                      }
                      min="1"
                      step="1"
                      placeholder="10000"
                    />
                  </label>

                  <label>
                    <span>
                      KILÓMETROS
                    </span>

                    <input
                      type="number"
                      name="km"
                      value={
                        formValues.km
                      }
                      onChange={
                        handleInputChange
                      }
                      min="0.01"
                      step="0.01"
                      placeholder="7.5"
                    />
                  </label>
                </>
              )}

              {(selectedActivity ===
                "running" ||
                selectedActivity ===
                  "cycling") && (
                <>
                  <label>
                    <span>
                      KILÓMETROS
                    </span>

                    <input
                      type="number"
                      name="km"
                      value={
                        formValues.km
                      }
                      onChange={
                        handleInputChange
                      }
                      min="0.01"
                      step="0.01"
                      placeholder="5"
                    />
                  </label>

                  <label>
                    <span>
                      TIEMPO EN MINUTOS
                    </span>

                    <input
                      type="number"
                      name="minutes"
                      value={
                        formValues.minutes
                      }
                      onChange={
                        handleInputChange
                      }
                      min="1"
                      step="1"
                      placeholder="30"
                    />
                  </label>
                </>
              )}

              <div className="stamina-form-preview">
                <span>
                  XP GENERADO
                </span>

                <strong>
                  {calculateXP(
                    selectedActivity,
                    {
                      steps:
                        Number(
                          formValues.steps
                        ) || 0,

                      km:
                        Number(
                          formValues.km
                        ) || 0,

                      minutes:
                        Number(
                          formValues.minutes
                        ) || 0,
                    }
                  )}
                </strong>
              </div>

              <button
                className="stamina-submit"
                type="submit"
              >
                <span>
                  REGISTRAR ACTIVIDAD
                </span>

                <b>
                  →
                </b>
              </button>
            </form>
          </div>
        </div>
      );
    };

  const renderDashboard =
    () => (
      <>
        <section className="stamina-overview">
          <div className="stamina-overview-title">
            <span>
              CURRENT MONTH
            </span>

            <h1>
              STAMINA
            </h1>

            <p>
              {formatMonth(
                selectedMonth
              )}
            </p>
          </div>

          <div className="stamina-level-panel">
            <span>
              GENERAL LEVEL
            </span>

            <strong>
              {currentLevel}
            </strong>

            <small>
              {globalXP} XP
            </small>
          </div>

          <div className="stamina-month-panel">
            <span>
              MONTHLY PROGRESS
            </span>

            <strong
              className={`stamina-comparison-value ${getComparisonClass()}`}
            >
              {getComparisonValue()}
            </strong>

            <small
              className={
                getComparisonClass()
              }
            >
              {getComparisonText()}
            </small>
          </div>
        </section>

        <section className="stamina-progress-section">
          <div className="stamina-progress-header">
            <span>
              LEVEL{" "}
              {currentLevel}
            </span>

            <span>
              {globalXP} /
              {nextLevelXP} XP
            </span>
          </div>

          <div className="stamina-progress-track">
            <div
              className="stamina-progress-fill"
              style={{
                width: `${currentProgress}%`,
              }}
            ></div>
          </div>
        </section>

        <section className="stamina-month-selector">
          <div>
            <span>
              MONTH ARCHIVE
            </span>

            <strong>
              HISTORIAL MENSUAL
            </strong>
          </div>

          <select
            value={
              selectedMonth
            }
            onChange={(
              event
            ) =>
              setSelectedMonth(
                event.target
                  .value
              )
            }
          >
            {months.map(
              (
                month
              ) => (
                <option
                  key={
                    month
                  }
                  value={
                    month
                  }
                >
                  {formatMonth(
                    month
                  )}
                </option>
              )
            )}
          </select>
        </section>

        <section className="stamina-navigation">
          <button
            type="button"
            onClick={() =>
              setShowActivityForm(
                true
              )
            }
          >
            <span>
              +
            </span>

            AÑADIR ACTIVIDAD
          </button>

          <button
            type="button"
            className={
              view ===
              "history"
                ? "active"
                : ""
            }
            onClick={() =>
              setView(
                "history"
              )
            }
          >
            <span>
              ◈
            </span>

            HISTORIAL
          </button>

          <button
            type="button"
            className={
              view ===
              "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setView(
                "dashboard"
              )
            }
          >
            <span>
              ◆
            </span>

            RESUMEN
          </button>
        </section>

        <section className="stamina-activity-section">
          <div className="stamina-section-heading">
            <div>
              <span>
                ACTIVITY ANALYSIS
              </span>

              <h2>
                RESUMEN DEL MES
              </h2>
            </div>

            <small>
              {totalRecords}{" "}
              ACTIVIDADES
            </small>
          </div>

          <div className="stamina-activity-grid">
            <article className="stamina-activity-card walking">
              <div className="activity-card-header">
                <div>
                  <span>
                    01 // WALKING
                  </span>

                  <h3>
                    CAMINATAS
                  </h3>
                </div>

                <strong>
                  {walking.xp}
                </strong>
              </div>

              <div className="activity-card-stats">
                <div>
                  <span>
                    PASOS TOTALES
                  </span>

                  <strong>
                    {Math.round(
                      walking.steps
                    ).toLocaleString(
                      "es-ES"
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    KM TOTALES
                  </span>

                  <strong>
                    {roundNumber(
                      walking.km,
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    KCAL TOTALES
                  </span>

                  <strong>
                    {Math.round(
                      walking.calories
                    )}
                  </strong>
                </div>
              </div>

              <div className="activity-card-footer">
                <span>
                  XP GENERADOS
                </span>

                <b>
                  {walking.xp}
                </b>
              </div>
            </article>

            <article className="stamina-activity-card running">
              <div className="activity-card-header">
                <div>
                  <span>
                    02 // RUNNING
                  </span>

                  <h3>
                    CARRERA
                  </h3>
                </div>

                <strong>
                  {running.xp}
                </strong>
              </div>

              <div className="activity-card-stats">
                <div>
                  <span>
                    KM TOTALES
                  </span>

                  <strong>
                    {roundNumber(
                      running.km,
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    TIEMPO TOTAL
                  </span>

                  <strong>
                    {Math.round(
                      running.minutes
                    )}{" "}
                    MIN
                  </strong>
                </div>

                <div>
                  <span>
                    VELOCIDAD MEDIA
                  </span>

                  <strong>
                    {running.minutes >
                    0
                      ? roundNumber(
                          running.km /
                            (running.minutes /
                              60),
                          2
                        )
                      : 0}{" "}
                    KM/H
                  </strong>
                </div>

                <div>
                  <span>
                    KCAL TOTALES
                  </span>

                  <strong>
                    {Math.round(
                      running.calories
                    )}
                  </strong>
                </div>
              </div>

              <div className="activity-card-footer">
                <span>
                  XP GENERADOS
                </span>

                <b>
                  {running.xp}
                </b>
              </div>
            </article>

            <article className="stamina-activity-card cycling">
              <div className="activity-card-header">
                <div>
                  <span>
                    03 // CYCLING
                  </span>

                  <h3>
                    BICICLETA
                  </h3>
                </div>

                <strong>
                  {cycling.xp}
                </strong>
              </div>

              <div className="activity-card-stats">
                <div>
                  <span>
                    KM TOTALES
                  </span>

                  <strong>
                    {roundNumber(
                      cycling.km,
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    TIEMPO TOTAL
                  </span>

                  <strong>
                    {Math.round(
                      cycling.minutes
                    )}{" "}
                    MIN
                  </strong>
                </div>

                <div>
                  <span>
                    VELOCIDAD MEDIA
                  </span>

                  <strong>
                    {cycling.minutes >
                    0
                      ? roundNumber(
                          cycling.km /
                            (cycling.minutes /
                              60),
                          2
                        )
                      : 0}{" "}
                    KM/H
                  </strong>
                </div>

                <div>
                  <span>
                    KCAL TOTALES
                  </span>

                  <strong>
                    {Math.round(
                      cycling.calories
                    )}
                  </strong>
                </div>
              </div>

              <div className="activity-card-footer">
                <span>
                  XP GENERADOS
                </span>

                <b>
                  {cycling.xp}
                </b>
              </div>
            </article>
          </div>
        </section>
      </>
    );

  const renderHistory =
    () => (
      <section className="stamina-history">
        <div className="stamina-section-heading">
          <div>
            <span>
              ACTIVITY LOG
            </span>

            <h2>
              HISTORIAL DE ACTIVIDADES
            </h2>
          </div>

          <small>
            {formatMonth(
              selectedMonth
            )}
          </small>
        </div>

        {ACTIVITY_ORDER.map(
          (activity) => {
            const records =
              currentMonthData
                .activities[
                activity
              ]?.records ||
              [];

            return (
              <div
                className="stamina-history-group"
                key={
                  activity
                }
              >
                <div className="history-group-header">
                  <span>
                    {
                      ACTIVITY_DEFINITIONS[
                        activity
                      ].name
                    }
                  </span>

                  <b>
                    {
                      records.length
                    }{" "}
                    REGISTROS
                  </b>
                </div>

                {records.length ===
                0 ? (
                  <div className="history-empty">
                    SIN ACTIVIDADES
                    REGISTRADAS
                    ESTE MES
                  </div>
                ) : (
                  <div className="history-records">
                    {[
                      ...records,
                    ]
                      .sort(
                        (
                          a,
                          b
                        ) =>
                          new Date(
                            b.date
                          ) -
                          new Date(
                            a.date
                          )
                      )
                      .map(
                        (
                          record
                        ) => (
                          <div
                            className="stamina-history-record"
                            key={
                              record.id
                            }
                          >
                            <div>
                              <span>
                                FECHA
                              </span>

                              <strong>
                                {new Date(
                                  record.date
                                ).toLocaleDateString(
                                  "es-ES"
                                )}
                              </strong>
                            </div>

                            {activity ===
                              "walking" && (
                              <>
                                <div>
                                  <span>
                                    PASOS
                                  </span>

                                  <strong>
                                    {record
                                      .values
                                      .steps.toLocaleString(
                                        "es-ES"
                                      )}
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    KM
                                  </span>

                                  <strong>
                                    {
                                      record
                                        .values
                                        .km
                                    }
                                  </strong>
                                </div>
                              </>
                            )}

                            {activity !==
                              "walking" && (
                              <>
                                <div>
                                  <span>
                                    KM
                                  </span>

                                  <strong>
                                    {
                                      record
                                        .values
                                        .km
                                    }
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    MIN
                                  </span>

                                  <strong>
                                    {
                                      record
                                        .values
                                        .minutes
                                    }
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    KM/H
                                  </span>

                                  <strong>
                                    {
                                      record
                                        .speed
                                    }
                                  </strong>
                                </div>
                              </>
                            )}

                            <div>
                              <span>
                                KCAL
                              </span>

                              <strong>
                                {
                                  record.calories
                                }
                              </strong>
                            </div>

                            <div>
                              <span>
                                XP
                              </span>

                              <strong className="history-xp">
                                +
                                {
                                  record.xp
                                }
                              </strong>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </section>
    );

  return (
    <main className="stamina-screen">
      <div className="stamina-background">
        <div className="stamina-grid"></div>
        <div className="stamina-glow"></div>
        <div className="stamina-scanlines"></div>
        <div className="stamina-ring stamina-ring-one"></div>
        <div className="stamina-ring stamina-ring-two"></div>
      </div>

      <header className="stamina-header">
        <button
          className="stamina-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="stamina-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="stamina-header-center">
          <span className="stamina-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="stamina-header-title">
            STAMINA
          </span>
        </div>

        <div className="stamina-status">
          <span className="stamina-status-dot"></span>

          <span>
            ONLINE
          </span>
        </div>
      </header>

      <section className="stamina-content">
        {view ===
        "dashboard"
          ? renderDashboard()
          : renderHistory()}
      </section>

      <footer className="stamina-footer">
        <span>
          REQUIEM // STAMINA SYSTEM
        </span>

        <span>
          {globalXP} XP
        </span>

        <span>
          VER. 01.0
        </span>
      </footer>

      {showActivityForm &&
        renderActivityForm()}

      {levelUp && (
        <div className="stamina-level-overlay">
          <div className="stamina-level-card">
            <div className="stamina-level-rings"></div>

            <span className="stamina-level-small">
              REQUIEM SYSTEM
            </span>

            <h2>
              LEVEL UP
            </h2>

            <span className="stamina-level-name">
              STAMINA
            </span>

            <div className="stamina-level-values">
              <strong>
                {
                  levelUp.oldLevel
                }
              </strong>

              <span>
                →
              </span>

              <strong className="new-level">
                {
                  levelUp.newLevel
                }
              </strong>
            </div>

            <span className="stamina-level-xp">
              +{levelUp.xp} XP
            </span>

            <button
              type="button"
              onClick={
                closeLevelUp
              }
            >
              CONTINUAR
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Stamina;