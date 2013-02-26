var canvasWidth = 800;
var canvasHeight = 600;
var aspect = canvasWidth / canvasHeight;
var minX = -2.5;
var maxX = 0.75;
var minY = - height / 2
var offsetX = (maxX + minX) / 2;
var width = maxX - minX;
var height = width / aspect;

var camera = new THREE.OrthographicCamera(-2.5, 0.75, height / 2, -height / 2, 0, 10);

function sceneWidth() {
	return camera.right - camera.left;
}

function sceneHeight() {
	return camera.top - camera.bottom;
}

var request = new XMLHttpRequest();
request.overrideMimeType("text/plain; charset=x-user-defined");
request.open('GET', 'canvas.vert', false);
request.send();

var vertShader = request.response;

request = new XMLHttpRequest();
request.overrideMimeType("text/plain; charset=x-user-defined");
request.open('GET', 'canvas.frag', false);
request.send();

var fragShader = request.response;

var scene = new THREE.Scene();
//~ var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(canvasWidth, canvasHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.PlaneGeometry(sceneWidth() * 10, sceneHeight() * 10, 1, 1);
var m = new THREE.Matrix4();
m.makeTranslation(offsetX, 0, 0);
geometry.applyMatrix(m);
var material = new THREE.ShaderMaterial({	vertexShader: vertShader,
											fragmentShader: fragShader
										});

var plane = new THREE.Mesh(geometry, material);
//~ plane.translateX(offsetX);
scene.add(plane);

var canvas = renderer.domElement;

function canvasToScene(pc) {
	pc.x -= canvas.offsetLeft;
	pc.y -= canvas.offsetTop;
	var sx = pc.x / canvasWidth, sy = pc.y / canvasHeight;
	sx *= sceneWidth();
	sy *= sceneHeight();
	sx += camera.left;
	sy += camera.bottom;
	
	return { x: sx, y: sy };
}

function cameraCenter() {
	return	{
				x: (camera.left + camera.right) / 2,
				y: (camera.top + camera.bottom) / 2 
			};
}

function newCenter(zc) {
	var oldCenter = cameraCenter();
	return	{	
				x: (zc.x + oldCenter.x) / 2,
				y: (zc.y + oldCenter.y) / 2
			};
}

function sceneToCanvas(ps) {
	var cx = ps.x + camera.right, cy = ps.y + camera.top;
	cx /= sceneWidth;
	cy /= sceneHeight;
	cx *= canvasWidth;
	cy *= canvasHeight;
	
	return {x : cx, y: cy };
}

var dragging = false;
var dragPoint = { x: null, y: null };

function mouseCoords(event) {
	return { x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop };
}

canvas.addEventListener("mousedown", function (event) {
	if (event.button == 0) {
		dragging = true;
		dragPoint = mouseCoords(event);
	}
}, true);

canvas.addEventListener("mouseup", function (event) {
	if (event.button == 0) {
		dragging = false;
		dragPoint.x = null;
		dragPoint.y = null;
	}
}, true);

canvas.addEventListener("mouseleave", function (event) {
	dragging = false;
	dragPoint.x = null, dragPoint.y = null;
}, true);

canvas.addEventListener("mousemove", function (event) {
	if (dragging && (dragPoint.x !== null) && (dragPoint.y !== null)) {
		var currentDrag = mouseCoords(event);
		var scaleX = sceneWidth() / canvasWidth, scaleY = sceneHeight() / canvasHeight;
		var delta =	{
						x: (currentDrag.x - dragPoint.x) * scaleX,
						y: (currentDrag.y - dragPoint.y) * scaleY
					};
		
		camera.left -= delta.x;
		camera.right -= delta.x;
		camera.top += delta.y;
		camera.bottom += delta.y;
		
		camera.updateProjectionMatrix();
		
		dragPoint = currentDrag;
	}
}, true);

canvas.addEventListener("wheel", function (event) {
	console.log("foo");
	var scale = 1.0 + event.deltaY / 100;
	var wheelPosition = canvasToScene({ x: event.clientX, y: event.clientY });
	var offset =	{	x: (wheelPosition.x - cameraCenter().x) / sceneWidth(),
						y: (wheelPosition.y - cameraCenter().y) / sceneHeight() };
	
	//~ console.log(camera.left, camera.right, camera.top, camera.bottom);
	var zoomWidth = scale * sceneWidth(), zoomHeight = scale * sceneHeight();
	var center = cameraCenter();
	var oldWidth = sceneWidth(), oldHeight = sceneHeight();
	camera.left 	= center.x - zoomWidth / 2 + offset.x * oldWidth * (1 - scale);
	camera.right	= center.x + zoomWidth / 2 + offset.x * oldWidth * (1 - scale);
	camera.top		= center.y + zoomHeight / 2 - offset.y * oldHeight * (1 - scale);
	camera.bottom	= center.y - zoomHeight / 2 - offset.y * oldHeight * (1 - scale);
	camera.updateProjectionMatrix();
	//~ console.log(camera.left, camera.right, camera.top, camera.bottom);
	event.preventDefault();
}, true);

canvas.addEventListener("mousewheel", function (event) {
	var scale = 1.0 + event.wheelDelta / 100;
	var wheelPosition = canvasToScene({ x: event.clientX, y: event.clientY });
	var offset =	{	x: (wheelPosition.x - cameraCenter().x) / sceneWidth(),
						y: (wheelPosition.y - cameraCenter().y) / sceneHeight() };
	
	//~ console.log(camera.left, camera.right, camera.top, camera.bottom);
	var zoomWidth = scale * sceneWidth(), zoomHeight = scale * sceneHeight();
	var center = cameraCenter();
	var oldWidth = sceneWidth(), oldHeight = sceneHeight();
	camera.left 	= center.x - zoomWidth / 2 + offset.x * oldWidth * (1 - scale);
	camera.right	= center.x + zoomWidth / 2 + offset.x * oldWidth * (1 - scale);
	camera.top		= center.y + zoomHeight / 2 - offset.y * oldHeight * (1 - scale);
	camera.bottom	= center.y - zoomHeight / 2 - offset.y * oldHeight * (1 - scale);
	camera.updateProjectionMatrix();
	//~ console.log(camera.left, camera.right, camera.top, camera.bottom);
	event.preventDefault();
}, true);

//~ camera.position.z = 5;

var startTime = new Date();
var frames = 0;

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
	frames++;
}

function getFPS() {
	return 1000 * frames / (new Date() - startTime);
}

render();
