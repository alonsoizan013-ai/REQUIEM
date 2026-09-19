import React, { useEffect, useMemo, useState } from "react";
import "./Strength.css";
import { supabase } from "../lib/supabase";

/* =========================================================
   CONFIGURACIÓN DE EJERCICIOS
========================================================= */

const muscleData = {
  ESPALDA: [
    {
      name: "JALÓN AL PECHO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
    {
      name: "DOMINADAS",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 2",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 2,
    },
    {
      name: "REMO EN MÁQUINA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 70",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 70,
    },
    {
      name: "REMO EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
    {
      name: "REMO EN BARRA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 45",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 45,
    },
    {
      name: "PULL OVER",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
  ],

  PECHO: [
    {
      name: "PRESS INCLINADO CON MANCUERNAS",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 35",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 35,
    },
    {
      name: "PRESS PLANO EN MULTIPOWER",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 35",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 35,
    },
    {
      name: "PRESS DE MÁQUINA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "APERTURAS (PECK DECK)",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 15",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 15,
    },
    {
      name: "FLEXIONES",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 3",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 3,
    },
  ],

  HOMBRO: [
    {
      name: "PRESS MILITAR CON MANCUERNAS",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 30",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 30,
    },
    {
      name: "ELEVACIONES LATERALES",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 15",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 15,
    },
    {
      name: "ELEVACIONES FRONTALES",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 15",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 15,
    },
    {
      name: "ELEVACIONES LATERALES EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 10",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 10,
    },
    {
      name: "ELEVACIONES FRONTALES EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 10",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 10,
    },
  ],

  TRÍCEPS: [
    {
      name: "PRESS FRANCÉS",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "EXTENSIÓN DE TRÍCEPS CON MANCUERNA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 15",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 15,
    },
    {
      name: "EXTENSIÓN DE TRÍCEPS UNILATERAL EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 30",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 30,
    },
    {
      name: "FONDOS",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 2",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 2,
    },
  ],

  BÍCEPS: [
    {
      name: "CURL PREDICADOR BARRA Z",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "CURL MARTILLO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "CURL DE BÍCEPS INCLINADO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "CURL DE BÍCEPS EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 20",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 20,
    },
    {
      name: "CURL PREDICADOR EN MÁQUINA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 25",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 25,
    },
    {
      name: "CURL MARTILLO EN POLEA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 20",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 20,
    },
  ],

  ABDOMEN: [
    {
      name: "CRUNCH ABDOMINAL",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 2",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 2,
    },
    {
      name: "ABDOMINALES 90 GRADOS",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 2",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 2,
    },
    {
      name: "ELEVACIONES DE PIERNAS",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 2",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 2,
    },
    {
      name: "TOQUE DE TALONES",
      type: "reps_sets",
      formula: "REPETICIONES × SERIES / 5",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 5,
    },
    {
      name: "TWIST RUSO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 10",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 10,
    },
    {
      name: "CRUNCH ABDOMINAL EN MÁQUINA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 20",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 20,
    },
    {
      name: "PLANCHA",
      type: "seconds_sets",
      formula: "SEGUNDOS × SERIES / 10",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 10,
    },
    {
      name: "PLANCHA INFERIOR",
      type: "seconds_sets",
      formula: "SEGUNDOS × SERIES / 10",
      calculateXP: (weight, reps, sets) =>
        (reps * sets) / 10,
    },
  ],

  FEMORAL: [
    {
      name: "CURL FEMORAL",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
    {
      name: "CURL FEMORAL TUMBADO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
    {
      name: "PESO MUERTO RUMANO",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 30",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 30,
    },
  ],

  ABDUCTORES: [
    {
      name: "MÁQUINA ABDUCTOR",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 30",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 30,
    },
  ],

  CUADRÍCEPS: [
    {
      name: "PRENSA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 100",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 100,
    },
    {
      name: "HACKA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 70",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 70,
    },
    {
      name: "EXTENSIÓN DE CUADRÍCEPS",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
  ],

  GEMELO: [
    {
      name: "EXTENSIÓN DE GEMELO EN BARRA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 50",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 50,
    },
    {
      name: "EXTENSIÓN DE GEMELO EN PRENSA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 60",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 60,
    },
    {
      name: "EXTENSIÓN DE GEMELO EN MÁQUINA",
      type: "weight_reps_sets",
      formula: "KILOS × REPETICIONES × SERIES / 40",
      calculateXP: (weight, reps, sets) =>
        (weight * reps * sets) / 40,
    },
  ],
};

const basicData = {
  "PRESS DE BANCA": {
    type: "basic_weight_sets",
    formula: "KILOS × SERIES / 3",
    calculateXP: (weight, reps, sets) =>
      (weight * sets) / 3,
  },

  "PESO MUERTO": {
    type: "basic_weight_sets",
    formula: "KILOS × SERIES / 4",
    calculateXP: (weight, reps, sets) =>
      (weight * sets) / 4,
  },

  SENTADILLA: {
    type: "basic_weight_sets",
    formula: "KILOS × SERIES / 4",
    calculateXP: (weight, reps, sets) =>
      (weight * sets) / 4,
  },
};

const MUSCLE_NAMES = Object.keys(muscleData);
const BASIC_NAMES = Object.keys(basicData);

const STORAGE_KEY = "requiem-strength-data";

/* =========================================================
   SISTEMA DE NIVELES
========================================================= */

const XP_BASE = 100;
const XP_GROWTH = 1.12;

function xpRequiredForLevel(level) {
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

  return total;
}

function calculateLevel(totalXP) {
  let level = 1;

  while (
    totalXP >=
    xpRequiredForLevel(level + 1)
  ) {
    level++;

    if (level >= 999) {
      break;
    }
  }

  return level;
}

function calculateLevelProgress(totalXP) {
  const level = calculateLevel(totalXP);

  const currentLevelXP =
    xpRequiredForLevel(level);

  const nextLevelXP =
    xpRequiredForLevel(level + 1);

  const neededForCurrentLevel =
    nextLevelXP - currentLevelXP;

  const currentProgress =
    totalXP - currentLevelXP;

  const percentage =
    neededForCurrentLevel <= 0
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            (currentProgress /
              neededForCurrentLevel) *
              100
          )
        );

  return {
    level,
    currentXP: Math.floor(
      currentProgress
    ),
    requiredXP: Math.ceil(
      neededForCurrentLevel
    ),
    percentage,
  };
}

/* =========================================================
   DATOS INICIALES
========================================================= */

function createInitialData() {
  const muscles = {};

  MUSCLE_NAMES.forEach((muscle) => {
    muscles[muscle] = {
      xp: 0,
    };
  });

  const basics = {};

  BASIC_NAMES.forEach((basic) => {
    basics[basic] = {
      xp: 0,
    };
  });

  return {
    muscles,
    basics,
    workouts: [],
  };
}

/* =========================================================
   CARGAR DATOS
========================================================= */

function loadStrengthData() {
  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return createInitialData();
  }

  try {
    const parsed = JSON.parse(saved);

    const initial =
      createInitialData();

    return {
      muscles: {
        ...initial.muscles,
        ...(parsed.muscles || {}),
      },

      basics: {
        ...initial.basics,
        ...(parsed.basics || {}),
      },

      workouts: Array.isArray(
        parsed.workouts
      )
        ? parsed.workouts
        : [],
    };
  } catch {
    return createInitialData();
  }
}

/* =========================================================
   NORMALIZAR DATOS DE SUPABASE
========================================================= */

function normalizeStrengthData(remoteData) {
  const initial = createInitialData();

  return {
    muscles: {
      ...initial.muscles,
      ...(remoteData?.muscles || {}),
    },

    basics: {
      ...initial.basics,
      ...(remoteData?.basics || {}),
    },

    workouts: Array.isArray(remoteData?.workouts)
      ? remoteData.workouts
      : [],
  };
}

/* =========================================================
   COMPONENTE
========================================================= */

function Strength({ onBack }) {
  const [data, setData] = useState(
    loadStrengthData
  );

  const [userId, setUserId] = useState(null);

  const [syncLoading, setSyncLoading] =
    useState(true);

  const [view, setView] = useState(
    "main"
  );

  const [selectedMuscle, setSelectedMuscle] =
    useState("ESPALDA");

  const [selectedExercise, setSelectedExercise] =
    useState(
      muscleData.ESPALDA[0].name
    );

  const [selectedBasic, setSelectedBasic] =
    useState("PRESS DE BANCA");

  const [weight, setWeight] =
    useState("");

  const [reps, setReps] =
    useState("");

  const [sets, setSets] =
    useState("");

  const [selectedHistory, setSelectedHistory] =
    useState(null);

  const [levelUp, setLevelUp] =
    useState(null);

  /* =====================================================
     SINCRONIZAR CON SUPABASE
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const syncStrengthData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error(
            "No hay ninguna sesión iniciada."
          );
        }

        const {
          data: cloudData,
          error: cloudError,
        } = await supabase
          .from("strength_data")
          .select("id, muscles, basics, workouts")
          .eq("id", user.id)
          .maybeSingle();

        if (cloudError) {
          throw cloudError;
        }

        if (cancelled) {
          return;
        }

        setUserId(user.id);

        if (cloudData) {
          const normalizedData =
            normalizeStrengthData(cloudData);

          setData(normalizedData);

          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(normalizedData)
          );
        } else {
          const localData =
            loadStrengthData();

          const { error: insertError } =
            await supabase
              .from("strength_data")
              .upsert(
                {
                  id: user.id,
                  muscles: localData.muscles,
                  basics: localData.basics,
                  workouts: localData.workouts,
                  updated_at:
                    new Date().toISOString(),
                },
                { onConflict: "id" }
              );

          if (insertError) {
            throw insertError;
          }

          if (cancelled) {
            return;
          }

          setData(localData);
        }
      } catch (error) {
        console.error(
          "REQUIEM STRENGTH SYNC ERROR:",
          error
        );

        if (!cancelled) {
          alert(
            error.message ||
              "No se ha podido sincronizar FUERZA con Supabase."
          );
        }
      } finally {
        if (!cancelled) {
          setSyncLoading(false);
        }
      }
    };

    syncStrengthData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     GUARDAR
  ===================================================== */

  const saveData = async (newData) => {
    setData(newData);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newData)
    );

    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("strength_data")
      .upsert(
        {
          id: userId,
          muscles: newData.muscles,
          basics: newData.basics,
          workouts: newData.workouts,
          updated_at:
            new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) {
      console.error(
        "REQUIEM STRENGTH SAVE ERROR:",
        error
      );

      alert(
        error.message ||
          "No se ha podido sincronizar el entrenamiento."
      );
    }
  };

  /* =====================================================
     NIVEL GENERAL
  ===================================================== */

  const muscleLevels = MUSCLE_NAMES.map(
    (muscle) =>
      calculateLevel(
        data.muscles[muscle]?.xp || 0
      )
  );

  const generalLevel = Math.floor(
    muscleLevels.reduce(
      (total, level) =>
        total + level,
      0
    ) / muscleLevels.length
  );

  const generalXP = MUSCLE_NAMES.reduce(
    (total, muscle) =>
      total +
      (data.muscles[muscle]?.xp || 0),
    0
  );

  const generalAverageLevel =
    muscleLevels.reduce(
      (total, level) =>
        total + level,
      0
    ) / muscleLevels.length;

  const generalLevelData =
    calculateLevelProgress(
      generalXP /
        MUSCLE_NAMES.length
    );

  /* =====================================================
     EJERCICIO ACTUAL
  ===================================================== */

  const currentExercises =
    muscleData[selectedMuscle];

  const currentExercise =
    currentExercises.find(
      (exercise) =>
        exercise.name ===
        selectedExercise
    ) ||
    currentExercises[0];

  /* =====================================================
     CAMBIAR MÚSCULO
  ===================================================== */

  const handleMuscleChange = (
    muscle
  ) => {
    setSelectedMuscle(muscle);

    setSelectedExercise(
      muscleData[muscle][0].name
    );

    setWeight("");
    setReps("");
    setSets("");
  };

  /* =====================================================
     REGISTRAR ENTRENAMIENTO DE MÚSCULO
  ===================================================== */

  const handleMuscleWorkout = async (
    event
  ) => {
    event.preventDefault();

    const needsWeight =
      currentExercise.type ===
      "weight_reps_sets";

    const needsReps =
      currentExercise.type ===
        "weight_reps_sets" ||
      currentExercise.type ===
        "reps_sets";

    const needsSeconds =
      currentExercise.type ===
      "seconds_sets";

    const numericWeight =
      Number(weight);

    const numericReps =
      Number(reps);

    const numericSets =
      Number(sets);

    if (
      needsWeight &&
      (!weight ||
        numericWeight <= 0)
    ) {
      alert(
        "Introduce los kilos levantados."
      );
      return;
    }

    if (
      needsReps &&
      (!reps ||
        numericReps <= 0)
    ) {
      alert(
        needsSeconds
          ? "Introduce los segundos."
          : "Introduce las repeticiones."
      );
      return;
    }

    if (
      !sets ||
      numericSets <= 0
    ) {
      alert(
        "Introduce las series."
      );
      return;
    }

    const xpEarned =
      Math.max(
        1,
        Math.floor(
          currentExercise.calculateXP(
            numericWeight,
            numericReps,
            numericSets
          )
        )
      );

    const oldXP =
      data.muscles[
        selectedMuscle
      ]?.xp || 0;

    const oldLevel =
      calculateLevel(oldXP);

    const newXP =
      oldXP + xpEarned;

    const newLevel =
      calculateLevel(newXP);

    const workout = {
      id: Date.now(),

      category: "muscle",

      muscle: selectedMuscle,

      exercise:
        currentExercise.name,

      type:
        currentExercise.type,

      weight:
        needsWeight
          ? numericWeight
          : null,

      reps:
        needsReps
          ? numericReps
          : null,

      seconds:
        needsSeconds
          ? numericReps
          : null,

      sets: numericSets,

      xp: xpEarned,

      date: new Date().toISOString(),

      formula:
        currentExercise.formula,
    };

    const newData = {
      ...data,

      muscles: {
        ...data.muscles,

        [selectedMuscle]: {
          xp: newXP,
        },
      },

      workouts: [
        workout,
        ...data.workouts,
      ],
    };

    await saveData(newData);

    setWeight("");
    setReps("");
    setSets("");

    if (newLevel > oldLevel) {
      setLevelUp({
        type: "muscle",
        name: selectedMuscle,
        oldLevel,
        newLevel,
        xp: xpEarned,
      });
    }
  };

  /* =====================================================
     REGISTRAR BÁSICO
  ===================================================== */

  const handleBasicWorkout = async (
    event
  ) => {
    event.preventDefault();

    const numericWeight =
      Number(weight);

    const numericSets =
      Number(sets);

    if (
      !weight ||
      numericWeight <= 0
    ) {
      alert(
        "Introduce los kilos levantados."
      );
      return;
    }

    if (
      !sets ||
      numericSets <= 0
    ) {
      alert(
        "Introduce las series."
      );
      return;
    }

    const basic =
      basicData[selectedBasic];

    const xpEarned =
      Math.max(
        1,
        Math.floor(
          basic.calculateXP(
            numericWeight,
            0,
            numericSets
          )
        )
      );

    const oldXP =
      data.basics[
        selectedBasic
      ]?.xp || 0;

    const oldLevel =
      calculateLevel(oldXP);

    const newXP =
      oldXP + xpEarned;

    const newLevel =
      calculateLevel(newXP);

    const workout = {
      id: Date.now(),

      category: "basic",

      basic: selectedBasic,

      exercise: selectedBasic,

      type: "basic_weight_sets",

      weight: numericWeight,

      reps: null,

      seconds: null,

      sets: numericSets,

      xp: xpEarned,

      date: new Date().toISOString(),

      formula:
        basic.formula,
    };

    const newData = {
      ...data,

      basics: {
        ...data.basics,

        [selectedBasic]: {
          xp: newXP,
        },
      },

      workouts: [
        workout,
        ...data.workouts,
      ],
    };

    await saveData(newData);

    setWeight("");
    setReps("");
    setSets("");

    if (newLevel > oldLevel) {
      setLevelUp({
        type: "basic",
        name: selectedBasic,
        oldLevel,
        newLevel,
        xp: xpEarned,
      });
    }
  };

  /* =====================================================
     HISTORIAL
  ===================================================== */

  const historyEntries =
    useMemo(() => {
      if (!selectedHistory) {
        return [];
      }

      if (
        selectedHistory.type ===
        "muscle"
      ) {
        return data.workouts.filter(
          (workout) =>
            workout.category ===
              "muscle" &&
            workout.muscle ===
              selectedHistory.name
        );
      }

      return data.workouts.filter(
        (workout) =>
          workout.category ===
            "basic" &&
          workout.basic ===
            selectedHistory.name
      );
    }, [
      data.workouts,
      selectedHistory,
    ]);

  /* =====================================================
     CERRAR ANIMACIÓN
  ===================================================== */

  const closeLevelUp = () => {
    setLevelUp(null);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  if (syncLoading) {
    return (
      <main className="strength-screen">
        <div className="strength-background">
          <div className="strength-grid"></div>

          <div className="strength-glow"></div>

          <div className="strength-scanlines"></div>

          <div className="strength-orbit strength-orbit-one"></div>

          <div className="strength-orbit strength-orbit-two"></div>
        </div>

        <section
          className="strength-content"
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <span className="strength-header-small">
              REQUIEM SYSTEM
            </span>

            <h1
              className="strength-header-title"
              style={{
                display: "block",
                marginTop: "12px",
              }}
            >
              SYNCING STRENGTH
            </h1>

            <p
              style={{
                marginTop: "12px",
                opacity: 0.7,
                letterSpacing: "0.15em",
              }}
            >
              CONNECTING TO SYSTEM...
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="strength-screen">

      <div className="strength-background">
        <div className="strength-grid"></div>

        <div className="strength-glow"></div>

        <div className="strength-scanlines"></div>

        <div className="strength-orbit strength-orbit-one"></div>

        <div className="strength-orbit strength-orbit-two"></div>
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="strength-header">

        <button
          className="strength-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="strength-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="strength-header-center">

          <span className="strength-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="strength-header-title">
            FUERZA
          </span>

        </div>

        <div className="strength-status">

          <span className="strength-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="strength-content">

        {/* =================================================
            GENERAL STATUS
        ================================================= */}

        <div className="strength-general">

          <div className="strength-general-info">

            <span className="strength-general-label">
              PHYSICAL ATTRIBUTE
            </span>

            <h1>
              FUERZA
            </h1>

            <p>
              PODER FÍSICO Y CAPACIDAD MUSCULAR
            </p>

          </div>

          <div className="strength-general-level">

            <span>
              GENERAL LEVEL
            </span>

            <strong>
              {generalLevel}
            </strong>

          </div>

          <div className="strength-total">

            <span>
              TOTAL ENTRENAMIENTOS
            </span>

            <strong>
              {data.workouts.length}
            </strong>

          </div>

        </div>

        {/* =================================================
            GENERAL PROGRESS
        ================================================= */}

        <div className="strength-general-progress">

          <div>

            <span>
              EVOLUCIÓN GENERAL
            </span>

            <span>
              MEDIA:{" "}
              {generalAverageLevel.toFixed(
                1
              )}
            </span>

          </div>

          <div className="strength-progress-track">

            <div
              className="strength-progress-fill"
              style={{
                width: `${generalLevelData.percentage}%`,
              }}
            ></div>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="strength-navigation">

          <button
            type="button"
            className={
              view === "main"
                ? "strength-nav-button active"
                : "strength-nav-button"
            }
            onClick={() =>
              setView("main")
            }
          >
            <span>
              01
            </span>

            FUERZA
          </button>

          <button
            type="button"
            className={
              view === "history"
                ? "strength-nav-button active"
                : "strength-nav-button"
            }
            onClick={() =>
              setView("history")
            }
          >
            <span>
              02
            </span>

            HISTORIAL DE ENTRENAMIENTOS
          </button>

        </div>

        {/* =================================================
            MAIN VIEW
        ================================================= */}

        {view === "main" && (
          <>

            {/* =============================================
                MUSCLES
            ============================================= */}

            <section className="strength-section">

              <div className="strength-section-title">

                <div>

                  <span>
                    MUSCLE DEVELOPMENT
                  </span>

                  <h2>
                    MÚSCULOS
                  </h2>

                </div>

                <small>
                  10 ATRIBUTOS
                </small>

              </div>

              <div className="strength-muscle-grid">

                {MUSCLE_NAMES.map(
                  (muscle) => {

                    const xp =
                      data.muscles[
                        muscle
                      ]?.xp || 0;

                    const levelData =
                      calculateLevelProgress(
                        xp
                      );

                    return (
                      <div
                        className="strength-muscle-card"
                        key={muscle}
                      >

                        <div className="muscle-card-top">

                          <span>
                            {muscle}
                          </span>

                          <strong>
                            {levelData.level}
                          </strong>

                        </div>

                        <div className="muscle-card-progress">

                          <div
                            style={{
                              width: `${levelData.percentage}%`,
                            }}
                          ></div>

                        </div>

                        <div className="muscle-card-bottom">

                          <span>
                            {Math.floor(
                              xp
                            )} XP
                          </span>

                          <span>
                            {levelData.currentXP} /{" "}
                            {levelData.requiredXP}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* =============================================
                BASICS
            ============================================= */}

            <section className="strength-section">

              <div className="strength-section-title">

                <div>

                  <span>
                    FUNDAMENTAL STRENGTH
                  </span>

                  <h2>
                    BÁSICOS
                  </h2>

                </div>

                <small>
                  3 EJERCICIOS
                </small>

              </div>

              <div className="strength-basic-grid">

                {BASIC_NAMES.map(
                  (basic) => {

                    const xp =
                      data.basics[
                        basic
                      ]?.xp || 0;

                    const levelData =
                      calculateLevelProgress(
                        xp
                      );

                    return (
                      <div
                        className="strength-basic-card"
                        key={basic}
                      >

                        <div className="basic-card-name">
                          {basic}
                        </div>

                        <div className="basic-card-level">

                          <span>
                            LEVEL
                          </span>

                          <strong>
                            {levelData.level}
                          </strong>

                        </div>

                        <div className="basic-card-progress">

                          <div
                            style={{
                              width: `${levelData.percentage}%`,
                            }}
                          ></div>

                        </div>

                        <div className="basic-card-xp">
                          {Math.floor(
                            xp
                          )} XP
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* =============================================
                CREATE TRAINING
            ============================================= */}

            <section className="strength-section">

              <div className="strength-section-title">

                <div>

                  <span>
                    TRAINING PROTOCOL
                  </span>

                  <h2>
                    CREAR ENTRENAMIENTO
                  </h2>

                </div>

              </div>

              <div className="strength-training-panel">

                <div className="strength-training-selector">

                  <div className="training-mode-buttons">

                    <button
                      type="button"
                      className={
                        selectedHistory?.type !==
                        "basic"
                          ? "training-mode active"
                          : "training-mode"
                      }
                      onClick={() => {
                        setSelectedHistory(
                          null
                        );
                      }}
                    >
                      MÚSCULO
                    </button>

                    <button
                      type="button"
                      className={
                        selectedHistory?.type ===
                        "basic"
                          ? "training-mode active"
                          : "training-mode"
                      }
                      onClick={() => {
                        setSelectedHistory({
                          type: "basic",
                          name: selectedBasic,
                        });
                      }}
                    >
                      BÁSICO
                    </button>

                  </div>

                  {selectedHistory?.type !==
                    "basic" && (
                    <>

                      <div className="training-label">
                        SELECCIONAR MÚSCULO
                      </div>

                      <div className="training-muscle-buttons">

                        {MUSCLE_NAMES.map(
                          (muscle) => (
                            <button
                              key={muscle}
                              type="button"
                              className={
                                selectedMuscle ===
                                muscle
                                  ? "training-muscle active"
                                  : "training-muscle"
                              }
                              onClick={() =>
                                handleMuscleChange(
                                  muscle
                                )
                              }
                            >
                              {muscle}
                            </button>
                          )
                        )}

                      </div>

                      <div className="training-label">
                        SELECCIONAR EJERCICIO
                      </div>

                      <div className="training-exercises">

                        {currentExercises.map(
                          (exercise) => (
                            <button
                              key={exercise.name}
                              type="button"
                              className={
                                selectedExercise ===
                                exercise.name
                                  ? "training-exercise active"
                                  : "training-exercise"
                              }
                              onClick={() => {
                                setSelectedExercise(
                                  exercise.name
                                );

                                setWeight("");
                                setReps("");
                                setSets("");
                              }}
                            >

                              <span>
                                {exercise.name}
                              </span>

                              <small>
                                {exercise.formula}
                              </small>

                            </button>
                          )
                        )}

                      </div>

                      <form
                        className="strength-training-form"
                        onSubmit={
                          handleMuscleWorkout
                        }
                      >

                        {currentExercise.type ===
                          "weight_reps_sets" && (
                          <label>

                            <span>
                              KILOS
                            </span>

                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={weight}
                              onChange={(event) =>
                                setWeight(
                                  event.target.value
                                )
                              }
                              placeholder="0"
                            />

                          </label>
                        )}

                        {(currentExercise.type ===
                          "weight_reps_sets" ||
                          currentExercise.type ===
                            "reps_sets" ||
                          currentExercise.type ===
                            "seconds_sets") && (
                          <label>

                            <span>
                              {currentExercise.type ===
                              "seconds_sets"
                                ? "SEGUNDOS"
                                : "REPETICIONES"}
                            </span>

                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={reps}
                              onChange={(event) =>
                                setReps(
                                  event.target.value
                                )
                              }
                              placeholder="0"
                            />

                          </label>
                        )}

                        <label>

                          <span>
                            SERIES
                          </span>

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={sets}
                            onChange={(event) =>
                              setSets(
                                event.target.value
                              )
                            }
                            placeholder="0"
                          />

                        </label>

                        <button
                          type="submit"
                          className="training-submit"
                        >
                          REGISTRAR ENTRENAMIENTO

                          <span>
                            +
                          </span>

                        </button>

                      </form>

                    </>
                  )}

                  {selectedHistory?.type ===
                    "basic" && (
                    <>

                      <div className="training-label">
                        SELECCIONAR BÁSICO
                      </div>

                      <div className="training-basic-buttons">

                        {BASIC_NAMES.map(
                          (basic) => (
                            <button
                              key={basic}
                              type="button"
                              className={
                                selectedBasic ===
                                basic
                                  ? "training-basic active"
                                  : "training-basic"
                              }
                              onClick={() =>
                                setSelectedBasic(
                                  basic
                                )
                              }
                            >
                              {basic}
                            </button>
                          )
                        )}

                      </div>

                      <div className="training-formula">
                        FÓRMULA:{" "}
                        {basicData[
                          selectedBasic
                        ].formula}
                      </div>

                      <form
                        className="strength-training-form basic-training-form"
                        onSubmit={
                          handleBasicWorkout
                        }
                      >

                        <label>

                          <span>
                            KILOS
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={weight}
                            onChange={(event) =>
                              setWeight(
                                event.target.value
                              )
                            }
                            placeholder="0"
                          />

                        </label>

                        <label>

                          <span>
                            SERIES
                          </span>

                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={sets}
                            onChange={(event) =>
                              setSets(
                                event.target.value
                              )
                            }
                            placeholder="0"
                          />

                        </label>

                        <button
                          type="submit"
                          className="training-submit"
                        >
                          REGISTRAR BÁSICO

                          <span>
                            +
                          </span>

                        </button>

                      </form>

                    </>
                  )}

                </div>

              </div>

            </section>

          </>
        )}

        {/* =================================================
            HISTORY VIEW
        ================================================= */}

        {view === "history" && (
          <section className="strength-history-view">

            {!selectedHistory ? (
              <>

                <div className="strength-section-title">

                  <div>

                    <span>
                      TRAINING DATABASE
                    </span>

                    <h2>
                      HISTORIAL
                    </h2>

                  </div>

                  <small>
                    {data.workouts.length} REGISTROS
                  </small>

                </div>

                <div className="history-category-title">
                  MÚSCULOS
                </div>

                <div className="history-selection-grid">

                  {MUSCLE_NAMES.map(
                    (muscle) => (
                      <button
                        type="button"
                        key={muscle}
                        className="history-selection-card"
                        onClick={() =>
                          setSelectedHistory({
                            type: "muscle",
                            name: muscle,
                          })
                        }
                      >

                        <span>
                          {muscle}
                        </span>

                        <strong>
                          {
                            data.workouts.filter(
                              (workout) =>
                                workout.category ===
                                  "muscle" &&
                                workout.muscle ===
                                  muscle
                            ).length
                          }
                        </strong>

                        <small>
                          ENTRENAMIENTOS
                        </small>

                      </button>
                    )
                  )}

                </div>

                <div className="history-category-title">
                  BÁSICOS
                </div>

                <div className="history-selection-grid history-basic-selection">

                  {BASIC_NAMES.map(
                    (basic) => (
                      <button
                        type="button"
                        key={basic}
                        className="history-selection-card"
                        onClick={() =>
                          setSelectedHistory({
                            type: "basic",
                            name: basic,
                          })
                        }
                      >

                        <span>
                          {basic}
                        </span>

                        <strong>
                          {
                            data.workouts.filter(
                              (workout) =>
                                workout.category ===
                                  "basic" &&
                                workout.basic ===
                                  basic
                            ).length
                          }
                        </strong>

                        <small>
                          ENTRENAMIENTOS
                        </small>

                      </button>
                    )
                  )}

                </div>

              </>
            ) : (
              <>

                <button
                  type="button"
                  className="history-back-button"
                  onClick={() =>
                    setSelectedHistory(
                      null
                    )
                  }
                >
                  ‹ VOLVER AL HISTORIAL
                </button>

                <div className="strength-section-title">

                  <div>

                    <span>
                      TRAINING DATABASE
                    </span>

                    <h2>
                      {selectedHistory.name}
                    </h2>

                  </div>

                  <small>
                    {historyEntries.length} REGISTROS
                  </small>

                </div>

                {historyEntries.length ===
                0 ? (
                  <div className="history-no-results">

                    <span>
                      NO HAY ENTRENAMIENTOS
                    </span>

                    <small>
                      TODAVÍA NO HAY REGISTROS
                      PARA ESTA CATEGORÍA
                    </small>

                  </div>
                ) : (
                  <div className="history-record-list">

                    {historyEntries.map(
                      (workout) => (
                        <div
                          className="history-record"
                          key={workout.id}
                        >

                          <div>
                            <span>
                              EJERCICIO
                            </span>

                            <strong>
                              {workout.exercise}
                            </strong>
                          </div>

                          {workout.weight !==
                            null && (
                            <div>

                              <span>
                                KILOS
                              </span>

                              <strong>
                                {workout.weight}
                              </strong>

                            </div>
                          )}

                          {workout.reps !==
                            null && (
                            <div>

                              <span>
                                {workout.type ===
                                "seconds_sets"
                                  ? "SEGUNDOS"
                                  : "REPETICIONES"}
                              </span>

                              <strong>
                                {workout.reps}
                              </strong>

                            </div>
                          )}

                          <div>

                            <span>
                              SERIES
                            </span>

                            <strong>
                              {workout.sets}
                            </strong>

                          </div>

                          <div>

                            <span>
                              XP
                            </span>

                            <strong>
                              +{workout.xp}
                            </strong>

                          </div>

                          <div>

                            <span>
                              FECHA
                            </span>

                            <strong>
                              {new Date(
                                workout.date
                              ).toLocaleDateString(
                                "es-ES"
                              )}
                            </strong>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </>
            )}

          </section>
        )}

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="strength-footer">

        <span>
          REQUIEM // STRENGTH MODULE
        </span>

        <span>
          10 MUSCLES // 3 BASICS
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {/* =================================================
          LEVEL UP ANIMATION
      ================================================= */}

      {levelUp && (
        <div
          className="level-up-overlay"
          onClick={closeLevelUp}
        >

          <div
            className={
              levelUp.type === "muscle"
                ? "level-up-card"
                : "level-up-card general-basic"
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="level-up-rings"></div>

            <span className="level-up-small">
              REQUIEM SYSTEM
            </span>

            <span className="level-up-label">
              LEVEL UP
            </span>

            <span className="level-up-name">
              {levelUp.name}
            </span>

            <div className="level-up-levels">

              <strong>
                {levelUp.oldLevel}
              </strong>

              <span>
                →
              </span>

              <strong className="new-level">
                {levelUp.newLevel}
              </strong>

            </div>

            <span className="level-up-xp">
              +{levelUp.xp} XP
            </span>

            <button
              type="button"
              onClick={closeLevelUp}
            >
              CONTINUAR
            </button>

          </div>

        </div>
      )}

    </main>
  );
}

export default Strength;