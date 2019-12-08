window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module)
  }
}

const onProcessImage = () => {
  console.log('[onProcessImage]')
}

const init = Module => {
  document.getElementById('process-image-btn').addEventListener('click', onProcessImage)
  console.log('[init]')
  const hello = new Module.Hello()
  const view = hello.allocate(1000)
  console.dir(view)
  console.log("allocated")
  // TODO put in "view" actual image data
  const mat = hello.imdecode()
  console.dir(mat)
  console.log("decoded")
}
