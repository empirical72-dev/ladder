let participants = [];
let options = [];

function addParticipant() {
  const input = document.getElementById("participantInput");
  const name = input.value.trim();
  if (name) {
    participants.push(name);
    renderList("participantList", participants);
    input.value = "";
  }
}

function addOption() {
  const input = document.getElementById("optionInput");
  const name = input.value.trim();
  if (name) {
    options.push(name);
    renderList("optionList", options);
    input.value = "";
  }
}

function renderList(id, arr) {
  const list = document.getElementById(id);
  list.innerHTML = "";
  arr.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function startLadder() {
  if (participants.length !== options.length) {
    alert("참가자 수와 항목 수가 같아야 합니다!");
    return;
  }
  let shuffled = [...options].sort(() => Math.random() - 0.5);
  let result = "<h2>결과</h2><ul>";
  participants.forEach((p, i) => {
    result += `<li>${p} → ${shuffled[i]}</li>`;
  });
  result += "</ul>";
  document.getElementById("result").innerHTML = result;
}
