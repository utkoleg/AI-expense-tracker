# CLAUDE.md

Guidance for Claude when writing code in this repository.

## Project Context
- App: `Receiptly`
- Stack: React + Vite + Capacitor (iOS target first)
- Main flows: capture/upload receipt image, analyze with AI, confirm/edit grouped expenses, persist local expense data
- Current priority: production-hardening while preserving current UX

## Core Engineering Priorities
1. Security first
2. Correctness and edge-case handling
3. iOS reliability and UX polish
4. Readability and maintainability
5. Performance

## Non-Negotiable Rules
- Never expose secrets in client code.
  - Do not put provider API keys in `VITE_*`.
  - AI/network calls with secrets must go through a backend proxy.
- Do not rewrite large parts of the app unless explicitly requested.
- Prefer focused, minimal patches with clear intent.
- Keep behavior stable unless fixing a bug.
- Preserve existing UI style unless asked to redesign.

## iOS-Specific Constraints
- Assume Safari/WKWebView compatibility concerns.
  - Do not rely blindly on newest web APIs; add fallbacks when needed.
- Respect safe area insets (`safe.top`, `safe.bot`) and mobile viewport behavior.
- Handle app lifecycle interruptions gracefully (camera open/close, backgrounding).
- Avoid blocking UI during network operations; always provide cancel/error recovery paths.

## Architecture Preferences
- Keep orchestration logic in hooks (example: `useReceiptFlow`) instead of bloating `App.jsx`.
- Keep components presentational when possible; move side effects to hooks/services.
- Keep data transformations centralized (normalization in service/hook, not scattered in UI).

## Code Style
- Use clear names and short functions where possible.
- Avoid deep nesting; use guard clauses.
- Avoid inline complexity in JSX when it can be extracted to helpers.
- Add comments only when logic is non-obvious.
- Keep changes ASCII unless file already requires Unicode.

## Data and Domain Rules
- Expense IDs must be collision-resistant (`crypto.randomUUID()`).
- Validate external/AI-derived data before saving.
- Be robust to malformed, partial, or empty AI responses.
- Month calculations should use local time unless explicitly designed for UTC reporting.
- Treat receipt data as sensitive user data.

## Networking Rules
- All network requests must have:
  - timeout
  - cancellation support
  - user-friendly error mapping
- Prevent async race conditions (ignore stale responses, abort previous requests when appropriate).

## Performance Rules
- Avoid repeated O(n*m) work during render when data can be memoized/precomputed.
- Prefer computing stats once in hooks over recomputing per component row.
- Keep expensive parsing and normalization out of render paths.

## Testing and Validation
When making changes, run and report:
- `npm run lint`
- `npm run build`

For logic changes, add/update tests (when test setup exists) for:
- receipt parsing/normalization
- totals/category math
- edge dates/timezone behavior
- async flow cancellation/timeout behavior

## Expected Output for Code Tasks
1. Brief plan
2. Minimal patch
3. Validation commands and results
4. Any remaining risks/follow-ups

## Repository Hotspots
- Receipt analysis + normalization: `src/services/receiptAnalyzer.js`
- Flow orchestration: `src/hooks/useReceiptFlow.js`, `src/App.jsx`
- Persistence + stats: `src/hooks/useExpenses.js`
- Mobile interaction patterns: `src/hooks/useCamera.js`, `src/components/PullToRefresh.jsx`

