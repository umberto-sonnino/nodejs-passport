var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// schema for our user model
var userSchema = mongoose.Schema({
	local : {
		email: String,
		password: String,
	},
	facebook : {
		id: String,
		token: String,
		email: String,
		name: String
	},
	twitter : {
		id: String,
		token: String,
		displayName: String,
		username: String
	},
	google : {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

// methods
// =======
userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync( password, bcrypt.genSaltSync(8), null);
};

// checking if valid password
// ==========================
userSchema.methods.validPassword = function(password)
{
	return bcrypt.compareSync(password, this.local.password);
};

// create model and expose for our app to see
module.exports = mongoose.model('User', userSchema);