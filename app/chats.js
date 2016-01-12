var Message = require('./models/messages');

module.exports = function(app, passport, squares)
{
	squares.on('connection', function(socket)
	{
		socket.on('addUser', function(data)
		{
			var room = data.room;
			if(room != "" || room != null || room != undefined)
			{
				console.log("Room: " + room);
			}
			socket.username = data.user;
			socket.emit('updateChat', data.user, 'you have connected');
		    // echo globally (all clients) that a person has connected
		    socket.broadcast.emit('updateChat', 'Server', data.user + ' has connected');
		    // update the list of users in the chat, client side
		    // io.sockets.emit('updateUsers', usernames);
		});

		socket.on('news', function(data)
		{
			var room = data.room;
			if(room != "" || room != null || room != undefined)
			{
				console.log("Room: " + room);
			}
			console.log(data.user + " said: " + data.message);

			socket.emit('updateChat', data.user, data.message);
			socket.broadcast.emit('updateChat', data.user, data.message);
		});

		socket.on('disconnect', function()
		{
			console.log(socket.username + " disconnected");
			socket.broadcast.emit('updateChat', 'Server', socket.username + " is now disconnected");
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
    	// If url is http://<...>/get_messages/squareId=Sapienza
		// it'll get the value in the parameter (->Sapienza)
    	var squareId = req.query.squareId;
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
	
	// CHATS
	// =====
	app.use('/chat', function(req, res, next)
	{
		var id = req.query.squareId;

		// io.of("");
		next();
	});
	app.get('/chat', function(req, res)
	{
		// If url is http://<...>/chat?squareId=Sapienza
		// it'll get the value in the parameter (->Sapienza)
		var squareId = req.query.squareId;

		if(squareId == undefined)
		{
			console.log("No Id specified");
			squareId = "Home";
		}
		
		console.log("Currently in " + squareId);

		// var chat = app.io("http://localhost:" + Server.port + "/" + squareId);

		res.render('chat.ejs', 
			//We can pass JS objects to the template
			{
				user: req.user, 
				squareId: squareId
			});
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

