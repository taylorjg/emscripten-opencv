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

  Mat matIn(height, width, CV_8UC4, array);
  Mat matNormalised;
  Mat matBinary;

  cvtColor(matIn, matNormalised, COLOR_RGBA2GRAY);

  auto newSize = Size(224, 224);
  resize(matNormalised, matNormalised, newSize);

  auto ksize = Size(5, 5);
  auto sigmaX = 0;
  GaussianBlur(matNormalised, matBinary, ksize, sigmaX);

  auto maxValue = 255;
  auto adaptiveMethod = ADAPTIVE_THRESH_GAUSSIAN_C;
  auto thresholdType = THRESH_BINARY_INV;
  auto blockSize = 19;
  auto C = 3;
  adaptiveThreshold(matBinary, matBinary, maxValue, adaptiveMethod, thresholdType, blockSize, C);

  vector<vector<Point>> contours;
  vector<Vec4i> hierarchy;
  auto mode = RETR_EXTERNAL;
  auto method = CHAIN_APPROX_SIMPLE;
  findContours(matBinary, contours, hierarchy, mode, method);

  auto areas = vector<double>(contours.size());
  transform(
    contours.cbegin(),
    contours.cend(),
    areas.begin(),
    [](const vector<Point> &contour){ return contourArea(contour); });

  auto itMaxArea = max_element(areas.cbegin(), areas.cend());
  auto indexMaxArea = distance(areas.cbegin(), itMaxArea);
  auto bb = boundingRect(contours[indexMaxArea]);

  int return_image_1_width = matNormalised.cols;
  int return_image_1_height = matNormalised.rows;
  int return_image_1_channels = matNormalised.channels();
  int return_image_1_size = return_image_1_width * return_image_1_height * return_image_1_channels;

  int return_image_2_width = matBinary.cols;
  int return_image_2_height = matBinary.rows;
  int return_image_2_channels = matBinary.channels();
  int return_image_2_size = return_image_2_width * return_image_2_height * return_image_2_channels;

  int return_data_size = 12 * sizeof(int) + return_image_1_size + return_image_2_size;
  int *return_data = reinterpret_cast<int*>(malloc(return_data_size));
  uchar *return_image_1_addr = reinterpret_cast<uchar*>(&return_data[12]);
  uchar *return_image_2_addr = return_image_1_addr + return_image_1_size;
  memcpy(return_image_1_addr, matNormalised.data, return_image_1_size);
  memcpy(return_image_2_addr, matBinary.data, return_image_2_size);

  return_data[0] = bb.x;
  return_data[1] = bb.y;
  return_data[2] = bb.width;
  return_data[3] = bb.height;
  return_data[4] = return_image_1_width;
  return_data[5] = return_image_1_height;
  return_data[6] = return_image_1_channels;
  return_data[7] = reinterpret_cast<int>(return_image_1_addr);
  return_data[8] = return_image_2_width;
  return_data[9] = return_image_2_height;
  return_data[10] = return_image_2_channels;
  return_data[11] = reinterpret_cast<int>(return_image_2_addr);
  return return_data;
}

#ifdef __cplusplus
}
#endif
