# Open Issues

Two high-impact issues ready for experienced contributors. Neither is cosmetic — both are silent failures that block v1.0.

---

## Issue 1 — Retirement flow does not sign or submit a Stellar transaction before creating the retirement record

**Labels:** `type: bug` `type: feat` `area: retirement` `area: wallet` `difficulty: advanced`
**Reward tier:** High

### Why this matters now

The retirement wizard is complete UI-wise and is the most financially consequential action in the app. Right now `confirm()` POSTs to `/retirements` with no on-chain signature — meaning retirements either fail silently at the backend or succeed without an immutable Stellar record. This directly blocks the v1.0 release goal of verifiable on-chain certificates.

### Problem

`RetirementFormComponent.confirm()` constructs a `RetirementRequest` and immediately calls `RetirementService.createRetirement()`. The correct flow is:

1. POST to backend → receive unsigned XDR transaction
2. Pass XDR to `WalletService.signTx()`
3. POST the signed XDR back to the backend to submit on-chain and record the retirement

`WalletService.signTx()` is already implemented and working. `RetirementService` has no method to fetch an unsigned transaction. The backend contract addresses are in `environment.ts.example` but unused in this flow.

### Why it's hard

- The two-step backend protocol (get XDR → sign → submit) requires agreeing an API contract with the backend and reflecting it in `RetirementService`
- Freighter's `signTransaction` requires the correct `networkPassphrase` for testnet vs mainnet — passing the wrong one causes a silent failure at the Stellar network level, not at the Freighter API level
- Error states multiply: wallet not connected, user rejects signing, network mismatch, transaction expired (Stellar transactions have a time bound), backend submission failure after signing — each needs distinct UX handling
- The "Confirm & Retire" button must be disabled (not just show a spinner) during the async sign → submit sequence
- The wizard must not be navigable backward after signing begins

### Acceptance Criteria

- [ ] `RetirementService` has a `getUnsignedTransaction(request)` method that returns an XDR string from `POST /retirements/prepare`
- [ ] `confirm()` in `RetirementFormComponent` calls `getUnsignedTransaction` → `walletService.signTx` → `retirementService.submitRetirement(signedXdr)` in sequence
- [ ] Network passphrase is sourced from `environment.stellarNetwork` — not hardcoded
- [ ] Each failure mode surfaces a distinct user-visible error: wallet rejected, network mismatch, transaction expired, backend error
- [ ] Navigating back mid-flow after signing has started shows a confirm dialog warning the user
- [ ] Unit tests cover: success path, wallet rejection, network mismatch, backend submission failure — with `WalletService` and `RetirementService` mocked
- [ ] `ng test` passes, `ng build` succeeds

### Relevant files

| File | What to change |
|---|---|
| `src/app/features/retirement/retirement-form/retirement-form.ts` | `confirm()` method — replace direct `createRetirement()` call with sign → submit flow |
| `src/app/core/services/retirement.service.ts` | Add `getUnsignedTransaction()` and `submitRetirement()` |
| `src/app/core/services/wallet.service.ts` | `signTx()` — already implemented, use as-is |
| `src/app/core/models/retirement.model.ts` | Add types for unsigned tx response and submit request |
| `src/environments/environment.ts.example` | `stellarNetwork` and `sorobanRpcUrl` — source of truth for network passphrase |

### Out of scope

Marketplace transaction signing, credit issuance flows, any backend implementation beyond agreeing the API contract in types and comments.

### Self-check

If solved, this issue moves the v1.0 "verifiable on-chain certificates" goal forward because retirements will produce an immutable Stellar transaction record instead of a backend-only database entry.

---

## Issue 2 — WebSocket subscription teardown silently cancels all listeners for an event, and the socket is never connected after login

**Labels:** `type: bug` `area: sensors` `area: websocket` `area: store` `difficulty: advanced`
**Reward tier:** High

### Why this matters now

Real-time sensor data is the product's core differentiator. Currently the WebSocket is never connected after login (the `connect()` call is missing from the auth flow), and the teardown bug means any second subscriber to `sensor:reading` — whether a second component or the NgRx store — silently kills the first subscriber's stream. The sensor dashboard has never delivered live data and will keep silently failing even after the backend is wired up.

### Problem

Two bugs that must be fixed together:

**Bug 1 — Teardown removes all listeners, not just this one.**
`WebsocketService.on<T>(event)` creates an Observable whose teardown calls `this.socket.off(event)`. This deregisters *all* listeners for that event on the socket, not just the one returned to this subscriber. The correct teardown is `this.socket.off(event, specificHandler)` where `specificHandler` is the exact function reference passed to `socket.on`.

**Bug 2 — The socket is never connected.**
`WebsocketService.connect(token, userId)` is never called anywhere in the application. `AuthEffects.loginSuccess$` navigates to `/dashboard` but never initialises the WebSocket connection. `SensorsDashboardComponent` subscribes to `wsService.connected$` and `wsService.on('sensor:reading')` against a `null` socket, so both streams are permanently empty and no error is ever thrown.

**Structural issue — components dispatch directly to the store, bypassing effects.**
`SensorsDashboardComponent` calls `store.dispatch(SensorsActions.addRealtimeReading(...))` directly from a WS subscription. This couples the component to the transport layer, makes the store untestable in isolation, and means there is no `SensorsEffects` registered in `appConfig` to own the WS → store bridge.

### Why it's hard

- Fixing teardown requires each `on()` call to capture a stable named handler reference. Socket.IO's `off(event, handler)` requires the *exact same function reference* that was passed to `on()` — a new arrow function in the teardown closure will not match
- Reconnection coordination: when the JWT expires and `AuthService` logs out, the socket must be disconnected; when `loginSuccess` fires, a new socket must be opened with the fresh token — this must be orchestrated in `AuthEffects` without creating a subscription leak across login/logout cycles
- `appConfig` only registers `AuthEffects` and `ProjectsEffects` — a new `SensorsEffects` must be created and registered to own the WS → store pipeline
- After the fix, `SensorsDashboardComponent` must read only from `store.select(selectRecentReadings)` and have no direct WS dependency — which changes its initialisation contract and requires updating its spec

### Acceptance Criteria

- [ ] `WebsocketService.on(event)` teardown calls `socket.off(event, handler)` with the specific handler reference — verified by a unit test that subscribes twice and unsubscribes once, confirming the second subscription still receives events
- [ ] `AuthEffects.loginSuccess$` calls `wsService.connect(token, userId)` with the token from the login response
- [ ] `AuthEffects.logout$` calls `wsService.disconnect()`
- [ ] A `SensorsEffects` class is created, registered in `appConfig`, and handles `sensor:reading` WS events by dispatching `addRealtimeReading` to the store
- [ ] `SensorsDashboardComponent` removes its direct `wsService.on('sensor:reading')` subscription and reads only from the store via `selectRecentReadings`
- [ ] Unit tests cover: WS connect triggered on loginSuccess, WS disconnect triggered on logout, teardown isolation (subscribe twice / unsubscribe once), `SensorsEffects` dispatches `addRealtimeReading` when WS emits `sensor:reading`
- [ ] `ng test` passes, `ng build` succeeds

### Relevant files

| File | What to change |
|---|---|
| `src/app/core/services/websocket.service.ts` | Fix `on()` teardown to use handler reference |
| `src/app/core/store/auth/auth.effects.ts` | Call `wsService.connect()` on loginSuccess, `wsService.disconnect()` on logout |
| `src/app/app.config.ts` | Register `SensorsEffects` in `provideEffects` |
| `src/app/features/sensors/sensors-dashboard/sensors-dashboard.ts` | Remove direct WS subscription; read from store only |
| `src/app/core/store/sensors/sensors.actions.ts` | `addRealtimeReading` already exists — no changes needed |
| `src/app/core/store/sensors/sensors.selectors.ts` | Add `selectRecentReadings` if not present |

### Out of scope

WebSocket events for credits or marketplace, the auto-refresh polling interval in the dashboard, any backend changes.

### Self-check

If solved, this issue moves the v1.0 "WebSocket live data" roadmap item forward because the real-time sensor pipeline will deliver data to the store end-to-end for the first time.
