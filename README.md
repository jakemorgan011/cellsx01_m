# cellsx01_m
Conway's game of life for control over audio processes.

# importing to max !!
include inside your max project or folder and create a v8ui object like this:
"v8ui @filename cellx01_grid.js"

the left outlet will output the total cells alive.
the middle outlet will output a binary map of the cells.
the right outlet will output a bang to synchronize the update speed of the game with other objects.
