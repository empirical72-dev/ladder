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

  // 가로줄 생성
  const minGap = 20;   // 최소 간격(px)
  const safeGap = 40;  // 시작점 아래 안전거리(px)
  let attempts = 0;

  while (ladderLines.length < 20 && attempts < 500) {
    const lineY = topMargin + safeGap + Math.random() * (bottomMargin - topMargin - safeGap);
    const col = Math.floor(Math.random() * (players.length - 1));

    // 같은 열에서만 간격 체크
    const tooClose = ladderLines.some(line => line.col === col && Math.abs(line.y - lineY) < minGap);
    if (!tooClose) {
      const x1 = spacing * (col + 1);
      const x2 = spacing * (col + 2);
      ctx.beginPath();
      ctx.moveTo(x1, lineY);
      ctx.lineTo(x2, lineY);
      ctx.stroke();
      ladderLines.push({ y: lineY, col });
    }
    attempts++;
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

function animatePlayer(index, shuffledItems) {
  const spacing = canvas.width / (players.length + 1);
  const topMargin = 80;
  const bottomMargin = 420;
  let x = spacing * (index + 1);
  let y = topMargin;
  let col = index;

  const color = playerColors[index % playerColors.length];

  function step() {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    y += 5;

    // 가로줄 체크
    let crossed = false;
    for (let line of ladderLines) {
      if (!crossed && Math.abs(y - line.y) < 3) {
        if (col === line.col) {
          crossed = true;
          const targetX = spacing * (col + 2);
          animateHorizontal(x, targetX, y, color, () => {
            col++;
            x = targetX;
            requestAnimationFrame(step); // 가로 이동 끝나고 세로 이동 재개
          });
        } else if (col === line.col + 1) {
          crossed = true;
          const targetX = spacing * (col);
          animateHorizontal(x, targetX, y, color, () => {
            col--;
            x = targetX;
            requestAnimationFrame(step);
          });
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
      callback(); // 가로 이동 끝나면 세로 이동 재개
    }
  }
  move();
}
