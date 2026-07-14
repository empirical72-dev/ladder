let players = [];
let items = [];
let playerLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let ladderLines = [];

const canvas = document.getElementById("ladderCanvas");
const ctx = canvas.getContext("2d");

const playerColors = [
  "red","blue","green","orange","purple","brown","pink","teal",
  "magenta","cyan","lime","navy"
];

// 참가자 추가/삭제/표시
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
    li.innerHTML = `${p.label}. ${p.name}
      <button class="delete" onclick="removePlayer(${i})">X</button>`;
    list.appendChild(li);
  });
}

// 항목 추가/삭제/표시
function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const count = parseInt(document.getElementById("itemCount").value);
  if (!name || isNaN(count) || count <= 0) return;
  for (let i = 0; i < count; i++) items.push({ name });
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

// 리셋
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

// 사다리 그리기
function drawLadder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ladderLines = [];

  const topMargin = 80;
  const bottomMargin = 420;
  const spacing = canvas.width / (players.length + 1);

  // 참가자 라벨
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
  const shuffledItems = [...items].sort(() => Math.random() - 0.5);
  shuffledItems.forEach((item, i) => {
    const x = spacing * (i + 1);
    ctx.font = "18px Arial";
    ctx.fillText(item.name, x - 30, bottomMargin + 30);
  });

  // 가로줄 생성 (위/아래 모두 안전거리 적용, 절대 겹치지 않음)
  const minGap = 40;
  const safeGapTop = 40;
  const safeGapBottom = 40;
  for (let col = 0; col < players.length - 1; col++) {
    let count = 0;
    while (count < 3) {
      const lineY = topMargin + safeGapTop + Math.random() * (bottomMargin - topMargin - safeGapTop - safeGapBottom);
      const tooClose = ladderLines.some(line => Math.abs(line.y - lineY) < minGap);
      if (!tooClose) {
        const x1 = spacing * (col + 1);
        const x2 = spacing * (col + 2);
        ctx.beginPath();
        ctx.moveTo(x1, lineY);
        ctx.lineTo(x2, lineY);
        ctx.stroke();
        ladderLines.push({ y: lineY, col });
        count++;
      }
    }
  }

  ladderLines.sort((a, b) => a.y - b.y);

  // 참가자 버튼
  const btnArea = document.getElementById("playerButtons");
  btnArea.innerHTML = "";
  players.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.innerText = `${p.label}. ${p.name}`;
    btn.onclick = () => animatePlayer(i, shuffledItems);
    btnArea.appendChild(btn);
  });
}

// 애니메이션
function animatePlayer(index, shuffledItems) {
  const spacing = canvas.width / (players.length + 1);
  const topMargin = 80;
  const bottomMargin = 420;
  let x = spacing * (index + 1);
  let y = topMargin;
  let col = index;
  const color = playerColors[index % playerColors.length];

  // 참가자별로 독립적인 usedLines 관리
  let usedLines = new Set();

  function step() {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    y += 5;

    let crossed = false;
    for (let line of ladderLines) {
      const key = line.y + "-" + col;
      if (!crossed && Math.abs(y - line.y) < 3 && !usedLines.has(key)) {
        if (col === line.col) {
          crossed = true;
          usedLines.add(key);
          const targetX = spacing * (col + 2);
          animateHorizontal(x, targetX, y, color, () => {
            col++;
            x = targetX;
            requestAnimationFrame(step);
          });
          return;
        } else if (col === line.col + 1) {
          crossed = true;
          usedLines.add(key);
          const targetX = spacing * (col);
          animateHorizontal(x, targetX, y, color, () => {
            col--;
            x = targetX;
            requestAnimationFrame(step);
          });
          return;
        }
      }
    }

    if (!crossed) {
      if (y < bottomMargin) {
        requestAnimationFrame(step);
      } else {
        const item = shuffledItems[col % shuffledItems.length];
        addResult(players[index], item);
      }
    }
  }
  step();
}

// 가로 이동 애니메이션
function animateHorizontal(startX, endX, y, color, callback) {
  let currentX = startX;
  const stepSize = (endX > startX ? 5 : -5);
  function move() {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(currentX, y, 5, 0, Math.PI * 2);
    ctx.fill();
    if ((stepSize > 0 && currentX < endX) || (stepSize < 0 && currentX > endX)) {
      currentX += stepSize;
      requestAnimationFrame(move);
    } else {
      callback();
    }
  }
  move();
}

// 결과 표시
function addResult(player, item) {
  const resultDiv = document.getElementById("result");
  if (!resultDiv.querySelector("table")) {
    resultDiv.innerHTML = "<table><tr><th>참가자</th><th>결과</th></tr></table>";
  }
  const table = resultDiv.querySelector("table");
  const row = document.createElement("tr");
  row.innerHTML = `<td>${player.label}. ${player.name}</td><td>${item.name}</td>`;
  table.appendChild(row);
}
