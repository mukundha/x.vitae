
/**
 * Module dependencies.
 */

var usergrid = require('usergrid');

var express = require('express')
  , routes = require('./routes')
  ,	register = require('./routes/register')
  , trans = require('./routes/trans')
  , user = require('./routes/user')
  , http = require('http')
  , https = require('https')
  , path = require('path');

var app = express();
var fs = require('fs');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use('/static',express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var client = new usergrid.client ({
  orgName : 'x-vitae',
  appName : 'vitae',
  logging : true,
  buildCurl : false
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(express.methodOverride());
app.use(allowCrossDomain);


var loadUser = function(req, res, next){
  //console.log(req.body.fName);
  var fName = req.body.fName;
  var lName = req.body.lName;
  var email = req.body.email;
  var dob   = req.body.dob;
  var password = req.body.password;
  next ();
};

function createSkill(options, payload){
  console.log('Creating  Skills');
  var req = https.request(options,function(res){
    res.on('err', function(e){
      console.log(e);
    });
    res.on('end', function(){});


  });
  res.write(JSON.stringify(payload));
  req.end();

};

function associateSkill (options){
  console.log('Associating Skills');
  var req = https.request(options, function(res){
    res.on('err', function(e){
      console.log(e);
    });
  });

  res.end();

}



app.get('/', routes.index);

app.get('/register', register.register);

app.get('/users', user.list);


/**
Create User
*/

app.post ('/people', function(req, res){

  var username = req.body.email;
  var payload = req.body;
  payload.username = username;

  var skills = req.body.skills;

  
  var options = {
    method:'POST',
    endpoint:'user',
    body: payload
  };

  client.request(options, function(err, data){
    if (err){
      res.send(400,JSON.stringify(err));
    }
    else {
      if(skills) {
        for(s in skills){
          var _payload = new Object;
          //_payload
        }

      }


      res.send(200, JSON.stringify(data));
    }
  });

});

/**

GET A People Resource

*/

app.get('/people/:id', function(req, res){
  var options = {
    method:'GET',
    endpoint:'user/'+req.params.id,
    
  };
  client.request(options, function(err, data){
    if (err){
      res.send(404);
    }
    else {
      res.send(200, JSON.stringify(data.entities[0]));
    }
  });
});

/*
GET All People Resources.
*/


app.get ('/people', function(req, res){

  var options = {
    method:'GET',
    endpoint:'user'
  };
  client.request(options, function (err, data){
    if (err){
      res.send(400);
    }
    else {
      res.send(200, JSON.stringify(data.entities));
    }
  });


});

/**
get Skill of a USER 
*/

app.get ('/people/:id/skills', function (req , res){
  var options = {
    method: 'GET',
    endpoint:'user/'+req.params.id
  };

  client.request(options, function (err, data){
    if (err){
      res.send(400);
    }
    else {
      var skills = data.entities[0].skill;
      var skillsKey = new Array();
      var i =0;
      if (skills)
      {
        for (s in skills)
        {
          skillsKey[i]=s;
          i++;
        }
      }
      
      res.send(200, skillsKey);
    }
  });
});

/**
Create a JOB
*/

app.post ('/job', function (req, res){
  var options = {
    method:'POST',
    endpoint:'jobs',
    body:req.body
  };

  client.request(options, function (err, data){
    if (err){
      res.send(500);
    }
    else {
      var jobid = new Object;
      jobid.jobid = data.uuid;
      res.send(201,jobid);
    }
  });
});

/**

GET a job by ID
OR WITH FILTER

*/

app.get ('/job/:id', function (req, res){

  var key ;
  
  if (req.query.key) {
    key = new Array();
    key = (req.query.key).split(',');
  }
  

  var options = {
    method : 'GET',
    endpoint: 'jobs/'+req.params.id
  };

  client.request ( options, function ( err, data ){
    if (err){
      res.send(404);
    }
    else {
      if (key){
        var selectiveResponse = new Object();
        var val = data.entities[0];
        for (k in key){
          //k is alway index
          var val = data.entities[0];
          var t = key[k]
          
          if (val[t]) {
            selectiveResponse[t]=val[t];
          }
        }
        res.send(200, JSON.stringify(selectiveResponse));
      }
      else{
        res.send(200, data.entities[0]);
      }
      
    }
  });
});


/**
GET skills required by A JOB
*/

app.get ( '/job/:id/skills', function ( req, res ){

  var options = {
    method: 'GET',
    endpoint: 'jobs/'+req.params.id
  };

  client.request ( options, function ( err, data ) {
    if ( err ){
      res.send (404);
    }
    else {
      res.send (data.entities[0].skills);

    }
  } );

} );

/**
GET ALL JOBS
*/

app.get ('/jobs', function (req, res ) {
  var options = {
    method : 'GET',
    endpoint:'jobs'
  }
  client.request(options, function (err, data ){
    if (err){
      res.send(500);
    }
    else {
      res.send(200, data.entities);
    }

  });
});


/**
USER Apply to job
*/

app.post ( '/job/:id/people/:peopleId/referral', function (req, res){
  
  var jobId = req.params.id;

  var peopleId = req.params.peopleId;

  var applicantId = req.headers.xuser;
  console.log("here: "+applicantId);
  var displayName;
  var uuid;
  var username;
  var email;
  var content;

  //Create Referral
  var payload = new Object();
  payload["status"]="pending";
  payload['user']="/users/"+applicantId;
  payload['job']='/jobs/'+jobId;
  var options = {
    method:'POST',
    endpoint: 'referrals',
    body: payload
  }

  client.request (options, function (err, data){
    if (err){
      res.send(500, 'Error Creating Referral Request');
    }
    else{
      var uuid = data.entities[0].uuid;

      var options = {
        method:'POST',
        endpoint:'users/'+peopleId+'/has/referrals/'+uuid,
        body:''

      };

      client.request(options, function(err, data){
        if (err){
          res.send(500, 'Error Creating Referral in Referer Profile');
        }

      });
    }
  });



  //GET Applicant Data
  var applicantActivity = new Object ();
  var imageOb = new Object();
  var image = new Object();
  image["duration"]=0;
  image["height"] =80;
  image["width"] = 80;


  var options = {
    method:'GET',
    endpoint:'/users/'+applicantId
  };
  client.request (options, function (err, data){
    if (err){
      res.send(404);
    }
    else{
      r = data.entities[0];
      displayName = (r["first-name"]) +" "+(r["last-name"]);
      uuid = r.uuid;
      username = r.username;
      email = r.email;
      content = displayName + " has applied for the Job Posted by you."
      image["url"]= r["picture"];

      // Creating Activity

      var payload = new Object();
      var actor = new Object ();
      actor["displayName"]= displayName;
      actor["uuid"]= uuid;
      actor["username"] = username;
      actor["email"] = email;
      
      //image["url"]=picture;
      actor["image"] = image;

      payload["content"] = content;
      payload["actor"]= actor;
      payload["verb"] = 'post';


      // Creating Activity in Referer Account
      var options = {
        method: 'POST',
        endpoint: 'users/'+peopleId+'/activities',
        body: payload
      };
      

      client.request(options, function ( err, data){
        if(err){
          res.send(500);
        }
        else {
          // Activity Created In referers 
          payload["content"] = "You have applied for A Job";
          //Creating Activity in Applicant's Activity Stream
          var options = {
            method: 'POST',
            endpoint: 'users/'+uuid+'/activities',
            body: payload
          };


          client.request(options, function( err, data){
            if (err){
              res.send(500);
            }
            else {
              res.send(200, 'Connections Created');

            }
          });

        }

      });
      //Success Till Now

    }

  });

});



// Decision on Referal Request, 

app.put('/people/:id/referral/:rid', function (req, res) {
  var payload = new Object();
  payload["status"] = req.query.action;

  
  var options = {
    method: 'PUT',
    endpoint: 'users/'+req.params.id+'/has/referrals/'+req.params.rid,
    body:payload

  };

  client.request(options, function (err, data){
    if (err){
      res.send(400);
    }
    else {
      res.send(200, data);
    }
  });
});




/**
CREATE Public Message for JOB ID
*/

app.post ('/jobs/:id/conversation', function(req, res){

  //Create a Message
  var options = {
    method: 'POST',
    endpoint: 'conversation',
    body: req.body
  };

  client.request(options, function (err, data ){
    if (err){
      res.send(500, 'Could not create conversation.');
    }
    else{
      var uuid = data.entities[0].uuid;

      var options = {
        method: 'POST',
        endpoint:'jobs/'+req.params.id+'/has/conversation/'+uuid,
        body:''
      };
      client.request(options, function (err, data){
        if (err){
          res.send(500,'Error while associating message with the job');

        }
        else{
          res.send(200)
        }
      });

      
    }
  });

});










/**
*/

app.put ('/people/:id',  function (req, res){
  res.send(501);

});

app.post ('/login', function(req, res){
  var output = '';
  var payload = {
    username : req.body.username,
    password : req.body.password,
    grant_type: 'password'
  };

  var options = {
    host : 'api.usergrid.com',
    path : '/mindtreeproject-4418/tech/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'

    }
  };

  var usergrid_req = https.request(options, function (usergrid_res) {
    console.log('Status: '+ usergrid_res.statusCode);
    console.log('headers' + JSON.stringify(usergrid_res.headers));

    usergrid_res.setEncoding('utf8');

    usergrid_res.on('data', function(chunk) {
      output+=chunk;
    });
    usergrid_res.on('end', function (){
      res.send(usergrid_res.statusCode,output);
    });

    usergrid_res.on('error', function(e){
      res.send(401);
    });

  });
  console.log('USERGRID REQUEST: '+JSON.stringify(payload));
  usergrid_req.write(JSON.stringify(payload));
  usergrid_req.end();

  

})

app.post ('/people/:id/skills',function(req,res)
  {
    var options = {
    host : 'api.usergrid.com',
    path : '/mindtreeproject-4418/tech/users/'+req.params.id,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      
    }
  };

  var array= req.body;
  var skills = new Array();
  
  var i =0;
  
  for (var s in array){

    var skill = new Object;
    skill["name"]= array[s];

    /**
    Preparing to Create Skills in master Collection
    */
    var op1 = {
    host : 'api.usergrid.com',
    path : '/mindtreeproject-4418/tech/skills',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      
    }
  };

  /**
    Preparing to Associate users skill
    */

    var op2 = {
    host : 'api.usergrid.com',
    path : '/mindtreeproject-4418/tech/users/'+req.params.id+'/has/skill'+array[s],
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      
    }
  };


/**
    Preparing to Create Skills in master Collection
    */
    
    var sk_req = https.request(op1, function(sk_res){
      console.log("Sending req"+ JSON.stringify("Created Skill in Master Collection: "+op1));
      sk_req.on()


    });

    
    sk_req.write(JSON.stringify(skill));

    var associateSkill_req = https.request(op2, function(associateSkill_res){
      console.log("Sending req"+ JSON.stringify(op2));

    });

    console.log(JSON.stringify(skill));
    skill["rating"]=500;
    
    skills[i]=skill;
    //var r = https.request(op);
    i++;
  }
  

  var u_req = https.request(options, function (u_res){
    console.log("Sending req"+ JSON.stringify(options));

    u_res.setEncoding('utf8');

    u_res.on('data', function(chunk) {
      output+=chunk;
    });
    u_res.on('end', function (){
      console.log(output);
      res.send(u_res.statusCode,output);
    });

    u_res.on('err', function(e){
      res.send(500, "Internal Server Error. No Data Saved"+e);
    });

  });

  u_req.write(JSON.stringify(skills));

  
  

// values are in skills



  });



/**
* /user/:id/experience
*/
app.post('/user/:id/experience');




/**
* /user/:id/jobs
*/

app.post('/trans', function(req, res) {

  console.log(JSON.stringify(req.headers));
  fs.readFile('/Users/appigee/Documents/GIT/NTT/Docomo/Docs/resp.xml', function(err,data){
    if (err){
      res.send(500);
    }
    else
    {
      res.send(200,data);
    }

  });

  
  //res.send('');
});


app.post("/jobs/:jobid/people/:personemail/messages", function (req, res) {
  
  getUserId(req.headers.xuser,function(r){
    if ( !r.err){
      var from = r.entities[0].uuid;
      getUserId(req.params.personemail,function(s){
        if (!s.err){
          var to = s.entities[0].uuid;
          var message = req.body.question;
          createConversationItem(from,to,message,function(p){
            if (!p.err){
              var conversationItemid = p.entities[0].uuid;
              createConversation(function(q){
                if (!q.err){
                  var conversationid = q.entities[0].uuid;
                  linkConversationToConversationItem(conversationid,conversationItemid,function(x){
                    if (!x.err){
                      linkJobToConversation(req.params.jobid,conversationid,function(w){
                        if (!w.err){
                          res.writeHead(200, {'Content-Type':'application/json'}) ;
                          res.end(JSON.stringify({"success":"true"}));
                        }
                      });
                    }
                  });
                }

              }); 
            }
          });
        }
      });
    }
  });
});

app.set('title','Vitae');

function internalReq(options,req,res){
  client.request (options,function(success,response){
    if (!success){
      res.writeHead(200, {'Content-Type':'application/json'}) ;
          res.end(JSON.stringify(response.entities));
    }else{
      res.end(JSON.stringify(response));
    }
});

}

function getUserId(email,callback){

  var options = {
      method:'GET',
      endpoint:'users/'+email
  };
  var uuid = client.request (options, function (err, data){
      if (err){
        callback({'err':'true'});
      }
      else{
        callback(data);
        //return r.uuid;
    }
  });
  
}



function createConversationItem(from,to,text,callback){

  var item = new Object();
  item["from"]="/people/"+from;
  item["to"] = "/people/" + to;
  item["text"] = text;
  var options = {
      'method':'POST',
      'endpoint':'conversationItems/',
      'body':item

  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

function createConversation(callback){

  var item = new Object();
  item["conversationtype"] = 'private';
  var options = {
      'method':'POST',
      'endpoint':'conversations/',
      'body':item

  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

function linkConversationToConversationItem(conversationid, conversationItemid,callback){

  
  var options = {
      'method':'POST',
      'endpoint':'conversations/'+conversationid+'/has/conversationitems/'+conversationItemid
  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

function linkJobToConversation(jobid,conversationid,callback){

  
  var options = {
      'method':'POST',
      'endpoint':'jobs/'+jobid+'/has/conversations/'+conversationid
  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

function linkSentConversation(conversationItemid,from,callback){

  
  var options = {
      'method':'POST',
      'endpoint':'users/'+from+'/sent/conversationitems/'+conversationItemid
  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

function linkReceivedConversation(conversationItemid,to,callback){

  
  var options = {
      'method':'POST',
      'endpoint':'users/'+to+'/received/conversationitems/'+conversationItemid
  };
  client.request (options, function (err, data){
      if (err){
        callback({"err":"true"});
      }
      else{
        callback(data);
    }
  });
  
}

/*
app.use(function(err,req,res, next){
	console.error(err.stack);
	res.send (500,"Server Error");
});*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
