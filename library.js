(function() {
	'use strict';

	var winston = module.parent.require('winston'),
		async = module.parent.require('async'),
		nconf = module.parent.require('nconf'),
		Meta = module.parent.require('./meta'),
		User = module.parent.require('./user'),
		Posts = module.parent.require('./posts'),
		Topics = module.parent.require('./topics'),
		Privileges = module.parent.require('./privileges'),
		SocketPosts = module.parent.require('./socket.io/posts');

			//Stuff for topic rendering
			//app = express(),
			//controllers = module.parent.require('./controllers'),//possible double dot ../controllers
			//middleware = module.parent.require('./middleware'),


		var	Plinker = {
			config: function() {
				winston.info("PLINKER - config called");
			},

			staticAppLoad: function(params, callback) {
				var app = params.app,
						router = params.router,
						middleware = params.middleware,
						controllers = params.controllers;


				// Load saved config
				winston.info("PLINKER - app.load called");
				winston.info("PLINKER - nconf:" + nconf.get('url'));

				winston.info("About to register route for rendered page");
				var renderTestTemplate = function(req, res) {
					var templatePath = 'nodebb-plugin-plinker/test';
					winston.info("About to render template: " + templatePath)

					res.render(templatePath, {
						url: nconf.get('url'),
						jgdata: "Some data rendered into things"
					});
				};
				router.get('/plinker-test-page', renderTestTemplate);

				var helpers = module.parent.require('./routes/helpers');
				var setupPageRoute = helpers.setupPageRoute;
				//winston.info("controllers is: " + JSON.stringify(controllers));
				var topicController = controllers.topics;
				//winston.info("topicController is: " + JSON.stringify(topicController));
				setupPageRoute(router, '/plugin-topic/:topic_id/:slug?', middleware, [], topicController.get);

				router.get('/plinker-reset-template-cache', function(req, res) {
					winston.info("Attempting to reset template cache");
					var templates = module.parent.require('templates');
					templates.compile();
					res.sendStatus(200);
				});

				//Done
				if (typeof callback === 'function') {
					callback();
				}
			},

			pluginActivate: function (id) {
				winston.info("PLINKER - Plugin activated: " + id);
				console.log("PLINKER - just get out!");
			},

			filterParsePost: function(input) {
				winston.info("PLINKER post parse");
				//winston.info("PLINKER post parse: " + input.content);
				return input;
			},

			filterSearchQuery:  function(input, callback) {
				winston.info("PLINKER filter Search Query");
				//winston.info("PLINKER filter Search Query input:" + input.content);

				if (typeof callback === 'function') {
					callback();
				}
				return input;
			}

		}

		module.exports = Plinker;

})();
