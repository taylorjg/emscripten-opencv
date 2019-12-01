window.Module = {
  onRuntimeInitialized: () => {
    console.log('[onRuntimeInitialized]')
    init(Module)
  }
}

const init = Module => {
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
