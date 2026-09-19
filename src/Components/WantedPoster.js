import React, { useEffect, useState } from "react";
import "./WantedPoster.css";

import { supabase } from "../lib/supabase";

const EGO_STORAGE_KEY = "requiem-ego-data";
const BOUNTY_STORAGE_KEY = "requiem-bounty-data";
const TITLES_STORAGE_KEY = "requiem-titles-data";

const TITLES = [
  {
    id: "cazademonios",
    name: "CAZADEMONIOS",
    minBounty: 0,
  },
  {
    id: "segador-de-dragones",
    name: "SEGADOR DE DRAGONES",
    minBounty: 5000000,
  },
  {
    id: "2nd-commander",
    name: "2 ND COMMANDER",
    minBounty: 10000000,
  },
  {
    id: "1st-commander",
    name: "1 ST COMMANDER",
    minBounty: 50000000,
  },
  {
    id: "the-strongest",
    name: "THE STRONGEST",
    minBounty: 100000000,
  },
  {
    id: "humano-perfecto",
    name: "HUMANO PERFECTO",
    minBounty: 300000000,
  },
  {
    id: "el-defecto-del-mundo",
    name: "EL DEFECTO DEL MUNDO",
    minBounty: 500000000,
  },
  {
    id: "asesino-de-heroes",
    name: "ASESINO DE HÉROES",
    minBounty: 750000000,
  },
  {
    id: "el-cirujano-de-la-muerte",
    name: "EL CIRUJANO DE LA MUERTE",
    minBounty: 1000000000,
  },
  {
    id: "las-huellas-del-diablo",
    name: "LAS HUELLAS DEL DIABLO",
    minBounty: 2000000000,
  },
  {
    id: "yonko",
    name: "YONKO",
    minBounty: 3000000000,
  },
  {
    id: "monarca-de-las-sombras",
    name: "MONARCA DE LAS SOMBRAS",
    minBounty: 4000000000,
  },
  {
    id: "demon-king",
    name: "DEMON KING",
    minBounty: 5000000000,
  },
  {
    id: "the-honored-one",
    name: "THE HONORED ONE",
    minBounty: 7000000000,
  },
  {
    id: "rey-egoista",
    name: "REY EGOÍSTA",
    minBounty: 8000000000,
  },
];

function getEgoLevel() {
  try {
    const data = localStorage.getItem(EGO_STORAGE_KEY);

    if (!data) {
      return 0;
    }

    const parsed = JSON.parse(data);

    return typeof parsed.level === "number"
      ? parsed.level
      : 0;
  } catch (error) {
    console.error(
      "REQUIEM WANTED POSTER EGO ERROR:",
      error
    );

    return 0;
  }
}

function getBounty() {
  try {
    const data = localStorage.getItem(
      BOUNTY_STORAGE_KEY
    );

    if (!data) {
      return 0;
    }

    const parsed = JSON.parse(data);

    return typeof parsed.bounty === "number"
      ? parsed.bounty
      : 0;
  } catch (error) {
    console.error(
      "REQUIEM WANTED POSTER BOUNTY ERROR:",
      error
    );

    return 0;
  }
}

function getTitleFromBounty(bounty) {
  const unlockedTitles = TITLES.filter(
    (title) => bounty >= title.minBounty
  );

  if (unlockedTitles.length === 0) {
    return "CAZADEMONIOS";
  }

  return unlockedTitles[
    unlockedTitles.length - 1
  ].name;
}

function getSavedTitle(bounty) {
  try {
    const data = localStorage.getItem(
      TITLES_STORAGE_KEY
    );

    if (data) {
      const parsed = JSON.parse(data);

      if (
        Array.isArray(parsed.unlockedTitles) &&
        parsed.unlockedTitles.length > 0
      ) {
        const savedTitles = TITLES.filter(
          (title) =>
            parsed.unlockedTitles.includes(title.id)
        );

        if (savedTitles.length > 0) {
          return savedTitles[
            savedTitles.length - 1
          ].name;
        }
      }
    }
  } catch (error) {
    console.error(
      "REQUIEM WANTED POSTER TITLE ERROR:",
      error
    );
  }

  return getTitleFromBounty(bounty);
}

function WantedPoster({ onBack }) {
  const [profile, setProfile] = useState({
    name: "UNKNOWN",
    age: "--",
    weight: "--",
    height: "--",
  });

  const [egoLevel, setEgoLevel] = useState(0);
  const [bounty, setBounty] = useState(0);
  const [title, setTitle] =
    useState("CAZADEMONIOS");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const currentEgo = getEgoLevel();
      const currentBounty = getBounty();
      const currentTitle =
        getSavedTitle(currentBounty);

      if (mounted) {
        setEgoLevel(currentEgo);
        setBounty(currentBounty);
        setTitle(currentTitle);
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select(
            "name, age, weight, height"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!mounted || !data) {
          return;
        }

        setProfile({
          name: data.name || "UNKNOWN",
          age:
            data.age !== null &&
            data.age !== undefined
              ? data.age
              : "--",
          weight:
            data.weight !== null &&
            data.weight !== undefined
              ? data.weight
              : "--",
          height:
            data.height !== null &&
            data.height !== undefined
              ? data.height
              : "--",
        });
      } catch (error) {
        console.error(
          "REQUIEM WANTED POSTER PROFILE ERROR:",
          error
        );
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const formattedBounty =
    new Intl.NumberFormat("es-ES").format(
      bounty
    );

  return (
    <main className="wanted-poster-screen">

      <div className="wanted-background">
        <div className="wanted-grid"></div>
        <div className="wanted-glow wanted-glow-one"></div>
        <div className="wanted-glow wanted-glow-two"></div>
        <div className="wanted-scanlines"></div>
      </div>

      <header className="wanted-header">

        <button
          className="wanted-back"
          type="button"
          onClick={onBack}
        >
          <span>‹</span>
          RETURN
        </button>

        <div className="wanted-system">
          REQUIEM SYSTEM
        </div>

        <div className="wanted-online">
          <i></i>
          ONLINE
        </div>

      </header>

      <section className="wanted-content">

        <div className="wanted-card">

          <div className="wanted-card-frame"></div>

          <div className="wanted-corner wanted-corner-tl"></div>
          <div className="wanted-corner wanted-corner-tr"></div>
          <div className="wanted-corner wanted-corner-bl"></div>
          <div className="wanted-corner wanted-corner-br"></div>

          <div className="wanted-top-label">
            <span></span>

            <div>
              <small>REQUIEM</small>
              <strong>PLAYER IDENTIFICATION</strong>
            </div>

            <span></span>
          </div>

          <div className="wanted-title">
            <span></span>

            <h1>WANTED</h1>

            <span></span>
          </div>

          <div className="wanted-name">
            <label>NOMBRE</label>

            <h2>
              {profile.name}
            </h2>
          </div>

          <div className="wanted-basic">

            <div>
              <span>PESO</span>
              <strong>
                {profile.weight} KG
              </strong>
            </div>

            <b>/</b>

            <div>
              <span>ALTURA</span>
              <strong>
                {profile.height} CM
              </strong>
            </div>

            <b>/</b>

            <div>
              <span>EDAD</span>
              <strong>
                {profile.age}
              </strong>
            </div>

          </div>

          <div className="wanted-middle">

            <div className="wanted-stat">
              <label>EGO LEVEL</label>

              <strong className="wanted-ego">
                {egoLevel}
              </strong>
            </div>

            <div className="wanted-divider">
              <span></span>
              <i></i>
              <span></span>
            </div>

            <div className="wanted-stat wanted-title-stat">
              <label>TITLE</label>

              <strong>
                {title}
              </strong>
            </div>

          </div>

          <div className="wanted-bounty">

            <label>BOUNTY</label>

            <strong>
              {formattedBounty}
              <small> €</small>
            </strong>

          </div>

          <div className="wanted-bottom">

            <div className="wanted-line"></div>

            <div className="wanted-dead">
              <span></span>

              <strong>
                DEAD OR ALIVE
              </strong>

              <span></span>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default WantedPoster;