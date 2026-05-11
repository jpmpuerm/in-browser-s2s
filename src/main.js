import * as STT from "./stt.js";
import * as TTS from "./tts.js";
import * as VAD from "./vad.js";

console.log("Loading STT...");
await STT.loadModel();
console.log("STT loaded...");

console.log("Loading TTS...");
await TTS.loadModel();
console.log("TTS loaded...");

console.log("Loading VAD...");

const audioStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    channelCount: 1,
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
  },
});

const vad = await VAD.create(
  audioStream,
  async (arr) => {
    console.log("Transcribing audio...");
    const transcription = await STT.transcribe(arr);
    console.log("Audio transcribed.");
    console.log(transcription);
  },
  () => {
    console.log("Speech start detected");
  },
);

console.log("VAD loaded.");

await vad.start();

// TO PAUSE VAD
// await vad.pause();

TTS.generate("The quick brown fox jumps over the lazy dog.", async (arr) => {
  // Create WAV download/replay element
  // const wavBuffer = VAD.encodeWAV(arr, undefined, 24000);
  // const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
  // const url = URL.createObjectURL(wavBlob);

  const wavBuffer = VAD.encodeWAV(arr, undefined, 24000);
  const base64 = VAD.arrayBufferToBase64(wavBuffer);
  const url = `data:audio/wav;base64,${base64}`;
  const audio = document.createElement("audio");

  audio.controls = true;
  audio.src = url;
  audio.play();

  console.log("Transcribing audio...");
  const transcription = await STT.transcribe(arr);
  console.log("Audio transcribed:", transcription);
});
