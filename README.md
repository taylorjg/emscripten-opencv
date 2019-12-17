# Description

> I meant to fork https://github.com/mpizenberg/emscripten-opencv.git but I cloned it instead and I don't know how to correct it.

I have another repo ([sudoku-buster](https://github.com/taylorjg/sudoku-buster)) that uses OpenCV.js
to detect the bounding box of a Sudoku puzzle given an image from a newspaper or similar. It then
goes on to solve the puzzle and show the solution.

It works pretty well but the OpenCV.js file is very big. I have managed to get it down to about 4 MB from 8 MB by
exlcuding some bits that I am not using. However, it occurred to me that if I could move the bounding box code
from JavaScript to C++ and then build it as a WebAssembly, the overall result might be smaller.

> **UPDATE:** This isn't the final version of the code but results so far are encouraging - my
current C++ WebAssembly is about 1 MB in size.

# Setup

## Directory Structure

These instructions assume the following directory structure:

```
some-root
├── emscripten-opencv
└── opencv
```

The name `some-root` could be anything.
The key point is that the `opencv` and `emscripten-opencv` directories are at the same level.

Clone `opencv` from https://github.com/opencv/opencv.git.
You may want to checkout to a particular tag e.g.

```
cd some-root/opencv
git checkout 4.1.2
```

## Ensure Docker is installed

I use the `trzeci/emscripten` Docker image to build WebAssemblies.

## Build the OpenCV WebAssembly

You only need to do this once.
This builds the OpenCV WebAssembly libraries which you will find in:

* `some-root/opencv/build_wasm/lib`

```
cd some-root/emscripten-opencv
npm run build:opencv
```

## Build this project's WebAssembly

Run this whenever a change is made to this project's C++ source files.
This will build:

* `some-root/emscripten-opencv/build/hello.js`
* `some-root/emscripten-opencv/build/hello.wasm`

```
cd some-root/emscripten-opencv
npm run build:wasm
```

# Running

This assumes that you have already cloned and built OpenCV as described above.

## Running a local server

This builds this repo's WebAssembly and bundles everything using `webpack` and then launches
an Express-based web server:

```
cd some-root/emscripten-opencv
npm run build
npm start
```

To run on a specific port e.g. 3434:

```
PORT=3434 npm start
```

## Running a local server in dev mode

This builds this repo's WebAssembly then launches `webpack-dev-server`:

```
cd some-root/emscripten-opencv
npm run start:dev
```

This will automatically rebundle when a change is made to files of type .js, .html, .css etc.

If you change a C++ source file, you will have to explicitly re-run `npm run build:wasm`.
The resulting WebAssembly should then be automatically rebundled.

# Links

* https://github.com/mpizenberg/emscripten-opencv.git
* https://docs.opencv.org/4.1.2/d4/da1/tutorial_js_setup.html
* https://hub.docker.com/r/trzeci/emscripten/
