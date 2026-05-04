# TimeOut V1 Canon

This document is the current working build baseline for the TimeOut app.

## Source Priority

Use sources in this order when there is a conflict:

1. User Stories August 2022.docx
2. hand-sketched screen designs
3. TimeOut System Spec v1.1 - Corrections and Clarifications Final Lock Addendum
4. TimeOut Flow.pptx
5. TimeOut_App_Requirements_Journey_Map_Part1.docx
6. TimeOut_App_User_Stories_Part2.docx
7. TimeOut_App_UI_Requirements_Part3.docx

The August stories carry the strongest founder/product intent. The locked addendum resolves conflicts and defines current V1 scope. Parts 1, 2, and 3 are older rewrite/reference documents and may contain obsolete rules.

## Product Core

TimeOut is not a marketplace. It is a trust-based coordination tool for local sitter-friends.

Core loop:

1. invite trusted local sitter-friends
2. create a sit request quickly
3. AutoPing finds the first available sitter
4. sitter and requester get reminders
5. sit ends and points are posted
6. ledger reflects the transaction
7. group repeats the behavior reliably

Core product language to preserve:

- No more hunting and begging for a sitter
- One-tap AutoPing finds the first YES
- Friends make the best sitters
- The points will work out

## V1 Scope

Build in V1:

- phone identity
- invite and circle formation
- sit request and fixed presets
- candidate list sorted by lowest point balance first
- AutoPing with sequential default and limited broadcast
- notifications and reminders
- sit completion and auto fallback
- points ledger and transfer
- past sit entry
- same-day active ping conflict handling
- basic ghost/system adjustment capability

Defer from V1:

- complex balancing formulas
- voting and bylaws UI
- advanced analytics dashboards
- polished multi-circle UX
- user-facing monthly reports

## Resolved Rules

### Sit Requests

- Do not save draft sit requests.
- App presets are fixed and app-defined only.
- Do not support user-created presets.
- Presets are primarily a marketing surface.
- Custom sit request is the main operational path for frequent use.
- Icon-tap behavior should optimize for quick custom sit entry.
- The cursor/default attention should favor quick custom entry.

### Presets

- Presets are intended to feel one-click and low-friction.
- Preset flows do not allow requester edits to the ping list.
- If the user wants control over candidate selection, they should bypass presets and use custom.
- Emergency Daycare Pickup is a special-case preset with additional education and information capture such as daycare location.

### Group Identity

- Do not ask the first user to manually create a group name up front.
- The system may generate a default group name from local streets or neighborhood cues.
- The generated name should feel human and editable later.
- Invitees should inherit the inviter group identity.
- If a user belongs to more than one group, the product must keep group identity clear.

### Invite vs Share

- Invite and Share are distinct product actions and must not be conflated.
- Invite brings a local sitter-friend into an existing group.
- Share is a viral growth path that helps a non-local friend start a new group as a new User 1.
- A successful share that results in startup of a new group may award incentive points.
- Product should support the edge case of belonging to more than one group, even if polish is deferred.
- Product must avoid accidentally creating a new local group when the user intended to invite.
- Product must avoid accidentally treating a share as a local invite.

### AutoPing

- Sequential AutoPing is the default.
- Broadcast is limited to emergency daycare pickup, playdate, and gathering RSVP.
- Remove generic batch mode language from product/spec text.
- No 2-hour AutoPing cutoff in V1.
- AutoPing continues until first YES, requester cancels, or list is exhausted.
- Same-day rule: only one active AutoPing per day.
- On same-day conflict, prompt the requester to wait or cancel and continue.

### Candidate Ordering

- Sort candidates with the lowest point balance first.
- This is a circulation mechanic, not a fairness claim.
- Product language should describe effectiveness and circulation, not fairness.

### Past Sits

- Past sits are allowed.
- Do not block past times in validation.
- If sit time is in the past, enter Past Sit Mode.
- Past Sit Mode is requester-only entry.
- No AutoPing occurs in Past Sit Mode.
- Past sits post immediately to the ledger.
- Past Sit Mode is the preferred way to record off-app sits.

### Estimate Meaning

- Estimated duration exists mainly to help potential sitters evaluate availability.
- Estimated duration is not binding.
- Actual details can be discussed off-app.
- Meaningful changes to a sit require cancel/restart.
- Errors can be corrected through a custom single-target request in some cases or transfer points.

### Non-App / Family Sitters

- Non-app sitters may appear in request flows where allowed by product logic.
- In V1, the important active case is emergency daycare pickup.
- A non-app responder may coordinate a sit, but no points are exchanged.
- Family members who want points for sitting other members must be actual subscribed members.
- A member-family edge case may use transfer points later.

### Reminders

- Reminder timing is 24 hours before sit start and 2 hours before sit start.
- Reminder notifications must include a cancel option.
- Both requester and sitter may cancel before points are posted.
- Reminder and confirmation notifications should support direct action without unnecessary navigation.

## Invite / Startup Path

This area is provisional and must be revalidated in a future session.

Current direction:

- The first invite text should come from a friend.
- App may help the user select contacts and generate invite message/link.
- Message should feel friend-originated and low friction.
- Invitees should follow a standalone educational path.
- Do not put registration friction in front of value.
- No card/payment friction upfront.

Working assumptions:

- user taps invite in app
- user selects from native contacts
- app provides a link and message
- user sends it through friend-origin texting behavior
- invitee opens link and gets education in context

Open for validation:

- exact first-run onboarding order
- exact invite acceptance flow
- how early group identity is created or assigned
- whether guided test flow is required before real invites are complete

## UI Direction

The sketches are authoritative for intent.

Preset Screen:

- Primary marketing surface for the Play Store.
- Should feel branded, warm, personal, and emotionally compelling.
- Should emphasize quick-ping presets and the value proposition.
- Should not look like a generic menu screen.

Sit Request Screen:

- Should feel compact, practical, and form-board-like.
- Time and duration matrix are key interaction elements.
- Preserve sketch structure; do not flatten into generic cards.
- Sit start-time matrix is a 3 x 6 matrix.
- Sit duration matrix is a 3 x 6 matrix.

## Corrections To Older Rewrite Docs

Treat these statements in Parts 1, 2, and 3 as outdated unless reapproved:

- validation ensures sit start time is in the future
- AutoPing concludes 2 hours before sit start time
- inactive users are removed after 180 days
- generic batch mode language
- any requirement contradicting fixed-preset or one-active-ping rules

## Best Near-Term Build Order

1. formalize this canon as the build baseline
2. continue screen design refinement of presets and custom sit
3. add candidate list behavior consistent with preset vs custom rules
4. implement ledger and transfer flow
5. implement sit completion and reminder/status behavior
6. revisit onboarding and invite flow before locking that path

## Open Founder Questions

Keep these visible for the next product session:

- exact onboarding sequence after invite link open
- whether invitees accept circle membership before or after education cards
- whether a guided test flow should be part of V1 startup
- final implementation of friend-origin invite text composition and tracking
