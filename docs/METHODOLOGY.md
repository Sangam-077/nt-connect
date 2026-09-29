# Methodology — NT Connect

## Unit of analysis

188 records from the NT Remote Areas Mobile Coverage source. These include locations classified as COMMUNITY, VILLAGE, HIGHWAY and TOURISM. The priority ranking focuses on community/village rows with recorded population; the map retains all source locations. The 48 Black Spot entries are separate programme records.

## Preparation

1. Read original mobile Excel with its header offset and standardise coordinates and indicator fields.
2. Retain missing population values as unknown, not zero. In the original workbook, highway/tourism population is often absent.
3. Spatially join location points to ABS remote/very-remote geographic classes, and check intersection with the supplied **fixed-line-only** NBN footprint.
4. Calculate distances to listed Black Spot programme points. Nearest programme point is not nearest live cell and does not establish signal coverage.
5. Convert historical BOM observations into cyclone tracks and summarise nearest track, distinct tracks within 100/200 km, severe-track context and dates; obtain relative percentile context across the 188 source locations.
6. Match a limited published service directory at **locality** level; never invent facility coordinates/distances or interpret no match as no service.

## Exploratory Gap Index

Six user-adjustable components, default weights:

| Dimension | Default weight | Input/proxy |
|---|---:|---|
| Mobile infrastructure class | 30% | Macro/small/proximity flags, **not measured signal** |
| NBN fixed-line context | 15% | Whether point is within supplied 2024 fixed-line polygon only |
| Remoteness | 15% | ABS remoteness category |
| Black Spot intervention | 10% | Distance to nearest listed programme project and status |
| Population impact | 10% | Log-scaled recorded population where available |
| Historical cyclone-track context | 20% | Relative percentile score from the separate cyclone notebook |

For location `i`, with available components `x` and selected nonnegative weights `w`:

`Gap Index(i) = round(Σ available(w × x) / Σ available(w))`.

Missing components are omitted and available weights re-normalised; a missing value is not assigned zero. The weights express an **exploratory scenario**, not validated engineering or public-policy preference. An adjusted weight changes the map and ranking in the browser.

The mobile proxy starts at 80 and subtracts 50 for macro, 25 for small, and 5 for proximity indicator, clamped 5–95. NBN fixed-line uses 15 for intersecting the supplied polygon and 85 otherwise (a map-context *proxy*, not a broadband availability determination). Remoteness uses 65 for Remote and 90 for Very Remote. The intervention component uses documented distance/status categories, not measured radio coverage. Population uses a log transform for known values. Cyclone component reads the already calculated `cyclone_exposure_context_score` from the enriched mobile records. Exact implementation: `app/app.js`, functions `parts`, `score` and `why`.

## Data completeness indicator

The app checks nine groups: coordinates; site identity/type; provider/infrastructure; population; remoteness; Black Spot distance; NBN fixed-line flag; cyclone analysis; published locality service listing. The displayed percentage is the share **present**, not statistical confidence, correctness or independence.

## Historical cyclone methodology

The analysis uses records from 1970 onward, grouped by disturbance ID, with lines connecting timestamped cyclone-centre observations. Track-to-location distances are calculated in Australian Albers (EPSG:3577). The final contextual score is a relative weighted percentile: nearest-track proximity 40%, number of distinct tracks within 200 km 35%, severe-track frequency within 200 km 25%. Historical proximity cannot establish future storm probability, specific cyclone wind/rain/flood exposure or vulnerability.

## Key warnings

- A `Proximity to Cell` flag is not an observed mobile signal strength, quality or reliability measure.
- A location outside the supplied NBN fixed-line layer may still use NBN satellite, fixed wireless or other broadband.
- Black Spot project distance does not prove service availability or status at the mobile dataset point.
- Provider counts are observations in this dataset, not carrier market shares.
- Service-directory matches are at locality level and may omit unlisted or newly opened services; some category records refer to the same facility.
- Emergency telephone details and offline packs are static reference materials, not live emergency warnings or emergency-response functionality.
- Actual network design/investment requires surveys, operators, power/backhaul assessment, community-defined needs, consent and Indigenous Data Sovereignty consideration.
