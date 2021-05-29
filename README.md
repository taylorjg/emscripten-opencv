# Description

> I meant to fork https://github.com/mpizenberg/emscripten-opencv.git but I cloned it instead and I don't know how to correct it.

I have another repo ([sudoku-buster](https://github.com/taylorjg/sudoku-buster)) that uses OpenCV.js
to detect the bounding box of a Sudoku puzzle given an image from a newspaper or similar. It then
goes on to solve the puzzle and show the solution.

It works pretty well but the OpenCV.js file is very big. I have managed to get it down to about 4 MB from 8 MB by
excluding some bits that I am not using. However, it occurred to me that if I could move the bounding box code
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

`<some-root>` could be any directory.
The key point is that the `opencv` and `emscripten-opencv` directories are at the same level.

Clone `opencv` from https://github.com/opencv/opencv.git.
You may want to checkout to a particular tag e.g.

```
cd <some-root>/opencv
git checkout 4.1.2
```

## Ensure Docker is installed

~~I use the [trzeci/emscripten](https://hub.docker.com/r/trzeci/emscripten/) Docker image to build WebAssemblies.~~

According to https://hub.docker.com/r/trzeci/emscripten/:

> THIS DOCKER IMAGE IS TO BE DEPRECATED
>
> In favour of the official image: https://hub.docker.com/repository/r/emscripten/emsdk Please investigate transition to those images. In case of missing features or bugs, please report them to https://github.com/emscripten-core/emsdk/

Hence, I am now using [emscripten/emsdk](https://hub.docker.com/r/emscripten/emsdk).

## Build the OpenCV WebAssembly Libraries

You only need to do this once.

```
cd <some-root>/emscripten-opencv
npm run build:opencv
```

This builds the OpenCV WebAssembly libraries which you will find in `../opencv/build_wasm/lib`
when it has finished building:

```
$ ls -l ../opencv/build_wasm/lib

total 33208
-rw-r--r--  1 jontaylor  staff  2153518 29 May 08:02 libopencv_calib3d.a
-rw-r--r--  1 jontaylor  staff  2434882 29 May 08:00 libopencv_core.a
-rw-r--r--  1 jontaylor  staff  5858586 29 May 08:03 libopencv_dnn.a
-rw-r--r--  1 jontaylor  staff   665434 29 May 08:01 libopencv_features2d.a
-rw-r--r--  1 jontaylor  staff   549828 29 May 08:00 libopencv_flann.a
-rw-r--r--  1 jontaylor  staff  3836412 29 May 08:01 libopencv_imgproc.a
-rw-r--r--  1 jontaylor  staff   455288 29 May 08:03 libopencv_objdetect.a
-rw-r--r--  1 jontaylor  staff   621346 29 May 08:01 libopencv_photo.a
-rw-r--r--  1 jontaylor  staff   407924 29 May 08:03 libopencv_video.a
```

## Build this project's WebAssembly

Run this whenever a change is made to this project's C++ source files.
This will build:

* `<some-root>/emscripten-opencv/build/hello.js`
* `<some-root>/emscripten-opencv/build/hello.wasm`

```
cd <some-root>/emscripten-opencv
npm run build:wasm
```

# Running

The following sections assume that you have already cloned and built OpenCV as described above.

## Running a local server

This builds this repo's WebAssembly and bundles everything using `webpack` and then launches
an Express-based web server:

```
cd <some-root>/emscripten-opencv
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
cd <some-root>/emscripten-opencv
npm run start:dev
```

This will automatically rebundle when a change is made to files of type .js, .html, .css etc.

If you change a C++ source file, you will have to explicitly re-run `npm run build:wasm`.
The resulting WebAssembly should then be automatically rebundled.

# Unit Tests

I have added a single unit test so far. This can be run from the command line or a web browser
(inspired by chapter 13 of [WebAssembly in Action](https://www.manning.com/books/webassembly-in-action)).

The following sections assume that you have already cloned and built OpenCV as described above.

## Running unit tests from the command line

```
npm run build
npm test
```

> **NOTE:** this is currently failing since switching from `trzeci/emscripten` to `emscripten/emsdk`:

```
RuntimeError: abort(RuntimeError: abort(CompileError: WebAssembly.instantiate(): Compiling function #16 failed: Invalid opcode (enable with --experimental-wasm-threads) @+9038). Build with -s ASSERTIONS=1 for more info.). Build with -s ASSERTIONS=1 for more info.
    at process.abort (build/hello.js:1:9914)
    at processPromiseRejections (internal/process/promises.js:245:33)
    at processTicksAndRejections (internal/process/task_queues.js:94:32) {
  uncaught: true
}
```

## Running unit tests from a web browser

```
npm run build
PORT=3434 npm start
open http://localhost:3434/tests.html
```

# Links

* https://github.com/mpizenberg/emscripten-opencv.git
* https://docs.opencv.org/4.1.2/d4/da1/tutorial_js_setup.html
* https://hub.docker.com/r/trzeci/emscripten/
* https://hub.docker.com/r/emscripten/emsdk
