var mongoose = require('mongoose');

// schema for our messages model
var messageSchema = mongoose.Schema({
	text: String,
	createdAt : Date,
	senderId: String,
	senderEmail: String,
	squareId: String
});

module.exports = mongoose.model('Message', messageSchema);