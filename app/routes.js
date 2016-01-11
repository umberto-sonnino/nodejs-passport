// app/routes

var Message = require('./models/messages');
 
module.exports = function(app, passport)
{
	//HOME PAGE
	app.get('/', function(req, res)
	{
		console.log("BODY =====\n" + req.body);
		res.render('index.ejs'); //load index.ejs file
	});

	// LOGIN
	// =====
	app.get('/login', function(req,res)
	{
		//flash any data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', 
	{
		successRedirect : '/profile',
		failureRedirect : '/login',
		failureFlash : true
	}));
	
	app.get('/signup', function(req,res)
	{
		//flash any data if it exists
		res.render('signup.ejs', {message: req.flash('signupMessage')});
	});

	//process signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile', //redirect to the profile section
		failureRedirect: '/signup', //redirect back to the signup page if there's an error
		failureFlash: true //allow flash messages
		}));

	// PROFILE SECTION
	// ===============
	app.get('/profile', isLoggedIn, function(req,res)
	{
		res.render('profile.ejs', {
			user: req.user //get the user from the session and pass to template
		});
	});

	// FACEBOOK ROUTES
	// ===============
	app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/profile',
		failureRedirect : '/'
	}));

	// TWITTER ROUTES
	// ==============
	app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));


	// GOOGLE ROUTES
	// ==============
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
	
	// CONNECTION OF ACCOUNTS (AUTHORIZE)
	// ==================================
	// LOCAL
	app.get('/connect/local', function(req, res)
	{
		res.render('connect-local.ejs', {message: req.flash('loginMessage')});
	});
	app.post('/connect/local', passport.authenticate('local-signup', 
	{
		successRedirect: '/profile',
		failureRedirect: '/connect/local',
		failureFlash: true
	}));

	// FACEBOOK
	// => authentication
	app.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));
	// => handle callback
	app.get('/connect/facebook/callback', passport.authorize('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));
	
	// TWITTER
	// => authentication
	app.get('/connect/twitter', passport.authorize('twitter', {scope: 'email'}));
	// => callback
	app.get('/connect/facebook/callback', passport.authorize('twitter', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	// GOOGLE
	// => authentication
	app.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}));
	// => callback
	app.get('/connect/google/callback', passport.authorize('google', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));

	// LOGOUT
	// ======
	app.get('/logout', function(req, res)
	{
		req.logout();
		res.redirect('/');
	});

	// =============================================================================
	// UNLINK ACCOUNTS =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // Send messages
    app.get('/send_message', isLoggedIn, function(req, res)
    {
		var mes = new Message();
		var email = (function()
		{
			if(req.user.local.email)
				return req.user.local.email;
			if(req.user.facebook.email)
				return req.user.facebook.email;
			if(req.user.google.email)
				return req.user.google.email;
		}) ();

    	mes.text = "I am a new message";
    	mes.createdAt = (new Date()).getTime();
    	mes.senderId = req.user.id;
    	mes.senderEmail = email;
    	mes.squareId = "#Google Workshop";

    	mes.save(function(err)
    	{
    		if(err) throw err;
    		console.log(mes);
    	});

		res.send(req.user + " created a new message!");
    });
	
    app.get('/get_messages', isLoggedIn, function(req, res)
    {
    	var squareId = req.param('squareId');
    	var senderId = req.user.id;
    	
    	if(senderId && squareId)
    	{
	    	console.log(squareId);
	    	console.log(senderId);

	    	var params = { 'senderId':senderId, 'squareId':squareId };
	    	
	    	var query = findMessages(params, res);
	    	query.exec(
	    		function(err,messages)
		    	{
		    		if(err) throw err;

		    		res.send(messages[0]);
		    	});

    	}else if(senderId)
    	{
    		console.log(senderId);
	    	var params = { 'senderId':senderId };
			var query = findMessages(params, res);
	    	query.exec(
	    		function(err,messages)
		    	{
		    		if(err) throw err;

		    		res.send(messages[0]);
		    	});

    	}else if(squareId)
    	{
    		console.log(squareId);
	    	var params = { 'squareId':squareId};
	    	var query = findMessages(params, res);
	    	query.exec(
	    		function(err,messages)
		    	{
		    		if(err) throw err;

		    		res.send(messages);
		    	});

    	}
    	else
    	{
    		console.log("No parameters!");
			var query = findMessages({}, res);
	    	query.exec(
	    		function(err,messages)
		    	{
		    		if(err) throw err;

		    		res.send(messages);
		    	});

	    }
    });
};

function isLoggedIn(req, res, next)
{
	//if user is auth-ed, go on
	if(req.isAuthenticated())
		return next();

	// else redirect to home page
	res.redirect('/');
}

function findMessages(params)
{
	var vals = 	Message.find(params);
	return vals;
}