const createError = require('http-errors');
const express = require('express');
const Ultralight = require('./controllers/ultraLight');

const iot = express();
const ultraLightRouter = express.Router();

// The Ultralight router is responding to Southbound commands only.
// Therefore we need a route for each actuator
ultraLightRouter.post('/iot/bell:id', Ultralight.bellCommand);
ultraLightRouter.post('/iot/door:id', Ultralight.doorCommand);
ultraLightRouter.post('/iot/lamp:id', Ultralight.lampCommand);
// The motion sensor offers no commands, hence it does not need an endpoint.


// parse everything as a stream of text
function rawBody(req, res, next) {
  req.setEncoding('utf8');
  req.body = '';
  req.on('data', function(chunk) {
    req.body += chunk;
  });
  req.on('end', function(){
    next();
  });
}

iot.use(rawBody);
iot.use('/', ultraLightRouter);

// catch 404 and forward to error handler
iot.use(function(req, res) {
	res.status(404).send(new createError.NotFound());
});


module.exports = iot;
