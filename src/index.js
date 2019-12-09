window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module)
  }
}

const onProcessImage = () => {
  console.log('[onProcessImage]')
  Module.ccall('fred', null, ['number', 'string'], [42, 'Hello'])
}

const init = Module => {
  console.log('[init]')
  document.getElementById('process-image-btn').addEventListener('click', onProcessImage)
}
