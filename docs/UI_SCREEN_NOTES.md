# TimeOut UI Screen Notes

These notes preserve the founder's currently valid hand-drawn screen intent. The original screenshots should be kept with the project as authoritative UI references. These notes translate the sketches into implementation guidance so a future AI or developer can build without losing the intent.

## Valid screen references

The founder confirmed the following screenshots are still valid:

1. TimeOut app icon / logo
2. Ping Order Screen
3. Ping Status Screen
4. Pre-set Screen
5. Sit Request Screen
6. Desktop project folder screenshot showing current local file structure

## App icon / logo

Visual intent:

- Rounded square app icon.
- Pink-to-purple gradient background.
- White silhouette of child jumping or playing.
- White balloons above the child.
- Large white `TimeOut` wordmark.
- The `O` in Out may function like a clock or circular symbol.

Implementation note:

- Keep the current icon asset if it exists in the repo.
- If generating a new icon later, preserve the playful but trusted parent-to-parent feel.

## Sit Request Screen

Purpose:

- Main screen for scheduling a custom sit request.
- Founder wants low-friction date, time, duration, location, child count, and comments selection.

Visible elements from sketch:

- Header: `Schedule My TimeOut`.
- Points/profile area near top.
- Group selector such as `Blue Group Contacts`.
- Menu/help/settings area at upper right.
- Date section with calendar picker.
- Start section with a compact grid.
- TimeOut / duration section with a compact grid.
- Location section.
- Comments field.

Start time grid intent:

- Number row for hours: 1, 2, 3, 4, 5, 6.
- Number row for hours: 7, 8, 9, 10, 11, 12.
- Minute row: :00, :15, :30, :45.
- AM / PM selectors.

Duration grid intent:

- Number rows for duration hours: 1 through 12.
- Minute row: :00, :15, :30, :45.
- Label: hours away.

Location / points toggles:

- `Date Nite / My Place` concept.
- `Drop Off` concept.
- `One Child` toggle.
- `2+` toggle.

Comments:

- Freeform comments area at bottom.

Implementation guidance:

- Avoid long scrolling where possible.
- Use compact button grids rather than spinner-style pickers.
- Selected states must be visually obvious.
- A point preview should update when duration, child count, location, or emergency preset changes.

## Pre-set Screen

Purpose:

- Quick preset entry point to reduce friction.
- User can pick a common sit type and then review/edit details.

Visible elements from sketch:

- Top status strip: user has points and can book a sit / offer help.
- Heading: `TimeOut QuickPing Presets`.
- Preset cards:
  - Friday Date + Dinner, My-Place sit, 8-11:30 PM.
  - Saturday Date + Dinner, My-Place sit, 8-11:30 PM.
  - Saturday Brunch, Drop-Off sit, 9-12 PM.
  - Sunday Home Project, Drop-Off sit, 1-5 PM.
  - My TimeOut, any time / any reason.
- Date pick calendar area.
- Time pick area.

Implementation guidance:

- Presets should be tappable cards.
- Presets should prefill sit request fields, not immediately send without review.
- Include icons, but keep them simple and friendly.
- `My TimeOut` supports custom needs outside the preset list.

## Ping Order Screen

Purpose:

- Shows the requester who will be pinged and in what order.
- Allows add/invite and selective inclusion/exclusion.
- Supports the fairness rule: lowest point balance is pinged first.

Visible elements from sketch:

- Toggles for `1 Child` and `2 or more (+4 points)`.
- Toggles for `Drop-Off` and `My Place (+4 points)`.
- Standard format text message area for user to view sit request.
- Section: `TimeOut Contacts - Ping Order`.
- Add/invite control.
- YES / selectable column.
- Contact list with point balances:
  - User A -28
  - User B -21
  - User C -11
  - User D 3
  - User E 9
  - User F 23
  - User G 24
  - Teen entries
  - Family entries
- Bottom button: `AutoPing - Send`.

Implementation guidance:

- Sort by lowest point balance first for normal AutoPing.
- Use check circles or similar controls for included contacts.
- Teens/family can appear as special contact types, but core V1 should not overbuild them unless already simple.
- Show the sit request message before send.
- Do not make exclusions feel casual; preserve parental discretion but educate gently.

## Ping Status Screen

Purpose:

- Shows progress after an AutoPing is sent.
- Lets requester refresh status.
- Shows which users have not responded and who accepted.

Visible elements from sketch:

- Button: `AutoPing - Send`.
- Button: `Refresh Ping Status`.
- Table: `Sit Request [Date] [Time]`.
- Sent times and response status:
  - User A 5:09 No Response
  - User B 5:19 No Response
  - User C 5:29 No Response
  - User D 5:33 YES
- Lower list: `Sit Request [Date] [Time]`.
- Note: can have many sit requests; delete after.

Implementation guidance:

- Normal AutoPing is sequential.
- First YES wins.
- Once one user says YES, requester and sitter get confirmation.
- Others get polite sitter already confirmed message.
- Store multiple sit requests but provide a cleanup/delete/archive path.

## Design principles from screenshots

- Mobile-first, narrow vertical screen.
- Large tap targets.
- Parent-friendly wording.
- Minimal typing.
- Use grids and cards.
- Show point consequences before sending.
- Preserve transparency: requester should see message, ping order, and status.
- Fairness rule should be visible enough to build trust.

## Immediate implementation priority

1. Confirm the current Expo app runs.
2. Inspect current `app` folder.
3. Identify current first screen and create-sit-request files.
4. Implement or improve the Sit Request screen based on these notes.
5. Implement point preview.
6. Add preset cards.
7. Add mock ping order and mock ping status before backend/Firebase.
