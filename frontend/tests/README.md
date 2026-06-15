# Frontend Tests

Run frontend tests with Vitest:

```bash
cd frontend
npm install
npm run test
```

## Test Files

- **services/__tests__/resumeApi.test.ts** — API layer with error handling
- **modules/__tests__/applyPatch.test.ts** — Patch application to resume model
- **modules/__tests__/resumeToText.test.ts** — Resume serialization
- **hooks/__tests__/useTheme.test.ts** — Theme management hook
- **components/__tests__/ui.test.tsx** — UI components (Button, Card, Badge, Chip, CircularScore, ProgressBar)

## Coverage

```bash
npm run test:coverage
```

Each test file targets 100% coverage of its corresponding module.

## Test UI

View tests interactively:

```bash
npm run test:ui
```
