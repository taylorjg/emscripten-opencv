#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/opencv.hpp>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
void processImage(uchar *array, int width, int height) {
  cv::Mat mat(height, width, CV_8UC4, array);
  EM_ASM_({
    console.log(`[processImage] width: ${$0}; height: ${$1}; array[0]: ${$2}; array[1]: ${$3}; array[2]: ${$4}`)
  }, width, height, array[0], array[1], array[2]);
}

#ifdef __cplusplus
}
#endif
