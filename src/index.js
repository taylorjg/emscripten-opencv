window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module)
  }
}

const processImageBtn = document.getElementById('process-image-btn')
const img = document.getElementById('input-image')

const getImageData = () => {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, img.width, img.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return imageData
}

const onProcessImage = processImage => () => {
  console.log('[onProcessImage]')
  const { data, width, height } = getImageData()
  processImage(data, width, height)
}

const wrapProcessImage = module => {
  const ident = 'processImage'
  const returnType = null
  const argTypes = ['array', 'number', 'number']
  const processImage = module.cwrap(ident, returnType, argTypes)
  return processImage
}

const init = module => {
  console.log('[init]')
  const processImage = wrapProcessImage(module)
  processImageBtn.addEventListener('click', onProcessImage(processImage))
}
