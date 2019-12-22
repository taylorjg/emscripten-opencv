window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module) // eslint-disable-line no-undef
  }
}

const range = n =>
  Array.from(Array(n).keys())

export const inset = (x, y, w, h, dx, dy) =>
  [x + dx, y + dy, w - 2 * dx, h - 2 * dy]

const getImageData = () => {
  console.log('[getImageData]')
  const img = document.getElementById('input-image')
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return imageData
}

const imageDataFrom1Channel = (data, width, height) => {
  console.log('[imageDataFrom1Channel]')
  const cb = width * height * 4
  const array = new Uint8ClampedArray(cb)
  data.forEach((pixelValue, index) => {
    const base = index * 4
    array[base] = pixelValue
    array[base + 1] = pixelValue
    array[base + 2] = pixelValue
    array[base + 3] = 255
  })
  const imageData = new ImageData(array, width, height)
  return imageData
}

const imageDataFrom4Channels = (data, width, height) => {
  console.log('[imageDataFrom4Channels]')
  const array = new Uint8ClampedArray(data)
  const imageData = new ImageData(array, width, height)
  return imageData
}

const drawOutputImage = imageData => {
  console.log('[drawOutputImage]')
  const canvas = document.getElementById('output-image')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(imageData, 0, 0)
}

const drawBoundingBox = boundingBox => {
  console.log('[drawBoundingBox]')
  const canvas = document.getElementById('input-image-overlay')
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 2
  ctx.strokeRect(...inset(...boundingBox, 2, 2))
}

const cropCells = (imageData, boundingBox) => {
  console.log('[cropCells]')

  const img = document.getElementById('input-image')
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)

  const cellsElement = document.getElementById('cells')

  const [bbx, bby, bbw, bbh] = inset(...boundingBox, 2, 2)
  const cellw = bbw / 9
  const cellh = bbh / 9
  for (const y of range(9)) {
    const row = document.createElement('div')
    const celly = bby + y * cellh
    for (const x of range(9)) {
      const cellx = bbx + x * cellw
      const imageData = ctx.getImageData(...inset(cellx, celly, cellw, cellh, 2, 2))
      console.dir(imageData)
      const cellCanvas = document.createElement('canvas')
      cellCanvas.setAttribute('class', 'cell')
      cellCanvas.width = imageData.width
      cellCanvas.height = imageData.height
      cellCanvas.getContext('2d').putImageData(imageData, 0, 0)
      row.appendChild(cellCanvas)
    }
    cellsElement.appendChild(row)
  }
}

const onProcessImage = (module, processImage) => () => {
  console.log('[onProcessImage]')
  const { data, width, height } = getImageData()
  const addr = processImage(data, width, height)
  const returnDataAddr = addr / module.HEAP32.BYTES_PER_ELEMENT
  const returnData = module.HEAP32.slice(returnDataAddr, returnDataAddr + 8)
  const [bbx, bby, bbw, bbh, outImageWidth, outImageHeight, outImageChannels, outImageAddr] = returnData
  const boundingBox = [bbx, bby, bbw, bbh]
  console.log(JSON.stringify(boundingBox))
  console.log(JSON.stringify([outImageWidth, outImageHeight, outImageChannels, outImageAddr]))
  const outImageDataSize = outImageWidth * outImageHeight * outImageChannels
  const outImageData = module.HEAPU8.slice(outImageAddr, outImageAddr + outImageDataSize)
  const imageData = outImageChannels === 1
    ? imageDataFrom1Channel(outImageData, outImageWidth, outImageHeight)
    : imageDataFrom4Channels(outImageData, outImageWidth, outImageHeight)
  drawOutputImage(imageData)
  drawBoundingBox(boundingBox)
  cropCells(imageData, boundingBox)
  module._free(addr)
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
  const processImageBtn = document.getElementById('process-image-btn')
  processImageBtn.addEventListener('click', onProcessImage(module, processImage))
  const inputImage = document.getElementById('input-image')
  const inputImageOverlay = document.getElementById('input-image-overlay')
  inputImageOverlay.width = inputImage.width
  inputImageOverlay.height = inputImage.height
}
