
var LightConfiguration = function() {
	this.shiny = 10;
	this.specularity = 15;
	this.lx = -100;
	this.ly = 100;
	this.lz = 137;
}

var lightConf = new LightConfiguration();
var gui = new dat.GUI();
gui.add( lightConf, "shiny", 0, 10 );
gui.add( lightConf, "specularity", 0, 100 );
gui.add( lightConf, "lx", -100, 100 );
gui.add( lightConf, "ly", -100, 100 );
gui.add( lightConf, "lz", 0, 200 );

///
///
///

var canvasNormal = document.getElementById( "canvas_normal_map" );
canvasNormal.width = canvasNormal.getAttribute( "width" );
canvasNormal.height = canvasNormal.getAttribute( "height" );
var ctxNormal = canvasNormal.getContext( "2d" );

var normals = [];
var normalData = getImageData( document.getElementById( "normal_map" ), ctxNormal ).data;
var nx, ny, nz, magInv;
var n = canvasNormal.width * canvasNormal.height * 4;
for( var i = 0; i < n; i+=4 )
{
	nx = normalData[ i ];
	ny = 255 - normalData[ i + 1 ];
	nz = normalData[ i + 2 ];

	magInv = 1.0 / Math.sqrt( nx * nx + ny * ny + nz * nz );
	nx *= magInv;
	ny *= magInv;
	nz *= magInv;

	normals.push( nx );
	normals.push( ny );
	normals.push( nz );
}


var textureData = getImageData( document.getElementById( "texture" ), ctxNormal ).data;
window.onmousemove = render;

function render( e ) {
	var cx = Math.max( 200, Math.min( e.clientX, 440 ) );
	var cy = Math.max( 150, Math.min( e.clientY, 200 ) );
	drawLight( lightConf.shiny, lightConf.specularity, cx + lightConf.lx, cy + lightConf.ly, lightConf.lz );
}

function drawLight( shiny, specularity, lx, ly, lz ) {
	var imgData = ctxNormal.getImageData( 0, 0, canvasNormal.width, canvasNormal.height );
	var data = imgData.data;

	var i = 0;
	var ni = 0;
	var nx = canvasNormal.width;
	var ny = canvasNormal.height;
	var dx = 0;
	var dy = 0;
	var dz = 0;
	var x, y, vx, vx, vz, magInv, channel;
	for( y = 0; y < ny; y++ ) {
		for( x = 0; x < nx; x++ ) {
			vx = normals[ ni ];
			vy = normals[ ni + 1 ];
			vz = normals[ ni + 2 ];

			if( shiny > 0 || ( ni & 1 == 0 ) ) {
				dx = lx - x;
				dy = ly - y;
				dz = lz;

				magInv = 1.0 / Math.sqrt( dx * dx + dy * dy + dz * dz );
				dx *= magInv;
				dy *= magInv;
				dz *= magInv;
			}

			var dot = dx * vx + dy * vy + dz * vz;
			var spec = Math.pow( dot, 20 ) * specularity;
			spec += Math.pow( dot, 400 ) * shiny;
			var intensity = spec + 0.5;

			for( channel = 0; channel < 3; channel++ ) {
				data[ i + channel ] = Math.round( clamp( textureData[ i + channel ] * intensity, 0, 255 ) );
			}
			i += 4;
			ni += 3;
		}
	}
	ctxNormal.putImageData( imgData, 0, 0 );
}

function clamp( x, min, max ) {
	if( x < min ) return min;
	if( x > max ) return max - 1;
	return x;
}

///
///
///

var displacementSource = document.getElementById( "canvas_displacement_source" );
var displacementMap = document.getElementById( "canvas_displacement_map" );
var displacementTarget = document.getElementById( "canvas_displacement_target" );

fillContext( displacementSource, document.getElementById( "texture" ) );
fillContext( displacementMap, document.getElementById( "displacement_map" ) );

var filter = new filters.DisplacementMap( displacementSource, displacementMap, displacementTarget, new filters.Point(), 15, 15, filters.ColorChannelRED, filters.ColorChannelGREEN );
filter.draw();

function fillContext( canvas, img ) {
	var ctx = canvas.getContext( "2d" );
	ctx.drawImage( img, 0, 0, img.width, img.height );
}

gui = new dat.GUI();
gui.add( filter, "scaleX", -100, 100 ).onChange( updateDisplacement );
gui.add( filter, "scaleY", -100, 100 ).onChange( updateDisplacement );

function updateDisplacement() {
	filter.draw();
}

///
///
///

function getImageData( img, ctx ) {
	ctx.clearRect( 0, 0, img.width, img.height );
	ctx.drawImage( img, 0, 0 );
	return ctx.getImageData( 0, 0, img.width, img.height );
}

