#include <cstring>
#include <vector>
#include <algorithm>
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
int *processImage(uchar *array, int width, int height) {

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

  auto areas = vector<double>(contours.size());
  transform(
    contours.cbegin(),
    contours.cend(),
    areas.begin(),
    [](const vector<Point> &contour){ return contourArea(contour); });

  auto itMaxArea = max_element(areas.cbegin(), areas.cend());
  auto indexMaxArea = distance(areas.cbegin(), itMaxArea);
  auto bb = boundingRect(contours[indexMaxArea]);

  int channels = mat.channels();
  const int cb_return_image = width * height * channels;
  const int cb_return_data = 8 * sizeof(int) + cb_return_image;
  int *return_data = reinterpret_cast<int*>(malloc(cb_return_data));
  uchar *return_image = reinterpret_cast<uchar*>(&return_data[8]);
  memcpy(return_image, mat.data, cb_return_image);
  return_data[0] = bb.x;
  return_data[1] = bb.y;
  return_data[2] = bb.width;
  return_data[3] = bb.height;
  return_data[4] = width;
  return_data[5] = height;
  return_data[6] = channels;
  return_data[7] = reinterpret_cast<int>(return_image);
  return return_data;
}

#ifdef __cplusplus
}
#endif
