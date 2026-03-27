---
marp: true
theme: croktile-dark
paginate: true
---

<!-- _class: lead -->

# CrokTile

### Easy GPU Programming with Zero-Cost Abstractions

![width:140](../../assets/images/logo-square.svg)

---

## What is CrokTile?

A **high-level GPU programming framework** that makes CUDA kernel development accessible without sacrificing performance.

<!-- _class: split -->

**Easy to Use**
40% of equivalent CUDA code.
Higher abstraction than Triton.

**Compile-Time Safety**
Catch tiling bugs before they crash your GPU. Best-in-class static checks.

**Dynamic / Symbolic Shapes**
First system with dynamic shared memory in low-level kernels.

**Born for AI Agents**
Engineered for agentic AI programming with superior context & harness.

---

<!-- _class: chapter -->

#### Chapter 1

## Easy to Use

Best of all competitors: Triton / CuTe / Cutile / Helion

---

<!-- _class: split -->

## Less Code: 40% of Equivalent CUDA

**CrokTile — matmul kernel (25 LOC)**

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-kw">__co__</span> <span class="hl-ty">void</span> matmul<span class="hl-pu">(</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>N<span class="hl-pu">,</span> K<span class="hl-pu">]</span> rhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> N<span class="hl-pu">]</span> output<span class="hl-pu">)</span> <span class="hl-pu">{</span>

  <span class="hl-kw">parallel</span> <span class="hl-pu">{</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">}</span>
    <span class="hl-kw">by</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>M<span class="hl-pu">,</span> WARP_M<span class="hl-pu">)</span><span class="hl-pu">,</span> <span class="hl-kw">cdiv</span><span class="hl-pu">(</span>N<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span><span class="hl-pu">]</span>
    <span class="hl-op">:</span> <span class="hl-st">block</span> <span class="hl-pu">{</span>
    <span class="hl-st">shared</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">]</span> lhs_s<span class="hl-pu">;</span>
    <span class="hl-st">shared</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>WARP_N<span class="hl-pu">,</span> TILE_K<span class="hl-pu">]</span> rhs_s<span class="hl-pu">;</span>
    mc <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">fill</span>.<span class="hl-ty">f16</span> <span class="hl-nu">0.0f</span><span class="hl-pu">;</span>
    <span class="hl-kw">foreach</span> <span class="hl-pu">{</span>iv_k<span class="hl-pu">}</span> <span class="hl-kw">in</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>K<span class="hl-pu">,</span> TILE_K<span class="hl-pu">)</span><span class="hl-pu">]</span> <span class="hl-pu">{</span>
      <span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
        lhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> iv_k<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> lhs_s<span class="hl-pu">;</span>
      <span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
        rhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_n<span class="hl-pu">,</span> iv_k<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> rhs_s<span class="hl-pu">;</span>
      <span class="hl-kw">foreach</span> <span class="hl-pu">{</span>iv<span class="hl-pu">}</span> <span class="hl-kw">in</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>TILE_K<span class="hl-pu">,</span> WARP_K<span class="hl-pu">)</span><span class="hl-pu">]</span> <span class="hl-pu">{</span>
        <span class="hl-kw">parallel</span> p <span class="hl-kw">by</span> <span class="hl-nu">1</span> <span class="hl-op">:</span> <span class="hl-st">group</span><span class="hl-op">-</span><span class="hl-nu">4</span> <span class="hl-pu">{</span>
          ma <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">load</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
                 lhs_s<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>_<span class="hl-pu">,</span> iv<span class="hl-pu">)</span><span class="hl-pu">;</span>
          mb <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">load</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
                 rhs_s<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>_<span class="hl-pu">,</span> iv<span class="hl-pu">)</span><span class="hl-pu">;</span>
          <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">row</span><span class="hl-pu">.</span><span class="hl-fn">row</span> mc<span class="hl-pu">,</span> ma<span class="hl-pu">,</span> mb<span class="hl-pu">;</span>
        <span class="hl-pu">}</span>
      <span class="hl-pu">}</span>
    <span class="hl-pu">}</span>
    <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">store</span> mc<span class="hl-pu">,</span> output<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span>
                                 block_n<span class="hl-pu">)</span><span class="hl-pu">;</span>
  <span class="hl-pu">}</span>
<span class="hl-pu">}</span></code></pre></div>

**Generated CUDA/CuTe — same kernel (180+ LOC)**

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code><span class="hl-kw">__global__</span> <span class="hl-kw">void</span> __choreo_device_matmul<span class="hl-pu">(</span>
    f16<span class="hl-op">*</span> lhs<span class="hl-pu">,</span> f16<span class="hl-op">*</span> rhs<span class="hl-pu">,</span> f16<span class="hl-op">*</span> output<span class="hl-pu">,</span>
    <span class="hl-kw">unsigned</span> K<span class="hl-pu">,</span> <span class="hl-kw">unsigned</span> M<span class="hl-pu">,</span> <span class="hl-kw">unsigned</span> N<span class="hl-pu">,</span>
    <span class="hl-kw">const</span> __grid_constant__
      CUtensorMap __choreo_tma_0_tensor_map<span class="hl-pu">,</span>
    <span class="hl-kw">const</span> __grid_constant__
      CUtensorMap __choreo_tma_1_tensor_map<span class="hl-pu">,</span>
    <span class="hl-kw">const</span> __grid_constant__
      CUtensorMap __choreo_tma_2_tensor_map<span class="hl-pu">)</span> <span class="hl-pu">{</span>
  <span class="hl-kw">auto</span> wg_barrier <span class="hl-op">=</span>
    cooperative_groups<span class="hl-op">:</span><span class="hl-op">:</span>tiled_partition<span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span><span class="hl-pu">(</span>
      cooperative_groups<span class="hl-op">:</span><span class="hl-op">:</span>this_thread_block<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
  <span class="hl-kw">__shared__</span> cuda<span class="hl-op">:</span><span class="hl-op">:</span>barrier<span class="hl-op">&lt;</span>
    cuda<span class="hl-op">:</span><span class="hl-op">:</span>thread_scope_block<span class="hl-op">&gt;</span>
      choreo_copy_atom_t_0_barrier<span class="hl-pu">;</span>
  <span class="hl-kw">if</span> <span class="hl-pu">(</span>__CHOREO_BLOCK_SINGLE__<span class="hl-pu">)</span> <span class="hl-pu">{</span>
    init<span class="hl-pu">(</span><span class="hl-op">&amp;</span>choreo_copy_atom_t_0_barrier<span class="hl-pu">,</span>
         blockDim.x<span class="hl-pu">)</span><span class="hl-pu">;</span>
    cde<span class="hl-op">:</span><span class="hl-op">:</span>fence_proxy_async_shared_cta<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
  <span class="hl-pu">}</span>
  <span class="hl-kw">__syncthreads</span><span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
  <span class="hl-cm">// ... TMA barrier setup x3 ...</span>
  <span class="hl-cm">// ... shared memory allocation ...</span>
  <span class="hl-cm">// ... fragment initialization ...</span>
  <span class="hl-cm">// ... TMA load orchestration ...</span>
  <span class="hl-cm">// ... WGMMA descriptor creation ...</span>
  <span class="hl-cm">// ... warpgroup synchronization ...</span>
  <span class="hl-cm">// ... 180+ lines total ...</span>
<span class="hl-pu">}</span></code></pre></div>

---

<!-- _class: split -->

## Work on Tensors, Not Buffers

**CrokTile — typed tensor parameters**

Tensors carry shape, data type, and memory space as part of the declaration. No manual pointer arithmetic.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-cm">// Dense GEMM: 2D tensors with named dims</span>
<span class="hl-kw">__co__</span> <span class="hl-ty">void</span> matmul<span class="hl-pu">(</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>N<span class="hl-pu">,</span> K<span class="hl-pu">]</span> rhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> N<span class="hl-pu">]</span> output<span class="hl-pu">)</span>

<span class="hl-cm">// BMM: 3D batched tensors</span>
<span class="hl-kw">__co__</span> <span class="hl-ty">void</span> bmm<span class="hl-pu">(</span>
    <span class="hl-st">global</span> <span class="hl-ty">bf16</span> <span class="hl-pu">[</span>B<span class="hl-pu">,</span> M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">bf16</span> <span class="hl-pu">[</span>B<span class="hl-pu">,</span> N<span class="hl-pu">,</span> K<span class="hl-pu">]</span> rhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f32</span>  <span class="hl-pu">[</span>B<span class="hl-pu">,</span> M<span class="hl-pu">,</span> N<span class="hl-pu">]</span> output<span class="hl-pu">)</span>

<span class="hl-cm">// Shared memory: typed + shaped</span>
<span class="hl-st">shared</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">]</span> lhs_s<span class="hl-pu">;</span></code></pre></div>

**CUDA — raw pointers + manual offsets**

All shape information is implicit. Buffer boundaries must be tracked manually. Off-by-one bugs are silent.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code><span class="hl-kw">__global__</span> <span class="hl-kw">void</span> matmul<span class="hl-pu">(</span>
    f16<span class="hl-op">*</span> lhs<span class="hl-pu">,</span> f16<span class="hl-op">*</span> rhs<span class="hl-pu">,</span> f16<span class="hl-op">*</span> output<span class="hl-pu">,</span>
    <span class="hl-kw">unsigned</span> K<span class="hl-pu">,</span> <span class="hl-kw">unsigned</span> M<span class="hl-pu">,</span> <span class="hl-kw">unsigned</span> N<span class="hl-pu">,</span>
    <span class="hl-kw">const</span> __grid_constant__
      CUtensorMap tma_0<span class="hl-pu">,</span> ...<span class="hl-pu">)</span>
<span class="hl-pu">{</span>
  <span class="hl-cm">// manual shared memory allocation</span>
  <span class="hl-kw">__shared__</span> alignas<span class="hl-pu">(</span><span class="hl-nu">1024</span><span class="hl-pu">)</span>
    <span class="hl-kw">unsigned</span> <span class="hl-kw">char</span> anon_1<span class="hl-pu">[</span><span class="hl-nu">24576</span><span class="hl-pu">]</span><span class="hl-pu">;</span>
  f16<span class="hl-op">*</span> lhs_s <span class="hl-op">=</span> <span class="hl-pu">(</span>f16<span class="hl-op">*</span><span class="hl-pu">)</span><span class="hl-pu">(</span>anon_1 <span class="hl-op">+</span> <span class="hl-nu">16384</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
  f16<span class="hl-op">*</span> rhs_s <span class="hl-op">=</span> <span class="hl-pu">(</span>f16<span class="hl-op">*</span><span class="hl-pu">)</span><span class="hl-pu">(</span>anon_1 <span class="hl-op">+</span> <span class="hl-nu">0</span><span class="hl-pu">)</span><span class="hl-pu">;</span>

  <span class="hl-cm">// manual offset arithmetic</span>
  output<span class="hl-pu">[</span>row <span class="hl-op">*</span> N <span class="hl-op">+</span> col<span class="hl-pu">]</span> <span class="hl-op">=</span> ...<span class="hl-pu">;</span>
<span class="hl-pu">}</span></code></pre></div>

---

<!-- _class: split -->

## No Manual TMA/DMA Management

**CrokTile — one-liner TMA copy**

TMA (Tensor Memory Accelerator) loads are a single instruction. Shape, swizzle, and async barriers are handled automatically.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-cm">// TMA load: global → shared (1 line)</span>
<span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
  lhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> iv_k<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> lhs_s<span class="hl-pu">;</span>

<span class="hl-cm">// TMA store: shared → global (1 line)</span>
<span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span> output_s <span class="hl-op">=&gt;</span>
  output<span class="hl-pu">.</span><span class="hl-fn">subspan</span><span class="hl-pu">(</span>WARP_M<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span>
        <span class="hl-pu">.</span><span class="hl-fn">at</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// DMA load: global → shared (1 line)</span>
lhs_s <span class="hl-op">=</span> <span class="hl-fn">dma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span>
  lhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> iv_k<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> <span class="hl-st">shared</span><span class="hl-pu">;</span></code></pre></div>

**CUDA — TMA descriptor setup (30+ LOC)**

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code><span class="hl-cm">// TMA requires manual descriptor creation</span>
uint64_t tma_shape<span class="hl-pu">[</span><span class="hl-pu">]</span> <span class="hl-op">=</span> <span class="hl-pu">{</span>K<span class="hl-pu">,</span> M<span class="hl-pu">}</span><span class="hl-pu">;</span>
uint64_t tma_strides<span class="hl-pu">[</span><span class="hl-pu">]</span> <span class="hl-op">=</span> <span class="hl-pu">{</span><span class="hl-pu">(</span>K <span class="hl-op">*</span> <span class="hl-nu">2</span><span class="hl-pu">)</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
uint32_t tma_box<span class="hl-pu">[</span><span class="hl-pu">]</span> <span class="hl-op">=</span> <span class="hl-pu">{</span><span class="hl-nu">64</span><span class="hl-pu">,</span> <span class="hl-nu">64</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
uint32_t tma_elem_strides<span class="hl-pu">[</span><span class="hl-pu">]</span> <span class="hl-op">=</span> <span class="hl-pu">{</span><span class="hl-nu">1</span><span class="hl-pu">,</span> <span class="hl-nu">1</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
alignas<span class="hl-pu">(</span><span class="hl-nu">64</span><span class="hl-pu">)</span> CUtensorMap tma_map<span class="hl-pu">{</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
cuTensorMapEncodeTiled<span class="hl-pu">(</span>
  <span class="hl-op">&amp;</span>tma_map<span class="hl-pu">,</span>
  CU_TENSOR_MAP_DATA_TYPE_FLOAT16<span class="hl-pu">,</span>
  <span class="hl-nu">2</span><span class="hl-pu">,</span> lhs.data<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">,</span>
  tma_shape<span class="hl-pu">,</span> tma_strides<span class="hl-pu">,</span>
  tma_box<span class="hl-pu">,</span> tma_elem_strides<span class="hl-pu">,</span>
  CU_TENSOR_MAP_INTERLEAVE_NONE<span class="hl-pu">,</span>
  CU_TENSOR_MAP_SWIZZLE_128B<span class="hl-pu">,</span>
  CU_TENSOR_MAP_L2_PROMOTION_NONE<span class="hl-pu">,</span>
  CU_TENSOR_MAP_FLOAT_OOB_FILL_NONE<span class="hl-pu">)</span><span class="hl-pu">;</span>
<span class="hl-cm">// ... repeat for each tensor ...</span>
<span class="hl-cm">// ... then barrier setup ...</span>
<span class="hl-cm">// ... then async copy orchestration ...</span></code></pre></div>

---

<!-- _class: codeblock -->

## Parallel Programs Made Simple

CrokTile expresses GPU parallelism **declaratively** — from thread blocks to warp groups to individual threads. No manual `blockIdx`, `threadIdx`, or `__syncthreads()`.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-cm">// Level 1: Block-level parallelism (GEMM)</span>
<span class="hl-kw">parallel</span> <span class="hl-pu">{</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">}</span> <span class="hl-kw">by</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>M<span class="hl-pu">,</span> WARP_M<span class="hl-pu">)</span><span class="hl-pu">,</span> <span class="hl-kw">cdiv</span><span class="hl-pu">(</span>N<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span><span class="hl-pu">]</span> <span class="hl-op">:</span> <span class="hl-st">block</span> <span class="hl-pu">{</span> ... <span class="hl-pu">}</span>

<span class="hl-cm">// Level 2: Warp-group parallelism (128 threads = 4 warps)</span>
<span class="hl-kw">parallel</span> p <span class="hl-kw">by</span> <span class="hl-nu">1</span> <span class="hl-op">:</span> <span class="hl-st">group</span><span class="hl-op">-</span><span class="hl-nu">4</span> <span class="hl-pu">{</span> ... <span class="hl-pu">}</span>

<span class="hl-cm">// Level 3: Thread-level parallelism (BMM accumulation)</span>
<span class="hl-kw">parallel</span> <span class="hl-pu">{</span>m<span class="hl-pu">,</span> n<span class="hl-pu">}</span> <span class="hl-kw">by</span> <span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> <span class="hl-nu">2</span><span class="hl-pu">]</span> <span class="hl-op">:</span> <span class="hl-st">thread</span> <span class="hl-pu">{</span> ... <span class="hl-pu">}</span>

<span class="hl-cm">// Level 4: Expert-parallel async blocks (MoE GEMM)</span>
<span class="hl-kw">parallel</span><span class="hl-pu">.</span><span class="hl-fn">async</span> <span class="hl-pu">{</span>eid<span class="hl-pu">,</span> block_n<span class="hl-pu">}</span> <span class="hl-kw">by</span> <span class="hl-pu">[</span>EXPERTS<span class="hl-pu">,</span> <span class="hl-kw">cdiv</span><span class="hl-pu">(</span>N<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span><span class="hl-pu">]</span> <span class="hl-op">:</span> <span class="hl-st">block</span>

<span class="hl-cm">// Level 5: Warp-specialized producer/consumer (blockscale GEMM)</span>
<span class="hl-kw">parallel</span> p1 <span class="hl-kw">by</span> <span class="hl-nu">2</span> <span class="hl-op">:</span> <span class="hl-st">group</span><span class="hl-op">-</span><span class="hl-nu">4</span> <span class="hl-pu">{</span>
    <span class="hl-kw">inthreads</span><span class="hl-pu">.</span><span class="hl-fn">async</span> <span class="hl-pu">(</span>p1 <span class="hl-op">==</span> <span class="hl-nu">0</span><span class="hl-pu">)</span> <span class="hl-pu">{</span> <span class="hl-op">/</span><span class="hl-op">*</span> TMA producer <span class="hl-op">*</span><span class="hl-op">/</span> <span class="hl-pu">}</span>
    <span class="hl-kw">inthreads</span><span class="hl-pu">.</span><span class="hl-fn">async</span> <span class="hl-pu">(</span>p1 <span class="hl-op">==</span> <span class="hl-nu">1</span><span class="hl-pu">)</span> <span class="hl-pu">{</span> <span class="hl-op">/</span><span class="hl-op">*</span> WGMMA consumer <span class="hl-op">*</span><span class="hl-op">/</span> <span class="hl-pu">}</span>
<span class="hl-pu">}</span></code></pre></div>

> In CUDA, each of these patterns requires hundreds of lines of barrier management, index calculations, and synchronization primitives.

---

## Best Practices Enforced by Tileflow

Every CrokTile kernel follows the **same canonical pipeline** — the language ensures you can't skip steps or misorder operations.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-kw">__co__</span> <span class="hl-ty">void</span> kernel<span class="hl-pu">(</span><span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span> ...<span class="hl-pu">)</span> <span class="hl-pu">{</span>
  <span class="hl-cm">// 1. PARTITION — declare parallel tile decomposition</span>
  <span class="hl-kw">parallel</span> <span class="hl-pu">{</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">}</span> <span class="hl-kw">by</span> <span class="hl-pu">[</span>...<span class="hl-pu">]</span> <span class="hl-op">:</span> <span class="hl-st">block</span> <span class="hl-pu">{</span>

    <span class="hl-cm">// 2. ALLOCATE — typed shared memory tiles</span>
    <span class="hl-st">shared</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">]</span> tile_s<span class="hl-pu">;</span>

    <span class="hl-cm">// 3. INITIALIZE — accumulator setup</span>
    mc <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">fill</span>.<span class="hl-ty">f16</span> <span class="hl-nu">0.0f</span><span class="hl-pu">;</span>

    <span class="hl-cm">// 4. ITERATE — tile over reduction dimension</span>
    <span class="hl-kw">foreach</span> <span class="hl-pu">{</span>iv_k<span class="hl-pu">}</span> <span class="hl-kw">in</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>K<span class="hl-pu">,</span> TILE_K<span class="hl-pu">)</span><span class="hl-pu">]</span> <span class="hl-pu">{</span>

      <span class="hl-cm">// 5. LOAD — tma/dma copy global → shared</span>
      <span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span> lhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>...<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> tile_s<span class="hl-pu">;</span>

      <span class="hl-cm">// 6. COMPUTE — MMA on warp group</span>
      <span class="hl-kw">parallel</span> p <span class="hl-kw">by</span> <span class="hl-nu">1</span> <span class="hl-op">:</span> <span class="hl-st">group</span><span class="hl-op">-</span><span class="hl-nu">4</span> <span class="hl-pu">{</span>
        ma <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">load</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span> tile_s<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>...<span class="hl-pu">)</span><span class="hl-pu">;</span>
        <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">row</span><span class="hl-pu">.</span><span class="hl-fn">row</span> mc<span class="hl-pu">,</span> ma<span class="hl-pu">,</span> mb<span class="hl-pu">;</span>
      <span class="hl-pu">}</span>
    <span class="hl-pu">}</span>
    <span class="hl-cm">// 7. STORE — accumulator → shared → global</span>
    <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">store</span> mc<span class="hl-pu">,</span> output_s<span class="hl-pu">;</span>
    <span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span> output_s <span class="hl-op">=&gt;</span> output<span class="hl-pu">.</span><span class="hl-fn">subspan</span><span class="hl-pu">(</span>...<span class="hl-pu">)</span><span class="hl-pu">.</span><span class="hl-fn">at</span><span class="hl-pu">(</span>...<span class="hl-pu">)</span><span class="hl-pu">;</span>
  <span class="hl-pu">}</span>
<span class="hl-pu">}</span></code></pre></div>

---

## C++ Integration — Works with CUTLASS/CuTe

CrokTile kernels live alongside standard C++ code. The host API uses familiar C++ patterns — no FFI, no bindings, no serialization.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code><span class="hl-cm">// Host code: allocate typed tensors (C++ standard library style)</span>
<span class="hl-kw">auto</span> lhs_h <span class="hl-op">=</span> choreo<span class="hl-op">:</span><span class="hl-op">:</span>make_spandata<span class="hl-op">&lt;</span>choreo<span class="hl-op">:</span><span class="hl-op">:</span>f16<span class="hl-op">&gt;</span><span class="hl-pu">(</span>M<span class="hl-pu">,</span> K<span class="hl-pu">)</span><span class="hl-pu">;</span>
<span class="hl-kw">auto</span> rhs_h <span class="hl-op">=</span> choreo<span class="hl-op">:</span><span class="hl-op">:</span>make_spandata<span class="hl-op">&lt;</span>choreo<span class="hl-op">:</span><span class="hl-op">:</span>f16<span class="hl-op">&gt;</span><span class="hl-pu">(</span>N<span class="hl-pu">,</span> K<span class="hl-pu">)</span><span class="hl-pu">;</span>
lhs_h.fill_random<span class="hl-pu">(</span><span class="hl-nu">0</span><span class="hl-pu">,</span> <span class="hl-nu">2</span><span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// Create device views (zero-copy span wrappers)</span>
<span class="hl-kw">auto</span> lhs_d <span class="hl-op">=</span> choreo<span class="hl-op">:</span><span class="hl-op">:</span>make_spanview<span class="hl-op">&lt;</span>choreo<span class="hl-op">:</span><span class="hl-op">:</span>f16<span class="hl-pu">,</span> <span class="hl-nu">2</span><span class="hl-op">&gt;</span><span class="hl-pu">(</span>a_d<span class="hl-pu">,</span> <span class="hl-pu">{</span>M<span class="hl-pu">,</span> K<span class="hl-pu">}</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
<span class="hl-kw">auto</span> rhs_d <span class="hl-op">=</span> choreo<span class="hl-op">:</span><span class="hl-op">:</span>make_spanview<span class="hl-op">&lt;</span>choreo<span class="hl-op">:</span><span class="hl-op">:</span>f16<span class="hl-pu">,</span> <span class="hl-nu">2</span><span class="hl-op">&gt;</span><span class="hl-pu">(</span>b_d<span class="hl-pu">,</span> <span class="hl-pu">{</span>N<span class="hl-pu">,</span> K<span class="hl-pu">}</span><span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// Call __co__ kernel like any C++ function</span>
matmul<span class="hl-pu">(</span>lhs_d<span class="hl-pu">,</span> rhs_d<span class="hl-pu">,</span> res_d<span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// Built-in profiling</span>
choreo<span class="hl-op">:</span><span class="hl-op">:</span>TimerOption topt<span class="hl-pu">{</span>.warmup <span class="hl-op">=</span> <span class="hl-nu">10</span><span class="hl-pu">,</span> .repeat <span class="hl-op">=</span> <span class="hl-nu">500</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
<span class="hl-kw">auto</span> avg_ms <span class="hl-op">=</span> choreo<span class="hl-op">:</span><span class="hl-op">:</span>timing<span class="hl-pu">(</span>
    <span class="hl-pu">[</span><span class="hl-op">&amp;</span><span class="hl-pu">]</span><span class="hl-pu">(</span><span class="hl-pu">)</span> <span class="hl-pu">{</span> matmul<span class="hl-pu">(</span>lhs_d<span class="hl-pu">,</span> rhs_d<span class="hl-pu">,</span> res_d<span class="hl-pu">)</span><span class="hl-pu">;</span> cudaDeviceSynchronize<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">;</span> <span class="hl-pu">}</span><span class="hl-pu">,</span>
    topt<span class="hl-pu">)</span><span class="hl-pu">;</span>
std<span class="hl-op">:</span><span class="hl-op">:</span>cout <span class="hl-op">&lt;&lt;</span> <span class="hl-sr">&quot;TFLOPS: &quot;</span> <span class="hl-op">&lt;&lt;</span> <span class="hl-pu">(</span><span class="hl-nu">2.0</span><span class="hl-op">*</span>M<span class="hl-op">*</span>N<span class="hl-op">*</span>K <span class="hl-op">/</span> <span class="hl-pu">(</span>avg_ms<span class="hl-op">/</span><span class="hl-nu">1e3</span><span class="hl-pu">)</span><span class="hl-pu">)</span> <span class="hl-op">/</span> <span class="hl-nu">1e12</span> <span class="hl-op">&lt;&lt;</span> <span class="hl-sr">&quot;\n&quot;</span><span class="hl-pu">;</span></code></pre></div>

> CrokTile compiles to CUDA/CuTe via `choreo -gs -t cute -arch=sm_90a`, producing standard `.cu` files that work with `nvcc` and CUTLASS.

---

<!-- _class: chapter -->

#### Chapter 2

## Compile-Time Code Safety

Best of all competitors: Triton / CuTe / Cutile / Helion

---

<!-- _class: split -->

## Tiling Mismatch Detection at Compile Time

**CrokTile — catches misconfigurations before GPU execution**

From real production kernels — these constraints are enforced by the compiler, not discovered after hours of debugging:

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-cm">// matmul_f16_dyn_sm90.co</span>
<span class="hl-kw">#if</span><span class="hl-sr"> MATMUL_SWIZ != (2 * MATMUL_TILE_K)</span>
<span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_SWIZ must equal 2 * MATMUL_TILE_K</span>
        <span class="hl-kw">for</span> <span class="hl-ty">f16</span> kernel<span class="hl-sr">&quot;</span>
<span class="hl-kw">#endif</span><span class="hl-sr"></span>

<span class="hl-kw">#if</span><span class="hl-sr"> MATMUL_SWIZ != 32 &amp;&amp; MATMUL_SWIZ != 64 \</span>
    <span class="hl-op">&amp;&amp;</span> MATMUL_SWIZ <span class="hl-op">!=</span> <span class="hl-nu">128</span>
<span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_SWIZ must be one of 32, 64, 128&quot;</span>
<span class="hl-kw">#endif</span><span class="hl-sr"></span>

<span class="hl-kw">#if</span><span class="hl-sr"> MATMUL_WARP_M != 64</span>
<span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_WARP_M must be 64 for f16</span>
        WGMMA constraints<span class="hl-sr">&quot;</span>
<span class="hl-kw">#endif</span><span class="hl-sr"></span>

<span class="hl-kw">#if</span><span class="hl-sr"> MATMUL_WARP_K != 16</span>
<span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_WARP_K must be 16 for f16</span>
        WGMMA constraints<span class="hl-sr">&quot;</span>
<span class="hl-kw">#endif</span><span class="hl-sr"></span></code></pre></div>

**In CUDA/CuTe — these are silent bugs**

Wrong tiling parameters in CUDA don't cause compile errors. They produce:

- Silent data corruption
- Intermittent wrong results
- GPU hangs with no diagnostic
- Performance cliffs with no explanation

> "The bug that takes 5 days to find in CUDA is a compile error in CrokTile."

---

## Runtime Checks — The Full Safety Net

CrokTile provides **two layers of protection**: compile-time tiling checks AND auto-generated runtime validation.

**Layer 1: Compile-Time** (covered previously)
<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_WARP_M must be 64 for f16 WGMMA constraints&quot;</span>
<span class="hl-kw">#error</span><span class="hl-sr"> &quot;MATMUL_SWIZ must equal 2 * MATMUL_TILE_K for f16 kernel&quot;</span></code></pre></div>

**Layer 2: Auto-Generated Runtime Checks** (from generated CuTe output)
<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code><span class="hl-cm">// Automatically generated shape consistency checks</span>
choreo<span class="hl-op">:</span><span class="hl-op">:</span>runtime_check<span class="hl-pu">(</span>lhs.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">1</span><span class="hl-pu">]</span> <span class="hl-op">==</span> rhs.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">1</span><span class="hl-pu">]</span><span class="hl-pu">,</span>
    <span class="hl-sr">&quot;The shapes of the 1st parameter (dim: 1) and the 2nd parameter (dim: 1) &quot;</span>
    <span class="hl-sr">&quot;are inconsistent.&quot;</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
choreo<span class="hl-op">:</span><span class="hl-op">:</span>runtime_check<span class="hl-pu">(</span>lhs.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">0</span><span class="hl-pu">]</span> <span class="hl-op">==</span> output.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">0</span><span class="hl-pu">]</span><span class="hl-pu">,</span>
    <span class="hl-sr">&quot;The shapes of the 1st parameter (dim: 0) and the 3rd parameter (dim: 0) &quot;</span>
    <span class="hl-sr">&quot;are inconsistent.&quot;</span><span class="hl-pu">)</span><span class="hl-pu">;</span>
choreo<span class="hl-op">:</span><span class="hl-op">:</span>runtime_check<span class="hl-pu">(</span>rhs.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">0</span><span class="hl-pu">]</span> <span class="hl-op">==</span> output.shape<span class="hl-pu">(</span><span class="hl-pu">)</span><span class="hl-pu">[</span><span class="hl-nu">1</span><span class="hl-pu">]</span><span class="hl-pu">,</span>
    <span class="hl-sr">&quot;The shapes of the 2nd parameter (dim: 0) and the 3rd parameter (dim: 1) &quot;</span>
    <span class="hl-sr">&quot;are inconsistent.&quot;</span><span class="hl-pu">)</span><span class="hl-pu">;</span></code></pre></div>

> No other GPU programming framework generates both layers automatically. In Triton or CUDA, shape mismatches produce silent wrong results.

---

<!-- _class: chapter -->

#### Chapter 3

## Dynamic / Symbolic Shape Support

First of its kind — best of all competitors

---

<!-- _class: split -->

## Dynamic vs Static Shapes

**Static shapes — fixed at compile time**

Dimensions are `#define` constants. Every new size requires recompilation. Shared memory is fixed.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-kw">#define</span><span class="hl-sr"> M 4096</span>
<span class="hl-kw">#define</span><span class="hl-sr"> N 2048</span>
<span class="hl-kw">#define</span><span class="hl-sr"> K 2048</span>

<span class="hl-kw">__co__</span> <span class="hl-kw">auto</span> matmul<span class="hl-pu">(</span>
    <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span>
    <span class="hl-ty">f16</span> <span class="hl-pu">[</span>N<span class="hl-pu">,</span> K<span class="hl-pu">]</span> rhs<span class="hl-pu">)</span> <span class="hl-pu">{</span>
  <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> N<span class="hl-pu">]</span> output<span class="hl-pu">{</span><span class="hl-nu">0.0f</span><span class="hl-pu">}</span><span class="hl-pu">;</span>
  <span class="hl-ty">int</span> TILE_M <span class="hl-op">=</span> <span class="hl-nu">32</span><span class="hl-pu">,</span> TILE_N <span class="hl-op">=</span> <span class="hl-nu">32</span><span class="hl-pu">;</span>
  <span class="hl-cm">// ...</span>
<span class="hl-pu">}</span></code></pre></div>

**Dynamic shapes — resolved at runtime**

Dimensions are **symbolic parameters**. One compilation serves all sizes. Shared memory adapts automatically.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-kw">__co__</span> <span class="hl-ty">void</span> matmul<span class="hl-pu">(</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> K<span class="hl-pu">]</span> lhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>N<span class="hl-pu">,</span> K<span class="hl-pu">]</span> rhs<span class="hl-pu">,</span>
    <span class="hl-st">global</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>M<span class="hl-pu">,</span> N<span class="hl-pu">]</span> output<span class="hl-pu">)</span> <span class="hl-pu">{</span>
  <span class="hl-cm">// M, N, K are runtime values</span>
  <span class="hl-kw">parallel</span> <span class="hl-pu">{</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">}</span>
    <span class="hl-kw">by</span> <span class="hl-pu">[</span><span class="hl-kw">cdiv</span><span class="hl-pu">(</span>M<span class="hl-pu">,</span> WARP_M<span class="hl-pu">)</span><span class="hl-pu">,</span> <span class="hl-kw">cdiv</span><span class="hl-pu">(</span>N<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span><span class="hl-pu">]</span>
    <span class="hl-op">:</span> <span class="hl-st">block</span> <span class="hl-pu">{</span>
    <span class="hl-st">shared</span> <span class="hl-ty">f16</span> <span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">]</span> lhs_s<span class="hl-pu">;</span>
    <span class="hl-cm">// shared memory size adapts to tiles</span>
    <span class="hl-cm">// ...</span>
  <span class="hl-pu">}</span>
<span class="hl-pu">}</span>
<span class="hl-cm">// Called with any M, N, K at runtime:</span>
<span class="hl-cm">// matmul(lhs_2048, rhs_2048, res_2048);</span>
<span class="hl-cm">// matmul(lhs_4096, rhs_8192, res_4096);</span></code></pre></div>

---

<!-- _class: codeblock -->

## Flexible Memory Access Primitives

CrokTile provides a rich set of **view and slicing operators** that work on both static and dynamic tensors — all bounds-checked and type-safe.

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.co</span><span class="editor-badge">CROKTILE</span></div><pre><code><span class="hl-cm">// chunkat — tile a tensor into fixed-size chunks, index by tile coordinate</span>
lhs_load_s <span class="hl-op">=</span> <span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span> lhs<span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> iv_k<span class="hl-pu">)</span> <span class="hl-op">=&gt;</span> <span class="hl-st">shared</span><span class="hl-pu">;</span>

<span class="hl-cm">// subspan — create a sub-view with explicit tile shape</span>
<span class="hl-fn">tma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span> output_s <span class="hl-op">=&gt;</span> output<span class="hl-pu">.</span><span class="hl-fn">subspan</span><span class="hl-pu">(</span>WARP_M<span class="hl-pu">,</span> WARP_N<span class="hl-pu">)</span><span class="hl-pu">.</span><span class="hl-fn">at</span><span class="hl-pu">(</span>block_m<span class="hl-pu">,</span> block_n<span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// view + from — dynamic window into a tensor (MoE expert segments)</span>
<span class="hl-fn">dma</span><span class="hl-pu">.</span><span class="hl-fn">copy</span><span class="hl-pu">.</span><span class="hl-fn">swiz</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span><span class="hl-pu">.</span><span class="hl-fn">zfill</span>
  lhs<span class="hl-pu">.</span><span class="hl-fn">view</span><span class="hl-pu">(</span>WARP_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">)</span><span class="hl-pu">.</span><span class="hl-fn">from</span><span class="hl-pu">(</span>seg_start <span class="hl-op">+</span> iv_m <span class="hl-op">*</span> WARP_M<span class="hl-pu">,</span> iv_k <span class="hl-op">*</span> TILE_K<span class="hl-pu">)</span>
    <span class="hl-op">=&gt;</span> sA<span class="hl-pu">.</span><span class="hl-fn">subspan</span><span class="hl-pu">(</span>TILE_M<span class="hl-pu">,</span> TILE_K<span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// span_as — reshape without copy (BMM: collapse batch dim)</span>
ma <span class="hl-op">=</span> <span class="hl-fn">mma</span><span class="hl-pu">.</span><span class="hl-fn">load</span><span class="hl-pu">.</span><span class="hl-fn">swizzle</span><span class="hl-op">&lt;</span><span class="hl-nu">128</span><span class="hl-op">&gt;</span>
  lhs_load_s<span class="hl-pu">.</span><span class="hl-fn">span_as</span><span class="hl-pu">(</span><span class="hl-pu">[</span>WARP_M<span class="hl-pu">,</span> TILE_SIZE_K<span class="hl-pu">]</span><span class="hl-pu">)</span><span class="hl-pu">.</span><span class="hl-fn">chunkat</span><span class="hl-pu">(</span>_<span class="hl-pu">,</span> iv_warp<span class="hl-pu">)</span><span class="hl-pu">;</span>

<span class="hl-cm">// at — scalar element access</span>
output<span class="hl-pu">.</span><span class="hl-fn">at</span><span class="hl-pu">(</span>block_b<span class="hl-pu">,</span> block_m # m<span class="hl-pu">,</span> block_n # <span class="hl-pu">(</span>n # ni<span class="hl-pu">)</span><span class="hl-pu">)</span> <span class="hl-op">+</span><span class="hl-op">=</span> result<span class="hl-pu">;</span>

<span class="hl-cm">// # operator — hierarchical index composition (block + warp + thread)</span>
block_m # iv_warp_m # iv_thr_m # thr_m   <span class="hl-cm">// composes to a global index</span></code></pre></div>

> In CUDA, each of these requires manual pointer arithmetic with error-prone offset calculations.

---

<!-- _class: chapter -->

#### Chapter 4

## Born for Agentic AI Programming

Superior context engineering + superior harness engineering

---

## Superior Context Engineering — Real Results

**1 AI agent + 1 CrokTile request = autonomous performance tuning**

The Choreo project used AI agents to autonomously optimize GPU kernels over multiple sessions, achieving results that surpass SOTA operator libraries.

| Kernel | Iterations | Baseline | Best | vs Baseline | vs cuBLAS |
|--------|-----------|----------|------|-------------|-----------|
| Dense GEMM FP16 | 65 | 208.7 TFLOPS | 382.5 TFLOPS | **+83%** | **100.5%** |
| Sparse GEMM FP16 | 153 | 368 TFLOPS | 655 TFLOPS | **+78%** | — |
| Blockscale GEMM FP8 | 71 | 397.9 TFLOPS | 621 TFLOPS | **+56%** | — |

**Why CrokTile enables this:**
- **25-line kernels** fit entirely in an AI agent's context window (~500 tokens)
- Clean syntax is parsable — AI agents **understand** the code, not just copy it
- Tileflow structure guides the agent to make **valid** optimizations
- Each iteration is a small, safe change within the compile-time safety net

> The same optimization task in CUDA would require 180+ lines per kernel, 3000+ tokens of context, and manual debugging of silent bugs.

---

## Superior Harness Engineering — Compiler as AI Guardrail

CrokTile's compiler messages are **tailored for AI understanding** — guiding program repair and performance tuning with minimal random guessing.

**Compile-time messages tell the AI agent exactly what to fix:**

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code>error<span class="hl-op">:</span> <span class="hl-sr">&quot;MATMUL_WARP_M must be 64 for f16 WGMMA constraints&quot;</span>
error<span class="hl-op">:</span> <span class="hl-sr">&quot;MATMUL_SWIZ must equal 2 * MATMUL_TILE_K for f16 kernel&quot;</span>
error<span class="hl-op">:</span> <span class="hl-sr">&quot;MATMUL_WARP_K must be 32 for f8 WGMMA constraints&quot;</span></code></pre></div>

**Runtime checks validate shapes with actionable diagnostics:**

<div class="editor"><div class="editor-header"><div class="editor-dots"><span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span></div><span class="editor-filename">kernel.cu</span></div><pre><code>runtime_check failed<span class="hl-op">:</span> <span class="hl-sr">&quot;The shapes of the 1st parameter (dim: 1)</span>
  and the <span class="hl-nu">2</span>nd parameter <span class="hl-pu">(</span>dim<span class="hl-op">:</span> <span class="hl-nu">1</span><span class="hl-pu">)</span> are inconsistent.<span class="hl-sr">&quot;</span></code></pre></div>

**Result: 200+ iterations without a single silent failure**

| Metric | CrokTile | CUDA |
|--------|----------|------|
| Invalid kernel → compile error | **Yes** | No (silent bug) |
| Shape mismatch → runtime error | **Auto-generated** | Manual or absent |
| AI agent iterations without crash | **200+** | Frequent hangs |
| Context cost per debug cycle | **~0 tokens** (compiler tells why) | **~3000+ tokens** (need full trace) |
| AI learning curve | **Hours** (structured syntax) | **Days** (tribal knowledge) |

> The compiler is the harness — it reduces AI randomness by making invalid programs **impossible to compile**.

---

<!-- _class: lead -->

# CrokTile

### Fewer Lines. Safer Kernels. AI-Ready.

**40%** of equivalent CUDA code
**83%** faster than baseline (AI-tuned)
**200+** autonomous AI iterations without failure
**100.5%** cuBLAS performance on dense GEMM

![width:120](../../assets/images/logo-square.svg)

github.com/croktile
