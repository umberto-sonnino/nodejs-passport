var mongoose = require('mongoose');

// schema for our messages model
var squareSchema = mongoose.Schema({
	squareName: String, // TODO make this unique (?)
	location: {
		x: Number,
		y: Number
	}
});

module.exports = mongoose.model('Square', squareSchema);