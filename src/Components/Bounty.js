import React, { useEffect, useState } from "react";
import "./Bounty.css";

const STORAGE_KEY = "requiem-bounty-data";

const createEmptyData = () => ({
  bounty: 0,
  actions: [],
});

const formatBounty = (amount) => {
  return new Intl.NumberFormat("es-ES").format(amount);
};

function Bounty({ onBack }) {
  const [data, setData] = useState(createEmptyData);
  const [isLoaded, setIsLoaded] = useState(false);

  const [actionName, setActionName] = useState("");
  const [actionDescription, setActionDescription] = useState("");
  const [actionReward, setActionReward] = useState("");

  const [showRewardAnimation, setShowRewardAnimation] =
    useState(false);
  const [rewardGained, setRewardGained] = useState(0);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        setData({
          bounty:
            typeof parsedData.bounty === "number" &&
            Number.isFinite(parsedData.bounty)
              ? parsedData.bounty
              : 0,

          actions: Array.isArray(parsedData.actions)
            ? parsedData.actions
            : [],
        });
      } else {
        setData(createEmptyData());
      }
    } catch (error) {
      console.error(
        "Error loading REQUIEM BOUNTY data:",
        error
      );

      setData(createEmptyData());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }, [data, isLoaded]);

  const handleCreateAction = (event) => {
    event.preventDefault();

    const name = actionName.trim();
    const description = actionDescription.trim();
    const reward = Number(actionReward);

    if (!name) {
      alert("Introduce un nombre para la acción.");
      return;
    }

    if (!description) {
      alert("Introduce una descripción para la acción.");
      return;
    }

    if (!Number.isFinite(reward) || reward <= 0) {
      alert("Introduce una recompensa válida.");
      return;
    }

    const newAction = {
      id: Date.now(),
      name,
      description,
      reward,
      createdAt: new Date().toISOString(),
      completions: 0,
      lastCompletedAt: null,
    };

    setData((currentData) => ({
      ...currentData,
      actions: [
        newAction,
        ...currentData.actions,
      ],
    }));

    setActionName("");
    setActionDescription("");
    setActionReward("");
  };

  const handleCompleteAction = (actionId) => {
    const action = data.actions.find(
      (item) => item.id === actionId
    );

    if (!action) {
      return;
    }

    setRewardGained(action.reward);
    setShowRewardAnimation(true);

    setData((currentData) => ({
      ...currentData,

      bounty:
        currentData.bounty + action.reward,

      actions: currentData.actions.map(
        (item) => {
          if (item.id !== actionId) {
            return item;
          }

          return {
            ...item,
            completions:
              item.completions + 1,
            lastCompletedAt:
              new Date().toISOString(),
          };
        }
      ),
    }));

    window.setTimeout(() => {
      setShowRewardAnimation(false);
    }, 2500);
  };

  const handleDeleteAction = (actionId) => {
    const action = data.actions.find(
      (item) => item.id === actionId
    );

    if (!action) {
      return;
    }

    const confirmed = window.confirm(
      `¿Eliminar la acción "${action.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setData((currentData) => ({
      ...currentData,

      actions: currentData.actions.filter(
        (item) => item.id !== actionId
      ),
    }));
  };

  return (
    <main className="bounty">

      <div className="bounty-background">
        <div className="bounty-grid"></div>
        <div className="bounty-glow"></div>
        <div className="bounty-scanlines"></div>
      </div>

      <header className="bounty-header">

        <button
          className="bounty-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="bounty-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="bounty-header-center">

          <span className="bounty-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="bounty-header-title">
            BOUNTY
          </span>

        </div>

        <div className="bounty-status">

          <span className="bounty-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="bounty-content">

        <div className="bounty-intro">

          <span className="bounty-intro-line"></span>

          <div>

            <p>
              THREAT REWARD
            </p>

            <h1>
              YOUR BOUNTY
            </h1>

          </div>

          <span className="bounty-intro-line"></span>

        </div>

        <section className="bounty-display">

          <div className="bounty-display-top">

            <span>
              CURRENT REWARD
            </span>

            <span>
              BOUNTY SYSTEM
            </span>

          </div>

          <div className="bounty-number">
            {formatBounty(data.bounty)}
            <span className="bounty-currency">
              €
            </span>
          </div>

          <div className="bounty-label">
            THREAT VALUE
          </div>

          <div className="bounty-display-bottom">

            <span></span>

            <div>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span></span>

          </div>

        </section>

        <section className="bounty-create-section">

          <div className="bounty-section-header">

            <div>
              <span>
                01
              </span>

              <div>
                <p>
                  CREATE
                </p>

                <h2>
                  BOUNTY ACTION
                </h2>
              </div>
            </div>

            <span className="bounty-section-status">
              MANUAL ENTRY
            </span>

          </div>

          <form
            className="bounty-form"
            onSubmit={handleCreateAction}
          >

            <div className="bounty-form-row">

              <label>
                ACTION NAME

                <input
                  type="text"
                  value={actionName}
                  onChange={(event) =>
                    setActionName(
                      event.target.value
                    )
                  }
                  placeholder="Ej. CORRER 10 KM"
                />

              </label>

              <label>
                BOUNTY REWARD

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={actionReward}
                  onChange={(event) =>
                    setActionReward(
                      event.target.value
                    )
                  }
                  placeholder="Ej. 50000"
                />

              </label>

            </div>

            <label>
              DESCRIPTION

              <textarea
                value={actionDescription}
                onChange={(event) =>
                  setActionDescription(
                    event.target.value
                  )
                }
                placeholder="Describe qué debe hacer el jugador para completar esta acción..."
                rows="4"
              />

            </label>

            <button
              className="bounty-create-button"
              type="submit"
            >
              <span>
                CREATE ACTION
              </span>

              <span>
                +
              </span>

            </button>

          </form>

        </section>

        <section className="bounty-actions-section">

          <div className="bounty-section-header bounty-actions-header">

            <div>
              <span>
                02
              </span>

              <div>
                <p>
                  AVAILABLE
                </p>

                <h2>
                  BOUNTY ACTIONS
                </h2>
              </div>
            </div>

            <span className="bounty-section-status">
              {data.actions.length} ACTIONS
            </span>

          </div>

          {data.actions.length === 0 ? (

            <div className="bounty-empty">

              <div className="bounty-empty-symbol">
                +
              </div>

              <p>
                NO BOUNTY ACTIONS REGISTERED
              </p>

              <span>
                CREATE YOUR FIRST ACTION TO BEGIN
              </span>

            </div>

          ) : (

            <div className="bounty-actions-list">

              {data.actions.map(
                (action, index) => (

                  <article
                    className="bounty-action-card"
                    key={action.id}
                  >

                    <div className="bounty-action-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="bounty-action-main">

                      <div className="bounty-action-title-row">

                        <h3>
                          {action.name}
                        </h3>

                        <span>
                          +{formatBounty(
                            action.reward
                          )} €
                        </span>

                      </div>

                      <p>
                        {action.description}
                      </p>

                      <div className="bounty-action-meta">

                        <span>
                          COMPLETED:{" "}
                          {action.completions}
                        </span>

                        {action.lastCompletedAt && (
                          <span>
                            LAST:
                            {" "}
                            {new Date(
                              action.lastCompletedAt
                            ).toLocaleDateString(
                              "es-ES"
                            )}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="bounty-action-controls">

                      <button
                        className="bounty-complete-button"
                        type="button"
                        onClick={() =>
                          handleCompleteAction(
                            action.id
                          )
                        }
                      >
                        COMPLETE
                      </button>

                      <button
                        className="bounty-delete-button"
                        type="button"
                        onClick={() =>
                          handleDeleteAction(
                            action.id
                          )
                        }
                      >
                        DELETE
                      </button>

                    </div>

                    <span className="bounty-card-corner bounty-card-corner-tl"></span>

                    <span className="bounty-card-corner bounty-card-corner-br"></span>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </section>

      <footer className="bounty-footer">

        <span>
          REQUIEM // BOUNTY
        </span>

        <span>
          THREAT REWARD SYSTEM
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {showRewardAnimation && (

        <div className="bounty-reward-overlay">

          <div className="bounty-reward-grid"></div>

          <div className="bounty-reward-energy"></div>

          <div className="bounty-reward-panel">

            <div className="bounty-reward-line"></div>

            <span className="bounty-reward-small">
              BOUNTY INCREASED
            </span>

            <div className="bounty-reward-number">
              +{formatBounty(rewardGained)} €
            </div>

            <span className="bounty-reward-label">
              THREAT REWARD ACQUIRED
            </span>

            <div className="bounty-reward-divider">
              <span></span>
              <div></div>
              <span></span>
            </div>

            <span className="bounty-reward-system">
              REQUIEM SYSTEM
            </span>

          </div>

        </div>

      )}

    </main>
  );
}

export default Bounty;