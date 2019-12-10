window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module)
  }
}

const processImageBtn = document.getElementById('process-image-btn')
const inputImage = document.getElementById('input-image')
const outputImage = document.getElementById('output-image')

const getImageData = () => {
  console.log('[getImageData]')
  const canvas = document.createElement('canvas')
  canvas.width = inputImage.width
  canvas.height = inputImage.height
  ctx = canvas.getContext('2d')
  ctx.drawImage(inputImage, 0, 0, inputImage.width, inputImage.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return imageData
}

const drawOutputImage = (dataOut, width, height) => {
  console.log('[drawOutputImage]')
  const array = new Uint8ClampedArray(dataOut)
  const imageData = new ImageData(array, width, height)
  outputImage.width = width
  outputImage.height = height
  ctx = outputImage.getContext('2d')
  ctx.putImageData(imageData, 0, 0)
}

const onProcessImage = (module, processImage) => () => {
  console.log('[onProcessImage]')
  const { data, width, height } = getImageData()
  const dataOutAddr = processImage(data, width, height)
  const dataOutSize = width * height * 4
  const dataOut = module.HEAPU8.slice(dataOutAddr, dataOutAddr + dataOutSize)
  drawOutputImage(dataOut, width, height)
  module._free(dataOutAddr)
}

const wrapProcessImage = module => {
  console.log('[wrapProcessImage]')
  const ident = 'processImage'
  const returnType = 'number'
  const argTypes = ['array', 'number', 'number']
  const processImage = module.cwrap(ident, returnType, argTypes)
  return processImage
}

const init = module => {
  console.log('[init]')
  const processImage = wrapProcessImage(module)
  processImageBtn.addEventListener('click', onProcessImage(module, processImage))
}
