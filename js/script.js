/* CHART */
window.onload = () => {

  new Chart(document.getElementById('resultsChart'), {
    type: 'doughnut',
    data: {
      labels: ['NDA','INDIA','Others'],
      datasets: [{
        data: [293,234,16],
        backgroundColor: ['#00c6ff','#7c3aed','#00ff9f']
      }]
    },
    options: {
      cutout: "70%"
    },
    plugins: [{
      id: 'centerText',
      beforeDraw(chart) {
        const ctx = chart.ctx;
        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("543 Seats", chart.width/2, chart.height/2);
      }
    }]
  });

  initMap();
};

/* MAP */
let map;
function initMap(){
  map = L.map('map').setView([19.8762,75.3433],10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  .addTo(map);
}

function getLocation(){
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map.setView([lat,lon],13);
    L.marker([lat,lon]).addTo(map)
      .bindPopup("You are here").openPopup();
  });
}

/* CHAT */
function sendMessage(){
  const input = document.getElementById("user-input");
  const msg = input.value;
  if(!msg) return;

  addMsg("You",msg);
  setTimeout(()=>addMsg("Bot",botReply(msg.toLowerCase())),500);
  input.value="";
}

function addMsg(s,m){
  const div=document.createElement("div");
  div.innerHTML=`<b>${s}:</b> ${m}`;
  document.getElementById("chat-messages").appendChild(div);
}

function quickAsk(type){
  if(type==="vote") sendAuto("How to vote");
  if(type==="evm") sendAuto("EVM");
  if(type==="helpline") sendAuto("Helpline");
}

function sendAuto(msg){
  document.getElementById("user-input").value = msg;
  sendMessage();
}

function botReply(m){
  if(m.includes("vote")) return "Go to booth → Verify ID → Press EVM.";
  if(m.includes("evm")) return "EVM is electronic voting machine.";
  if(m.includes("helpline")) return "Call 1950.";
  return "Ask about voting or results.";
}

/* VOICE */
function startVoice(){
  const rec = new webkitSpeechRecognition();
  rec.onresult = e=>{
    document.getElementById("user-input").value =
      e.results[0][0].transcript;
    sendMessage();
  };
  rec.start();
}
