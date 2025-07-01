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
  const characterImg = document.getElementById("character");
  const messageArea = document.getElementById("message-area");
  const hitSound = document.getElementById("hit-sound");
  const missSound = document.getElementById("miss-sound");
  const shopItemsContainer = document.getElementById("shop-items");

  let currentIndex = 0;
  let coin = 0;
  let ownedItems = {};
  let spinning = false;

  const shopItems = [
    {
      id: "special_swimsuit",
      name: "水着キャラ",
      price: 50,
      img: "images/char_special.png"
    },
    {
      id: "uniform",
      name: "制服キャラ",
      price: 30,
      img: "images/char_uniform.png"
    },
    {
      id: "bg_change",
      name: "背景変更",
      price: 20,
      img: "images/bg_sample.png"
      // 背景変更機能は今回なし
    }
  ];

  function updateCharacterImage() {
    if (ownedItems["special_swimsuit"]) {
      characterImg.src = "images/char_special.png";
    } else if (ownedItems["uniform"]) {
      characterImg.src = "images/char_uniform.png";
    } else {
      const chars = ["images/char1.png", "images/char2.png", "images/char3.png"];
      characterImg.src = chars[currentIndex];
    }
  }

  function showMessage(msg) {
    messageArea.textContent = msg;
    setTimeout(() => (messageArea.textContent = ""), 2000);
  }

  function addCoin(amount) {
    coin += amount;
    coinDisplay.textContent = coin;
  }

  function spinReels() {
    if (spinning) return;
    spinning = true;
    showMessage("スロット回転中...");
    let spinCount = 0;
    const maxSpin = 20;
    const images = ["7", "cherry", "bar"];
    const spinInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        const rand = images[Math.floor(Math.random() * images.length)];
        reels[i].src = `images/${rand}.png`;
      }
      spinCount++;
      if (spinCount >= maxSpin) {
        clearInterval(spinInterval);
        finishSpin();
      }
    }, 100);
  }

  function finishSpin() {
    const images = ["7", "cherry", "bar"];
    const results = [];

    for (let i = 0; i < 3; i++) {
      const rand = images[Math.floor(Math.random() * images.length)];
      reels[i].src = `images/${rand}.png`;
      results.push(rand);
    }

    if (results.every(r => r === results[0])) {
      if (results[0] === "7") {
        currentIndex = Math.min(currentIndex + 1, 2);
        updateCharacterImage();
        showMessage("大当たり！＋10コイン！");
        addCoin(10);
        hitSound.play();
      } else if (results[0] === "cherry") {
        characterImg.src = "images/char_laugh.png";
        showMessage("チェリー揃い！＋3コイン！");
        addCoin(3);
        hitSound.play();
      } else {
        characterImg.src = "images/char_mad.png";
        showMessage("レモン揃い！＋1コイン！");
        addCoin(1);
        missSound.play();
      }
    } else {
      showMessage("はずれ！");
      missSound.play();
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
      buyBtn.disabled = ownedItems[item.id] ? true : false;

      buyBtn.addEventListener("click", () => {
        if (ownedItems[item.id]) return;
        if (coin < item.price) {
          alert("コインが足りません！");
          return;
        }
        if (confirm(`${item.name}を${item.price}コインで購入しますか？`)) {
          coin -= item.price;
          ownedItems[item.id] = true;
          updateCharacterImage();
          coinDisplay.textContent = coin;
          renderShopItems();
          alert("購入完了！");
        }
      });

      div.appendChild(img);
      div.appendChild(name);
      div.appendChild(buyBtn);

      if (ownedItems[item.id]) {
        const dlBtn = document.createElement("button");
        dlBtn.textContent = "ダウンロード";
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

  updateCharacterImage();
  coinDisplay.textContent = coin;
  renderShopItems();
});
