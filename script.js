let players = [];
let items = [];
let playerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let ladderLines = [];

const canvas = document.getElementById("ladderCanvas");
const ctx = canvas.getContext("2d");

function addPlayer() {
  const name = document.getElementById("playerInput").value.trim();
  if (!name) return;
  const label = playerLabels[players.length];
  players.push({ name, label });
  renderPlayers();
  document.getElementById("playerInput").value = "";
}

function removePlayer(index) {
  players.splice(index, 1);
  renderPlayers();
}

function renderPlayers() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="label">${p.label}</span>${p.name}
                    <button class="delete" onclick="removePlayer(${i})">X</button>`;
    list.appendChild(li);
  });
}

function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const count = parseInt(document.getElementById("itemCount").value);
  if (!name || isNaN(count) || count <= 0) return;
  for (let i = 0; i < count; i++) {
    items.push({ name });
  }
  renderItems();
  document.getElementById("itemName").value = "";
  document.getElementById("itemCount").value = "";
}

function removeItem(index) {
  items.splice(index, 1);
  renderItems();
}

function renderItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";
  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.name}
                    <button class="delete" onclick="removeItem(${i})">X</button>`;
    list.appendChild(li);
  });
}

function resetGame() {
  players = [];
  items = [];
  ladderLines = [];
  renderPlayers();
  renderItems();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("result").innerHTML = "";
  document.getElementById("playerButtons").innerHTML = "";
}

function drawLadder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ladderLines = [];

  const topMargin = 80;
  const bottomMargin = 420;
  const spacing = canvas.width / (players.length + 1);

  // 세로줄 + 참가자 라벨
  players.forEach((p, i) => {
    const x = spacing * (i + 1);
    ctx.beginPath();
    ctx.moveTo(x, topMargin);
    ctx.lineTo(x, bottomMargin);
    ctx.stroke();
    ctx.font = "18px Arial";
    ctx.fillText(`${p.label}. ${p.name}`, x - 30, topMargin - 20);
  });

  // 항목 라벨
  items.forEach((item, i) => {
    const x = spacing * (i + 1);
    ctx.font = "18px Arial";
    ctx.fillText(item.name, x - 30, bottomMargin + 30);
  });

  // 랜덤 가로줄
  for (let j = 0; j < 15; j++) {
    const lineY = topMargin + Math.random() * (bottomMargin - topMargin);
    const col = Math.floor(Math.random() * (players.length - 1));
    const x1 = spacing * (col + 1);
    const x2 = spacing * (col + 2);
    ctx.beginPath();
    ctx.moveTo(x1, lineY);
    ctx.lineTo(x2, lineY);
    ctx.stroke();
    ladderLines.push({ y: lineY, col });
  }
  ladderLines.sort((a, b) => a.y - b.y);

  // 참가자 버튼 생성
  const btnArea = document.getElementById("playerButtons");
  btnArea.innerHTML = "";
  players.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${p.label}. ${p.name}`;
    btn.onclick = () => animatePlayer(i);
    btnArea.appendChild(btn);
  });
}

function animatePlayer(index) {
  const spacing = canvas.width / (players.length + 1);
  const topMargin = 80;
  const bottomMargin = 420;
  let x = spacing * (index + 1);
  let y = topMargin;
  let col = index;

  function step() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    y += 5; // 내려가는 속도

    // 가로줄 만나면 좌우 이동
    ladderLines.forEach(line => {
      if (Math.abs(y - line.y) < 3) {
        if (col === line.col) { col++; x = spacing * (col + 1); }
        else if (col === line.col + 1) { col--; x = spacing * (col + 1); }
      }
    });

    if (y < bottomMargin) {
      requestAnimationFrame(step);
    } else {
      const item = items[col % items.length];
      addResult(players[index], item);
    }
  }
  step();
}

function addResult(player, item) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv.querySelector("table")) {
    resultDiv.innerHTML = "<table><tr><th>참가자</th><th>결과</th></tr></table>";
  }
  const table = resultDiv.querySelector("table");
  const row = document.createElement("tr");
  row.innerHTML = `<td>${player.label} (${player.name})</td><td>${item.name}</td>`;
  table.appendChild(row);
}
