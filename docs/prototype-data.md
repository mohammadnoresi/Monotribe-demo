# MonoTribe Prototype Data

This dataset is a fictional static community for the MonoTribe research prototype. It exists only to support concept validation, user interviews, and realistic demo scenarios.

All identities, biographies, relationships, and activity counts are fictional. Do not treat this dataset as real user data or production data.

## Primary Demo User

The primary logged-in demo user is:

- `mt001` — سارا نیک‌فر

Future prototype screens can use this ID as the default viewer when demonstrating graph distance, trust signals, profile paths, feed visibility, and interview scenarios.

## Relationship Semantics

- `friend`: two members know each other in real life. Treat this as bidirectional even though the record is stored once.
- `trusted`: one member considers another member reliable. This is directional.
- `sponsor`: historical invitation relationship. This is directional and should match each member's `sponsorId`.

Follow relationships are intentionally not part of the graph dataset yet.

## Avatars

Prepared profile images live in `src/assets/Avatar/`.

The research dataset assigns all 60 prepared images deterministically across the 120 fictional members. Each image is reused approximately twice. This reuse is intentional for the prototype and should not be treated as a production avatar strategy.

Graph thumbnails live in `src/assets/Avatar/thumbs/`. They are generated from the original images as 128×128 JPEG files:

```bash
pnpm run generate:avatar-thumbs
```

The command uses `scripts/generateAvatarThumbnails.mjs` to find a Python runtime with Pillow, then runs `scripts/generateAvatarThumbnails.py`.

The raw member records store:

- `avatarFileName`
- `avatarPath`
- `avatarThumbnailFileName`
- `avatarThumbnailPath`

Frontend graph data resolves the final Vite-bundled thumbnail URL through `src/data/community/avatarAssets.ts`. Full-size avatar paths remain on the member records for future profile screens.

No source avatar files were renamed as part of this setup.

## Graph-Ready Data

Graph-ready data is derived from the source members and relationships instead of duplicating the full community model.

Use selectors from `src/data/community/graphSelectors.ts`:

- `getGraphNodes()`
- `getGraphLinks(type?)`
- `getGraphData(type?)`
- `friendGraph`
- `trustedGraph`
- `sponsorGraph`
- `fullRelationshipGraph`

Graph nodes include only display-oriented fields such as member ID, display name, avatar URL, city, verified status, profession, cluster ID, and primary-demo-user status.

Graph links include source ID, target ID, and relationship type.

## Designed Network Shape

The community contains 120 fictional Iranian members. Most members are in Tehran, with smaller groups in Karaj, Isfahan, Shiraz, Tabriz, and Mashhad.

The network includes:

- dense local clusters
- weaker links between clusters
- bridge members between larger portions of the network
- sponsor chains that differ from some friend paths
- members at different friend-link distances from the primary demo user
- several members with multiple possible friend paths

Known graph scenarios are exported from `src/data/community/communityData.ts` as `graphScenarios`.

## Future Excel Workbook Structure

The future human-editable master workbook should use separate sheets:

### Members

Columns:

- `id`
- `firstName`
- `lastName`
- `displayName`
- `gender`
- `ageRange`
- `city`
- `profession`
- `bio`
- `avatarPath`
- `verified`
- `joinedDate`
- `sponsorId`
- `followerCount`
- `followingCount`
- `contributionCount`
- `endorsementCount`
- `skills`
- `clusterId`

### Relationships

Columns:

- `id`
- `type`
- `fromMemberId`
- `toMemberId`
- `note`

### Scenarios

Columns:

- `id`
- `title`
- `memberId`
- `description`

For now, the frontend consumes TypeScript data directly. A future Excel-to-JSON conversion task can export the workbook into the same `Member[]`, `Relationship[]`, and `GraphScenario[]` shapes without adding parsing logic to the frontend.
