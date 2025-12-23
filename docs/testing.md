# Testing Best Practices

## Philosophy

Focus on **user-facing behavior**, not implementation details. Follow the React Testing Library principle: "The more your tests resemble the way your software is used, the more confidence they can give you."

## What to Test

**DO test:**

- User-facing behavior (modal shows/hides, form submits, error messages display)
- Outcomes and side effects (data persists across remounts)
- Error handling behavior (graceful degradation)
- Edge cases and boundaries

**DO NOT test:**

- Logger calls (`expect(mockLogger.warn).toHaveBeenCalled()`)
- Storage mechanism calls (`expect(mockStorage.set).toHaveBeenCalledWith(...)`)
- Internal state changes
- Configuration values/constants
- Mock function call counts (except user-provided callbacks)

## Testing Zod Schemas

Understand the difference between `.optional()` and `.nullable()`:

- **`.optional()`** - Field can be **omitted** (undefined). Use for optional form fields.
- **`.nullable()`** - Field must be **present** but can be `null`.

In FormData, omitted fields become `undefined`, not `null`. Always use `.optional()` for optional form fields.

## Required Tests for Optional Enum Fields

When testing `z.enum(["A", "B"]).optional()`, always include:

1. **Valid enum value** - Test with each valid enum value
2. **Omitted field** - Field completely absent from FormData
3. **Empty string** - Test with `""` (common for unselected radio buttons)
4. **Invalid value** - Value not in enum (verify rejection)

```typescript
// Good - tests realistic FormData behavior
it("accepts form when field is omitted", async () => {
  const form = new URLSearchParams({
    email: "test@example.com",
    // subscriptionType intentionally omitted
  });
  // ... test expects success
});
```

## Schema Unit Tests

For complex schemas, create dedicated test files (e.g., `action-name-schema.test.ts`):

- Test Zod schema directly with `.safeParse()`
- Document expected edge case behavior
- Catch schema issues before integration tests

## Refactoring Example

```typescript
// BAD - Testing implementation
it("should store dismissal in localStorage", () => {
  result.current.dismiss();
  expect(mockStorage.set).toHaveBeenCalledWith(expect.any(Number));
});

// GOOD - Testing behavior
it("should persist dismissal across remounts", () => {
  const { result, unmount } = renderHook(() => useFeature());
  result.current.dismiss();
  unmount();

  const { result: newResult } = renderHook(() => useFeature());
  expect(newResult.current.isShown).toBe(false);
});
```

## Self-Check Questions

Before submitting tests, ask:

1. "If I refactor the implementation, would this test still be valid?"
2. "Does this test verify something a user would notice?"
3. "Am I testing the 'what' (behavior) or the 'how' (implementation)?"
