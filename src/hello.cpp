#include <cstring>
#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <emscripten.h>

using namespace cv;

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
uchar *processImage(uchar *array, int width, int height) {
  Mat mat(height, width, CV_8UC4, array);
  cvtColor(mat, mat, COLOR_RGBA2GRAY);
  const int cb = width * height * mat.channels();
  uchar *array_copy = reinterpret_cast<uchar*>(malloc(cb));
  std::memcpy(array_copy, mat.data, cb);
  return array_copy;
}

#ifdef __cplusplus
}
#endif
