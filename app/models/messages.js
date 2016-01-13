var mongoose = require('mongoose');
// var User = require('./user');

// schema for our messages model
var messageSchema = mongoose.Schema({
	text: String,
	createdAt : Date,
	senderId: String,
	senderEmail: String,
	squareId: String
	// squareId: [ {type:mongoose.Schema.Types.ObjectId, ref:'Square'}]
});

module.exports = mongoose.model('Message', messageSchema);