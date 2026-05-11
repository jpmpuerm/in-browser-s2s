import { MicVAD, utils } from "@ricky0123/vad-web";

export function create(audioStream, onSpeechEnd, onSpeechStart, onFrameProcessed) {
  return MicVAD.new({
    stream: audioStream,
    model: "v5",
    // baseAssetPath:
    //   "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/",
    // onnxWASMBasePath:
    //   "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    baseAssetPath: "/vad/",
    onnxWASMBasePath: "/vad/",
    positiveSpeechThreshold: 0.4,
    negativeSpeechThreshold: 0.4,
    minSpeechFrames: 15,
    preSpeechPadFrames: 30,
    onFrameProcessed: onFrameProcessed || (() => {}),
    onSpeechStart: onSpeechStart || (() => {}),
    onSpeechEnd: onSpeechEnd || (() => {}),
  });
}

export const encodeWAV = utils.encodeWAV;
export const arrayBufferToBase64 = utils.arrayBufferToBase64;
