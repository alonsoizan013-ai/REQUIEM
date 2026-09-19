import React, { useMemo, useState } from "react";
import "./Finance.css";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const STORAGE_KEY = "requiem-finance-data";

const XP_BASE = 100;
const XP_GROWTH = 1.12;

/* =========================================================
   FORMATO DE DINERO
========================================================= */

const formatMoney = (amount) => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/* =========================================================
   DATOS INICIALES
========================================================= */

const createInitialData = () => ({
  totalMoney: 0,
  totalEarned: 0,
  categories: [],
  transactions: [],
});

/* =========================================================
   STORAGE
========================================================= */

const loadFinanceData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return createInitialData();
    }

    const parsedData = JSON.parse(savedData);

    return {
      totalMoney:
        typeof parsedData.totalMoney === "number"
          ? parsedData.totalMoney
          : 0,

      totalEarned:
        typeof parsedData.totalEarned === "number"
          ? parsedData.totalEarned
          : 0,

      categories: Array.isArray(parsedData.categories)
        ? parsedData.categories
        : [],

      transactions: Array.isArray(parsedData.transactions)
        ? parsedData.transactions
        : [],
    };
  } catch (error) {
    console.error("Error cargando los datos de Finanzas:", error);
    return createInitialData();
  }
};

const saveFinanceData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/* =========================================================
   NIVEL Y XP
========================================================= */

const getXPRequiredForLevel = (level) => {
  if (level <= 1) {
    return XP_BASE;
  }

  return XP_BASE * Math.pow(XP_GROWTH, level - 1);
};

const calculateLevel = (xp) => {
  let level = 1;
  let accumulatedXP = 0;

  while (true) {
    const requiredXP = getXPRequiredForLevel(level);

    if (accumulatedXP + requiredXP > xp) {
      break;
    }

    accumulatedXP += requiredXP;
    level += 1;
  }

  return level;
};

const calculateLevelProgress = (xp) => {
  const level = calculateLevel(xp);

  let accumulatedXP = 0;

  for (
    let currentLevel = 1;
    currentLevel < level;
    currentLevel += 1
  ) {
    accumulatedXP += getXPRequiredForLevel(currentLevel);
  }

  const currentLevelXP = getXPRequiredForLevel(level);

  const progressXP = xp - accumulatedXP;

  const percentage =
    currentLevelXP > 0
      ? Math.min((progressXP / currentLevelXP) * 100, 100)
      : 0;

  return {
    level,
    currentXP: progressXP,
    requiredXP: currentLevelXP,
    percentage,
  };
};

/* =========================================================
   COMPONENTE
========================================================= */

function Finance({ onBack }) {
  const [data, setData] = useState(loadFinanceData);

  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [incomeAmount, setIncomeAmount] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryPercentage, setCategoryPercentage] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] =
    useState(null);

  const [expenseAmount, setExpenseAmount] = useState("");

  const [levelUp, setLevelUp] = useState(false);

  /* =========================================================
     VALORES CALCULADOS
  ========================================================= */

  const totalPercentage = useMemo(() => {
    return data.categories.reduce(
      (total, category) => total + category.percentage,
      0
    );
  }, [data.categories]);

  const unassignedPercentage = Math.max(
    0,
    100 - totalPercentage
  );

  const unassignedMoney = useMemo(() => {
    return (
      data.totalMoney *
      (unassignedPercentage / 100)
    );
  }, [data.totalMoney, unassignedPercentage]);

  const assignedMoney = useMemo(() => {
    return data.totalMoney - unassignedMoney;
  }, [data.totalMoney, unassignedMoney]);

  const levelData = useMemo(() => {
    return calculateLevelProgress(
      data.totalEarned / 20
    );
  }, [data.totalEarned]);

  /* =========================================================
     ACTUALIZAR STORAGE
  ========================================================= */

  const updateData = (newData) => {
    setData(newData);
    saveFinanceData(newData);
  };

  /* =========================================================
     AÑADIR INGRESO
  ========================================================= */

  const handleAddIncome = (event) => {
    event.preventDefault();

    const amount = Number(incomeAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const oldLevel = levelData.level;

    const distributedCategories = data.categories.map(
      (category) => ({
        ...category,
        money:
          category.money +
          amount * (category.percentage / 100),
      })
    );

    const newData = {
      ...data,

      totalMoney: data.totalMoney + amount,

      totalEarned: data.totalEarned + amount,

      categories: distributedCategories,

      transactions: [
        {
          id: Date.now(),
          type: "income",
          amount,
          date: new Date().toISOString(),
        },
        ...data.transactions,
      ],
    };

    const newLevel = calculateLevelProgress(
      newData.totalEarned / 20
    ).level;

    updateData(newData);

    setIncomeAmount("");
    setShowIncomeForm(false);

    if (newLevel > oldLevel) {
      setLevelUp(true);

      setTimeout(() => {
        setLevelUp(false);
      }, 2500);
    }
  };

  /* =========================================================
     CREAR APARTADO
  ========================================================= */

  const handleCreateCategory = (event) => {
    event.preventDefault();

    const name = categoryName.trim();
    const percentage = Number(categoryPercentage);

    if (!name) {
      return;
    }

    if (!Number.isFinite(percentage) || percentage <= 0) {
      return;
    }

    if (totalPercentage + percentage > 100) {
      alert(
        `No puedes superar el 100%.\n\nPorcentaje disponible: ${(
          100 - totalPercentage
        ).toFixed(2)}%`
      );

      return;
    }

    const newCategory = {
      id: Date.now(),
      name,
      percentage,
      money:
        data.totalMoney * (percentage / 100),
    };

    const newData = {
      ...data,
      categories: [
        ...data.categories,
        newCategory,
      ],
    };

    updateData(newData);

    setCategoryName("");
    setCategoryPercentage("");
    setShowCategoryForm(false);
  };

  /* =========================================================
     ELIMINAR APARTADO
  ========================================================= */

  const handleDeleteCategory = (categoryId) => {
    const category = data.categories.find(
      (item) => item.id === categoryId
    );

    if (!category) {
      return;
    }

    const confirmDelete = window.confirm(
      `¿Quieres eliminar el apartado "${category.name}"?\n\n` +
        `Los ${formatMoney(category.money)} € volverán al dinero sin asignar.`
    );

    if (!confirmDelete) {
      return;
    }

    const newData = {
      ...data,

      categories: data.categories.filter(
        (item) => item.id !== categoryId
      ),
    };

    updateData(newData);

    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId(null);
    }
  };

  /* =========================================================
     AÑADIR GASTO
  ========================================================= */

  const handleAddExpense = (event) => {
    event.preventDefault();

    const amount = Number(expenseAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const category = data.categories.find(
      (item) => item.id === selectedCategoryId
    );

    if (!category) {
      return;
    }

    if (amount > category.money) {
      alert(
        `No puedes gastar más dinero del disponible en este apartado.\n\n` +
          `Disponible: ${formatMoney(category.money)} €`
      );

      return;
    }

    if (amount > data.totalMoney) {
      alert(
        `No puedes gastar más dinero del total disponible.`
      );

      return;
    }

    const newCategories = data.categories.map(
      (item) => {
        if (item.id !== selectedCategoryId) {
          return item;
        }

        return {
          ...item,
          money: item.money - amount,
        };
      }
    );

    const newData = {
      ...data,

      totalMoney: data.totalMoney - amount,

      categories: newCategories,

      transactions: [
        {
          id: Date.now(),
          type: "expense",
          amount,
          categoryId: selectedCategoryId,
          date: new Date().toISOString(),
        },
        ...data.transactions,
      ],
    };

    updateData(newData);

    setExpenseAmount("");
    setSelectedCategoryId(null);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="finance-screen">

      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="finance-background">
        <div className="finance-grid"></div>
        <div className="finance-glow"></div>
        <div className="finance-scanlines"></div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="finance-header">

        <button
          className="finance-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="finance-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="finance-header-center">

          <span className="finance-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="finance-header-title">
            FINANZAS
          </span>

        </div>

        <div className="finance-status">

          <span className="finance-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <section className="finance-content">

        {/* ===================================================
            BLOQUE PRINCIPAL DE DINERO
        =================================================== */}

        <section className="finance-money-panel">

          <div className="finance-section-label">
            <span></span>

            <p>
              CAPITAL DISPONIBLE
            </p>

            <span></span>
          </div>

          <p className="finance-total-label">
            DINERO TOTAL
          </p>

          <h1 className="finance-total-money">
            {formatMoney(data.totalMoney)} €
          </h1>

          <div className="finance-money-details">

            <div>
              <span>
                DINERO GANADO
              </span>

              <strong>
                {formatMoney(data.totalEarned)} €
              </strong>
            </div>

            <div>
              <span>
                SIN ASIGNAR
              </span>

              <strong>
                {formatMoney(unassignedMoney)} €
              </strong>
            </div>

          </div>

          <div className="finance-main-actions">

            <button
              type="button"
              onClick={() =>
                setShowIncomeForm(!showIncomeForm)
              }
            >
              + AÑADIR INGRESO
            </button>

            <button
              type="button"
              onClick={() =>
                setShowCategoryForm(!showCategoryForm)
              }
            >
              + CREAR APARTADO
            </button>

          </div>

        </section>

        {/* ===================================================
            NIVEL
        =================================================== */}

        <section className="finance-level-panel">

          <div className="finance-level-top">

            <div>
              <span className="finance-level-label">
                FINANZAS
              </span>

              <span className="finance-level-number">
                LVL {levelData.level}
              </span>
            </div>

            <div className="finance-level-xp">
              {levelData.currentXP.toFixed(1)}
              {" / "}
              {levelData.requiredXP.toFixed(1)}
              {" XP"}
            </div>

          </div>

          <div className="finance-xp-bar">

            <div
              className="finance-xp-fill"
              style={{
                width: `${levelData.percentage}%`,
              }}
            ></div>

          </div>

          <p className="finance-level-description">
            DINERO GANADO / 20
          </p>

        </section>

        {/* ===================================================
            FORMULARIO INGRESO
        =================================================== */}

        {showIncomeForm && (
          <section className="finance-form-panel">

            <div className="finance-form-header">
              <span>
                NUEVO INGRESO
              </span>

              <button
                type="button"
                onClick={() =>
                  setShowIncomeForm(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddIncome}>

              <label>
                CANTIDAD
              </label>

              <div className="finance-input-row">

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={incomeAmount}
                  onChange={(event) =>
                    setIncomeAmount(event.target.value)
                  }
                  placeholder="100"
                />

                <span>
                  €
                </span>

              </div>

              <button
                className="finance-confirm-button"
                type="submit"
              >
                AÑADIR DINERO
              </button>

            </form>

          </section>
        )}

        {/* ===================================================
            FORMULARIO APARTADO
        =================================================== */}

        {showCategoryForm && (
          <section className="finance-form-panel">

            <div className="finance-form-header">

              <span>
                NUEVO APARTADO
              </span>

              <button
                type="button"
                onClick={() =>
                  setShowCategoryForm(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleCreateCategory}>

              <label>
                NOMBRE DEL APARTADO
              </label>

              <input
                type="text"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(event.target.value)
                }
                placeholder="Ej. COCHE"
              />

              <label>
                PORCENTAJE
              </label>

              <div className="finance-input-row">

                <input
                  type="number"
                  min="0.01"
                  max={100 - totalPercentage}
                  step="0.01"
                  value={categoryPercentage}
                  onChange={(event) =>
                    setCategoryPercentage(
                      event.target.value
                    )
                  }
                  placeholder="40"
                />

                <span>
                  %
                </span>

              </div>

              <p className="finance-percentage-info">
                PORCENTAJE DISPONIBLE:{" "}
                {(100 - totalPercentage).toFixed(2)}%
              </p>

              <button
                className="finance-confirm-button"
                type="submit"
              >
                CREAR APARTADO
              </button>

            </form>

          </section>
        )}

        {/* ===================================================
            APARTADOS
        =================================================== */}

        <section className="finance-categories-section">

          <div className="finance-section-heading">

            <div>
              <span>
                CAPITAL ALLOCATIONS
              </span>

              <h2>
                TUS APARTADOS
              </h2>
            </div>

            <div className="finance-percentage-total">
              {totalPercentage.toFixed(2)}%
            </div>

          </div>

          {data.categories.length === 0 ? (

            <div className="finance-empty-state">

              <span>
                NO HAY APARTADOS CREADOS
              </span>

              <p>
                Crea un apartado para comenzar a
                distribuir tu dinero.
              </p>

            </div>

          ) : (

            <div className="finance-categories-grid">

              {data.categories.map((category) => (

                <article
                  className="finance-category-card"
                  key={category.id}
                >

                  <div className="finance-category-top">

                    <div>

                      <span className="finance-category-percentage">
                        {category.percentage}%
                      </span>

                      <h3>
                        {category.name}
                      </h3>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCategory(
                          category.id
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                  <div className="finance-category-money">
                    {formatMoney(category.money)} €
                  </div>

                  <div className="finance-category-bar">

                    <div
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    ></div>

                  </div>

                  <button
                    className="finance-category-expense-button"
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(
                        category.id
                      )
                    }
                  >
                    AÑADIR GASTO
                  </button>

                  {selectedCategoryId ===
                    category.id && (

                    <form
                      className="finance-expense-form"
                      onSubmit={handleAddExpense}
                    >

                      <label>
                        GASTO
                      </label>

                      <div className="finance-input-row">

                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={expenseAmount}
                          onChange={(event) =>
                            setExpenseAmount(
                              event.target.value
                            )
                          }
                          placeholder="40"
                        />

                        <span>
                          €
                        </span>

                      </div>

                      <div className="finance-expense-actions">

                        <button
                          type="submit"
                          className="finance-confirm-button"
                        >
                          CONFIRMAR
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(
                              null
                            );

                            setExpenseAmount("");
                          }}
                        >
                          CANCELAR
                        </button>

                      </div>

                    </form>
                  )}

                </article>

              ))}

            </div>

          )}

        </section>

        {/* ===================================================
            RESUMEN
        =================================================== */}

        <section className="finance-summary-panel">

          <div>
            <span>
              DINERO TOTAL
            </span>

            <strong>
              {formatMoney(data.totalMoney)} €
            </strong>
          </div>

          <div>
            <span>
              ASIGNADO
            </span>

            <strong>
              {formatMoney(assignedMoney)} €
            </strong>
          </div>

          <div>
            <span>
              SIN ASIGNAR
            </span>

            <strong>
              {formatMoney(unassignedMoney)} €
            </strong>
          </div>

          <div>
            <span>
              GANADO HISTÓRICO
            </span>

            <strong>
              {formatMoney(data.totalEarned)} €
            </strong>
          </div>

        </section>

      </section>

      {/* =====================================================
          LEVEL UP
      ===================================================== */}

      {levelUp && (

        <div className="finance-level-up-overlay">

          <div className="finance-level-up-box">

            <span>
              FINANZAS
            </span>

            <strong>
              LEVEL UP
            </strong>

            <p>
              LVL {levelData.level}
            </p>

          </div>

        </div>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="finance-footer">

        <span>
          REQUIEM // FINANZAS
        </span>

        <span>
          CAPITAL MANAGEMENT SYSTEM
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

    </main>
  );
}

export default Finance;