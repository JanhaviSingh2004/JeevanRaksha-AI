function speakResult(text, lang) {
  if (!("speechSynthesis" in window)) {
    alert("Text-to-Speech not supported in this browser");
    return;
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Set language explicitly
  utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Debug check
  console.log("Speaking:", text, "Language:", utterance.lang);

  window.speechSynthesis.speak(utterance);
}
