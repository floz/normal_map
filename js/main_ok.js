var MainOK = MainOK || ( function() {

	var _lightConf = null, _canvas = null, _ctx = null, _imgDrop = null, _imgNormal = null,
		_normals = [], _dataNormal = null, _dataTexture = null;

	function init() {
		_lightConf = new LightConfiguration();
		var gui = new dat.GUI();
		gui.add( _lightConf, "shiny", 0, 10 );
		gui.add( _lightConf, "specularity", 0, 100 );
		gui.add( _lightConf, "lx", -100, 100 );
		gui.add( _lightConf, "ly", -100, 100 );
		gui.add( _lightConf, "lz", 0, 200 );

		_canvas = document.getElementById( "canvas" );
		_canvas.width = 235;
		_canvas.height = 235;
		_ctx = _canvas.getContext( "2d" );

		_imgDrop = document.getElementById( "img_drop" );
		_imgNormal = document.getElementById( "img_normal" );

		_ctx.clearRect( 0, 0, _imgNormal.width, _imgNormal.height );
		_ctx.drawImage( _imgNormal, 0, 0, _imgNormal.width, _imgNormal.height );
		_dataNormal = _ctx.getImageData( 0, 0, _imgNormal.width, _imgNormal.height ).data;

		var nx = 0, ny = 0, nz = 0, magInv = 0,
			i = 0, n = _imgNormal.width * _imgNormal.height * 4;
		for( ; i < n; i += 4 ) {
			nx = _dataNormal[ i ];
			ny = 255 - _dataNormal[ i + 1 ];
			nz = _dataNormal[ i + 2 ];

			magInv = 1.0 / Math.sqrt( nx * nx + ny * ny + nz * nz );
			nx *= magInv;
			ny *= magInv;
			nz *= magInv;

			_normals.push( nx );
			_normals.push( ny );
			_normals.push( nz );
		}

		_ctx.clearRect( 0, 0, _imgNormal.width, _imgNormal.height );
		_ctx.drawImage( _imgDrop, ( _imgNormal.width - _imgDrop.width ) * .5, ( _imgNormal.height - _imgDrop.height ) * .5 );//( _imgNormal.width - _imgDrop.width ) >> 0, ( _imgNormal.height - _imgDrop.height ) >> 0 );
		_dataTexture = _ctx.getImageData( 0, 0, _imgNormal.width, _imgNormal.height ).data;

		window.onmousemove = render;
	}

	function render( e ) {
		var cx = e.clientX,
			cy = e.clientY;

		drawLight( _lightConf.shiny, _lightConf.specularity, cx + _lightConf.lx, cy + _lightConf.ly, _lightConf.lz );
		// _ctx.drawImage( _imgDrop, ( _imgNormal.width - _imgDrop.width ) * .5, ( _imgNormal.height - _imgDrop.height ) * .5 );//( _imgNormal.width - _imgDrop.width ) >> 0, ( _imgNormal.height - _imgDrop.height ) >> 0 );)
	}

	function drawLight( shiny, specularity, lx, ly, lz ) {
		var imgData = _ctx.getImageData( 0, 0, _imgNormal.width, _imgNormal.height );
		var data = imgData.data;

		var i = 0, ni = 0, nx = _imgNormal.width, ny = _imgNormal.height,
			dx = 0, dy = 0, dz = 0,
			x, y, vx, vx, vz, magInv, channel;
		for( y = 0; y < ny; y++ ) {
			for( x = 0; x < nx; x++ ) {
				vx = _normals[ ni ];
				vy = _normals[ ni + 1 ];
				vz = _normals[ ni + 2 ];

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
					data[ i + channel ] = Math.round( clamp( _dataTexture[ i + channel ] * intensity, 0, 255 ) );
				}
				i += 4;
				ni += 3;
			}
		}
		_ctx.putImageData( imgData, 0, 0 );
	}

	function clamp( x, min, max ) {
		if( x < min ) return min;
		if( x > max ) return max - 1;
		return x;
	}

	$( document ).ready( init );

})();

var LightConfiguration = function() {
	this.shiny = 10;
	this.specularity = 70;
	this.lx = 60;
	this.ly = -100;
	this.lz = 85;
}