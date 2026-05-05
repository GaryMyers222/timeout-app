# TimeOut Build Status

This file preserves current product/build context so the repo remains useful even if chat context is lost.

## Current focus

The current branch/PR is focused on the **invite and onboarding flow**.

The invite flow is treated as an educational first-user experience, not as a generic growth/share feature. The goal is to help a new parent understand why a private circle is needed before asking them to invite trusted friends.

## Current invite decisions preserved

- The first screen sequence starts with the TimeOut logo and brand promise.
- Preset pings are used as the most compelling marketing moment, especially Date Night and Emergency Daycare Pickup.
- Custom Sit is acknowledged as the likely common path for real usage, but the Custom Sit Request flow is **not complete yet**.
- AutoPing should be explained as thoughtful and non-spammy.
- Points are framed first as creating a supply of sitters, not as a fairness/accounting lecture.
- Fairness remains implied and secondary in early onboarding.
- Share App is deferred until users love the group/app and may want to help someone else start a separate circle.
- Native contacts are appropriate for inviting friends, but the user must remain in control.
- Parent-controlled SMS is preferred for v1 because the invite comes from the known parent and does not feel like app spam.
- Web mode should not pretend SMS works; it should show copyable SMS text and explain that SMS opens on a real phone.
- Group naming by nearby landmark/school is a strategic later step, not a first-run burden.

## Current technical state

### Implemented in this PR/branch

- Invite onboarding route: `app/invite-friends.tsx`
- Invitee preview route: `app/invitee-preview.tsx`
- Home-screen CTA to Build Your Circle
- Expo Contacts dependency added to `package.json`
- Web fallback for contacts/SMS testing
- App-wide invite mock store: `components/invite-store.tsx`

### Newly added mock invite model

`components/invite-store.tsx` introduces:

- `CircleInvite`
- `InviteStatus`
- `CircleMember`
- `createInvites`
- `markSmsOpened`
- `acceptInviteByPhone`
- `cancelInvite`
- pending/accepted invite lists

This is intended as a bridge toward Firebase invite records and deep links.

## Important limitation

The app is **not done** with Custom Sit Request.

There is a draft `create-sit-request` screen, but it should not be treated as complete product behavior. The next serious sit-request pass still needs to refine the custom sit UX, especially:

- date selection
- start-time grid
- duration grid
- kids count
- drop-off vs my-place
- comments
- review-before-AutoPing
- confirmation language
- point estimate display
- cancellation/edit policy

## Likely next build step

After the invite store is wired into the invite screen, the next high-value build target is the **Custom Sit Request v1** flow, because most real users may use custom sit even if preset pings are the strongest onboarding/marketing screen.
