
// -Jake Morgan @publicservices.web on instagram.
// a lot of things are hard coded so just ignore the spaghetti mess i guess.

// initializing the size off rip
box.message("size", 308,308);
inlets = 1;
outlets = 3;

mgraphics.init();
mgraphics.autofill = 0;
mgraphics.relative_coords = 0;

var mouse_pos = [];
var JSUIsize = [box.rect[2]-box.rect[0],box.rect[3]-box.rect[1]]; // uh i donot need this.
var inbox = 0;
var cell_amount = 22*22; // hard coded because i'm refuse to do all the work to make it dynamic.
var cell_width = 22; // amount of cells width. not pixel width
var cell_height = cell_width;
var start;
var stateX = [];
stateX[0] = 1;
var scale_speed = 100;

var timeTask = new Task(timescale, this);
var cellx = new Buffer("cellx01_b");
//var playhead = new Buffer("playhead");

timeTask.interval = scale_speed;
timeTask.execute();
timeTask.repeat();


var timeline = 0;
var deltaTimeline = 0;

function timescale(){
	//deltaTimeline = timeline;
	
	//timeline = playhead.peek(0,0);
	//deltaTimeline = timeline - deltaTimeline;
	update_state();
	refresh();
}

//
// for reference: functions can be called by using message boxes outsid the ui.
function start(){
	timeTask.execute();
	timeTask.repeat();
	outlet(0,"startpressed")
}
function stop(){
	timeTask.cancel();
	outlet(0,"stoppressed");
}
function set_speed(speed){
	scale_speed = speed;
	outlet(0,["speed_set_to", speed]);
	refresh();
}
function clear(){
	for(let i = 0; i<cell_amount; i++){
		stateX[i] = 0;
	}
	mgraphics.redraw();
}

//
// to find cell to left = n-1 to right n+1 above n-cell_width below n+cell_width topleft n-cell_width+1
// topright n-cell_width-6 bottomright n+cellcount+1 bottomleft n+cell_width-1
// ^^ this literally won't work if the grid can be dynamically sized lol so i'm not changing it


// c-style class declaration.
// i like this style of creating an object/"class" allows for streamlined coding within patch
// for more professional projects i think doing this in an obj oriented way would be better.
// anything less than ~2000 lines is fine to be in this c-style file.

var cell = function(id,coords,width,height)/*id,top left corner, w,h*/{
	this.id = id;
	this.coords = coords;
	this.width = width;
	this.height = height;
	for(let i = 0; i<cell_amount; i++){
		stateX[i] = 0;
	}
	//var color = [[0.25,0.07,0.02,1],[0.87,1,1,1]];
	var color  = [[0.2,0.2,0.2,1],[0.8,0.55,0,1]]
	
	
	this.paint = function(){
		with(mgraphics){
			set_source_rgba(color[stateX[id]]);
			rectangle(coords[0],coords[1],width,height);
			fill();
		}
	}
	// this function can technically be called anything just needs to be called in the global click function.
	this.onclick = function(x,y,but){
		var w = width;
		var h = height;
		//outlet(1,[width,height,coords[0],coords[1]]); // for testing.
		if(x>coords[0] && x<(coords[0] + w) && y>coords[1] && y<(coords[1] + h)){
			inbox =1;
			//outlet(0,"cellpressed"); // for testing.
		}else{inbox = 0;}
		if(but && inbox){
			if(stateX[id] == 0){
				stateX[id] = 1;
			}
			else{
				stateX[id] = 0;
			}
			//outlet(0,[id,stateX[id],"state"]); // for testing.
		}else{}
	}
	this.update = function(){
	}
	this.getState = function(){
		return stateX[id];
	}
};

//
var cells = [];
var cell_size = 14; // in pixels.
var temp = 0;
for(let i = 0; i<cell_width; i++){
	for(let j = 0; j<cell_height; j++){
		cells.push(new cell(temp+j,[cell_size*i,cell_size*j],cell_size,cell_size));
	}
	temp += 22; // uhhhh 22 cause thats where a new column starts.
}

//
function paint(){
	with(mgraphics){
		for(let i = 0; i<cell_amount;i++){
			cells[i].paint();
		}
	}
}

function onresize(w,h){
	forcesize(w,h);
}
onresize.local = 1;

function forcesize(w,h){
	if(w!=h){
		h = w;
		box.message("size",w,h);
	}
}
forcesize.local = 1;

function onclick(x,y,but){ //this func is essential as a global func. the local ones inside classes can be called anything
	mouse_pos[0] = x;
	mouse_pos[1] = y;
	
	for(let i = 0; i<cell_amount; i++){
		cells[i].onclick(x,y,but);
	}
	//TODO: optimize later.
	mgraphics.redraw();
}
onclick.local = 1;

function update_state(){
	
	//
	var current_cell_amount = 0;
	var first_column = 22; // it is not dynamic. hard coded values for my 22x22 grid.
	var last_column = 462;
	var first_row = 0;
	var last_row = 21;
	var mult = 1;
	var mult_l = 1;
	var cells_alive = 0;
	var cells_dead = 0;
	var cell_sub = cell_height - 1;
	var cell_plus = cell_height + 1;
	var list_output = [];
	
	//
	for(let i = 0; i<cell_amount;i++){
		current_cell_amount += stateX[i];
		list_output.push(stateX[i]); 
		
		//outlet(0, i);
		//
		//=====================================
		// 				corners
		// ====================================
		//
		
		// TODO: add the update state thing.
		
		// first cell check. special properties.
		// i know all of this could be in its own function. i am tired and don't feel like it.
		if(i == 0){
			cells_alive += (stateX[i+1] + stateX[i+cell_height] + stateX[i+cell_height+1]);
			cells_dead = cells_alive % 3;
			if(stateX[i] == 0){
				spawn(cells_alive,i);
			}
			if(stateX[i] == 1){
				survive(cells_alive,i);
			}
		}
		// bottom left corner. special properties.
		if(i == 21){
			var ca = (stateX[i - 1]) + (stateX[i + cell_height] + stateX[i+cell_sub]);
			if(stateX[i] == 0){
				spawn(ca,i);
			}
			if(stateX[i] == 1){
				survive(ca,i);
			}
		}
		// top right corner. special properties.
		if(i == 462){
			var ca = (stateX[i + 1]) + (stateX[i - cell_height] + stateX[i-cell_sub]);
			if(stateX[i] == 0){
				spawn(ca,i);
			}
			if(stateX[i] == 1){
				survive(ca,i);
			}
		}
		
		// bottom right corner. special properties.
		// need to fix
		if(i == 483){
			var ca = (stateX[i - 1]) + (stateX[i - cell_height] + stateX[i - cell_plus]);
			//outlet(0,ca);
			//cells_alive += (stateX[i - 1] + stateX[i - cell_height] + stateX[i - (cell_height - 1)]);
			if(stateX[i] == 0){
				spawn(ca, i);
			}
			if(stateX[i] == 1){
				survive(ca,i);
			}
		}
		//
		// =====================================
		//			rows + columns
		// =====================================
		//
		
		//TODO: add the cell count algo to columns/rows/everything_else.
		
		// first row check. special properties.
		if(i == first_row+(22*mult)){
			//TODO: fix whatever is happening here.
			// first row is doing something it is not supposed to.
			var ca = (stateX[i + 1] + stateX[i - cell_height] + stateX[i - cell_sub] + stateX[i + cell_height] + stateX[i + cell_plus]);
			if(i == 0 || i == 462){
				// do nothing
			}
			else if(stateX[i] == 0){
				spawn(ca, i);
			}
			else if(stateX[i] == 1){
				survive(ca, i);
			}
			mult++;
		}
		// last row check. special properties.
		if(i == last_row+(22*mult_l)){
			var ca = (stateX[i - 1] + stateX[i - cell_height] + stateX[i - cell_plus] + stateX[i + cell_height] + stateX[i + cell_sub]);
			if(i == 21 || i == 483){
				// do nothing
			}
			else if(stateX[i] == 0){
				spawn(ca, i);
			}
			else if(stateX[i] == 1){
				survive(ca, i);
			}
			mult_l++;
		}
		// first column check. special properties.
		if(i<=first_column){
			var ca = (stateX[i - 1] + stateX[i + 1] + stateX[i + cell_height] + stateX[i + cell_sub] + stateX[i + cell_plus]);
			if(i == 0 || i == 21){
				// do nothing
			}
			else if(stateX[i] == 0){
				spawn(ca, i);
			}
			else if(stateX[i] == 1){
				survive(ca, i);
			}	
		}
		// last column check. special properties.
		if(i > last_column && i < 483){
			if(stateX[i] == 0){
				//outlet(0, "if detected");
				var ca = ((stateX[i - 1]) + stateX[i + 1] + stateX[i - cell_height] + stateX[i - cell_plus] + stateX[i - cell_plus]);
				//outlet(0, ca);
				spawn(ca, i);
			}
			if(stateX[i] == 1){
				var ca = ((stateX[i - 1]) + stateX[i + 1] + stateX[i - cell_height] + stateX[i - cell_plus] + stateX[i - cell_plus]);
				survive(ca, i);
			}
		}
		//
		// ===================================
		// 			everything else
		// ===================================
		//
		if(i != 483 && stateX[i] == 0 && i != first_row+(22*mult) && i != last_row+(22*mult)){
			//outlet(0,i);
			var ca = (stateX[i - 1] + stateX[i + 1] + stateX[i - cell_height] + stateX[i + cell_height] + stateX[i + cell_plus] + stateX[i - cell_plus] + stateX[i + cell_sub] + stateX[i - cell_sub]);
			
			spawn(ca, i);
			
		}
		else if(i != 483 && stateX[i] == 1 && i != first_row+(22*mult) && i != last_row+(22*mult)){
			var ca = (stateX[i - 1] + stateX[i + 1] + stateX[i - cell_height] + stateX[i + cell_height] + stateX[i + cell_plus] + stateX[i - cell_plus] + stateX[i + cell_sub] + stateX[i - cell_sub]);
			//outlet(0,ca);
			survive(ca, i);
			//outlet(0, ["state changed", stateX[i]])
			
			
		}
		cellx.peek(i,stateX[i]);
	}
	// to find cell to left = n-1 to right n+1 above n-cellcount below n+cellcount topleft n-cellcount+1
	// topright n-cellcount-6 bottomright n+cellcount+1 bottomleft n+cellcount-1
	// TODO: create loop to check every id's state and check if it can be alive or dead.
	outlet(0,["alive_cell_count",current_cell_amount]);
	outlet(1,list_output);
	outlet(2,"bang");
	mgraphics.redraw();
}

function spawn(cells_a,id){
	if(cells_a == 3){
		stateX[id] = 1;
	}else{
		stateX[id] = 0;
	}
}
function survive(cells_a,id){
	if(cells_a == 2 || cells_a == 3){
		//survive
		stateX[id] = 1;
	}
	else if(cells_a < 2 || cells_a > 3){
		// die
		stateX[id] = 0;
	}
}

function random_init(){
	for(let i = 0;i<cell_amount;i++){
		stateX[i] = Math.random(0,1);
	}
}