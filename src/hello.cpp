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

int distanceSquared(const Point &p1, const Point& p2) {
  auto dx = p1.x - p2.x;
  auto dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

int distance(const Point &p1, const Point& p2) {
  return sqrt(distanceSquared(p1, p2));
}

int findQuadrant(const Point &centre, const Point &p) {
  if (p.x < centre.x && p.y < centre.y) return 0;
  if (p.x > centre.x && p.y < centre.y) return 1;
  if (p.x > centre.x && p.y > centre.y) return 2;
  if (p.x < centre.x && p.y > centre.y) return 3;
  return -1;
}

vector<Point> findCorners(const vector<Point> &contour) {
  auto M = moments(contour, true);
  auto centre = Point(M.m10 / M.m00, M.m01 / M.m00);
  auto corners = vector<Point>(4);
  int maxDistances[] = {0, 0, 0, 0};
  for_each(
    contour.cbegin(),
    contour.cend(),
    [&](const Point &p){
      auto q = findQuadrant(centre, p);
      if (q >= 0) {
        auto d = distanceSquared(centre, p);
        if (d > maxDistances[q]) {
          maxDistances[q] = d;
          corners[q] = p;
        }
      }
    });
  return corners;
}

void applyWarpPerspective(const Mat &matIn, Mat &matOut, const vector<Point> &corners) {
  auto widthTop = distance(corners[0], corners[1]);
  auto widthBottom = distance(corners[2], corners[3]);
  auto heightLeft = distance(corners[0], corners[3]);
  auto heightRight = distance(corners[1], corners[2]);
  auto unwarpedSize = Size(max(widthTop, widthBottom), max(heightLeft, heightRight));
  auto unwarpedCorners = vector<Point2f>(4);
  unwarpedCorners[0] = Point2f(0, 0);
  unwarpedCorners[1] = Point2f(unwarpedSize.width, 0);
  unwarpedCorners[2] = Point2f(unwarpedSize.width, unwarpedSize.height);
  unwarpedCorners[3] = Point2f(0, unwarpedSize.height);
  auto warpedCorners = vector<Point2f>(4);
  warpedCorners[0] = Point2f(corners[0].x, corners[0].y);
  warpedCorners[1] = Point2f(corners[1].x, corners[1].y);
  warpedCorners[2] = Point2f(corners[2].x, corners[2].y);
  warpedCorners[3] = Point2f(corners[3].x, corners[3].y);
  auto transform = getPerspectiveTransform(warpedCorners.data(), unwarpedCorners.data());
  warpPerspective(matIn, matOut, transform, unwarpedSize);
}

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

  if (contours.empty()) {
    return 0;
  }

  auto areas = vector<double>(contours.size());
  transform(
    contours.cbegin(),
    contours.cend(),
    areas.begin(),
    [](const vector<Point> &contour){ return contourArea(contour); });

  auto itMaxArea = max_element(areas.cbegin(), areas.cend());
  auto indexMaxArea = distance(areas.cbegin(), itMaxArea);
  auto bb = boundingRect(contours[indexMaxArea]);

  auto corners = findCorners(contours[indexMaxArea]);
  Mat matUnwarped;
  applyWarpPerspective(matNormalised, matUnwarped, corners);

  int return_image_1_width = matNormalised.cols;
  int return_image_1_height = matNormalised.rows;
  int return_image_1_channels = matNormalised.channels();
  int return_image_1_size = return_image_1_width * return_image_1_height * return_image_1_channels;

  int return_image_2_width = matUnwarped.cols;
  int return_image_2_height = matUnwarped.rows;
  int return_image_2_channels = matUnwarped.channels();
  int return_image_2_size = return_image_2_width * return_image_2_height * return_image_2_channels;

  int return_data_size = 20 * sizeof(int) + return_image_1_size + return_image_2_size;
  int *return_data = reinterpret_cast<int*>(malloc(return_data_size));
  uchar *return_image_1_addr = reinterpret_cast<uchar*>(&return_data[20]);
  uchar *return_image_2_addr = return_image_1_addr + return_image_1_size;
  memcpy(return_image_1_addr, matNormalised.data, return_image_1_size);
  memcpy(return_image_2_addr, matUnwarped.data, return_image_2_size);

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
  return_data[12] = corners[0].x;
  return_data[13] = corners[0].y;
  return_data[14] = corners[1].x;
  return_data[15] = corners[1].y;
  return_data[16] = corners[2].x;
  return_data[17] = corners[2].y;
  return_data[18] = corners[3].x;
  return_data[19] = corners[3].y;
  return return_data;
}

#ifdef __cplusplus
}
#endif
