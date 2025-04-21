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

## Status

This project is currently under active development. Contributions are welcome!

## License

MIT
