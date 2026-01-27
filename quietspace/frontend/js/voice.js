const micBtn = document.getElementById("micBtn");
const spokenText = document.getElementById("spokenText");

let recognition;

window.onload = () => {
  speak("Hey. Take your time. I’m listening.");
};

micBtn.onclick = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    spokenText.innerText = "Listening…";
  };

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    spokenText.innerText = transcript;

    // Only send final result to backend
    if (event.results[event.results.length - 1].isFinal) {
      sendToBackend(transcript);
      recognition.stop();
    }
  };

  recognition.onerror = (e) => {
    console.error("Speech error:", e.error);
    spokenText.innerText = "Couldn’t hear you clearly. Try again.";
  };

  recognition.onend = () => {
    console.log("Recognition ended");
  };

  recognition.start();
};

function sendToBackend(text) {
  fetch("http://127.0.0.1:5004/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: text })
  })
    .then(res => res.json())
    .then(data => {
      speak(data.reply);
    })
    .catch(err => {
      console.error(err);
      speak("I’m here. Something didn’t come through.");
    });
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.lang = "en-IN";
  window.speechSynthesis.speak(utter);
}
