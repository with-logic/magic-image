# Code Quality Standards

## TypeScript

**Optional chaining**: Prefer `foo?.bar` over `foo && foo.bar`

**Avoid `any`**: Use `unknown` for truly unknown types, then narrow with type guards.

**Discriminated unions**: Use a literal `type` field for exhaustive pattern matching:

```typescript
type Result<T> =
  | { type: "success"; data: T }
  | { type: "error"; error: string };

function handle<T>(result: Result<T>) {
  if (result.type === "success") {
    return result.data; // TypeScript knows this is T
  }
  return result.error; // TypeScript knows this is string
}
```

**Type guards with predicates**: Use `value is Type` for reusable type narrowing:

```typescript
function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Usage
if (isNonNullObject(data)) {
  console.log(data.someProperty); // Safe access
}
```

**Generics**: Use descriptive type parameters for complex hooks:

```typescript
// T = item type, I = input type, R = response type
function useOptimisticList<T, I, R>(params: Params<T, I, R>): Return<T>;
```

**`as const`**: Use for type-safe string literals:

```typescript
const ERROR_REASONS = {
  LLM_GENERATED_ERROR: "LLM_GENERATED_ERROR",
  LLM_EXECUTION_ERROR: "LLM_EXECUTION_ERROR",
} as const;

type ErrorReason = (typeof ERROR_REASONS)[keyof typeof ERROR_REASONS];
```

**Named constants**: Extract magic numbers with TSDoc:

```typescript
/**
 * Delay in milliseconds before detecting user interaction.
 * Prevents false positives during initial setup.
 */
const INTERACTION_DETECTION_DELAY = 100;
```

## Hook Design

**Group related return values**:

```typescript
return {
  randomInputOperations: {
    data,
    fetch,
    isLoading,
    stop,
  },
  formControls: {
    clear,
    reset,
    triggers,
  },
};
```

**Stable callback references**: Use refs to keep callbacks stable while staying current:

```typescript
const stableOnTick = useRef(onTick);
useEffect(() => {
  stableOnTick.current = onTick;
}, [onTick]);

// Use stableOnTick.current in intervals/timeouts
```

**Hook composition**: Compose smaller hooks into larger ones. Keep each hook focused on a single responsibility:

```typescript
function useArtifactProcessing(versionId: string | undefined) {
  const lastSuccessfulDataRef = useRef<ProcessingState | null>(null);
  const polling = useFetchPolling<ProcessingState>(url, config);
  const processingState = useMemo(() => { ... }, [polling]);
  return processingState;
}
```

## Memoization

**When to use `useMemo`/`useCallback`**:

- Expensive calculations (complex filtering, sorting, transformations)
- Passing callbacks to memoized children that would otherwise cause re-renders
- Values used in other hooks' dependency arrays

**When NOT to use**:

- Simple calculations or primitive values
- "Just to be safe" - memoization has its own cost
- Functions that don't cause re-render issues

```typescript
// Good - expensive list computation
const merged = useMemo(() => {
  const optimisticKeys = new Set(optimistic.map((i) => getKey(i)));
  return optimistic.concat(
    server.filter((i) => !optimisticKeys.has(getKey(i))),
  );
}, [server, optimistic, getKey]);

// Unnecessary - simple value
const doubled = useMemo(() => count * 2, [count]); // Just use: count * 2
```

## Accessibility

Add ARIA labels for interactive elements:

```tsx
<button
  aria-label={isLoading ? "Loading data" : "Load data"}
  aria-busy={isLoading}
>
```

## UI/UX

- Use thematically appropriate icons (dice for randomness, not shuffle)
- Animation timing: 300ms for deliberate effects, 150ms for micro-interactions
- Always show loading states during async operations

## Error Handling

- Log errors for debugging (even when failing silently for UX)
- Use refs or request IDs to handle race conditions
- Add max depth limits to recursive functions

**Normalized error parsing**: Handle all error shapes consistently:

```typescript
interface ParsedError {
  message: string;
  details: string[];
  rawError: unknown;
}

function parseError(error: unknown): ParsedError {
  // Handle null, undefined, strings, Error objects, API responses
}
```

**Type-safe error checking**: Use type guards for error discrimination:

```typescript
function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === "object" && "response" in error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    return status === 404 || status === 403 || status === 410;
  }
  return false;
}
```

## Code Organization

**Barrel files**: Use `index.ts` to provide clean public APIs:

```typescript
// app/hooks/useDocumentAutosave/index.ts
export * from "./useDocumentAutosave";
export * from "./types";
```

**Type organization**:

- Centralize shared types in `/app/types/`
- Co-locate component-specific types with their components
- Use interface extension for composable prop types:

```typescript
interface FormActionHandlers extends RandomInputHandlers, FormClearHandlers {
  isSubmitting?: boolean;
}
```

## Documentation

Prefer TSDoc comments that show up in IDE tooltips:

```typescript
/**
 * Fetches user data from the API.
 * @param userId - The unique identifier for the user
 * @returns The user object or undefined if not found
 */
function getUser(userId: string): Promise<User | undefined> {
```

## Avoid

- Over-engineering (only make requested changes)
- Adding features beyond what was asked
- Docstrings/comments for unchanged code
- Backwards-compatibility hacks (just delete unused code)
- Error handling for impossible scenarios
