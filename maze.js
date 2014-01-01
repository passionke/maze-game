var Maze = function() {

	this.data = [];
	this.walkedMap = [];
	this.w = 0;
	this.h = 0;
	this.marker = {
		entrance: 'S',
		wall: '#',
		road: '.',
		exit: 'G',
		walked: 'M',
		unwalked: 'U'
	}

	this.searchingList = [];
	this.minStep = Number.MAX_VALUE;
	this.minPath = [];

	var deltaSearh = [[0, -1], [1, 0], [0, 1], [-1, 0]];
	var SearchData = function() {
		this.pos = [0, 0];
		this.path = [];
		this.steps = 0;
	}

	this.sortSearchData = function(searchigList) {
		searchigList.sort(function(a, b) {
			return a.steps - b.steps;
		})
		return searchigList;
	}
	this.init = function(data) {
		this.data = data;
		if (data.length > 0) {
			this.w = data.length;
			this.h = data[0].length;
		}
		for (var i = 0 ; i < this.w; i++) {
			var row = [];
			for (var j = 0 ; j < this.h; j++) {
				row.push(Number.MAX_VALUE);
			}
			this.walkedMap.push(row)
		}
	}

	this.findEntrance = function() {
		for (var i = 0 ; i < this.w; i ++) {
			for (var j = 0; j < this.h; j++) {
				if (this.data[i][j] == this.marker.entrance) {
					return [i, j];
				}
			}
		}
	}

	this.findNeighbor = function(curWalkInfo) {
		var self = this;
		var x = curWalkInfo.pos[0];
		var y = curWalkInfo.pos[1];
		var neighbor = [];
		// don't need search any more
		if (curWalkInfo.steps > this.minStep) {
			return neighbor;
		}
		var neighborPoses = [];
		deltaSearh.forEach(function(direction) {
			neighborPoses.push([x + direction[0], y + direction[1]]);
		});
		neighborPoses.forEach(function(neighborPos) {
			if (neighborPos[0] >= 0 &&
				neighborPos[0] < self.w &&
				neighborPos[1] >=0 &&
				neighborPos[1] < self.h &&
				curWalkInfo.steps < self.walkedMap[neighborPos[0]][neighborPos[1]]) {

				
				if (self.data[neighborPos[0]][neighborPos[1]] == self.marker.road) {
					self.walkedMap[neighborPos[0]][neighborPos[1]] = curWalkInfo.steps + 1;
					var nextSearchData = new SearchData();
					nextSearchData.pos = [neighborPos[0], neighborPos[1]];
					var path = curWalkInfo.path.concat([]);
					path.push(neighborPos);
					nextSearchData.path = path;
					nextSearchData.steps = curWalkInfo.steps + 1;
					neighbor.push(nextSearchData);
				} else if (self.data[neighborPos[0]][neighborPos[1]] == self.marker.exit) {
					self.walkedMap[neighborPos[0]][neighborPos[1]] = curWalkInfo.steps + 1;
					if (curWalkInfo.steps + 1 < self.minStep) {
						self.minStep = curWalkInfo.steps + 1;
						self.minPath = curWalkInfo.path.concat([]);
						self.minPath.push(neighborPos)
					}
				}
			}
		});
		return neighbor;
	}

	this.isWalked = function(walkedList, curInfo) {
		for (var i = 0 ; i < walkedList.length; i++) {
			var walkedPos = walkedList[i].pos;
			if (curInfo.pos[0] == walkedPos[0] && curInfo.pos[1] == walkedPos[1]) {
				return true;
			}
		}
		return false;
	}
	this.findNextStep = function(walkedList) {
		var nextWalkingList = [];
		var self = this;

		walkedList.forEach(function(walkItem) {
			var neighbor = self.findNeighbor(walkItem);
			if (neighbor.length > 0 && !self.isWalked(nextWalkingList, walkItem)) {
				nextWalkingList = nextWalkingList.concat(neighbor);
			}
		});
		if (nextWalkingList.length > 0) {
			this.findNextStep(nextWalkingList);
		}
	}

	this.buildRandomMaze = function(m, n, blocksNum) {
		var getRandomPos = function(m, n) {
			var x = Math.random() * m | 0;
			var y = Math.random() * n | 0;
			return [x, y];
		}

		var getBounderPos = function(m, n) {
			var pos = getRandomPos(m, n);
			var rnd  = Math.random()
			if (rnd < 0.25) {
				pos[0] = 0;
			}else if( rnd < 0.5){
				pos[1] = 0;
			}else if ( rnd < 0.75) {
				pos[0] = m - 1;
			}else {
				pos[1] = n - 1;
			}
			return pos;
		}

		var startPos = getBounderPos(m, n);
		var exitPos = getBounderPos(m, n);
		while (exitPos[0] == startPos[0] && exitPos[1] == startPos[1]) {
			exitPos = getBounderPos(m, n);
		}

		var data = [];
		for (var i = 0; i < m; i ++) {
			var row = [];
			for (var j = 0 ; j < n ; j++) {
				row.push(this.marker.road);
			}
			data.push(row);
		}

		for (var i = 0 ; i < blocksNum; i++) {
			var pos = getRandomPos(m, n);
			data[pos[0]][pos[1]] = this.marker.wall;
		}
		data[startPos[0]][startPos[1]] = this.marker.entrance;
		data[exitPos[0]][exitPos[1]] = this.marker.exit;

		return data;
	}

	this.findSolution = function() {
		var entrance =	this.findEntrance();
		var searchingData = new SearchData();
		searchingData.pos = entrance;
		searchingData.steps = 0;
		searchingData.path.push(entrance); 
		var walkedList = [];
		walkedList.push(searchingData);
		this.findNextStep(walkedList);
	}
	this.matrixClone = function(data) {
		var matrix = [];
		if (data.length > 0 && data[0].length > 0) {
			var w = data.length;
			var h = data[0].length;
			for (var i = 0 ; i < w; i++) {
				var row = [];
				for (var j = 0 ; j < h; j ++) {
					row.push(data[i][j]);
				}
				matrix.push(row);
			}
		}
		return matrix;
	}
	this.printRoadMap = function() {
		var matrix = this.matrixClone(this.data);
		if (this.minPath.length > 0) {
			for (var i = 2; i < this.minPath.length - 1; i ++) {
				var path1 = this.minPath[i - 1];
				var path2 = this.minPath[i];
				console.log(path1, path2)
				if (path1[1] == path2[1]) {
					matrix[path1[0]][path1[1]] = "|";
					matrix[path2[0]][path2[1]] = "|";
				}else {
					matrix[path1[0]][path1[1]] = "-";
					matrix[path2[0]][path2[1]] = "-";
				}
			}
		}
		return matrix;
	}
}

var maze = new Maze();

var data = maze.buildRandomMaze(29, 10, 150)
maze.init(data);
maze.findSolution();
// console.log(maze.data)
// console.log(maze.minPath)
console.log(maze.minStep)
console.log(maze.printRoadMap())
