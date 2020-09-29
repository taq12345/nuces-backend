var express = require('express');
var bodyParser = require('body-parser')
var mysql = require('mysql');

var app = express();

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

var db = mysql.createConnection({
  host: "nuces-db-1",
  user: "root",
  password: "shooting",
  database : "test"
});

db.connect(function(err) {
	  if(err){
		     throw err
		    }
	  console.log('mysql connected')
	  });


var server = app.listen('8080', () => {
  console.log("listening to 8080")
});

//app.use(express.static('../../NUCES Circle'));

app.get('/test', function (req,res){
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    console.log("test succeeded")
	  res.send(["success", "hello world"]);
});

app.post('/addUser/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  let sql = 'INSERT INTO user (fName, lName, email, password, type) VALUES ?';
  var item = req.body;
  var values = [[item.fName, item.lName, item.email, item.pass, item.type]];

  //make checks here...passes matching etc
  db.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log(result);
    res.send(["success",result.insertId]);
  });

 // let sql = 'insert into qualifications (id,accomplishments,skills,interests,semesterProjects,graduation) values (7,'a lot', 'something', 'not much', 'games', '2020-01-01');';
});

app.post('/login/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'SELECT id,email,type, password from user where email = \'' + item.email + '\' and password = \'' + item.pass +'\'';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results[0].id,results[0].type]);
    }
    else
    {
      res.send(["fail", 0]);
    }
  });
});

app.post('/loginWithFb/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'SELECT * from user where email = \'' + item.email + '\'';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      console.log("wrong success")
      res.send(["success", results[0].id]);
    }
    else
    {
      let sql = 'INSERT INTO user (fName, lName, email, password, type) VALUES ?';
      var values = [[item.fName, item.lName, item.email, 'facebook', 1]];
      db.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send(["success",result.insertId]);
      });
    }
  });
});

app.post('/postStatus/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  var item = req.body;
  let sql = 'INSERT INTO statuses (userid, status, time) VALUES ?';
  var values = [[item.id, item.status, dateTime]];
  db.query(sql, [values], function (err, results) {
    if (err) throw err;
    res.send("success");
  });
});

app.post('/getStatuses/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'Select id,FName,LName, status,time from user join (SELECT userid, status, time from statuses where userid = ' + item.id + ' or userid in (select id2 from connections where id1 = ' + item.id + ' and status = \'approved\') or userid in (select id1 from connections where id2 = ' +item.id+ ' and status = \'approved\')) as tStatuses on user.id = userid ORDER BY time DESC;';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/getSuggestions/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select id, FName, LName, Email from user where id != ' + item.id + ' and type = 1 and id not in (select id1 from connections where id1= ' + item.id + ' or id2 = ' + item.id + ') ' + 'and id not in (select id2 from connections where id1=' + item.id + ' or id2 = ' +item.id +')' ;
  // and id not in (select id2 from connections where id1=' + item.id + 'or id2 = ' +item.id +')';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/requestUser/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'INSERT into connections (id1,id2,status) VALUES (' + item.id + ',' + item.hisId + ',\'pending\')';
  db.query(sql, function (err, results) {
    if (err) throw err;
    res.send("success");
  });
});

app.post('/getRequests/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select id,FName,LName,Email from user where id in (select id1 from connections where id2 = ' + item.id + ' and status = \'pending\')';
  // and id not in (select id2 from connections where id1=' + item.id + 'or id2 = ' +item.id +')';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/acceptUser/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'UPDATE connections set status = \'approved\' where id1 = ' + item.hisId + ' and id2 = ' + item.id;
  db.query(sql, function (err, results) {
    if (err) throw err;
    res.send("success");
  });
});

app.post('/getApproved/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select FName,LName,Email from user where id in (select id2 from connections where id1 = ' + item.id + ' and status = \'approved\') or id in (select id1 from connections where id2 = ' + item.id + ' and status = \'approved\')';
  // and id not in (select id2 from connections where id1=' + item.id + 'or id2 = ' +item.id +')';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/getPending/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select id,FName,LName,Email from user where id in (select id2 from connections where id1 = ' +item.id + ' and status = \'pending\')';
  // and id not in (select id2 from connections where id1=' + item.id + 'or id2 = ' +item.id +')';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/cancelUser/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'delete from connections where id1 = ' + item.id + ' and id2 = ' + item.hisId;
  db.query(sql, function (err, results) {
    if (err) throw err;
    res.send("success");
  });
});

app.post('/getProfile/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select * from qualifications join user on user.id = ' + item.id + ' and qualifications.id = ' + item.id;
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/postJob/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'INSERT INTO jobs (userid, title, description, discipline,experience,tags) VALUES ?';
  var values = [[item.id, item.title, item.desc, item.disc,item.exp,item.tags]];
  db.query(sql, [values], function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send("success");
  });
});

app.post('/getRecruits/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select userId, FName, LName, Skills, Interests, Graduation,jobId, title from user join (select * from qualifications right join (select jobs.jobid,title,applicants.userId from jobs join applicants on jobs.jobId = applicants.jobId where jobs.userId = ' +item.id + ') as temp on temp.userId = qualifications.id) as temp2 on user.Id = temp2.id order by jobid asc';

  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/getJobs/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'select * from jobs where jobId not in (select jobId from applicants where userId = ' +item.id + ') order by jobid desc';

  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.post('/applyJob/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'INSERT INTO applicants (jobId, userId) values (' + item.jobId + ', ' + item.userId + ')';
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send("success");
  });
});

app.post('/editProfile/', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  let sql = 'insert into qualifications (id, accomplishments,skills,interests,semesterprojects,graduation) VALUES  ?';
  var values = [[item.id, item.acc, item.skills, item.interests,item.projects,item.grad]];
  db.query(sql, [values], function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send("success");
  });
});

app.get('/showProfile/id/:id/fName/:fName', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  //also include connections posts
  let sql = 'select id, fname,lname,email from user where id = ' + req.params.id + ' or fname = ' + '\'' + req.params.fName +'\'';

  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(results);
    }
  });
});

app.get('/postStatus/id/:id/status/:status', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  var item = req.body;
  let sql = 'INSERT INTO statuses (userid, status, time) VALUES ?';
  var values = [[req.params.id, req.params.status, dateTime]];
  db.query(sql, [values], function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send("success");
  });
});

app.get('/getStatuses/id/:id', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'Select id,FName,LName, status,time from user join (SELECT userid, status, time from statuses where userid = ' + req.params.id + ' or userid in (select id2 from connections where id1 = ' + req.params.id + ' and status = \'approved\') or userid in (select id1 from connections where id2 = ' +req.params.id+ ' and status = \'approved\')) as tStatuses on user.id = userid ORDER BY time DESC;';
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.get('/delStatus/id/:id', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var item = req.body;
  //also include connections posts
  let sql = 'delete from statuses where statusId = ' + req.params.id;
  
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    if (results.length > 0)
    {
      res.send(["success", results]);
    }
  });
});

app.get('/updateStatus/id/:id/status/:status', function (req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  var item = req.body;
 // let sql = 'INSERT INTO statuses (userid, status, time) VALUES ?';
    let sql = 'update statuses set status = ' + '\'' + req.params.status + '\'' + ', time = ' + '\'' + dateTime + '\'' + ' where statusid = ' + req.params.id
  db.query(sql, function (err, results) {
    if (err) throw err;
    console.log(results);
    res.send("success");
  });
});
