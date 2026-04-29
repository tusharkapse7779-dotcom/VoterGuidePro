export function triggerVoiceReport() {
    const speech = new SpeechSynthesisUtterance("Election update running");
    speechSynthesis.speak(speech);
}
