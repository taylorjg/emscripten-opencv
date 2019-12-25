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
  const canvas = document.getElementById('input-image')
  const ctx = canvas.getContext('2d')
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

const drawOutputImage = (imageData, canvasId) => {
  console.log('[drawOutputImage]')
  const canvas = document.getElementById(canvasId)
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  ctx.putImageData(imageData, 0, 0)
  const outputImageOverlay = document.getElementById(`${canvasId}-overlay`)
  outputImageOverlay.width = imageData.width
  outputImageOverlay.height = imageData.height
}

const drawBoundingBox = (boundingBox, canvasId) => {
  console.log('[drawBoundingBox]')
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 1
  ctx.strokeRect(...inset(...boundingBox, 2, 2))
}

const drawCorners = (corners, canvasId) => {
  console.log('[drawCorners]')
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = 'magenta'
  ctx.lineWidth = 1
  const path = new Path2D()
  path.moveTo(corners[0].x, corners[0].y)
  corners.slice(1).forEach(corner => {
    path.lineTo(corner.x, corner.y)
  })
  path.closePath()
  ctx.stroke(path)
}

const cropCells = (canvasId, cellsId, boundingBox) => {
  console.log('[cropCells]')

  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext('2d')

  const cellsElement = document.getElementById(cellsId)

  const [bbx, bby, bbw, bbh] = inset(...boundingBox, 2, 2)
  const cellw = bbw / 9
  const cellh = bbh / 9
  for (const y of range(9)) {
    const row = document.createElement('div')
    const celly = bby + y * cellh
    for (const x of range(9)) {
      const cellx = bbx + x * cellw
      const imageData = ctx.getImageData(...inset(cellx, celly, cellw, cellh, 2, 2))
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

const clearCanvas = canvasId => {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const deleteChildren = parent => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

const reset = () => {
  clearCanvas('output-image-1')
  clearCanvas('output-image-1-overlay')
  const cells1Element = document.getElementById('cells-1')
  const cells2Element = document.getElementById('cells-2')
  deleteChildren(cells1Element)
  deleteChildren(cells2Element)
}

const loadInputImage = async index => {
  console.log('[loadInputImage]')
  const inputImageSelector = document.getElementById('input-image-selector')
  const imageUrl = inputImageSelector.options[index].value
  const image = new Image()
  await new Promise(resolve => {
    image.onload = resolve
    image.src = imageUrl
  })
  const canvas = document.getElementById('input-image')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, image.width, image.height)
  const inputImageOverlay = document.getElementById('input-image-overlay')
  inputImageOverlay.width = image.width
  inputImageOverlay.height = image.height
  reset()
}

const onSelectImageSudoku = e => {
  console.log('[onSelectImageSudoku]')
  loadInputImage(e.target.selectedIndex)
}

const onProcessImage = (module, processImage) => () => {
  console.log('[onProcessImage]')
  reset()
  const { data, width, height } = getImageData()
  const addr = processImage(data, width, height)
  const returnDataAddr = addr / module.HEAP32.BYTES_PER_ELEMENT
  const returnData = module.HEAP32.slice(returnDataAddr, returnDataAddr + 20)
  const [
    bbx, bby, bbw, bbh,
    outImage1Width, outImage1Height, outImage1Channels, outImage1Addr,
    outImage2Width, outImage2Height, outImage2Channels, outImage2Addr
  ] = returnData
  const boundingBox = [bbx, bby, bbw, bbh]
  const corners = range(4).map(cornerIndex => ({
    x: returnData[12 + cornerIndex * 2],
    y: returnData[12 + cornerIndex * 2 + 1]
  }))

  const outImage1DataSize = outImage1Width * outImage1Height * outImage1Channels
  const outImage1Data = module.HEAPU8.slice(outImage1Addr, outImage1Addr + outImage1DataSize)
  const imageData1 = outImage1Channels === 1
    ? imageDataFrom1Channel(outImage1Data, outImage1Width, outImage1Height)
    : imageDataFrom4Channels(outImage1Data, outImage1Width, outImage1Height)
  drawOutputImage(imageData1, 'output-image-1')
  drawBoundingBox(boundingBox, 'output-image-1-overlay')
  drawCorners(corners, 'output-image-1-overlay')

  const outImage2DataSize = outImage2Width * outImage2Height * outImage2Channels
  const outImage2Data = module.HEAPU8.slice(outImage2Addr, outImage2Addr + outImage2DataSize)
  const imageData2 = outImage2Channels === 1
    ? imageDataFrom1Channel(outImage2Data, outImage2Width, outImage2Height)
    : imageDataFrom4Channels(outImage2Data, outImage2Width, outImage2Height)
  drawOutputImage(imageData2, 'output-image-2')
  drawBoundingBox(boundingBox, 'output-image-2-overlay')
  drawCorners(corners, 'output-image-2-overlay')

  cropCells('output-image-1', 'cells-1', boundingBox)
  cropCells('output-image-2', 'cells-2', boundingBox)

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
  const inputImageSelector = document.getElementById('input-image-selector')
  range(2).forEach(index => {
    const sudokuNumber = index + 1
    const value = `/images/sudoku-${sudokuNumber}.png`
    const label = `Sudoku ${sudokuNumber}`
    const optionElement = document.createElement('option')
    optionElement.setAttribute('value', value)
    optionElement.innerText = label
    inputImageSelector.appendChild(optionElement)
  })
  inputImageSelector.addEventListener('change', onSelectImageSudoku)
  loadInputImage(0)
  const processImage = wrapProcessImage(module)
  const processImageBtn = document.getElementById('process-image-btn')
  processImageBtn.addEventListener('click', onProcessImage(module, processImage))
}
