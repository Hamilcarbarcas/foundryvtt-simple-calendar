# Documentation edits pending review

Local fork only. Append-only record of user-facing strings and docs changed on this fork, with
before/after, for a review pass. Delete an entry once reviewed. Excluded from git via
`.git/info/exclude`.

---

## 2026-09-27 — Moonrise/moonset in the day menu

### 1. ADDED — `src/lang/en.json`, four keys after `FSC.Sunset`

- Before: *(no keys)*
- After:
  - `FSC.Moonrise`: "Moonrise"
  - `FSC.Moonset`: "Moonset"
  - `FSC.MoonriseMoonset`: "Moonrise/Moonset Time"
  - `FSC.MoonNoneThisDay`: "None this day"

Other languages have no entries; Foundry falls back to English.

### 2. ADDED — `CHANGELOG.md`, *Local changes* section

New bullets under **New API** (moon rise/set), a new **New UI** subsection, and a second **Bug
Fixes** bullet (`getSunriseSunsetTime` using the active calendar). No before.
