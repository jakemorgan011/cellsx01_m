# cellsx01_m
Conway's game of life for control over audio processes.

# importing to max !!
include inside your max project or folder and create a v8ui object like this:
"v8ui @filename cellx01_grid.js"

# info:
you'll need three seperate message boxes to active the game.
1 - start
2 - stop
3 - clear
To choose a starting point for the game you just click on the black box while the game is stopped.

the left outlet will output the total cells alive.
the middle outlet will output a binary map of the cells.
the right outlet will output a bang to synchronize the update speed of the game with other objects.
