#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/opencv.hpp>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

EMSCRIPTEN_KEEPALIVE
void fred(int n, const char *s) {
  EM_ASM_({
    console.log(`[fred] n: ${$0}; s: ${Module.UTF8ToString($1)}`)
  }, n, s);
}

#ifdef __cplusplus
}
#endif
