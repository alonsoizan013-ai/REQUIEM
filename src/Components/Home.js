import React from "react";
import "./Home.css";

function Home({ onEnterSystem }) {
  return (
    <main className="home-screen">
      <div className="home-background">
        <div className="home-grid"></div>
        <div className="home-vignette"></div>
        <div className="home-scanlines"></div>
      </div>

      <div className="home-interface">
        <div className="home-top-line">
          <span>SYSTEM</span>
          <span>REQUIEM</span>
          <span>ONLINE</span>
        </div>

        <section className="home-center">
          <div className="home-system-label">
            <span className="home-line"></span>
            <span>SYSTEM INITIALIZATION</span>
            <span className="home-line"></span>
          </div>

          <h1 className="home-title">REQUIEM</h1>

          <p className="home-subtitle">PRESSURE IS A PRIVILEGE</p>

          <div className="home-divider">
            <span></span>
            <div className="home-divider-core"></div>
            <span></span>
          </div>

          <button
            className="home-system-button"
            type="button"
            onClick={onEnterSystem}
          >
            <span className="home-button-corner top-left"></span>
            <span className="home-button-corner top-right"></span>
            <span className="home-button-corner bottom-left"></span>
            <span className="home-button-corner bottom-right"></span>

            <span className="home-button-status"></span>
            <span className="home-button-text">SISTEMA</span>
          </button>
        </section>

        <div className="home-bottom-line">
          <span>NO PAIN</span>
          <span>NO EXCUSES</span>
          <span>EVOLVE</span>
        </div>
      </div>
    </main>
  );
}

export default Home;