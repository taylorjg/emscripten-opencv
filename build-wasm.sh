mkdir -p build
( \
  cd build; \
  emconfigure cmake ..; \
  emmake make clean; \
  emmake make; \
  cd ..\
)
