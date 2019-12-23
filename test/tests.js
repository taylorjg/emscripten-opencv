let expect
let npmcanvas
let helloModule

const IS_NODE = typeof process === 'object' && typeof require === 'function'

if (IS_NODE) {
  expect = require('chai').expect
  npmcanvas = require('canvas')
} else {
  expect = chai.expect
  mocha.setup('bdd')
  window.Module = {
    onRuntimeInitialized: () => {
      helloModule = window.Module
      mocha.run()
    }
  }
}

const getImageDataNode = async () => {
  const fs = require('fs').promises
  const png = await fs.readFile('src/images/sudoku-1.png')
  return new Promise(resolve => {
    const img = new npmcanvas.Image()
    img.onload = () => {
      const canvas = npmcanvas.createCanvas(img.width, img.height)
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

  before(() => {
    if (IS_NODE) {
      return new Promise(resolve => {
        const Module = require('../build/hello.js')
        Module.onRuntimeInitialized = () => {
          helloModule = Module
          resolve()
        }
      })
    }
  })

  const expectAlmost = (actual, expected) => {
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
    const returnDataAddr = addr / helloModule.HEAP32.BYTES_PER_ELEMENT
    const returnData = helloModule.HEAP32.slice(returnDataAddr, returnDataAddr + 8)

    const [bbx, bby, bbw, bbh, imgw, imgh, imgd] = returnData

    expectAlmost(bbx, 29)
    expectAlmost(bby, 43)
    expectAlmost(bbw, 266)
    expectAlmost(bbh, 267)

    expect(imgw).to.equal(324)
    expect(imgh).to.equal(324)
    expect(imgd).to.equal(1)

    helloModule._free(addr)
  })
})
