import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = "/stt/models/";
// env.backends.onnx.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2/dist/";
env.backends.onnx.wasm.wasmPaths = "/stt/";

const MODELS = {
  "tiny-en": { repo: "whisper-tiny.en", opts: {} },
  "small-en": { repo: "whisper-small.en", opts: {} },
};

let transcriber = null;

export async function loadModel(model) {
  transcriber = await pipeline("automatic-speech-recognition", MODELS[model || "tiny-en"].repo, {
    // progress_callback: (p) => {
    //   if (p.status === "progress") {
    //     console.log(`${p.file}: ${Math.round(p.progress)}%`);
    //   }
    // },
    dtype: "q8", // q8 or fp32
  });
}

export async function transcribe(audio, model) {
  const result = await transcriber(audio, MODELS[model || "tiny-en"].opts);
  return result.text.trim();
}
