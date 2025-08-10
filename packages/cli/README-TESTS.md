# Testing Guide

## Test Structure

We use **Vitest** for fast, modern testing with minimal setup overhead.

### Test Categories

1. **Unit Tests** (`src/utils/__tests__/`)
   - `validators.test.ts` - Tests module and adapter validation logic
   - `config.test.ts` - Tests environment variable handling with nullish coalescing

2. **Adapter Tests** (`src/adapters/__tests__/`)
   - `factory.test.ts` - Tests adapter factory pattern
   - `neon.test.ts` - Tests Neon adapter with mocked API calls

3. **Command Tests** (`src/commands/__tests__/`)
   - `init.test.ts` - Tests module parsing and validation logic

4. **Integration Tests** (`src/__tests__/`)
   - `cli-integration.test.ts` - Tests actual CLI execution and error handling

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Watch mode (development)
pnpm test:watch
```

## Test Coverage

**✅ Covered:**
- Input validation (adapters, modules)
- Environment variable handling
- Adapter factory pattern
- Neon adapter validation and API mocking
- CLI argument parsing
- Error handling flows

**⏳ Not Covered (acceptable for now):**
- Migration implementation (stubbed)
- Interactive prompts (complex to test)
- Network operations (mocked)

## Writing New Tests

When adding new features, create tests for:

1. **Input validation** - Any new CLI flags or options
2. **Business logic** - Core functionality separate from I/O
3. **Error scenarios** - How failures are handled
4. **Adapter contracts** - New adapter implementations

Keep tests simple and focused on behavior, not implementation details.