import React, { useState } from "react";
import "./Auth.css";
import { supabase } from "../lib/supabase";

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Introduce tu email.");
      return;
    }

    if (!password) {
      setError("Introduce tu contraseña.");
      return;
    }

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
          });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          setMessage(
            "CUENTA CREADA CORRECTAMENTE."
          );

          onAuthenticated(data.session);
        } else {
          setMessage(
            "CUENTA CREADA. REVISA TU EMAIL PARA CONFIRMARLA."
          );
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          onAuthenticated(data.session);
        }
      }
    } catch (authError) {
      console.error(
        "REQUIEM AUTH ERROR:",
        authError
      );

      if (
        authError.message?.toLowerCase().includes(
          "invalid login credentials"
        )
      ) {
        setError(
          "EMAIL O CONTRASEÑA INCORRECTOS."
        );
      } else if (
        authError.message?.toLowerCase().includes(
          "user already registered"
        )
      ) {
        setError(
          "ESTE EMAIL YA TIENE UNA CUENTA."
        );
      } else {
        setError(
          authError.message ||
            "HA OCURRIDO UN ERROR."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(
      mode === "login"
        ? "register"
        : "login"
    );

    setError("");
    setMessage("");
    setPassword("");
  };

  return (
    <main className="auth">

      <div className="auth-background">
        <div className="auth-grid"></div>
        <div className="auth-glow"></div>
        <div className="auth-scanlines"></div>
      </div>

      <section className="auth-content">

        <div className="auth-system">
          REQUIEM SYSTEM
        </div>

        <h1 className="auth-title">
          REQUIEM
        </h1>

        <div className="auth-subtitle">
          {mode === "login"
            ? "WELCOME BACK"
            : "INITIALIZE ACCOUNT"}
        </div>

        <div className="auth-divider">
          <span></span>
          <div></div>
          <span></span>
        </div>

        <div className="auth-mode">
          <button
            type="button"
            className={
              mode === "login"
                ? "auth-mode-button active"
                : "auth-mode-button"
            }
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            LOGIN
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-mode-button active"
                : "auth-mode-button"
            }
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
          >
            REGISTER
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <label>
            EMAIL

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="your@email.com"
              autoComplete="email"
            />
          </label>

          <label>
            PASSWORD

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </label>

          {error && (
            <div className="auth-message auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message auth-success">
              {message}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "CONNECTING..."
                : mode === "login"
                ? "ENTER SYSTEM"
                : "CREATE ACCOUNT"}
            </span>

            <span className="auth-submit-arrow">
              →
            </span>
          </button>

        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={switchMode}
        >
          {mode === "login"
            ? "¿NO TIENES UNA CUENTA? REGISTER"
            : "¿YA TIENES UNA CUENTA? LOGIN"}
        </button>

        <div className="auth-footer">
          REQUIEM // ACCOUNT SYSTEM
        </div>

      </section>

    </main>
  );
}

export default Auth;