#include <cstring>
#include <vector>
#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>
#include <opencv2/opencv.hpp>
#include <emscripten.h>

using namespace std;
using namespace cv;

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
uchar *processImage(uchar *array, int width, int height) {

  Mat mat(height, width, CV_8UC4, array);

  cvtColor(mat, mat, COLOR_RGBA2GRAY);

  auto ksize = Size(5, 5);
  auto sigmaX = 0;
  GaussianBlur(mat, mat, ksize, sigmaX);

  auto maxValue = 255;
  auto adaptiveMethod = ADAPTIVE_THRESH_GAUSSIAN_C;
  auto thresholdType = THRESH_BINARY_INV;
  auto blockSize = 19;
  auto C = 3;
  adaptiveThreshold(mat, mat, maxValue, adaptiveMethod, thresholdType, blockSize, C);

  vector<vector<Point>> contours;
  vector<Vec4i> hierarchy;
  auto mode = RETR_EXTERNAL;
  auto method = CHAIN_APPROX_SIMPLE;
  findContours(mat, contours, hierarchy, mode, method);

  auto numContours = contours.size();
  EM_ASM_(console.log(`numContours: ${$0}`), numContours);

  const int cb = width * height * mat.channels();
  uchar *array_copy = reinterpret_cast<uchar*>(malloc(cb));
  memcpy(array_copy, mat.data, cb);
  return array_copy;
}

#ifdef __cplusplus
}
#endif
