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

- Work on **tensors**, not raw buffers
- **40% less code** than equivalent CUDA
- **Zero-cost abstractions** — higher level than Triton
- Full **C++ integration** with CUTLASS/CuTe

---

## Easy to Use — Best in Class

<!-- _class: comparison -->

| Feature | CrokTile | Triton | CuTe | CUDA |
|---------|----------|--------|------|------|
| Lines of code | **1x** | 1.5x | 2x | 2.5x |
| Abstraction level | **Tensor** | Block | Layout | Buffer |
| HW knowledge needed | **Minimal** | Some | Heavy | Expert |
| C++ interop | **Native** | No | Native | Native |

---

## High-Level Abstractions

### Avoid the complexity of hardware programming

- No manual **TMA/DMA** management
- No explicit **tensor-core** programming
- Parallel programs made **simple**
- Best practices enforced by the **tileflow paradigm**

```python
@croktile.kernel
def matmul(A: Tensor[M, K], B: Tensor[K, N]) -> Tensor[M, N]:
    return A.tile(128, 64) @ B.tile(64, 128)
```

---

## Compile-Time Safety — Best in Class

### Catch bugs before they crash your GPU

- **Tiling mismatch detection** at compile time
- Avoids hard-to-debug issues in low-level kernel programming
- Aggressive **runtime checks** available for development
- Clear, actionable error messages

> No more silent data corruption from shape mismatches.

---

## Dynamic Shape Support — First of Its Kind

### The first system with dynamic shared memory in low-level CUDA kernels

- **Dynamic scratchpad memory** — no fixed-size limitations
- **Symbolic shapes** — compile once, run with any size
- Both **static and runtime** memory allocation supported
- Enables truly flexible kernel designs

---

## Born for Agentic AI Programming

<!-- _class: split -->

**Superior Context Engineering**
- High abstraction saves context tokens
- Simple syntax — easy for AI to parse
- Less code = less to understand

**Superior Harness Engineering**
- Compile-time checks prevent runtime bugs
- Compiler messages tailored for **AI understanding**
- AI learns CrokTile programming fast

---

<!-- _class: lead -->

# Get Started with CrokTile

**Fewer lines. Safer kernels. AI-ready.**

github.com/croktile
