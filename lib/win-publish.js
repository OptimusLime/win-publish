//superagent handles browser or node.js requests
//thank you tjholowaychuk
var request = require('superagent');

//now we're ready to get into this module
module.exports = winpublish;

function winpublish(backbone, globalConfig, localConfig)
{
	//pull in backbone info, we gotta set our logger/emitter up
	var self = this;

	self.winFunction = "publish";

	//this is how we talk to win-backbone
	self.backEmit = backbone.getEmitter(self);

	//grab our logger
	self.log = backbone.getLogger(self);

	//only vital stuff goes out for normal logs
	self.log.logLevel = localConfig.logLevel || self.log.normal;

	//we have logger and emitter, set up some of our functions

	if(!globalConfig.server)
		throw new Error("Global configuration requires server location and port")

	self.hostname = globalConfig.server;
	self.port = globalConfig.port;
	
	//what events do we need?
	//none for now, though in the future, we might have a way to communicate with foreign win-backbones as if it was just sending
	//a message within our own backbone -- thereby obfuscating what is done remotely and what is done locally 
	self.requiredEvents = function()
	{
		return [
		];
	}

	//what events do we respond to?
	self.eventCallbacks = function()
	{ 
		return {
			"publish:publishArtifacts" : self.publishArtifacts
		};
	}

	var baseWIN = function()
	{
		return self.hostname + (self.port ? ":" + self.port : "") + "/api";
	}

	self.getWIN = function(apiPath, data, resFunction)
	{
		var base = baseWIN();

		request
		  .get(base + apiPath)
		  // .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}

	self.postWIN = function(apiPath, data, resFunction)
	{
		var base = baseWIN();

		request
		  .post(base + apiPath)
		  .send(data)
		  .set('Accept', 'application/json')
		  .end(resFunction);
	}

	//publish many at a time! Heading out to the internet thank you
	self.publishArtifacts = function(type, session, individuals, privateIndividuals, finished)
	{
		//need to hit the server for certain behavior
		var apiPath = '/artifacts';
		
		var artifacts = individuals;
		var privateArtifacts = privateIndividuals;
		//artifacts going in must be in an array -- this will change in the future 
		//for backwards compat, it is what it is

		// if(Array.isArray(individuals, privateIndividuals))
		// {
		// 	artifacts = {};
		// 	for(var i=0; i < individuals, privateIndividuals.length; i++)
		// 	{
		// 		var ind = individuals, privateIndividuals[i];
		// 		artifacts[ind.wid] = ind;
		// 	}
		// }

		var data = {artifacts: artifacts, privateArtifacts: privateArtifacts, artifactType: type, user: '', sessionID: session.sessionID, publish: session.publish};

		self.postWIN(apiPath, data, function(err, res)
		{
			self.log("Artifact return: ", err, " res: ", res.error);
			if(err)
			{
				finished(err);
				return;
			}
			else if(res.statusCode == 500 || res.statusCode == 404)
			{
				finished("Server failure: " + JSON.stringify(res.error) + " | message: " + err.message);
				return;
			}


			//otherwise, all good
			finished();

			//maybe wwe do other things, don't know yet
		});
	}

	return self;
}




