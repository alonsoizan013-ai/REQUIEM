import React, { useState } from "react";
import "./SystemMenu.css";

function SystemMenu({
  onBack,
  onOpenStats,
  onOpenEgo,
  onOpenBounty,
  onOpenTitles,
  onOpenWantedPoster,
  onOpenShop,
  onReset,
}) {
  const [showResetConfirmation, setShowResetConfirmation] =
    useState(false);

  const menuItems = [
    {
      id: "stats",
      number: "01",
      title: "STATS",
      description: "ATRIBUTOS DEL JUGADOR",
    },
    {
      id: "ego",
      number: "02",
      title: "EGO",
      description: "EVOLUCIÓN Y VOLUNTAD",
    },
    {
      id: "bounty",
      number: "03",
      title: "BOUNTY",
      description: "VALOR DEL JUGADOR",
    },
    {
      id: "titles",
      number: "04",
      title: "TITLES",
      description: "TÍTULOS DESBLOQUEADOS",
    },
    {
      id: "poster",
      number: "05",
      title: "PÓSTER",
      description: "FICHA DEL JUGADOR",
    },
    {
      id: "shop",
      number: "06",
      title: "SHOP",
      description: "RECOMPENSAS DEL SISTEMA",
    },
  ];

  const handleItemClick = (item) => {
    if (item.id === "stats") {
      onOpenStats();
      return;
    }

    if (item.id === "ego") {
      onOpenEgo();
      return;
    }

    if (item.id === "bounty") {
      onOpenBounty();
      return;
    }

    if (item.id === "titles") {
      onOpenTitles();
      return;
    }

    if (item.id === "poster") {
      onOpenWantedPoster();
      return;
    }

    if (item.id === "shop") {
      onOpenShop();
      return;
    }

    alert(
      `${item.title}\n\nEste apartado todavía no ha sido construido.`
    );
  };

  const handleResetClick = () => {
    setShowResetConfirmation(true);
  };

  const handleCancelReset = () => {
    setShowResetConfirmation(false);
  };

  const handleConfirmReset = () => {
    setShowResetConfirmation(false);
    onReset();
  };

  return (
    <main className="system-menu">

      <div className="system-menu-bg">
        <div className="system-menu-grid"></div>
        <div className="system-menu-glow"></div>
        <div className="system-menu-scanlines"></div>
      </div>

      <header className="system-header">

        <button
          className="system-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="system-header-center">

          <span className="header-small">
            REQUIEM SYSTEM
          </span>

          <span className="header-title">
            SYSTEM MENU
          </span>

        </div>

        <div className="system-status">

          <span className="status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="system-content">

        <div className="system-intro">

          <span className="intro-line"></span>

          <div>

            <p className="intro-label">
              PLAYER INTERFACE
            </p>

            <h1>
              SELECT FUNCTION
            </h1>

          </div>

          <span className="intro-line"></span>

        </div>

        <div className="system-menu-list">

          {menuItems.map(
            (item) => (
              <button
                key={item.id}
                className="system-menu-item"
                type="button"
                onClick={() =>
                  handleItemClick(item)
                }
              >

                <span className="menu-number">
                  {item.number}
                </span>

                <span className="menu-main">

                  <span className="menu-title">
                    {item.title}
                  </span>

                  <span className="menu-description">
                    {item.description}
                  </span>

                </span>

                <span className="menu-access">

                  <span>
                    ACCESS
                  </span>

                  <span className="access-arrow">
                    →
                  </span>

                </span>

                <span className="menu-corner menu-corner-tl"></span>

                <span className="menu-corner menu-corner-br"></span>

              </button>
            )
          )}

        </div>

        <div className="system-reset-section">

          <button
            className="system-reset-button"
            type="button"
            onClick={handleResetClick}
          >

            <span className="reset-warning-label">
              SYSTEM WARNING
            </span>

            <span className="reset-button-text">
              RESET REQUIEM SYSTEM
            </span>

            <span className="reset-button-arrow">
              →
            </span>

          </button>

        </div>

      </section>

      <footer className="system-footer">

        <span>
          REQUIEM // SYSTEM
        </span>

        <span>
          ACCESS LEVEL: PLAYER
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {showResetConfirmation && (
        <div className="reset-overlay">

          <div className="reset-background-grid"></div>

          <div className="reset-energy"></div>

          <div className="reset-panel">

            <div className="reset-panel-corner reset-panel-corner-tl"></div>
            <div className="reset-panel-corner reset-panel-corner-tr"></div>
            <div className="reset-panel-corner reset-panel-corner-bl"></div>
            <div className="reset-panel-corner reset-panel-corner-br"></div>

            <div className="reset-panel-header">

              <span className="reset-panel-line"></span>

              <span className="reset-panel-warning">
                SYSTEM WARNING
              </span>

              <span className="reset-panel-line reset-panel-line-right"></span>

            </div>

            <div className="reset-core">

              <div className="reset-symbol">
                !
              </div>

            </div>

            <p className="reset-title">
              RESET REQUIEM
            </p>

            <p className="reset-subtitle">
              TOTAL SYSTEM REINITIALIZATION
            </p>

            <div className="reset-divider">
              <span></span>
              <div></div>
              <span></span>
            </div>

            <p className="reset-description">
              ESTA ACCIÓN ELIMINARÁ TODO EL PROGRESO
              <br />
              GUARDADO DEL JUGADOR.
            </p>

            <div className="reset-data-list">

              <div>
                <span>XP / LEVELS</span>
                <span>DELETE</span>
              </div>

              <div>
                <span>STATS</span>
                <span>DELETE</span>
              </div>

              <div>
                <span>EGO</span>
                <span>DELETE</span>
              </div>

              <div>
                <span>FINANCE DATA</span>
                <span>DELETE</span>
              </div>

              <div>
                <span>SAVED PROGRESS</span>
                <span>DELETE</span>
              </div>

            </div>

            <p className="reset-final-warning">
              THIS ACTION CANNOT BE UNDONE
            </p>

            <div className="reset-actions">

              <button
                className="reset-cancel-button"
                type="button"
                onClick={handleCancelReset}
              >
                CANCEL
              </button>

              <button
                className="reset-confirm-button"
                type="button"
                onClick={handleConfirmReset}
              >
                CONFIRM RESET
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default SystemMenu;