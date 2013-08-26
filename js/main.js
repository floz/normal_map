
var LightConfiguration = function() {
	this.shiny = 3;
	this.specularity = 20;
	this.lx = 50;
	this.ly = 50;
	this.lz = 100;
}

var lightConf = new LightConfiguration();
var gui = new dat.GUI();
gui.add( lightConf, "shiny", 0, 10 );
gui.add( lightConf, "specularity", 0, 100 );
gui.add( lightConf, "lx", -100, 100 );
gui.add( lightConf, "ly", -100, 100 );
gui.add( lightConf, "lz", -500, 500 );

//
//
//

var canvas = document.getElementById( "canvas_normal_map" );
canvas.width = canvas.getAttribute( "width" );
canvas.height = canvas.getAttribute( "height" );
var ctx = canvas.getContext( "2d" );

var normals = [];
var normalData = getImageData( document.getElementById( "normal_map" ) ).data;
var nx, ny, nz, magInv;
var n = canvas.width * canvas.height * 4;
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


var textureData = getImageData( document.getElementById( "texture" ) ).data;
canvas.onmousemove = render;

function getImageData( img ) {
	ctx.clearRect( 0, 0, img.width, img.height );
	ctx.drawImage( img, 0, 0 );
	return ctx.getImageData( 0, 0, img.width, img.height );
}

function render( e ) {
	drawLight( lightConf.shiny, lightConf.specularity, e.clientX + lightConf.lx, e.clientY + lightConf.ly, lightConf.lz );
}

function drawLight( shiny, specularity, lx, ly, lz ) {
	var imgData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
	var data = imgData.data;

	var i = 0;
	var ni = 0;
	var nx = canvas.width;
	var ny = canvas.height;
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
	ctx.putImageData( imgData, 0, 0 );
}

function clamp( x, min, max ) {
	if( x < min ) return min;
	if( x > max ) return max - 1;
	return x;
}

