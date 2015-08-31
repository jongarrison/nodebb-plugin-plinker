(function() {
	'use strict';

	var winston = module.parent.require('winston'),
		async = module.parent.require('async'),
		nconf = module.parent.require('nconf'),
		Meta = module.parent.require('./meta'),
		path = require('path'),
		User = module.parent.require('./user'),
		Posts = module.parent.require('./posts'),
		Topics = module.parent.require('./topics'),
		Privileges = module.parent.require('./privileges'),
		SocketPosts = module.parent.require('./socket.io/posts'),
		templates = module.parent.require('templates.js'),
		app, router,
		fs = require('fs'),
		cachedWidgetTemplates = {};

			//Stuff for topic rendering
			//app = express(),
			//controllers = module.parent.require('./controllers'),//possible double dot ../controllers
			//middleware = module.parent.require('./middleware'),

		function loadWidgetTemplate(template, next) {
			var __dirname = "./node_modules/nodebb-plugin-plinker";
			fs.readFile(path.resolve(__dirname, template), function (err, data) {
				if (err) {
					console.log(err.message);
					return next(null, err);
				}
				next(data.toString());
			});
		}

		var	Plinker = {
			config: function() {
				winston.info("PLINKER - config called");
			},

			staticAppLoad: function(params, callback) {
				var middleware = params.middleware,
						controllers = params.controllers;

				router = params.router;
				app = params.app;

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
				var topicController = controllers.topics;
				//setupPageRoute(router, '/plugin-topic/:topic_id/:slug?', middleware, [], topicController.get);

				var interceptTopicGet = function(req, res, reqNext) {
					var pluginTopicId = 10
					req.params.topic_id = pluginTopicId;

					async.waterfall([
						function(next) {
							Topics.getTopicData([pluginTopicId], next);
						},
						function(topic, next) {
							req.params.slug = topic.slug.replace(/\d+\//g, "");
							winston.info("Intercepted topic request. topic id: " + req.params.topic_id + " (slug from db): " + req.params.slug);
							topicController.get(req, res, reqNext);
						}
					]);
				}

				var customTopicRoute = '/plugin-topic'; //'/plugin-topic/:topic_id/:slug?';
				router.get(customTopicRoute, middleware.buildHeader, [], interceptTopicGet);
				router.get('/api' + customTopicRoute, [], interceptTopicGet);


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
			},

			cacheWidgetTemplate: function(templatePath, templateContents) {
				cachedWidgetTemplates[templatePath] = templateContents;
			},

			defineWidgets: function(widgets, callback) {
				loadWidgetTemplate('./templates/nodebb-plugin-plinker/admin/singlepost.tpl', function(templateData) {
					widgets = widgets.concat([
						{
							widget: "singlepost",
							name: "Single Post Widget",
							description: "Renders the content of a single post",
							content: templateData
						}
					]);

					callback(null, widgets);
				});
			},

			renderSinglePostWidget: function(widget, callback) {
        winston.info("widget input: " + JSON.stringify(widget));

				winston.info("postid: " +  widget.data.postId);

        //'nodebb-plugin-plinker/widgets/singlepost'
				app.render("nodebb-plugin-plinker/widgets/singleposttest", {postid: widget.data.postId }, callback);

			}

		};

		module.exports = Plinker;

})();
