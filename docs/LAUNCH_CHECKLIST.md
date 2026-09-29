# NT Connect — Launch verification checklist (29 September 2026)

**This package is a candidate for final review, not yet a public deployment.** Leave the working v6.2 copy intact and do not push until the steps below are confirmed.

## Required desktop checks

- [ ] Open the app in a clean Chrome or Edge tab on `http://localhost:8070/`.
- [ ] `188 locations`, `48 Black Spot projects` are visible. The selected location profile and map are populated.
- [ ] Search for `YUENDUMU` or `MATARANKA` and choose a suggestion: map spotlight, profile and ranking update.
- [ ] Filters → provider + infrastructure classification; count changes; Reset returns the 188-source overview.
- [ ] Change the map to Cyclone context and Infrastructure; data legends and markers change.
- [ ] Open **Why this location?**, and confirm that fixed-line and cyclone claims have caveats.
- [ ] Open Essential services for one matched locality and an unmatched locality: unknown must never be shown as confirmed absent.
- [ ] Open Compare, select two records and compare them.
- [ ] Change a weight in About data → Adjust weights. The map index/ranking recomputes; Reset defaults restores 30/15/15/10/10/20.
- [ ] Open Action plan: the recommendations must be preliminary investigation options.
- [ ] Emergency info shows 000, 132 500, 131 444, 1800 022 222 and says calling requires a working phone network.
- [ ] Download HTML pack, disconnect Wi-Fi and open the file: all sections display, including emergency phone reference.
- [ ] DevTools → Network → Offline, reload the running `localhost` app after successful first cached load. Map, search and bundled data still display.
- [ ] Check layout at desktop, tablet and phone widths; no critical button is obscured.
- [ ] Open DevTools Console; there should be no JavaScript errors.

## Showcase plan — 3-minute live flow

1. **10 seconds:** Explain the problem. "Remote connectivity data is fragmented. Important information can disappear when network access does."
2. **35 seconds:** Map, search, filter and the selected profile — show that the app uses source records rather than invented signal footprints.
3. **35 seconds:** Explain the Gap Index and confidence/completeness; switch to Cyclone context; point out the limitations.
4. **45 seconds:** Open Action plan; explain the three-phase concept: infrastructure validation, service continuity and community-led resilience.
5. **45 seconds:** Show locality health/shelter listing and verified Emergency info. Download a readable HTML community pack.
6. **10 seconds:** Disconnect network / enable browser Offline and reload; demonstrate that the core dashboard still functions.

## Data and ethical disclaimer to rehearse

"The Gap Index is an exploratory decision-support score, not a measurement of reception or a verdict on where to invest. The NBN layer is fixed-line only; cyclone analysis is historical proximity. Community-level service listings are not live availability. All action recommendations need local validation, collaboration with operators, and consultation with communities and Traditional Owners."

## Release / GitHub

1. Preserve the last working `app` folder as `app_v6_2_backup` locally (Git history provides longer-term backups).
2. Extract this package's `app` folder into the repo root.
3. Run tests above before commit. Verify no credentials, local Windows absolute paths, or private data are committed.
4. Update repository README with the above usage and known limitations.
5. Commit only after review, using a message like `Final review: streamlined offline-first NT Connect dashboard`.
