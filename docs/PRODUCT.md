# Product

## Platform

web

## Users

Two groups, both primary.

**Operations / administrators** keep the system healthy. They:

- get live overview from the dashboard: unhealthy endpoints and failed messages;
- handle failed messages: inspect them, retry them, delete them;
- check platform health: installed components, versions, available upgrades, and a snapshot to export for support cases.

**Developers** understand and fix behaviour. They:

- follow message flow and sequence diagrams, and see how sagas change state;
- read message details: headers, metadata, stack traces;
- use monitoring metrics per endpoint, instance and message type;
- write custom .NET checks that alert when a business condition fails.

In production environments, people mostly open ServicePulse when something breaks. During system development it's used to understand/debug the behavior.

## Product Purpose

ServicePulse provides live production monitoring for distributed applications built on NServiceBus. It monitors the health of a system's endpoints, detects processing errors, sends failed messages for reprocessing, and shows the platform's own health in one place.

In production, the success means a user goes from "something is wrong" to "I know the cause and have handled it" in as few steps as possible.

During development, the success means understanding the behavior of the system, what happened, where and why.

## Positioning

ServicePulse is part of the Particular Service Platform, alongside NServiceBus and ServiceControl. It presents data from ServiceControl (error and audit) and ServiceControl Monitoring instances, so it speaks the platform's own concepts directly: endpoints and their instances, heartbeats, failed messages and their groups, retries and retry redirects, sagas, conversations and custom checks.

ServicePulse and ServiceControl are parts of every platform deployment required to measure throughput and number of endpoints, needed for licensing purposes.

## Operating Context

- Two usage contexts: production deployments, where people react to failures and degraded health, and development environments, where developers run the system they are building to see and debug how it behaves.
- Self-hosted next to the user's ServiceControl and Monitoring instances; hosting options are described in `docs/hosting-options.md`.
- Platform topology: a primary ServiceControl instance, zero or more remote Audit instances, Monitoring when configured, and ServicePulse itself (`docs/platform-topology.md`).
- Can run with OIDC authentication; some actions are gated by user permissions (`PermissionGate`, `useAllowedRoutes`).
- Most views are lists that refresh automatically.

## Capabilities and Constraints

- Areas (from `src/Frontend/src/router/config.ts`): Dashboard, Platform health, Heartbeats, All Messages, Failed Messages (groups, all, deleted, pending retries, message details), Monitoring (endpoints and endpoint details), Custom checks, Events, Usage (throughput and license details), and Configuration (license, MassTransit connector, health check notifications, retry redirects, and more).
- Frontend: Vue 3 + TypeScript + Vite, Pinia, vue-router, Bootstrap 5, Font Awesome, CodeMirror, Vue Flow with dagre for diagrams. Code lives in `src/Frontend`.
- Desktop is the main target; every task must remain usable on tablets and phones.

## Brand Commitments

- Name: ServicePulse, part of the Particular Service Platform.
- Logo: `src/Frontend/src/assets/logo.svg`.
- Domain icons for message, saga and endpoint states live in `src/Frontend/src/assets/`.

## Evidence on Hand

- Working codebase with component tests (`src/Frontend/src/**/*.spec.ts`) and application tests (`src/Frontend/test/specs`).
- A mock server (`src/Frontend/test/mock-server.ts`); `npm run dev:mocks` runs the UI without a backend.
- Frontend design notes for specific pages in `docs/frontend/`.
- No user research, usage analytics or customer quotes are in the repository; do not invent them.

## Product Principles

- Problems first in production: what is broken and needs action outranks what is healthy.
- Shortest path from symptom to cause to fix: inspect, retry or delete without hunting across pages.
- Make behaviour explainable during development: show what happened, where and why, following a message through its flow, conversation and saga state.
- Speak the platform's language: use NServiceBus and ServiceControl terms as users know them.

## Accessibility & Inclusion

WCAG 2.2 AA is required.
