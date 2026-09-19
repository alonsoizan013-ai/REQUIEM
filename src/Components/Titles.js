import React, { useEffect, useRef, useState } from "react";
import "./Titles.css";

const BOUNTY_STORAGE_KEY = "requiem-bounty-data";
const TITLES_STORAGE_KEY = "requiem-titles-data";

const TITLES = [
  {
    id: "cazademonios",
    name: "CAZADEMONIOS",
    minBounty: 0,
    maxBounty: 5000000,
  },
  {
    id: "segador-de-dragones",
    name: "SEGADOR DE DRAGONES",
    minBounty: 5000000,
    maxBounty: 10000000,
  },
  {
    id: "2nd-commander",
    name: "2 ND COMMANDER",
    minBounty: 10000000,
    maxBounty: 50000000,
  },
  {
    id: "1st-commander",
    name: "1 ST COMMANDER",
    minBounty: 50000000,
    maxBounty: 100000000,
  },
  {
    id: "the-strongest",
    name: "THE STRONGEST",
    minBounty: 100000000,
    maxBounty: 300000000,
  },
  {
    id: "humano-perfecto",
    name: "HUMANO PERFECTO",
    minBounty: 300000000,
    maxBounty: 500000000,
  },
  {
    id: "el-defecto-del-mundo",
    name: "EL DEFECTO DEL MUNDO",
    minBounty: 500000000,
    maxBounty: 750000000,
  },
  {
    id: "asesino-de-heroes",
    name: "ASESINO DE HÉROES",
    minBounty: 750000000,
    maxBounty: 1000000000,
  },
  {
    id: "el-cirujano-de-la-muerte",
    name: "EL CIRUJANO DE LA MUERTE",
    minBounty: 1000000000,
    maxBounty: 2000000000,
  },
  {
    id: "las-huellas-del-diablo",
    name: "LAS HUELLAS DEL DIABLO",
    minBounty: 2000000000,
    maxBounty: 3000000000,
  },
  {
    id: "yonko",
    name: "YONKO",
    minBounty: 3000000000,
    maxBounty: 4000000000,
  },
  {
    id: "monarca-de-las-sombras",
    name: "MONARCA DE LAS SOMBRAS",
    minBounty: 4000000000,
    maxBounty: 5000000000,
  },
  {
    id: "demon-king",
    name: "DEMON KING",
    minBounty: 5000000000,
    maxBounty: 7000000000,
  },
  {
    id: "the-honored-one",
    name: "THE HONORED ONE",
    minBounty: 7000000000,
    maxBounty: 8000000000,
  },
  {
    id: "rey-egoista",
    name: "REY EGOÍSTA",
    minBounty: 8000000000,
    maxBounty: 10000000000,
  },
];

const createEmptyTitlesData = () => ({
  unlockedTitles: [],
});

const formatBounty = (amount) => {
  return new Intl.NumberFormat("es-ES").format(amount);
};

function playTitleUnlockSound() {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const audioContext = new AudioContext();

    const now = audioContext.currentTime;

    const masterGain =
      audioContext.createGain();

    masterGain.gain.setValueAtTime(
      0.0001,
      now
    );

    masterGain.gain.exponentialRampToValueAtTime(
      0.22,
      now + 0.05
    );

    masterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 1.8
    );

    masterGain.connect(
      audioContext.destination
    );

    const frequencies = [
      261.63,
      329.63,
      392.0,
      523.25,
      659.25,
    ];

    frequencies.forEach(
      (frequency, index) => {
        const oscillator =
          audioContext.createOscillator();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
          frequency,
          now + index * 0.12
        );

        oscillator.frequency.exponentialRampToValueAtTime(
          frequency * 1.35,
          now + 1.6
        );

        oscillator.connect(masterGain);

        oscillator.start(
          now + index * 0.12
        );

        oscillator.stop(
          now + 1.8
        );
      }
    );

    window.setTimeout(() => {
      audioContext.close();
    }, 2200);
  } catch (error) {
    console.error(
      "Error playing REQUIEM title unlock sound:",
      error
    );
  }
}

function Titles({ onBack }) {
  const [bounty, setBounty] = useState(0);
  const [unlockedTitles, setUnlockedTitles] =
    useState([]);

  const [unlockAnimation, setUnlockAnimation] =
    useState(null);

  const animationTimeoutRef =
    useRef(null);

  useEffect(() => {
    try {
      const savedBounty =
        localStorage.getItem(
          BOUNTY_STORAGE_KEY
        );

      let currentBounty = 0;

      if (savedBounty) {
        const parsedBounty =
          JSON.parse(savedBounty);

        if (
          typeof parsedBounty.bounty ===
            "number" &&
          Number.isFinite(
            parsedBounty.bounty
          )
        ) {
          currentBounty =
            parsedBounty.bounty;
        }
      }

      setBounty(currentBounty);

      const savedTitles =
        localStorage.getItem(
          TITLES_STORAGE_KEY
        );

      let savedUnlockedTitles = [];

      if (savedTitles) {
        const parsedTitles =
          JSON.parse(savedTitles);

        if (
          Array.isArray(
            parsedTitles.unlockedTitles
          )
        ) {
          savedUnlockedTitles =
            parsedTitles.unlockedTitles;
        }
      } else {
        const initialData =
          createEmptyTitlesData();

        localStorage.setItem(
          TITLES_STORAGE_KEY,
          JSON.stringify(initialData)
        );
      }

      const titlesThatShouldBeUnlocked =
        TITLES.filter(
          (title) =>
            currentBounty >=
            title.minBounty
        ).map(
          (title) => title.id
        );

      const newTitles =
        titlesThatShouldBeUnlocked.filter(
          (titleId) =>
            !savedUnlockedTitles.includes(
              titleId
            )
        );

      const mergedTitles =
        Array.from(
          new Set([
            ...savedUnlockedTitles,
            ...titlesThatShouldBeUnlocked,
          ])
        );

      setUnlockedTitles(
        mergedTitles
      );

      localStorage.setItem(
        TITLES_STORAGE_KEY,
        JSON.stringify({
          unlockedTitles:
            mergedTitles,
        })
      );

      /*
       * Si ya existían títulos guardados,
       * comprobamos si la nueva Bounty
       * acaba de desbloquear alguno.
       *
       * No mostramos animación en el
       * primer inicio de TITLES.
       */
      if (
        savedTitles &&
        newTitles.length > 0
      ) {
        const newestUnlockedId =
          newTitles[
            newTitles.length - 1
          ];

        const newestUnlockedTitle =
          TITLES.find(
            (title) =>
              title.id ===
              newestUnlockedId
          );

        if (newestUnlockedTitle) {
          setUnlockAnimation(
            newestUnlockedTitle
          );

          playTitleUnlockSound();

          animationTimeoutRef.current =
            window.setTimeout(() => {
              setUnlockAnimation(null);
            }, 4200);
        }
      }
    } catch (error) {
      console.error(
        "Error loading REQUIEM TITLES data:",
        error
      );
    }

    return () => {
      if (
        animationTimeoutRef.current
      ) {
        window.clearTimeout(
          animationTimeoutRef.current
        );
      }
    };
  }, []);

  const unlockedTitleObjects =
    TITLES.filter(
      (title) =>
        unlockedTitles.includes(
          title.id
        )
    );

  /*
   * De momento el título actual
   * es automáticamente el título
   * de mayor nivel desbloqueado.
   *
   * Más adelante añadiremos el
   * sistema para equiparlo manualmente.
   */
  const currentTitle =
    unlockedTitleObjects[
      unlockedTitleObjects.length - 1
    ] || TITLES[0];

  const getTitleStatus = (title) => {
    if (
      !unlockedTitles.includes(
        title.id
      )
    ) {
      return "LOCKED";
    }

    if (
      title.id === currentTitle.id
    ) {
      return "CURRENT";
    }

    return "UNLOCKED";
  };

  const getBountyRequirement = (
    title
  ) => {
    return `${formatBounty(
      title.minBounty
    )} €`;
  };

  return (
    <main className="titles">

      <div className="titles-background">
        <div className="titles-grid"></div>
        <div className="titles-glow"></div>
        <div className="titles-scanlines"></div>
      </div>

      <header className="titles-header">

        <button
          className="titles-back-button"
          type="button"
          onClick={onBack}
        >
          <span className="titles-back-symbol">
            ‹
          </span>

          <span>
            RETURN
          </span>
        </button>

        <div className="titles-header-center">

          <span className="titles-header-small">
            REQUIEM SYSTEM
          </span>

          <span className="titles-header-title">
            TITLES
          </span>

        </div>

        <div className="titles-status">

          <span className="titles-status-dot"></span>

          <span>
            ONLINE
          </span>

        </div>

      </header>

      <section className="titles-content">

        <div className="titles-intro">

          <span className="titles-intro-line"></span>

          <div>

            <p>
              IDENTITY SYSTEM
            </p>

            <h1>
              YOUR TITLES
            </h1>

          </div>

          <span className="titles-intro-line titles-intro-line-right"></span>

        </div>

        <section className="titles-current">

          <div className="titles-current-label">
            CURRENT TITLE
          </div>

          <div className="titles-current-name">
            {currentTitle.name}
          </div>

          <div className="titles-current-bounty">
            CURRENT BOUNTY:{" "}
            {formatBounty(bounty)} €
          </div>

        </section>

        <section className="titles-list-section">

          <div className="titles-section-header">

            <div>

              <span>
                01
              </span>

              <div>

                <p>
                  COLLECTION
                </p>

                <h2>
                  ALL TITLES
                </h2>

              </div>

            </div>

            <span className="titles-section-status">
              {unlockedTitles.length} /{" "}
              {TITLES.length} UNLOCKED
            </span>

          </div>

          <div className="titles-list">

            {TITLES.map(
              (title, index) => {

                const unlocked =
                  unlockedTitles.includes(
                    title.id
                  );

                const isCurrent =
                  currentTitle.id ===
                  title.id;

                return (
                  <article
                    className={`title-card ${
                      unlocked
                        ? "title-card-unlocked"
                        : "title-card-locked"
                    } ${
                      isCurrent
                        ? "title-card-current"
                        : ""
                    }`}
                    key={title.id}
                  >

                    <div className="title-card-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="title-card-main">

                      <h3>
                        {title.name}
                      </h3>

                      <p>
                        BOUNTY REQUIRED:{" "}
                        {getBountyRequirement(
                          title
                        )}
                      </p>

                    </div>

                    <div className="title-card-status">
                      {getTitleStatus(
                        title
                      )}
                    </div>

                  </article>
                );
              }
            )}

          </div>

        </section>

      </section>

      <footer className="titles-footer">

        <span>
          REQUIEM // TITLES
        </span>

        <span>
          IDENTITY SYSTEM
        </span>

        <span>
          VER. 01.0
        </span>

      </footer>

      {unlockAnimation && (
        <div className="title-unlock-overlay">

          <div className="title-unlock-flash"></div>

          <div className="title-unlock-lines"></div>

          <div className="title-unlock-content">

            <div className="title-unlock-small">
              REQUIEM SYSTEM
            </div>

            <div className="title-unlock-label">
              NEW TITLE UNLOCKED
            </div>

            <div className="title-unlock-divider">
              <span></span>
              <div></div>
              <span></span>
            </div>

            <div className="title-unlock-name">
              {unlockAnimation.name}
            </div>

            <div className="title-unlock-requirement">
              BOUNTY THRESHOLD REACHED
            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default Titles;