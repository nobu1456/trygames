document.addEventListener("DOMContentLoaded", () => {
  const spinBtn = document.getElementById("spin-btn");
  const shopBtn = document.getElementById("shop-btn");
  const closeShopBtn = document.getElementById("close-shop-btn");
  const shopPanel = document.getElementById("shop-panel");
  const coinDisplay = document.getElementById("coin-count");
  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
  ];
  const messageArea = document.getElementById("message-area");
  const logArea = document.getElementById("log-area");
  const shareBtn = document.getElementById("share-btn");

  const hitSound = document.getElementById("hit-sound");
  const jackpotSound = document.getElementById("jackpot-sound");
  const missSound = document.getElementById("miss-sound");
  const buySound = document.getElementById("buy-sound");
  const spinSound = document.getElementById("spin-sound");

  const bunnySpeech = document.getElementById("speech-bubble");
  const shopItemsContainer = document.getElementById("shop-items");

  let coin = 0;
  let ownedItems = {};
  let spinning = false;
  let logs = [];

  const shopItems = [
    { id: "item1", name: "メイドEX", price: 50, img: "images/shop1.png" },
    { id: "item2", name: "水着", price: 30, img: "images/shop2.png" },
    { id: "item3", name: "制服", price: 20, img: "images/shop3.png" },
    { id: "item4", name: "着物", price: 20, img: "images/shop4.png" },
    { id: "item5", name: "メイドA", price: 30, img: "images/shop5.png" },
    { id: "item6", name: "メイドB", price: 30, img: "images/shop6.png" }
  ];

  function getRandomSymbol() {
    const rand = Math.random();
    if (rand < 0.5) return "lemon";        // 50%
    else if (rand < 0.75) return "cherry";  // 25%
    else return "7";                        // 25% -> adjusted later to 10%
  }

  function showMessage(msg) {
    messageArea.textContent = msg;
    setTimeout(() => (messageArea.textContent = ""), 2000);
  }

  function showSpeech(msg) {
    bunnySpeech.textContent = msg;
    bunnySpeech.classList.remove("hidden");
    setTimeout(() => bunnySpeech.classList.add("hidden"), 2000);
  }

  function addLog(msg) {
    logs.unshift(msg);
    if (logs.length > 10) logs.pop();
    logArea.innerHTML = logs.map(log => `<div>${log}</div>`).join("");
  }

  function addCoin(amount) {
    coin += amount;
    coinDisplay.textContent = coin;
    updateShareLink();
  }

  function updateShareLink() {
    const url = encodeURIComponent(location.href);
    const text = encodeURIComponent(`今のコイン枚数：${coin}枚！ #スロット風ゲーム`);
    shareBtn.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }

  function spinReels() {
    if (spinning) return;
    spinning = true;
    showMessage("スロット回転中...");
    spinSound.currentTime = 0;
    spinSound.play();

    let spinCount = 0;
    const maxSpin = 20;
    const spinInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        const symbol = getRandomSymbol();
        reels[i].src = `images/${symbol}.png`;
      }
      spinCount++;
      if (spinCount >= maxSpin) {
        clearInterval(spinInterval);
        spinSound.pause();
        spinSound.currentTime = 0;
        finishSpin();
      }
    }, 100);
  }

  function finishSpin() {
    const results = [];

    for (let i = 0; i < 3; i++) {
      const symbol = getRandomSymbol();
      reels[i].src = `images/${symbol}.png`;
      results.push(symbol);
    }

    if (results.every(r => r === results[0])) {
      let msg = "";
      let reward = 0;
      if (results[0] === "7") {
        msg = "おおあたり！＋15コイン！";
        jackpotSound.play();
        showSpeech("おおあたり！");
        reward = 15;
      } else if (results[0] === "cherry") {
        msg = "チェリー揃い！＋10コイン！";
        hitSound.play();
        showSpeech("あたり！");
        reward = 10;
      } else {
        msg = "レモン揃い！＋5コイン！";
        hitSound.play();
        showSpeech("あたり！");
        reward = 5;
      }
      addCoin(reward);
      showMessage(msg);
      addLog(msg);
    } else {
      const msg = "はずれ！";
      showMessage(msg);
      addLog(msg);
      missSound.play();
      showSpeech("はずれ");
    }

    spinning = false;
  }

  function downloadImage(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function renderShopItems() {
    shopItemsContainer.innerHTML = "";
    shopItems.forEach(item => {
      const div = document.createElement("div");
      div.className = "shop-item";

      const img = document.createElement("img");
      img.src = item.img;
      img.alt = item.name;

      const name = document.createElement("div");
      name.textContent = `${item.name} - ${item.price}コイン`;

      const buyBtn = document.createElement("button");
      buyBtn.textContent = ownedItems[item.id] ? "購入済み" : "購入する";
      buyBtn.disabled = ownedItems[item.id];

      buyBtn.addEventListener("click", () => {
        if (ownedItems[item.id]) return;
        if (coin < item.price) {
          alert("コインが足りません！");
          return;
        }
        if (confirm(`${item.name}を${item.price}コインで購入しますか？`)) {
          coin -= item.price;
          ownedItems[item.id] = true;
          coinDisplay.textContent = coin;
          renderShopItems();
          buySound.play();
          alert("購入完了！");
        }
      });

      div.appendChild(img);
      div.appendChild(name);
      div.appendChild(buyBtn);

      if (ownedItems[item.id]) {
        const dlBtn = document.createElement("button");
        dlBtn.textContent = "画像を保存";
        dlBtn.addEventListener("click", () => {
          downloadImage(item.img, `${item.name}.png`);
        });
        div.appendChild(dlBtn);
      }

      shopItemsContainer.appendChild(div);
    });
  }

  spinBtn.addEventListener("click", spinReels);
  shopBtn.addEventListener("click", () => {
    shopPanel.classList.remove("hidden");
  });
  closeShopBtn.addEventListener("click", () => {
    shopPanel.classList.add("hidden");
    showMessage("");
  });

  coinDisplay.textContent = coin;
  renderShopItems();
  updateShareLink();
});
