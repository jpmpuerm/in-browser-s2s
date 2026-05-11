// ---- Worker setup ----
const worker = new Worker("tts/worker.js", { type: "module" });

const VOICES = {
  alba: "alba",
  marius: "marius",
  javert: "javert",
  fantine: "fantine",
  cosette: "cosette",
  eponine: "eponine",
  azelma: "azelma",
};

const QUANTS = { f32: "f32", q8: "q8" };

let sampleRate = 24000;
let audioCtx = null;
let nextStartTime = 0;
let startTime = 0;
let firstChunkTime = null;
let allChunks = [];
let cpuFeatures = {};
let onGenerationDone = null;
let onGenerationError = null;

function concatenateChunks(chunks) {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function formatFeatures(f) {
  // Show every flag with a clear on/off marker. Wasm builds normally
  // only enable simd128, but listing avx/neon/f16c too makes it obvious
  // when one of them is actually active (e.g. in a native re-build).
  const flags = ["avx", "neon", "simd128", "f16c"];
  return "CPU features: " + flags.map((k) => `${k}=${f[k] ? "on" : "off"}`).join(" ");
}

worker.onmessage = (e) => {
  const { type, ...data } = e.data;

  switch (type) {
    case "status":
      // console.log(data.message);
      break;

    case "progress":
      // if (data.pct >= 0) {
      //   console.log(`${data.label}: ${data.pct}% (${data.detail})`);
      // } else {
      //   console.log(`${data.label}: ${data.detail}`);
      // }
      break;

    case "progress_done":
      break;

    case "loaded":
      sampleRate = data.sampleRate;
      cpuFeatures = data.features || {};
      console.log(`TTS Ready! \n${formatFeatures(cpuFeatures)}`);
      break;

    case "gen_start":
      console.log(`Generating speech (${data.numTokens} tokens)...`);
      break;

    case "chunk": {
      const chunk = new Float32Array(data.data);

      if (!firstChunkTime) {
        firstChunkTime = performance.now() - startTime;
        nextStartTime = audioCtx.currentTime;
      }

      nextStartTime = Math.max(nextStartTime, audioCtx.currentTime);
      // const buf = audioCtx.createBuffer(1, chunk.length, sampleRate);
      // buf.getChannelData(0).set(chunk);
      // const src = audioCtx.createBufferSource();
      // src.buffer = buf;
      // src.connect(analyser);
      // src.start(nextStartTime);
      nextStartTime += chunk.length / sampleRate;
      allChunks.push(chunk);
      break;
    }

    case "done": {
      // const totalMs = performance.now() - startTime;
      // const totalTime = (totalMs / 1000).toFixed(2);
      // const totalSamples = allChunks.reduce((sum, c) => sum + c.length, 0);
      // const durationSec = totalSamples / sampleRate;
      // const duration = durationSec.toFixed(2);
      // const firstAudio = firstChunkTime != null ? (firstChunkTime / 1000).toFixed(2) : "?";
      // const rtf = totalMs > 0 ? (durationSec / (totalMs / 1000)).toFixed(3) : "?";
      // const promptMs = data.promptMs != null ? data.promptMs.toFixed(0) : "?";
      // const avgMs = data.stepMsAvg != null ? data.stepMsAvg.toFixed(1) : "?";
      // const minMs = data.stepMsMin != null ? data.stepMsMin.toFixed(1) : "?";
      // const maxMs = data.stepMsMax != null ? data.stepMsMax.toFixed(1) : "?";
      // const stats = [
      //   `Generated ${duration}s of audio in ${totalTime}s (RTF=${rtf}, first audio: ${firstAudio}s)`,
      //   `Text prompt: ${promptMs}ms`,
      //   `Decode steps: ${data.numSteps ?? 0}, avg ${avgMs}ms (min ${minMs}, max ${maxMs})`,
      //   formatFeatures(cpuFeatures),
      // ].join("\n");
      // console.log(stats);

      onGenerationDone(concatenateChunks(allChunks));
      break;
    }

    case "error":
      onGenerationError(data.message);
      break;
  }
};

export function generate(text, onDone, onError) {
  onGenerationDone = onDone;
  onGenerationError = onError;

  startTime = performance.now();
  firstChunkTime = null;
  allChunks = [];

  // AudioContext must be created/resumed from a user gesture
  audioCtx = new AudioContext({ sampleRate });

  worker.postMessage({
    type: "generate",
    text,
    voiceName: VOICES.azelma,
    temperature: 0.7, // 0.1 - 1.0
  });
}

export function loadModel() {
  worker.postMessage({
    type: "load",
    voiceName: VOICES.azelma,
    quant: QUANTS.q8,
  });
}
