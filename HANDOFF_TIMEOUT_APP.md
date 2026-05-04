# TimeOut Mobile App - AI Handoff

## Purpose

TimeOut is a private, invitation-only babysitting circle app for trusted friends. It is not a public babysitter marketplace, not a paid sitter platform, and not a stranger-matching app.

Core loop: Invite Friends -> Send Sit Request -> AutoPing finds sitter -> Sit happens -> Points transfer -> Circle grows stronger.

Functional promise: One tap AutoPing finds the first sitter who says yes.

Tone: friendly, practical, trusted, parent-to-parent, low-friction. Avoid corporate marketplace language.

## Founder context

The founder is a licensed professional engineer and business-analyst-oriented product owner, not a software developer. AI or developer help should be concrete, step-by-step, file-based, and repo-based. Avoid vague coding advice. Prefer actual code changes, GitHub commits, pull requests, and clear file paths.

## Current project status

- Requirements and canonical source of truth have been completed.
- Desktop file structure has been built.
- GitHub has been configured.
- First screen has been created.
- This is an Expo / React Native app.
- Prior local work used Expo / Metro, with localhost port 8081 mentioned.
- Development has included work on a create-sit-request screen.
- Started or built: start time grid, duration grid, 1 Child / 2+ Children toggle, Drop-off / My Place toggle, and screen styling improvements.

## Canonical source hierarchy

Use this order when conflicts appear:

1. August user stories / August rules document - canonical rules and points logic.
2. Hand-drawn screens - authoritative UI intent.
3. Unified PRD / merged specification - structured implementation blueprint.
4. User Story Journeys - tone, context, and use cases.
5. Prompt Playbook - AI/dev operating instructions.
6. Legacy book, Smart Mom's Babysitting Co-op - inspiration only, not binding for rules.

## Product positioning

TimeOut is for trusted parent groups who already know each other. It is designed for neighborhood-scale groups, preschool and young-child parents, low-friction sit requests, and fair reciprocity through points.

Starting circle: 3-5 families. Healthy circle: 8-12 families. Long-term neighborhood continuity: 14-20 families. If someone is looking for a local group, the preferred path is to start a group.

## Identity and onboarding

V1 identity should use phone number verification with no password. Keep onboarding minimal. Avoid collecting too much profile data before trust is earned. Early profile data should be minimal: parent first name, child first name, and child birthday or age only when needed.

Onboarding should explain private trusted circles, AutoPing, points, no strangers, low-friction sit requests, and friends helping friends.

## Invites

Invite Friends means inviting someone into the inviter's circle through phone contact / phone number matching.

Share App means letting someone start their own circle elsewhere.

If multiple circle invites exist, show Choose Your Circle. If duplicate invites exist for the same circle, collapse into one circle context. Optional fallback: join code or invite link.

## Sit request fields

A sit request includes date, start time, duration, number of kids, location type, and optional comments.

Defaults: Drop-off is default. My Place is less common and often night-sit oriented.

Founder prefers custom time entry UI based on hand sketches: quick date selection, grid-style start time, duration matrix, minimal scrolling.

## Presets

Core presets:

- Friday Date Night
- Saturday Date Night
- Saturday Brunch
- Sunday Project
- Playdate
- Emergency Daycare Pickup

Each preset should prefill a sit request and allow review/edit before sending.

## Emergency Daycare Pickup

Emergency Daycare Pickup is urgent. It uses broadcast ping, not slow sequential AutoPing. First YES wins. It adds +6 bonus points on top of normal sit points.

Requester should be prompted for daycare/school location and pickup details, for example: Kindercare on Martin Way. App should remind requester to authorize pickup by confirmed sitter's name.

Optional edge case: a member may preconfigure non-app family, such as grandma, for emergency pickup pings. Do not complicate V1 unless easy to support.

## AutoPing

Normal sits use sequential pings ordered by lowest point balance first. The member with greatest debt gets first chance to earn points. YES-or-ignore response model. First valid YES confirms the sit.

Emergency uses broadcast to selected list simultaneously. First YES wins.

After first YES, requester and sitter receive confirmation, and others receive a polite sitter already confirmed message.

Likely interval: about 10 minutes between sequential pings. 5 minutes may be too short; 15 minutes may be too long.

## Exclusions

Requester can exclude specific members for comfort or safety, but the UI should not make casual exclusion too easy. Use educational tone and preserve parental choice.

## Confirmation and reminders

After confirmation: notify requester, sitter, and others that the sit is filled.

Reminders: 24 hours before, 1 hour before, and at scheduled start.

Editing confirmed sits: prefer cancel-and-recreate. Posted sits are generally immutable.

## Points economy

Canonical rule: 1 point = 15 minutes. Therefore 4 points = 1 hour.

Base: 4 points per hour.

Modifiers:

- +4 points if 2+ kids
- +4 points if sitter travels to requester home / My Place
- +6 points for Emergency Daycare Pickup

All members start at zero. Posted sits should be immutable. Corrections should use Transfer Points flow.

## Fairness philosophy

The point system is group health, not tit-for-tat accounting. Default ping order prioritizes members with the lowest point balance so members in debt get the first chance to earn points back.

High-debt but active member is healthy and should get opportunities. High-debt and inactive member may indicate a group health issue and may trigger prompts to earn points, move to honorary, recruit replacements, or discuss at meeting.

## Ghost account / viral incentive

There may be a pseudo ghost account for startup or viral incentives. Ghost account can go negative and be paid down periodically through a group tax. Possible trigger: if ghost debt per member exceeds about 4 points, prompt adjustment. Do not overbuild this early.

## Group meetings

Official meetings: third Monday of odd months at 8:00 PM. System can ping for a volunteer host and optional facilitator.

Host compensation: 1 point from each member credited to host. Debit all members including host for code simplicity.

Meeting agenda can educate about recruiting, safety, group health, inactive members, points economy, aging out, and neighborhood continuity.

## Playdates

Playdates are broadcasts. Two hosts are preferred/required for safety so one can leave in an emergency. Suggested points: fixed attendance debit, for example 2 points to each host per attendee for about 90 minutes. Playdates are different from sits.

## Safety / liability

Priority: parental choice, private trusted circles, and avoiding platform liability creep. The app should not imply that TimeOut vets sitters.

The app should communicate that parents remain responsible for choosing trusted members and deciding whether a home, sitter, and situation are appropriate. TimeOut coordinates trusted friends; it does not certify childcare.

Avoid special-needs workflow in V1 due to liability complexity.

## Geography

Distance matters. Around 15 minutes driving distance is a practical upper limit for many sits. Large circles may naturally split by geography over time.

## Development stack

Current likely stack: Expo, React Native, TypeScript, Firebase / Firestore planned, GitHub repo, VS Code / local terminal, Metro bundler.

## Development style requested

The AI/dev assistant should work directly in the repo when possible, make small reviewable commits, avoid dumping huge abstract advice, provide exact file paths and commands, confirm what changed, keep the founder oriented, and use durable files as handoff.

## Near-term build plan

1. Stabilize current first screen.
2. Confirm app runs locally.
3. Commit current working state to GitHub.
4. Finish create-sit-request UI: date selector, start time grid, duration grid, 1 Child / 2+ Children toggle, Drop-off / My Place toggle, optional comment, point preview.
5. Add preset buttons: Friday Date Night, Saturday Date Night, Saturday Brunch, Sunday Project, Playdate, Emergency Daycare Pickup.
6. Implement point calculation function.
7. Add simple fake/mock AutoPing flow before Firebase.
8. Add Firebase only after UI logic is understandable.
9. Add Firestore schema and security rules.
10. Add SMS/push later.

## Point calculation pseudocode

Base: durationHours * 4.

Modifiers: if kids >= 2 add 4; if location is My Place add 4; if preset is Emergency Daycare Pickup add 6.

Example: 2-hour sit, 2 kids, My Place = 8 base + 4 kids + 4 My Place = 16 points.

Example: 1-hour Emergency Daycare Pickup, 1 child = 4 base + 6 emergency = 10 points.

## AI boot prompt for next session

You are helping build the TimeOut mobile app. Read HANDOFF_TIMEOUT_APP.md first. Treat it as project memory. Then inspect the repo. Do not assume the app is green until you run or inspect it.

Act as a practical coding partner for a non-developer founder. Use the repo as the source of truth. Make small safe changes. Give exact file paths and exact commands. Prefer working code over theory. Do not rewrite the whole app unless necessary. Preserve the founder's product intent. Ask only necessary questions. When uncertain, make a reasonable recommendation and proceed with the safest next step.
