let expect
let nodeCanvas
let helloModule

const IS_NODE = typeof process === 'object' && typeof require === 'function'

const main = async () => {
  if (IS_NODE) {
    expect = require('chai').expect
    nodeCanvas = require('canvas')
  } else {
    expect = chai.expect
    mocha.setup('bdd')
    helloModule = await window.createHelloModule()
    mocha.run()
  }
}

main()

const getImageDataNode = async () => {
  const fs = require('fs').promises
  const png = await fs.readFile('src/images/sudoku-1.png')
  return new Promise(resolve => {
    const img = new nodeCanvas.Image()
    img.onload = () => {
      const canvas = nodeCanvas.createCanvas(img.width, img.height)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve(imageData)
    }
    img.src = png
  })
}

const getImageDataBrowser = async () =>
  new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      resolve(imageData)
    }
    img.src = '/images/sudoku-1.png'
  })

const getImageData = () =>
  IS_NODE ? getImageDataNode() : getImageDataBrowser()

describe('tests', () => {

  before(async () => {
    if (IS_NODE) {
      const createHelloModule = require('../build/hello.js')
      helloModule = await createHelloModule()
    }
  })

  const expectWithinTolerance = (actual, expected) => {
    const TOLERANCE = 1
    const lowerBound = expected - TOLERANCE
    const upperBound = expected + TOLERANCE
    expect(actual).to.be.within(lowerBound, upperBound)
  }

  it('processImage', async () => {

    const ident = 'processImage'
    const returnType = 'number'
    const argTypes = ['array', 'number', 'number']
    const processImage = helloModule.cwrap(ident, returnType, argTypes)

    const imageData = await getImageData()
    const { data, width, height } = imageData

    const addr = processImage(data, width, height)

    try {
      const addr32 = addr / helloModule.HEAP32.BYTES_PER_ELEMENT
      const data32 = helloModule.HEAP32.slice(addr32, addr32 + 22)

      const [bbx, bby, bbw, bbh, imgw, imgh, imgd] = data32

      expectWithinTolerance(bbx, 20)
      expectWithinTolerance(bby, 30)
      expectWithinTolerance(bbw, 185)
      expectWithinTolerance(bbh, 185)

      expect(imgw).to.equal(224)
      expect(imgh).to.equal(224)
      expect(imgd).to.equal(1)
    } finally {
      helloModule._free(addr)
    }
  })
})
