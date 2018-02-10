"use strict";
var http = require("http");
var DesignNote = require ("./designNotes.js");
var pageUrl = "http://www.dragonfable.com/gamedesignnotes/"
var codeString = "";

var response = http.get(pageUrl, function(response){
	response.setEncoding("utf8");
	response.on("error", console.error);
	response.on("data", function(data){
		codeString += data;
	});
	response.on("end", function(){
		var stringArray = codeString.split("<td align=\"center\" valign=\"top\">");
		var currentPosts = [];
		for(var i = 1; i < (stringArray.length - 1); i++){
			currentPosts[i-1] = new DesignNote(stringArray[i]);
		}
		for(var i = 0; i < currentPosts.length; i++){
			console.log("\n------------------------------------------\n" + currentPosts[i].text + "\n------------------------------------------\n");
		}
	});
}).on("error", console.error);
