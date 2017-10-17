var sqlite3 = require("sqlite3");
var readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var db = new sqlite3.Database("e.db");

rl.question("number: ", function (number) {
	rl.question("url: ", function(url){
		try{
			db.run("INSERT INTO special (number,url) VALUES (?, ?)",[number, url]);
			rl.close();
		} catch(e){
			console.log(e);
		}
	});
});

