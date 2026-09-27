# Remote Connectivity NT — Version 4

This version combines the original connectivity explorer with a transparent, adjustable priority index.

## Main features
- 188 mobile locations and 48 NT Mobile Black Spot projects embedded locally
- real NT boundary
- search suggestions across mobile locations and Black Spot locations
- filters and clickable map
- save selected mobile location offline
- service-worker caching
- adjustable Gap Index based on five available data components:
  - mobile infrastructure gap
  - NBN fixed-line gap
  - remoteness
  - distance to Mobile Black Spot intervention
  - population impact
- community priority map
- sortable ranking table
- CSV ranking export
- generated recommendations
- responsible-use section
- simulated offline UI plus actual browser offline support

## Important
The Gap Index is illustrative and transparent. It is not a measured signal-strength score and should not be treated as an investment verdict.

The NBN component uses only the supplied fixed-line layer. It does not represent fixed wireless or satellite.

## Run
Open a terminal in this folder and run:

python -m http.server 8020

Then open:
http://localhost:8020

Use a fresh port such as 8020 so an older Service Worker cannot interfere.
