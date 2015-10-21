 
var express = require('express');
var app = express();
var fs = require( 'fs' )
var sys = require( 'sys' )
var execSync = require( 'exec-sync' )
var cors = require( 'cors' )
var exec = require( 'child_process' ).exec;

app.use(cors());

function puts( error, stdout, stderr ) { 
	sys.puts( stdout );
}

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    }
  }
});

app.param( 'amount', /^\-?\d+$/ );
app.param( 'track', /^[a-zA-Z0-9_]+$/ );

app.get( '/zero', function( req, res ) {
	exec( "~/i2ctest ZERO", puts );
	res.json( { 'zero': true } );
} );

app.get( '/move/:amount', function (req, res) {

	var amt = req.params.amount;

	exec("~/i2ctest MOVE " + amt, puts);
  	res.json({ move: amt });
});

app.get( '/eyes/on', function (req, res) {
        exec("~/i2ctest EYES 1", puts);
        res.json( { eyes: 'on' } );
});

app.get( '/eyes/off', function (req, res) {
        exec("~/i2ctest EYES 0", puts);
        res.json( { eyes: 'off' } );
});

app.get( '/eyes/toggle', function (req, res) {
        exec("~/i2ctest TOGGLE", puts);
        res.json( { 'eyes': 'toggled' } );
});

app.get( '/eyes/query', function( req, res ) {
	var status = execSync("~/i2ctest QUERY_EYES" );

	res.json( { 'eyes': /EYES:ON/ig.exec( status ) ? 'ON' : 'OFF' } );
} );

app.get( '/play/:track', function( req, res ) { 
        var track = req.params.track;
	
	var fpath = "~/app/projects/sounds/" + track + ".mp3"

	if( !fs.existsSync( fpath )) {	
        	exec( "mpg321 -g 100 " + fpath, puts );
        	res.json( { 'playing': track } );
	}
	else res.json( { 'error': 'file does not exist' } );
} );

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);

