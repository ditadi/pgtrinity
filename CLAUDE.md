# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PGTrinity is a unified library that provides cache, realtime, and queue functionality using only PostgreSQL. The project uses a monorepo structure with pnpm workspaces.

## Development Commands

### Essential Commands
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode for CLI
cd packages/cli && pnpm dev

# Format and lint code (using Biome)
pnpm format
pnpm lint

# Create a changeset for version management
pnpm changeset

# Run tests (when implemented)
pnpm test
```

### CLI Development
```bash
# Build CLI package
cd packages/cli && pnpm build

# Watch mode for CLI development
cd packages/cli && pnpm dev

# Type checking
cd packages/cli && pnpm lint
```

## Architecture

### Package Structure
- `/packages/cli` - Command-line interface for PGTrinity configuration
- `/examples` - Example implementations (placeholder)
- `/website` - VitePress documentation site

### CLI Architecture Pattern

The CLI uses a command pattern with factory-based adapter system:

1. **Command Pattern**: All commands extend `BaseCommand` abstract class in `packages/cli/src/commands/base.ts`
   - Provides spinner management, validation, and error handling
   - Commands register themselves statically with Commander.js

2. **Adapter Factory Pattern**: Database adapters use factory pattern in `packages/cli/src/adapters/`
   - `BaseAdapter` abstract class defines the interface
   - `createAdapter()` factory function instantiates specific adapters
   - Currently supports: Neon (PostgreSQL)

3. **Module System**: Three core modules (not yet implemented)
   - Cache: Temporary data storage
   - Realtime: WebSocket via PostgreSQL LISTEN/NOTIFY
   - Queue: Background job processing

### Key Files for Understanding Architecture

- `packages/cli/src/cli.ts` - Main CLI entry point
- `packages/cli/src/commands/base.ts` - Command abstraction
- `packages/cli/src/adapters/base.ts` - Adapter interface
- `packages/cli/src/adapters/index.ts` - Adapter factory implementation
- `packages/cli/src/adapters/neon/neonAdapter.ts` - Example adapter implementation

## Adding New Features

### Adding a New CLI Command
1. Create new command class extending `BaseCommand` in `packages/cli/src/commands/`
2. Implement required abstract methods
3. Register command in `packages/cli/src/cli.ts`

### Adding a New Database Adapter
1. Create adapter directory in `packages/cli/src/adapters/`
2. Extend `BaseAdapter` class
3. Implement all abstract methods
4. Add case to factory in `packages/cli/src/adapters/index.ts`
5. Update types in `packages/cli/src/adapters/types.ts`

## Code Style and Conventions

- **TypeScript**: Strict mode enabled, use explicit types
- **Formatting**: Biome handles all formatting (no Prettier/ESLint)
- **Imports**: Use relative imports within packages
- **Error Handling**: Use colored console output via utils/log.ts
- **Async Operations**: Always use async/await, handle errors properly
- **Git Commits**: Follow conventional commits (enforced by commitlint)

## Environment Variables

For Neon adapter:
- `NEON_API_KEY`: Required for Neon API access
- `NEON_PROJECT_ID`: Required for Neon project operations

## Current Implementation Status

- ✅ CLI infrastructure with command pattern
- ✅ Adapter factory pattern with Neon support
- ✅ Development tooling (Biome, changesets, husky)
- ⏳ Core library modules (cache, realtime, queue) - not implemented
- ⏳ Testing infrastructure - not set up
- ⏳ Migration system - stubbed but not functional