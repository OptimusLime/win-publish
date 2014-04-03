//We must test the ability to generate genotypes, force parents, and create valid offspring according to the schema

var assert = require('assert');
var should = require('should');
var colors = require('colors');
var Q = require('q');

var util = require('util');

var winpublish = require('..');
var wMath = require('win-utils').math;
var uuid = require('win-utils').cuid;
var winback = require('win-backbone');

var backbone, generator, backEmit, backLog;
var evoTestEnd;
var count = 0;

var emptyModule = 
{
	winFunction : "test",
	eventCallbacks : function(){ return {}; },
	requiredEvents : function() {
		return [
        "publish:publishArtifacts"
			];
	}
};

var sampleSchema = {
    sample : "string"
};

var cIx = 0;

describe('Testing win-publish for: ', function(){

    //we need to start up the WIN backend
    before(function(done){

    	//do this up front yo
    	backbone = new winback();


    	var sampleJSON = 
		{
			"win-publish" : winpublish,
			"test" : emptyModule
		};
		var configurations = 
		{
			"global" : {
                "server" : "http://localhost",
                "port" : "3000"
			},
			"win-publish" : {
				logLevel : backbone.testing
			}
		};

    	backbone.logLevel = backbone.testing;

    	backEmit = backbone.getEmitter(emptyModule);
    	backLog = backbone.getLogger({winFunction:"mocha"});
    	backLog.logLevel = backbone.testing;

    	//loading modules is synchronous
    	backbone.loadModules(sampleJSON, configurations);

    	var registeredEvents = backbone.registeredEvents();
    	var requiredEvents = backbone.moduleRequirements();
    		
    	backLog('Backbone Events registered: ', registeredEvents);
    	backLog('Required: ', requiredEvents);

    	backbone.initializeModules(function()
    	{
    		backLog("Finished Module Init");
 			done();
    	});

    });

    it('saving artifacts in win database',function(done){

        var artType = "picArtifact";

        var obs = {genome: {}, meta: {title: "snazzy", tags: ["super", "duper", "suave"], likeCount: 0, likes: []}};

        var nodes = [];
        var nCount = 3 + wMath.next(10);
        for(var i=0; i < nCount; i++)
            nodes.push({gid: "" + i, nodeType: "what-" + i});

        var connections = [];
        var cCount = 2 + wMath.next(8);
        for(var i=0; i < cCount; i++)
            connections.push({gid: "" + (i + nCount), sourceID: "" + wMath.next(nCount), targetID: "" + wMath.next(nCount)});

        //now we have a genome!
        obs.genome.nodes = nodes;
        obs.genome.connections = connections;
        obs.genome.wid = uuid();
        obs.genome.dbType = "simpleReference";
        obs.genome.parents = [];

        obs.wid = uuid();
        obs.dbType = artType;
        obs.parents = [];


        //just publish everything for now!
        var session = {sessionID: uuid(), publish: true};

        backEmit("publish:publishArtifacts", artType, session, [obs], [], function(err){

            if(err)
                done(new Error(err));
            else{

                backLog("Successfully published!");
                done();
            }

        })

    });

});







