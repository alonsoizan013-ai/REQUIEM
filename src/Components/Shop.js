import React, { useEffect, useState } from "react";
import "./Shop.css";

const SHOP_STORAGE_KEY = "requiem-shop-data";

const RARITIES = [
  {
    id: "common",
    name: "COMÚN",
  },
  {
    id: "rare",
    name: "RARO",
  },
  {
    id: "epic",
    name: "ÉPICO",
  },
  {
    id: "mythic",
    name: "MÍTICO",
  },
  {
    id: "legendary",
    name: "LEGENDARIO",
  },
];

const getTodayKey = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createEmptyShopData = () => ({
  gold: 0,
  missions: [],
  rewards: [],
  inventory: [],
  completedToday: [],
  lastResetDate: getTodayKey(),
});

const loadShopData = () => {
  try {
    const savedData = localStorage.getItem(
      SHOP_STORAGE_KEY
    );

    if (!savedData) {
      return createEmptyShopData();
    }

    const parsedData = JSON.parse(savedData);

    return {
      gold:
        typeof parsedData.gold === "number"
          ? parsedData.gold
          : 0,

      missions: Array.isArray(parsedData.missions)
        ? parsedData.missions
        : [],

      rewards: Array.isArray(parsedData.rewards)
        ? parsedData.rewards
        : [],

      inventory: Array.isArray(parsedData.inventory)
        ? parsedData.inventory
        : [],

      completedToday: Array.isArray(
        parsedData.completedToday
      )
        ? parsedData.completedToday
        : [],

      lastResetDate:
        typeof parsedData.lastResetDate === "string"
          ? parsedData.lastResetDate
          : getTodayKey(),
    };
  } catch (error) {
    console.error(
      "REQUIEM SHOP LOAD ERROR:",
      error
    );

    return createEmptyShopData();
  }
};

function Shop({ onBack }) {
  const [shopData, setShopData] = useState(
    loadShopData
  );

  const [activeSection, setActiveSection] =
    useState("missions");

  const [showMissionForm, setShowMissionForm] =
    useState(false);

  const [showRewardForm, setShowRewardForm] =
    useState(false);

  const [missionName, setMissionName] =
    useState("");

  const [missionGold, setMissionGold] =
    useState("");

  const [rewardName, setRewardName] =
    useState("");

  const [rewardPrice, setRewardPrice] =
    useState("");

  const [rewardRarity, setRewardRarity] =
    useState("common");

  useEffect(() => {
    const today = getTodayKey();

    if (shopData.lastResetDate !== today) {
      setShopData((previousData) => ({
        ...previousData,
        completedToday: [],
        lastResetDate: today,
      }));
    }
  }, [shopData.lastResetDate]);

  useEffect(() => {
    localStorage.setItem(
      SHOP_STORAGE_KEY,
      JSON.stringify(shopData)
    );
  }, [shopData]);

  const formatGold = (amount) => {
    return new Intl.NumberFormat("es-ES").format(
      amount
    );
  };

  const getRarityName = (rarityId) => {
    const rarity = RARITIES.find(
      (item) => item.id === rarityId
    );

    return rarity ? rarity.name : "COMÚN";
  };

  const handleAddMission = (event) => {
    event.preventDefault();

    const cleanName = missionName.trim();
    const gold = Number(missionGold);

    if (!cleanName) {
      return;
    }

    if (!Number.isFinite(gold) || gold <= 0) {
      return;
    }

    const newMission = {
      id: `mission-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: cleanName,
      gold: Math.floor(gold),
    };

    setShopData((previousData) => ({
      ...previousData,
      missions: [
        ...previousData.missions,
        newMission,
      ],
    }));

    setMissionName("");
    setMissionGold("");
    setShowMissionForm(false);
  };

  const handleDeleteMission = (missionId) => {
    setShopData((previousData) => ({
      ...previousData,

      missions: previousData.missions.filter(
        (mission) => mission.id !== missionId
      ),

      completedToday:
        previousData.completedToday.filter(
          (id) => id !== missionId
        ),
    }));
  };

  const handleCompleteMission = (mission) => {
    const alreadyCompleted =
      shopData.completedToday.includes(
        mission.id
      );

    if (alreadyCompleted) {
      return;
    }

    setShopData((previousData) => ({
      ...previousData,

      gold: previousData.gold + mission.gold,

      completedToday: [
        ...previousData.completedToday,
        mission.id,
      ],
    }));
  };

  const handleAddReward = (event) => {
    event.preventDefault();

    const cleanName = rewardName.trim();
    const price = Number(rewardPrice);

    if (!cleanName) {
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      return;
    }

    const newReward = {
      id: `reward-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: cleanName,
      price: Math.floor(price),
      rarity: rewardRarity,
    };

    setShopData((previousData) => ({
      ...previousData,
      rewards: [
        ...previousData.rewards,
        newReward,
      ],
    }));

    setRewardName("");
    setRewardPrice("");
    setRewardRarity("common");
    setShowRewardForm(false);
  };

  const handleDeleteReward = (rewardId) => {
    setShopData((previousData) => ({
      ...previousData,

      rewards: previousData.rewards.filter(
        (reward) => reward.id !== rewardId
      ),
    }));
  };

  const handleBuyReward = (reward) => {
    if (shopData.gold < reward.price) {
      return;
    }

    const purchasedReward = {
      inventoryId: `inventory-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      rewardId: reward.id,
      name: reward.name,
      price: reward.price,
      rarity: reward.rarity,
      purchasedAt: new Date().toISOString(),
    };

    setShopData((previousData) => ({
      ...previousData,

      gold: previousData.gold - reward.price,

      inventory: [
        ...previousData.inventory,
        purchasedReward,
      ],
    }));
  };

  const handleUseReward = (inventoryId) => {
    setShopData((previousData) => ({
      ...previousData,

      inventory: previousData.inventory.filter(
        (item) =>
          item.inventoryId !== inventoryId
      ),
    }));
  };

  return (
    <main className="shop-screen">
      <div className="shop-background">
        <div className="shop-grid"></div>
        <div className="shop-glow shop-glow-one"></div>
        <div className="shop-glow shop-glow-two"></div>
        <div className="shop-scanlines"></div>
      </div>

      <header className="shop-header">
        <button
          className="shop-back"
          onClick={onBack}
        >
          <span>‹</span>
          BACK TO SYSTEM
        </button>

        <div className="shop-header-title">
          <small>REQUIEM</small>
          <strong>SHOP</strong>
        </div>

        <div className="shop-header-status">
          <span className="shop-status-dot"></span>
          SYSTEM ONLINE
        </div>
      </header>

      <section className="shop-content">
        <div className="shop-panel">
          <div className="shop-corner shop-corner-tl"></div>
          <div className="shop-corner shop-corner-tr"></div>
          <div className="shop-corner shop-corner-bl"></div>
          <div className="shop-corner shop-corner-br"></div>

          <div className="shop-panel-frame"></div>

          <div className="shop-top">
            <div>
              <span className="shop-kicker">
                PERSONAL REWARD SYSTEM
              </span>

              <h1>SHOP</h1>

              <p>
                EARN GOLD. COMPLETE MISSIONS.
                <br />
                CLAIM YOUR REWARDS.
              </p>
            </div>

            <div className="shop-wallet">
              <span>AVAILABLE GOLD</span>

              <strong>
                {formatGold(shopData.gold)}
              </strong>

              <small>GOLD</small>
            </div>
          </div>

          <nav className="shop-tabs">
            <button
              className={
                activeSection === "missions"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("missions")
              }
            >
              <span>01</span>
              DAILY MISSIONS
            </button>

            <button
              className={
                activeSection === "rewards"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("rewards")
              }
            >
              <span>02</span>
              REWARDS
            </button>

            <button
              className={
                activeSection === "inventory"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection("inventory")
              }
            >
              <span>03</span>
              INVENTORY
            </button>
          </nav>

          {activeSection === "missions" && (
            <section className="shop-section">
              <div className="shop-section-heading">
                <div>
                  <span>01 / DAILY SYSTEM</span>
                  <h2>DAILY MISSIONS</h2>
                </div>

                <button
                  className="shop-create-button"
                  onClick={() =>
                    setShowMissionForm(
                      !showMissionForm
                    )
                  }
                >
                  <span>+</span>
                  ADD MISSION
                </button>
              </div>

              {showMissionForm && (
                <form
                  className="shop-form"
                  onSubmit={handleAddMission}
                >
                  <div className="shop-form-title">
                    NEW DAILY MISSION
                  </div>

                  <div className="shop-form-grid">
                    <label>
                      <span>MISSION NAME</span>

                      <input
                        type="text"
                        value={missionName}
                        onChange={(event) =>
                          setMissionName(
                            event.target.value
                          )
                        }
                        placeholder="Ej. Entrenar 1 hora"
                        maxLength={50}
                        autoComplete="off"
                      />
                    </label>

                    <label>
                      <span>GOLD REWARD</span>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={missionGold}
                        onChange={(event) =>
                          setMissionGold(
                            event.target.value
                          )
                        }
                        placeholder="50"
                      />
                    </label>
                  </div>

                  <div className="shop-form-actions">
                    <button
                      type="button"
                      className="shop-cancel-button"
                      onClick={() =>
                        setShowMissionForm(false)
                      }
                    >
                      CANCEL
                    </button>

                    <button
                      type="submit"
                      className="shop-confirm-button"
                    >
                      CREATE MISSION
                    </button>
                  </div>
                </form>
              )}

              <div className="shop-list">
                {shopData.missions.length === 0 && (
                  <div className="shop-empty">
                    <div className="shop-empty-icon">
                      +
                    </div>

                    <span>
                      NO DAILY MISSIONS CREATED
                    </span>

                    <p>
                      Create your first mission to
                      start earning gold.
                    </p>
                  </div>
                )}

                {shopData.missions.map(
                  (mission, index) => {
                    const completed =
                      shopData.completedToday.includes(
                        mission.id
                      );

                    return (
                      <article
                        className={`shop-mission ${
                          completed
                            ? "completed"
                            : ""
                        }`}
                        key={mission.id}
                      >
                        <div className="shop-item-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="shop-item-main">
                          <span>
                            DAILY MISSION
                          </span>

                          <h3>{mission.name}</h3>
                        </div>

                        <div className="shop-mission-reward">
                          <span>REWARD</span>

                          <strong>
                            +{formatGold(mission.gold)}
                          </strong>

                          <small>GOLD</small>
                        </div>

                        <div className="shop-item-actions">
                          <button
                            className={`shop-complete-button ${
                              completed
                                ? "completed"
                                : ""
                            }`}
                            disabled={completed}
                            onClick={() =>
                              handleCompleteMission(
                                mission
                              )
                            }
                          >
                            {completed
                              ? "COMPLETED"
                              : "COMPLETE"}
                          </button>

                          <button
                            className="shop-delete-button"
                            onClick={() =>
                              handleDeleteMission(
                                mission.id
                              )
                            }
                            aria-label="Delete mission"
                          >
                            ×
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {activeSection === "rewards" && (
            <section className="shop-section">
              <div className="shop-section-heading">
                <div>
                  <span>02 / PERSONAL REWARDS</span>
                  <h2>REWARDS</h2>
                </div>

                <button
                  className="shop-create-button"
                  onClick={() =>
                    setShowRewardForm(
                      !showRewardForm
                    )
                  }
                >
                  <span>+</span>
                  CREATE REWARD
                </button>
              </div>

              {showRewardForm && (
                <form
                  className="shop-form"
                  onSubmit={handleAddReward}
                >
                  <div className="shop-form-title">
                    NEW REWARD
                  </div>

                  <div className="shop-form-grid shop-reward-form-grid">
                    <label>
                      <span>REWARD NAME</span>

                      <input
                        type="text"
                        value={rewardName}
                        onChange={(event) =>
                          setRewardName(
                            event.target.value
                          )
                        }
                        placeholder="Ej. 1 hora de videojuegos"
                        maxLength={50}
                        autoComplete="off"
                      />
                    </label>

                    <label>
                      <span>PRICE</span>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={rewardPrice}
                        onChange={(event) =>
                          setRewardPrice(
                            event.target.value
                          )
                        }
                        placeholder="100"
                      />
                    </label>

                    <label>
                      <span>RARITY</span>

                      <select
                        value={rewardRarity}
                        onChange={(event) =>
                          setRewardRarity(
                            event.target.value
                          )
                        }
                      >
                        {RARITIES.map((rarity) => (
                          <option
                            key={rarity.id}
                            value={rarity.id}
                          >
                            {rarity.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="shop-form-actions">
                    <button
                      type="button"
                      className="shop-cancel-button"
                      onClick={() =>
                        setShowRewardForm(false)
                      }
                    >
                      CANCEL
                    </button>

                    <button
                      type="submit"
                      className="shop-confirm-button"
                    >
                      CREATE REWARD
                    </button>
                  </div>
                </form>
              )}

              <div className="shop-list rewards-list">
                {shopData.rewards.length === 0 && (
                  <div className="shop-empty">
                    <div className="shop-empty-icon">
                      +
                    </div>

                    <span>
                      NO REWARDS CREATED
                    </span>

                    <p>
                      Create your first reward to
                      build your personal shop.
                    </p>
                  </div>
                )}

                {shopData.rewards.map(
                  (reward, index) => {
                    const rarityName =
                      getRarityName(
                        reward.rarity
                      );

                    const cannotAfford =
                      shopData.gold <
                      reward.price;

                    return (
                      <article
                        className={`shop-reward rarity-${reward.rarity}`}
                        key={reward.id}
                      >
                        <div className="shop-item-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="shop-reward-icon">
                          ◈
                        </div>

                        <div className="shop-item-main">
                          <span>REWARD</span>

                          <h3>{reward.name}</h3>

                          <div className="shop-rarity">
                            <i></i>
                            {rarityName}
                          </div>
                        </div>

                        <div className="shop-reward-price">
                          <span>PRICE</span>

                          <strong>
                            {formatGold(
                              reward.price
                            )}
                          </strong>

                          <small>GOLD</small>
                        </div>

                        <div className="shop-item-actions">
                          <button
                            className="shop-buy-button"
                            disabled={cannotAfford}
                            onClick={() =>
                              handleBuyReward(
                                reward
                              )
                            }
                          >
                            {cannotAfford
                              ? "NOT ENOUGH GOLD"
                              : "PURCHASE"}
                          </button>

                          <button
                            className="shop-delete-button"
                            onClick={() =>
                              handleDeleteReward(
                                reward.id
                              )
                            }
                            aria-label="Delete reward"
                          >
                            ×
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}

          {activeSection === "inventory" && (
            <section className="shop-section">
              <div className="shop-section-heading">
                <div>
                  <span>03 / ACQUIRED REWARDS</span>
                  <h2>INVENTORY</h2>
                </div>

                <div className="shop-inventory-count">
                  <span>AVAILABLE ITEMS</span>
                  <strong>
                    {String(
                      shopData.inventory.length
                    ).padStart(2, "0")}
                  </strong>
                </div>
              </div>

              <div className="shop-list inventory-list">
                {shopData.inventory.length === 0 && (
                  <div className="shop-empty">
                    <div className="shop-empty-icon">
                      ◈
                    </div>

                    <span>
                      INVENTORY EMPTY
                    </span>

                    <p>
                      Purchased rewards will appear
                      here until you use them.
                    </p>
                  </div>
                )}

                {shopData.inventory.map(
                  (item, index) => {
                    const rarityName =
                      getRarityName(
                        item.rarity
                      );

                    return (
                      <article
                        className={`shop-inventory-item rarity-${item.rarity}`}
                        key={item.inventoryId}
                      >
                        <div className="shop-item-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div className="shop-inventory-icon">
                          ◈
                        </div>

                        <div className="shop-item-main">
                          <span>
                            ACQUIRED REWARD
                          </span>

                          <h3>{item.name}</h3>

                          <div className="shop-rarity">
                            <i></i>
                            {rarityName}
                          </div>
                        </div>

                        <div className="shop-inventory-origin">
                          <span>PAID</span>

                          <strong>
                            {formatGold(
                              item.price
                            )}
                          </strong>

                          <small>GOLD</small>
                        </div>

                        <div className="shop-item-actions">
                          <button
                            className="shop-use-button"
                            onClick={() =>
                              handleUseReward(
                                item.inventoryId
                              )
                            }
                          >
                            USE REWARD
                          </button>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

export default Shop;