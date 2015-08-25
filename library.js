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
		SocketPosts = module.parent.require('./socket.io/posts'),
		Plinker = {
			config: function() {
				winston.info("PLINKER - config called");
			},

			init: function (data, callback) {
				// Load saved config

				winston.info("PLINKER - init called");
				winston.info("PLINKER - nconf:" + nconf.get('url'));

				winston.info("About to register route for rendered page");

				var render = function(req, res) {
					var templatePath = 'nodebb-plugin-plinker/test';
					winston.info("About to render template: " + templatePath)

					res.render(templatePath, {
						url: nconf.get('url'),
						jgdata: "Some data rendered into things"
					});
				};

				data.router.get('/plinker-test-page', render);


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
