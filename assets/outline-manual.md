Easy to Use (Start with), best of all competitors: triton/cute/cutile/helion/ ... 
- Less code to equivalent functionality, 40% of equivalent CUDA code. (best, CUTE, Cutile, etc.)
- High-level Abstraction (zero-cost, higher abstraction than triton)
 - Work on tensors rather than buffers.
 - avoid the complexity of HW programming, including tma/dma, tensor-core.
 - Make parallel programs easier.
 - Ensure best practise within the tileflow paradigm. 
- C++ integration, can work with cutlass/cute, or any c++ library.

Strong Compile-Time Code Safety Check, best of all competitors: triton/cute/cutile/helion/ ... 
- Address Tiling mis-matches (avoid hard to debug issue in low-level cuda kernel programming)
- Can enable aggressive runtime checks for easier debugging.

Dynamic/Symbolic Shape Support, best of all competitors: triton/cute/cutile/helion/ ... 
- First system to allow shared (scratchpad) memory to be dynamic in low-level cuda kernel programming.
- Static and Runtime memory support.

Born for agentic AI programming
- superior context engineering
    - high abstraction and loc save context cost
    - syntax are simple
- superior harness engineering, use engineering way to reduce AI randomness
    - all-rounded compile-time check, prevent runtime bugs that are hard to debug, save context for debug.
    - compiler message is tailored for AI understanding, AI is easy to learn how to program with choreo