var http 		= require("https");
var schedule 	= require("node-schedule");
var sqlite3 	= require("sqlite3");
var read 		= require("read-file");

//var UAToken = "EAACpaYec9B4BAOPuwLw4p3lP7iMuAUq16PYZBNw6vVQMjjHpxa3Kdlok3VcvZCQj5De9cZAhwrRwGz17GCEUphQY9T2d1gYbxaOZAzyZBZCISfTTP0w76IEgrJLlap5uHY3zXw7O65P2UXHaH344kv9bYEilUkj1eWgp3hggmekW1WTi2JU7ZBogipLC3tSgNYZD";
//var PageUA = "EAACpaYec9B4BAN8mbuDfZCAlt8EG8GOH9vTxclxS6lajCH4i1MB5ytzgBEGSchn7EOqL2AZC4at3CZB2xZB6ZAFw2D2nLN24HGSV1gMReBZCqIQdfZCZCmR9fbzAELtSZCHTMc5i7ZA0hZC5dG038tyGjF6lxRHDNKSvsJ1wrlpG2b2yRl5v4206dB5j2gDCFPFNrF7KuZCDKljcIwZDZD";
//next digit of e UA


console.log("started next-digit-of-e");

var notify = schedule.scheduleJob("0 */3 * * * *", function(){
	//console.log("l");
	//var d = new Date();
	//console.log(d.getHours(), d.getMinutes());
});

function postToFacebook(PageUA){
	//console.log("ex", (new Date()).getHours(), (new Date()).getMinutes());
	var nodeID = "1285032391579894";
	//var PageUA = "EAACpaYec9B4BADx7wiJprURZCkPF8xqMukv075skvHVOZAYoy4zujgKpUloZCiOgNW6tYmUeBwQ8UxJK953EAsbB1ON0nFaVWwlwMs25sG5CiPcGxxx24fj8V1ZCZAZB3hxnOuipIqhAJbvufrOlH47HxKx99EfZC6NjWsJWSlJTQsfZBYvRleUjWufg9iIBsjYZD";

	
	//var ignore = read.sync("./ignore.txt");
	//ignore = ignore.split(" ");

	//læs e.txt og hav den i memory midlertidigt
	read("e.txt", "utf8", function(err, buffer){
		//læs hvor langt vi er nået i databasen
		var db = new sqlite3.Database("e.db");

		var specialIsSet = false;
		var specialUrl;



		db.all("SELECT * FROM progress WHERE id = 1", 
			function(err, rows){
				if(err){
					throw err;
				}

				var thisDigit = buffer.substring(rows[0].progress,rows[0].progress+1);

					db.all("SELECT * FROM special", function(err1, specialRows){
						if(err1){
							throw err1;
						}

						//console.log(specialRows);

						for (var i = specialRows.length - 1; i >= 0; i--) {
							if(specialRows[i].number == parseInt(rows[0].progress)+1){

								console.log("special url found: " + specialRows[i].url);

								specialUrl = specialRows[i].url;
								specialIsSet = true;
								break;
							}
						}

					});

				//opdater databasen
				db.run("UPDATE progress SET progress= "+ 
					(parseInt(rows[0].progress)+1) 
					+" WHERE id = 1"
				);

				//luk databsen
				db.close();

				//send post til facebook med det nye billede 
				//og besked om hvor lang vi er
				//console.log(rows[0].progress+1 + " = " +thisDigit);
				var dontpost = false;
				/*for (var i = ignore.length - 1; i >= 0; i--) {
					
					if((parseInt(rows[0].progress)+1).toString() == ignore[i]){
						dontpost = true;
						break;
					}
				}
				*/
				
				if(!dontpost){
					var photoURL;

					if(specialIsSet){
						photoURL = specialUrl;
					}else{
						photoURL = "http://klat9.org/numbers/"+ thisDigit +".png";
					}

					var post_options = {
				      host: 'graph.facebook.com',
				      path: '/'+ nodeID +'/photos?url='+ photoURL
				      +'&message=The%20'+ numberEnding((parseInt(rows[0].progress)+1)) +"%20digit%20of%20e."
				      +'&access_token=' + PageUA,
				      method: 'POST'
				      
				  	};

				  	var post_req = http.request(post_options, function(res) {
				      res.setEncoding('utf8');
				      res.on('data', function (chunk) {
				          console.log('Response: ' + chunk);
				      });
				  });

				  // post the data
				  
				  post_req.end();




			} else{
				console.log(thisDigit);
			}

			});
	});
}


//sæt interval så den poster hver hele time
var post = schedule.scheduleJob("0 0 * * * *", function(){
	postToFacebook(read.sync("./PageToken"));
});

function reset(){
	var db1 = new sqlite3.Database("e.db");
	db1.run("UPDATE progress SET progress = 0 WHERE id = 1");
	db1.close();
}

function numberEnding(number){
	number = number.toString();
	var lastNumber = number.toString().charAt(number.length - 1);
	var lastTwoNumbers = number.toString().substring(number.length-2, number.length);
	console.log(lastNumber);
	if(lastTwoNumbers == "11" || lastTwoNumbers == "12" || lastTwoNumbers == "13"){
		return number + "th";
	} else if(lastNumber == "1"){
		return number + "st";
	} else if(lastNumber == "2"){
		return number + "nd";
	}
	else if(lastNumber == "3"){
		return number + "rd";
	} else {
		return number + "th";
	}
}



/*
PLAY AREA
*/

//postToFacebook();
