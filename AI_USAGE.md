# AI Usage
## Use of AI in this Project

### Rasterizing Waypoints (turning a rough path into individual tiles)
I used AI assistance to understand and implement the logic for rasterizing path waypoints.
- Understanding how waypoint coordinates can define a path using horizontal and vertical segments.
- Converting high-level waypoint segments into individual grid cells.
- Understanding the use of Math.sign() to determine movement direction along each segment.
- Handling path junctions without unnecessarily duplicating shared cells.
- Validating that waypoint segments stay within the map boundaries and connect horizontally or vertically.

### Path Thickening (Making the path wider)
AI assistance was also used to understand the concept of thickening the rasterized path. The centerline is expanded around each cell according to the configured path width, which allows the map to render a wider path and perform path/object collision checks.