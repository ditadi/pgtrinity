# PGTrinity

A library that unifies cache, real-time communication, and task queues using only PostgreSQL.

## Overview

PGTrinity simplifies application building by offering an integrated solution for three fundamental pillars:

- **Cache**: Efficient temporary data storage to reduce latency and server load
- **Realtime**: WebSocket support for instant updates between client and server
- **Queue**: Asynchronous background job processing for time-consuming operations

Unlike traditional approaches that rely on external services like Redis, RabbitMQ, or dedicated WebSocket servers, PGTrinity exclusively uses PostgreSQL as the foundation for all its functionality.

## Why PostgreSQL?

- **Single Infrastructure**: Manage one database instead of multiple services
- **Cost-Effectiveness**: Disk storage is significantly cheaper than RAM-based solutions
- **Simplicity**: No need to learn and maintain multiple technologies
- **Built-in Features**: Leverages PostgreSQL's LISTEN/NOTIFY, JSONB, and more

## Modules

### PGTrinity Cache

Store frequently accessed data with configurable TTL, reducing database load and API calls.

### PGTrinity Realtime

Enable real-time communication using WebSockets, with the database as an intermediary for message delivery.

### PGTrinity Queue

Process background tasks with support for concurrency, scheduling, and retries.

## Neon Integration

While PGTrinity works with any PostgreSQL installation, it offers special integration with Neon to create leverage:

- **Branching**: Create dedicated branches for PGTrinity operations, allowing isolation and dedicated configurations
- **Autoscaling**: Automatically adjust compute resources based on demand
- **Serverless**: Scale to zero when not in use to reduce costs
- **Edge Optimized**: Low-latency performance with serverless drivers

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/ditadi/pgtrinity.git
cd pgtrinity

# Install dependencies
pnpm install

# Build the CLI
pnpm build
```

### Configuration

1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Add your Neon credentials to `.env`:
```
NEON_API_KEY=your_api_key_here
NEON_PROJECT_ID=your_project_id_here
```

You can get these values from [Neon Console](https://console.neon.tech).

### Initialize PGTrinity

Run the CLI to set up your database:

```bash
node packages/cli/dist/cli.js init --adapter neon
```

Options:
- `--adapter <adapter>`: Database adapter to use (currently only "neon")
- `--branch-name <name>`: Custom branch name (default: "pgtrinity")
- `--force`: Recreate branch if it already exists
- `--modules <modules>`: Modules to initialize (default: "cache,realtime,queue")

The command will:
1. Create a dedicated branch in your Neon project
2. Generate a connection string
3. Display the connection string to add to your `.env` file

## Development

```bash
# Run CLI in development mode
cd packages/cli && pnpm dev

# Run linting and formatting
pnpm lint
pnpm format

# Type checking
cd packages/cli && pnpm lint
```

## Status

This project is currently under active development. The CLI infrastructure and Neon adapter are functional, but the core library modules (cache, realtime, queue) are not yet implemented. Contributions are welcome!

## License

MIT
