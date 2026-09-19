import { useEffect, useState } from "react";
import "./App.css";

import { supabase } from "./lib/supabase";

import Home from "./Components/Home";
import SystemMenu from "./Components/SystemMenu";
import Stats from "./Components/Stats";
import Ego from "./Components/Ego";
import Bounty from "./Components/Bounty";
import Titles from "./Components/Titles";
import WantedPoster from "./Components/WantedPoster";
import Shop from "./Components/Shop";
import Strength from "./Components/Strength";
import Stamina from "./Components/Stamina";
import Finance from "./Components/Finance";
import Mind from "./Components/Mind";
import Willpower from "./Components/Willpower";
import Presence from "./Components/Presence";
import PlayerSetup from "./Components/PlayerSetup";
import Auth from "./Components/Auth";

const PLAYER_STORAGE_KEY =
  "requiem-player-profile";

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] =
    useState(true);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [hasPlayerProfile, setHasPlayerProfile] =
    useState(false);

  const [screen, setScreen] =
    useState("home");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(currentSession);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) {
          return;
        }

        setSession(currentSession);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setHasPlayerProfile(false);
      setProfileLoading(false);
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setProfileLoading(true);

      try {
        const {
          data: profile,
          error,
        } = await supabase
          .from("profiles")
          .select("name, age, weight, height")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        if (profile) {
          localStorage.setItem(
            PLAYER_STORAGE_KEY,
            JSON.stringify(profile)
          );

          setHasPlayerProfile(true);
        } else {
          localStorage.removeItem(
            PLAYER_STORAGE_KEY
          );

          setHasPlayerProfile(false);
        }
      } catch (error) {
        console.error(
          "REQUIEM PROFILE LOAD ERROR:",
          error
        );

        if (!mounted) {
          return;
        }

        setHasPlayerProfile(false);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [session]);

  const goToSystem = () =>
    setScreen("system");

  const goToStats = () =>
    setScreen("stats");

  const goToEgo = () =>
    setScreen("ego");

  const goToBounty = () =>
    setScreen("bounty");

  const goToTitles = () =>
    setScreen("titles");

  const goToWantedPoster = () =>
    setScreen("wantedPoster");

  const goToShop = () =>
    setScreen("shop");

  const goToStrength = () =>
    setScreen("strength");

  const goToStamina = () =>
    setScreen("stamina");

  const goToFinance = () =>
    setScreen("finance");

  const goToMind = () =>
    setScreen("mind");

  const goToWillpower = () =>
    setScreen("willpower");

  const goToPresence = () =>
    setScreen("presence");

  const goToHome = () =>
    setScreen("home");

  const handleAuthenticated = () => {
    setScreen("home");
  };

  const handlePlayerCreated = () => {
    setHasPlayerProfile(true);
    setScreen("home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    localStorage.removeItem(
      PLAYER_STORAGE_KEY
    );

    setSession(null);
    setHasPlayerProfile(false);
    setScreen("home");
  };

  const resetRequiem = () => {
    const requiemKeys = [];

    for (
      let index = 0;
      index < localStorage.length;
      index += 1
    ) {
      const key = localStorage.key(index);

      if (
        key &&
        key.toLowerCase().startsWith("requiem")
      ) {
        requiemKeys.push(key);
      }
    }

    requiemKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    setHasPlayerProfile(false);
    setScreen("playerSetup");
  };

  if (authLoading) {
    return (
      <div className="app-loading">
        REQUIEM SYSTEM
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app">
        <Auth
          onAuthenticated={
            handleAuthenticated
          }
        />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="app-loading">
        REQUIEM SYSTEM
      </div>
    );
  }

  if (!hasPlayerProfile) {
    return (
      <div className="app">
        <PlayerSetup
          onComplete={
            handlePlayerCreated
          }
        />
      </div>
    );
  }

  return (
    <div className="app">

      {screen === "home" && (
        <Home
          onEnterSystem={
            goToSystem
          }
        />
      )}

      {screen === "system" && (
        <SystemMenu
          onBack={goToHome}
          onOpenStats={goToStats}
          onOpenEgo={goToEgo}
          onOpenBounty={goToBounty}
          onOpenTitles={goToTitles}
          onOpenWantedPoster={
            goToWantedPoster
          }
          onOpenShop={goToShop}
          onReset={resetRequiem}
        />
      )}

      {screen === "stats" && (
        <Stats
          onBack={goToSystem}
          onOpenStrength={
            goToStrength
          }
          onOpenStamina={
            goToStamina
          }
          onOpenFinance={
            goToFinance
          }
          onOpenMind={
            goToMind
          }
          onOpenWillpower={
            goToWillpower
          }
          onOpenPresence={
            goToPresence
          }
        />
      )}

      {screen === "ego" && (
        <Ego
          onBack={goToSystem}
        />
      )}

      {screen === "bounty" && (
        <Bounty
          onBack={goToSystem}
        />
      )}

      {screen === "titles" && (
        <Titles
          onBack={goToSystem}
        />
      )}

      {screen === "wantedPoster" && (
        <WantedPoster
          onBack={goToSystem}
        />
      )}

      {screen === "shop" && (
        <Shop
          onBack={goToSystem}
        />
      )}

      {screen === "strength" && (
        <Strength
          onBack={goToStats}
        />
      )}

      {screen === "stamina" && (
        <Stamina
          onBack={goToStats}
        />
      )}

      {screen === "finance" && (
        <Finance
          onBack={goToStats}
        />
      )}

      {screen === "mind" && (
        <Mind
          onBack={goToStats}
        />
      )}

      {screen === "willpower" && (
        <Willpower
          onBack={goToStats}
        />
      )}

      {screen === "presence" && (
        <Presence
          onBack={goToStats}
        />
      )}

    </div>
  );
}

export default App;