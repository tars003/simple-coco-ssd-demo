import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

import * as cocoSsd from "@tensorflow-models/coco-ssd";

tfjsWasm.setWasmPaths(
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`);

// const stats = new Stats();
// stats.showPanel(0);
// document.body.prepend(stats.domElement);

let model, ctx, videoWidth, videoHeight, video, canvas;
let model1, ctx1, video1, canvas1;
let modelArr = [];
let ctxArr = [];
let videoArr = [];
let canvasArr = [];

const state = {
  backend: 'webgl'
};

const length = 5;

const gui = new dat.GUI();
gui.add(state, 'backend', ['wasm', 'webgl', 'cpu']).onChange(async backend => {
  await tf.setBackend(backend);
});

async function setupCamera() {
  video = document.getElementById('video');
  console.log(video)

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': { facingMode: 'user' },
  });
  video.srcObject = stream;
  // video.src = 'https://youtu.be/w5RRnVjiXuE';

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

const renderPredictionNew = async () => {
  const predictions = await model.detect(video);
  // Getting context fro canvas initialized in the constructor
  // const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  // Font options.
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";
  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    const width = prediction.bbox[2];
    const height = prediction.bbox[3];
    // Draw the bounding box.
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, width, height);
    // Draw the label background.
    ctx.fillStyle = "#00FFFF";
    const textWidth = ctx.measureText(prediction.class).width;
    const textHeight = parseInt(font, 10); // base 10
    ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  });

  predictions.forEach(prediction => {
    const x = prediction.bbox[0];
    const y = prediction.bbox[1];
    // Draw the text last to ensure it's on top.
    ctx.fillStyle = "#000000";
    ctx.fillText(prediction.class, x, y);
  });

  requestAnimationFrame(renderPredictionNew);

};


const renderPrediction = async () => {
  // stats.begin();

  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  // const predictions = await model.estimateFaces(
  //   video, returnTensors, flipHorizontal, annotateBoxes);

  const predictions = await model.detect(video);

  if (predictions.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }

      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];
      ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
      ctx.fillRect(start[0], start[1], size[0], size[1]);

      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;

        ctx.fillStyle = "blue";
        for (let j = 0; j < landmarks.length; j++) {
          const x = landmarks[j][0];
          const y = landmarks[j][1];
          ctx.fillRect(x, y, 5, 5);
        }
      }
    }
  }

  // stats.end();

  requestAnimationFrame(renderPrediction);
};

const setupPage = async () => {
  await tf.setBackend(state.backend);

  // model = await blazeface.load();
  console.log('loading modal')
  model = await cocoSsd.load();
  console.log(model)

  // await setupCamera();
  video = document.getElementById('video');
  video.play();

  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";




  setupPage1(length);

  // renderPrediction();
  renderPredictionNew();
};

async function setupCamera1(index) {
  videoArr[index] = document.getElementById(`video${index}`);

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': { facingMode: 'user' },
  });
  videoArr[index].srcObject = stream;

  return new Promise((resolve) => {
    videoArr[index].onloadedmetadata = () => {
      resolve(video);
    };
  });
}

const renderFunctionArr = []
const renderFunctionArrNew = []

for (let i = 0; i < length; i++) {
  const renderPredictionNew = async () => {
    let index = i;

    // stats.begin();
    console.log(`Inside renderPrediction1 ${index}`)
    console.log(modelArr[index])

    const returnTensors = false;
    const flipHorizontal = true;
    const annotateBoxes = true;
    // const predictions = await modelArr[index].estimateFaces(
    //   videoArr[index], returnTensors, flipHorizontal, annotateBoxes);

    const predictions = await modelArr[index].detect(videoArr[index]);

    if (predictions.length > 0) {
      ctxArr[index].clearRect(0, 0, canvasArr[index].width, canvasArr[index].height);

      for (let i = 0; i < predictions.length; i++) {
        if (returnTensors) {
          predictions[i].topLeft = predictions[i].topLeft.arraySync();
          predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
          if (annotateBoxes) {
            predictions[i].landmarks = predictions[i].landmarks.arraySync();
          }
        }

        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];
        ctxArr[index].fillStyle = "rgba(0, 255, 0, 0.5)";
        ctxArr[index].fillRect(start[0], start[1], size[0], size[1]);

        if (annotateBoxes) {
          const landmarks = predictions[i].landmarks;

          ctxArr[index].fillStyle = "blue";
          for (let j = 0; j < landmarks.length; j++) {
            const x = landmarks[j][0];
            const y = landmarks[j][1];
            ctxArr[index].fillRect(x, y, 5, 5);
          }
        }
      }
    }

    // stats.end();

    requestAnimationFrame(renderPredictionNew);
  }

  renderFunctionArr.push(renderPredictionNew);
}

for (let i = 0; i < length; i++) {
  const renderPredictionNew = async () => {

    console.log(`inside ${i}`)

    let index = i;

    const predictions = await modelArr[index].detect(videoArr[index]);
    // Getting context fro canvas initialized in the constructor
    // const ctx = canvas.getContext("2d");
    ctxArr[index].clearRect(0, 0, videoWidth, videoHeight);
    // Font options.
    const font = "16px sans-serif";
    ctxArr[index].font = font;
    ctxArr[index].textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctxArr[index].strokeStyle = "#00FFFF";
      ctxArr[index].lineWidth = 4;
      ctxArr[index].strokeRect(x, y, width, height);
      // Draw the label background.
      ctxArr[index].fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctxArr[index].fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctxArr[index].fillStyle = "#000000";
      ctxArr[index].fillText(prediction.class, x, y);
    });

    requestAnimationFrame(renderPredictionNew);
  }
  console.log(`${i} pushed to renderFunctionArrNew`)
  renderFunctionArrNew.push(renderPredictionNew);
}


const renderPrediction0 = async () => {

  let index = 0;

  // stats.begin();
  console.log(`Inside renderPrediction1 ${index}`)
  console.log(modelArr[index])

  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  const predictions = await modelArr[index].estimateFaces(
    videoArr[index], returnTensors, flipHorizontal, annotateBoxes);

  if (predictions.length > 0) {
    ctxArr[index].clearRect(0, 0, canvasArr[index].width, canvasArr[index].height);

    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }

      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];
      ctxArr[index].fillStyle = "rgba(0, 255, 0, 0.5)";
      ctxArr[index].fillRect(start[0], start[1], size[0], size[1]);

      if (annotateBoxes) {
        const landmarks = predictions[i].landmarks;

        ctxArr[index].fillStyle = "blue";
        for (let j = 0; j < landmarks.length; j++) {
          const x = landmarks[j][0];
          const y = landmarks[j][1];
          ctxArr[index].fillRect(x, y, 5, 5);
        }
      }
    }
  }

  // stats.end();

  requestAnimationFrame(renderPrediction0);
};

const setupPage1 = async (length) => {

  console.log(`length : ${length}`)

  for (let i = 0; i < length; i++) {

    // modelArr[i] = await blazeface.load();
    console.log(`loading ${i}th modal`);
    modelArr[i] = model;

    // await setupCamera1(i);

    videoArr[i] = document.getElementById(`video${i}`);
    videoArr[i].play();

    videoWidth = videoArr[i].videoWidth;
    videoHeight = videoArr[i].videoHeight;
    videoArr[i].width = videoWidth;
    videoArr[i].height = videoHeight;

    canvasArr[i] = document.getElementById(`output${i}`);
    canvasArr[i].width = videoWidth;
    canvasArr[i].height = videoHeight;
    ctxArr[i] = canvasArr[i].getContext('2d');
    ctxArr[i].fillStyle = "rgba(255, 0, 0, 0.5)";



    console.log(modelArr[i])
    // renderFunctionArr[i]();
    renderFunctionArrNew[i]();
  }
};

setupPage();
// setupPage1(length);
