import React, { useState } from "react";
import "./PlayerSetup.css";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "requiem-player-profile";

function PlayerSetup({ onComplete }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = name.trim();
    const numericAge = Number(age);
    const numericWeight = Number(weight);
    const numericHeight = Number(height);

    if (!cleanName) {
      alert("Introduce el nombre del jugador.");
      return;
    }

    if (!Number.isFinite(numericAge) || numericAge <= 0) {
      alert("Introduce una edad válida.");
      return;
    }

    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      alert("Introduce un peso válido.");
      return;
    }

    if (!Number.isFinite(numericHeight) || numericHeight <= 0) {
      alert("Introduce una estatura válida.");
      return;
    }

    const profile = {
      name: cleanName,
      age: numericAge,
      weight: numericWeight,
      height: numericHeight,
    };

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("No hay ninguna sesión iniciada.");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: cleanName,
          age: numericAge,
          weight: numericWeight,
          height: numericHeight,
        });

      if (profileError) {
        throw profileError;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(profile)
      );

      onComplete();
    } catch (error) {
      console.error(
        "REQUIEM PROFILE ERROR:",
        error
      );

      alert(
        error.message ||
          "No se ha podido guardar el perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="player-setup">
      <div className="player-setup-background">
        <div className="player-setup-grid"></div>
        <div className="player-setup-glow"></div>
        <div className="player-setup-scanlines"></div>
      </div>

      <section className="player-setup-content">
        <div className="player-setup-system">
          REQUIEM SYSTEM
        </div>

        <div className="player-setup-title">
          INITIALIZE
        </div>

        <div className="player-setup-subtitle">
          PLAYER PROFILE
        </div>

        <div className="player-setup-divider">
          <span></span>
          <div></div>
          <span></span>
        </div>

        <p className="player-setup-description">
          CREA TU PERFIL PARA INICIAR TU VIAJE.
        </p>

        <form
          className="player-setup-form"
          onSubmit={handleSubmit}
        >
          <label>
            PLAYER NAME

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Introduce tu nombre"
              autoComplete="name"
            />
          </label>

          <label>
            AGE

            <input
              type="number"
              min="1"
              value={age}
              onChange={(event) =>
                setAge(event.target.value)
              }
              placeholder="Edad"
            />
          </label>

          <label>
            WEIGHT

            <div className="player-setup-input-unit">
              <input
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(event) =>
                  setWeight(event.target.value)
                }
                placeholder="Peso"
              />

              <span>KG</span>
            </div>
          </label>

          <label>
            HEIGHT

            <div className="player-setup-input-unit">
              <input
                type="number"
                min="1"
                value={height}
                onChange={(event) =>
                  setHeight(event.target.value)
                }
                placeholder="Estatura"
              />

              <span>CM</span>
            </div>
          </label>

          <button
            className="player-setup-button"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "INITIALIZING..."
                : "CREATE PLAYER"}
            </span>

            <span>→</span>
          </button>
        </form>

        <div className="player-setup-footer">
          REQUIEM // PLAYER INITIALIZATION
        </div>
      </section>
    </main>
  );
}

export default PlayerSetup;