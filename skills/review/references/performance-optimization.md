# Performance Optimization Reference

Use this reference during review when performance requirements exist, users or monitoring report slowness, Core Web Vitals or load times matter, a change touches hot paths or large data sets, or a diff claims to improve performance.

## Core Rule

Measure before optimizing. Performance work without measurement is guessing. Approve simple fixes for obvious anti-patterns, but push back on added complexity that lacks before/after evidence.

Use this workflow:

1. **Measure** a baseline with representative data.
2. **Identify** the actual bottleneck, not an assumed one.
3. **Fix** the specific bottleneck with the smallest maintainable change.
4. **Verify** with after measurements.
5. **Guard** with monitoring, budgets, tests, or regression checks when the risk is recurring.

## Targets and Budgets

Use project-specific budgets when available. If none exist, use these as review prompts, not universal blockers:

- LCP should generally be at or below 2.5s.
- INP should generally be at or below 200ms.
- CLS should generally be at or below 0.1.
- Initial JavaScript should have an explicit budget and should not grow unnoticed.
- API p95 latency should have an SLA or at least a measured before/after comparison for hot endpoints.
- Large images, fonts, and payloads should have size limits appropriate to the user/device context.

## Where to Measure First

Use the symptom to choose the right evidence:

| Symptom | Inspect First | Common Causes |
|---|---|---|
| Slow first page load | Network waterfall, TTFB, bundle report, LCP attribution | large bundles, slow server, render-blocking resources, unoptimized images |
| Interaction lag | Performance trace, long tasks, render profiler | heavy JavaScript, expensive rerenders, layout thrashing, large DOM updates |
| Slow navigation | API timings, data waterfall, client render cost | sequential fetches, N+1 requests, missing prefetch/cache |
| Slow API endpoint | DB query log, traces, indexes, external calls | N+1 queries, missing indexes, connection pool issues, serialized I/O |
| Memory growth | heap snapshots, cache sizes, object retention | unbounded caches, retained closures, large payload accumulation |
| Intermittent latency | traces, lock/queue metrics, external dependency timing | contention, retries, GC pauses, rate limits, cold starts |

## Common Review Findings

### Backend and Data

Flag:

- N+1 database queries or per-row service calls.
- Missing pagination, limits, cursors, or streaming for large collections.
- Queries on hot paths without appropriate indexes or selectivity.
- Unbounded fan-out, queue processing, stream handling, retries, or concurrency.
- External API calls serialized when they are independent and latency-sensitive.
- Caches without size bounds, invalidation, tenant separation, or stale-data semantics.
- Synchronous CPU, filesystem, crypto, compression, or network work in request hot paths.

Prefer:

- Joins/includes/batching for related data.
- Pagination and explicit limits at API boundaries.
- Timeouts, cancellation, backpressure, and bounded retries.
- Measured caching with clear invalidation rules.
- Parallel orchestration when independence is clear and failure behavior stays understandable.

### Frontend and Rendering

Flag:

- Large initial bundle growth without analysis.
- Heavy dependencies added to initial routes when dynamic import or existing utilities would suffice.
- Images missing dimensions, responsive sources, compression, or lazy loading where appropriate.
- LCP assets loaded late or without priority where that route depends on them.
- Unstable object/function props causing expensive rerenders in hot components.
- Expensive computation on every render without memoization or precomputation.
- Layout thrashing from repeated read/write DOM cycles.
- Large DOM updates or animations that cause long main-thread tasks.

Prefer:

- Route-level or feature-level code splitting for rare heavy UI.
- Stable references only where they avoid real rerender cost.
- Responsive images and explicit dimensions.
- Profiling before widespread `memo`/`useMemo` use; blanket memoization can add complexity without benefit.

### Operability

Flag:

- Missing metrics for a newly critical path.
- Logging that is too noisy for a hot path or too sparse for incident diagnosis.
- Fail-open behavior that hides data loss or inconsistent state.
- Retry loops without caps, jitter, idempotency, or observability.
- Background jobs that can partially apply state without a recovery story.

Prefer:

- Clear metrics around latency, throughput, queue depth, error rate, retries, and cache hit rate.
- Idempotent operations and atomic state transitions.
- Stable error codes and structured logs for high-risk flows.

## Performance Finding Quality

For each performance finding:

- State whether the issue is measured or structurally obvious.
- Explain the scale trigger, such as rows in a list, tenants, requests per minute, image size, bundle path, or queue depth.
- Name the bottleneck category: network, database, CPU, memory, main thread, rendering, concurrency, or external dependency.
- Prefer concrete evidence: "one query per task" or "this fetches all rows" over "could be slow."
- Recommend the smallest maintainable fix and any needed guardrail.

## Red Flags

- Optimization claims without baseline and after numbers.
- Added complexity justified by performance without a specific bottleneck.
- Micro-optimizations while obvious N+1, unbounded fetch, or bundle bloat remains.
- Performance-sensitive changes without representative data sizes.
- Caches added without invalidation or memory bounds.
- Parallelization that ignores rate limits, backpressure, or failure semantics.
- `memo`/`useMemo` scattered everywhere instead of targeted based on profiling.

## Verification Checklist

Ask for or check:

- [ ] Baseline and after measurements exist when performance motivated the change.
- [ ] The specific bottleneck is identified.
- [ ] The fix addresses that bottleneck without unnecessary complexity.
- [ ] Data sizes, device/network conditions, and traffic assumptions are representative.
- [ ] Bundle size, Core Web Vitals, or API p95 did not regress where relevant.
- [ ] New data fetching has limits/pagination and avoids N+1 patterns.
- [ ] Queues, streams, retries, and fan-out have bounds and observability.
- [ ] Existing behavior tests still pass; optimization did not change semantics accidentally.
