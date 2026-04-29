/* Chart */
window.onload = () => {
  new Chart(document.getElementById('resultsChart'), {
    type: 'doughnut',
    data: {
      labels: ['NDA','INDIA','Others'],
      datasets: [{
        data: [293,234,16],
        backgroundColor: ['#00c6ff','#7c3aed','#00ff9f']
      }]
    }
  });

  initMap();
};

/* Map */
let map;
function initMap() {
  map = L.map('map').setView([19.8762,75.3433],10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map.setView([lat,lon],13);
    L.marker([lat,lon]).addTo(map)
      .bindPopup("You are here").openPopup();
  });
}

/* Chatbot */
document.getElementById("chatbot-toggle").onclick = () =>
  document.getElementById("chatbot-box").style.display = "flex";

document.getElementById("close-chat").onclick = () =>
  document.getElementById("chatbot-box").style.display = "none";

function sendMessage() {
  const input = document.getElementById("user-input");
  const msg = input.value;
  if(!msg) return;

  addMsg("You", msg);
  setTimeout(() => addMsg("Bot", botReply(msg.toLowerCase())), 500);
  input.value="";
}

function addMsg(s,m){
  const div=document.createElement("div");
  div.innerHTML=`<b>${s}:</b> ${m}`;
  document.getElementById("chat-messages").appendChild(div);
}

function botReply(m){
  if(m.includes("vote")) return "Go to booth → Verify ID → Vote.";
  if(m.includes("location")) return "Click location button.";
  return "Ask about voting or results.";
}

/* Voice */
function startVoice(){
  const rec=new webkitSpeechRecognition();
  rec.onresult=e=>{
    document.getElementById("user-input").value=e.results[0][0].transcript;
    sendMessage();
  };
  rec.start();
}

/* Ripple */
document.addEventListener("click",e=>{
  if(e.target.tagName==="BUTTON"){
    const r=document.createElement("span");
    r.classList.add("ripple");
    e.target.appendChild(r);
    setTimeout(()=>r.remove(),600);
  }
});

/* Scroll Reveal */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("show");
  });
});
document.querySelectorAll(".card").forEach(el=>{
  el.classList.add("hidden");
  obs.observe(el);
});
