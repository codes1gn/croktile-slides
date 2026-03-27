# Slide Examples

## Example 1: CrokTile Tech Talk (Dark Theme)

```markdown
---
marp: true
theme: croktile-dark
paginate: true
---

<!-- _class: lead -->

# CrokTile: GPU Programming Made Simple

### High-Level Abstractions for CUDA Kernels

**Albert** | March 2026

![width:120](../../assets/images/logo-square.svg)

---

## The Problem with GPU Programming

- CUDA kernel programming requires deep hardware knowledge
- TMA/DMA, tensor cores, memory coalescing — steep learning curve
- Debugging tiling mismatches is painful and time-consuming
- Existing tools (Triton, CUTE) still expose too much complexity

---

## CrokTile's Approach

### Zero-cost, high-level abstractions

- **Work on tensors**, not raw buffers
- **40% less code** than equivalent CUDA
- **Compile-time safety** catches tiling mismatches early
- **C++ integration** — works with CUTLASS/CuTe libraries

---

<!-- _class: split -->

## Before vs After

**CUDA (manual)**
```cuda
__global__ void matmul(
  float* A, float* B, float* C,
  int M, int N, int K) {
  // 50+ lines of tiling,
  // shared memory, sync...
}
```

**CrokTile**
```python
@croktile.kernel
def matmul(A: Tensor, B: Tensor):
    tile_a = A.tile(128, 64)
    tile_b = B.tile(64, 128)
    return tile_a @ tile_b
```

---

## Compile-Time Safety

| Check | CUDA | Triton | CrokTile |
|-------|------|--------|----------|
| Tiling mismatch | Runtime crash | Partial | Compile-time |
| Shape validation | None | Limited | Full |
| Memory bounds | None | None | Compile-time |

---

<!-- _class: lead -->

# Thank You

**github.com/croktile**
```

## Example 2: Chinese Weekly Report

```markdown
---
marp: true
theme: croktile-cn
paginate: true
---

<!-- _class: lead -->

# CrokTile 周报

### 编译器团队

**2026年3月17日 — 3月21日**

---

## 本周进展

- 完成了动态 Shape 支持的原型实现
- 修复了 3 个 tiling 相关的编译器 bug
- 新增了 Flash Attention kernel 的示例

---

## 下周计划

1. 性能基准测试 (vs Triton, CUTE)
2. 文档更新: 动态 Shape API
3. 开始 AI agent 集成的设计
```
