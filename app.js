//jshint esversion:6
//call back function is the function that will be executed after the execution of its original function

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _=require("lodash");
const mongoose=require("mongoose");
var mysql = require('mysql');
const app = express();
app.set('view engine', 'ejs');//set view engine, so no need to add .ejs at the end

app.use(express.static("public"));//place custom style sheet
app.use(bodyParser.urlencoded({extended: true}));
//app.use(bodyParser.json());


var con = mysql.createConnection({
  host: "la.beta.moe",
   user:"cs631",
  password: "cs631@2019",
  database:"cs631"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

let date_ob = new Date();

var userid="1";
var userpd;
var user_card="12";
var user_SAName="12";

//home page
app.get("/",function(req,res){
  res.render("landing");
});

//all products
app.get("/inventory",function(req,res){
  var sql = "SELECT * FROM PRODUCT";
  con.query(sql, function (err, result) {
   if (err) throw err;
   //console.log(result);
   res.render("inventory",{products:result});
 });
});

//signup
app.get("/signup",function(req,res){
  res.render("signup");
});
app.post("/signup",function(req,res){
  var sql="INSERT INTO `cs631`.`CUSTOMER` (`CID`, `FName`, `LName`, `Email`, `Address`, `Phone`,`PWD`) VALUES ('"+req.body.id+"', '"+req.body.Fname+"', '"+req.body.Lname+"', '"+req.body.Email+"', '"+req.body.Address+"', '"+req.body.phone+"','"+req.body.password+"')";

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to customer");
  });
  //console.log(req.body.id+req.body.password);
  res.render("landing");
});

//signin
app.get("/signin",function(req,res){
  res.render("signin");
});
app.post("/signin",function(req,res){
  userid=req.body.id;
  //console.log(req.body.id);
  //var userpassword=req.body.password;
  res.redirect("/set_default");
});

app.get("/set_default",function(req,res){
  res.render("set_default");
});
app.post("/set_default",function(req,res){
  user_card=req.body.card;
  user_SAName=req.body.address;
  console.log(user_card);
  console.log(user_SAName);
  res.redirect("/inventory");
});

app.get("/userpage",function(req,res){
var info={};
   var sql = "SELECT * FROM CUSTOMER WHERE CID= "+userid+"";
  con.query(sql, function (err, result) {
    if (err) throw err;
    //console.log(result);
    info=result[0];
    res.render("userpage",{id:userid,info:info});
  });
//console.log(info);

});

app.get("/add_card",function(req,res){
  res.render("add_card");
});
app.post("/add_card",function(req,res){
  var sql1="INSERT INTO `cs631`.`CREDIT_CARD` (`CCNumber`, `SecNumber`, `OwnerName`, `CCType`, `CCAddress`,`ExpDate`) VALUES ('"+req.body.CCNumber+"', '"+req.body.SecNumber+"', '"+req.body.OwnerName+"', '"+req.body.CCType+"', '"+req.body.CCAddress+"','"+req.body.ExpDate+"');";

  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to CREDIT_CARD");
  });

  var sql2="INSERT INTO `cs631`.`STORED_CARD` (`CCNumber`, `CID`) VALUES ('"+req.body.CCNumber+"', '"+userid+"');";

  con.query(sql2, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to STORED_CARD");
  });

  res.redirect("/userpage");
});

app.get("/add_shoppingaddr",function(req,res){
  res.render("add_shoppingaddr");
});
app.post("/add_shoppingaddr",function(req,res){
  var sql="INSERT INTO `cs631`.`SHIPPING_ADDRESS` (`CID`, `SAName`, `RecepientName`, `Street`, `SNumber`, `City`, `Zip`, `State`, `Country`) VALUES ('"+userid+"', '"+req.body.SAName+"', '"+req.body.RecepientName+"', '"+req.body.Street+"', '"+req.body.SNumber+"', '"+req.body.City+"', '"+req.body.Zip+"', '"+req.body.State+"', '"+req.body.Country+"');";

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to shoppingingaddr");
    res.redirect("/userpage");
  });
});

app.get("/order",function(req,res){
  var sql1="SELECT PName,PriceSold,Quantity,Tstatus,TDate,PRODUCT.PID FROM  `cs631`.`CART`,`cs631`.`APPEARS_IN`,`cs631`.`PRODUCT` WHERE CART.CartID=APPEARS_IN.CartID AND APPEARS_IN.PID=PRODUCT.PID AND CID="+userid+"";

  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log(result);
    console.log("query order result");
    res.render("order",{items:result});
  });
});
app.post("/order",function(req,res){//add data to cart
  var q_buy=req.body.quantity;
  var id_buy=req.body.pid;
  //user_SAName;
  //user_card;
  //userid;
 //to get a unique cartid
  var cartid=userid+req.body.pid+date_ob.getMinutes();
  var sql1="INSERT INTO `cs631`.`CART` (`CartID`, `CID`, `SAName`, `CCNumber`, `TStatus`, `TDate`) VALUES ('"+cartid+"', '"+userid+"', '"+user_SAName+"', '"+user_card+"', 'paid', '2019-12-12');";

  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to cart");
  });

  var sql2="INSERT INTO `cs631`.`APPEARS_IN` (`CartID`, `PID`, `Quantity`) VALUES ('"+cartid+"', '"+req.body.pid+"', '"+req.body.quantity+"');";

  con.query(sql2, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted to APPEARS_IN");
  });

  //for changing the quantity of product
  var leftq=9999;
  var sql3="SELECT PQuantity FROM PRODUCT WHERE PID='"+req.body.pid+"';";

  con.query(sql3, function (err, result) {
    if (err) throw err;
    console.log(result);
    leftq=result[0].PQuantity-q_buy;
    console.log(leftq);
    console.log("get quantity of product");

    var sql4="UPDATE `cs631`.`PRODUCT` SET `PQuantity` = '"+leftq+"' WHERE (`PID` = '"+id_buy+"');";

    con.query(sql4, function (err, result) {
      if (err) throw err;
      console.log("changed quantity of product");
      res.redirect("/order");
    });
  });

});

app.get("/specialcheck",function(req,res){
  res.render("specialcheck");
});
app.post("/specialcheck_p",function(req,res){
  var name="";
  name=req.body.p_name;
  var sql1="SELECT PName,PPRice,Quantity,Tstatus,TDate,PRODUCT.PID FROM  `cs631`.`CART`,`cs631`.`APPEARS_IN`,`cs631`.`PRODUCT` WHERE CART.CartID=APPEARS_IN.CartID AND APPEARS_IN.PID=PRODUCT.PID AND PName='"+name+"'";

  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log(result);
    console.log("query special check pname result:");
    res.render("checkresult",{items:result});
  });

});
app.post("/specialcheck_c",function(req,res){
  var name="";
  name=req.body.c_name;
  var sql1="SELECT PName,PPRice,Quantity,Tstatus,TDate,PRODUCT.PID FROM  `cs631`.`CART`,`cs631`.`APPEARS_IN`,`cs631`.`PRODUCT` ,`cs631`.`CUSTOMER` WHERE CART.CartID=APPEARS_IN.CartID AND APPEARS_IN.PID=PRODUCT.PID AND CART.CID=CUSTOMER.CID AND FName='"+name+"'";

  con.query(sql1, function (err, result) {
    if (err) throw err;
    console.log(result);
    console.log("query special check cname result:");
    res.render("checkresult",{items:result});
  });
});

app.get("/statistic",function(req,res){
  res.render("statistic");
});

let port=process.env.PORT;
if(port==null||port==""){
  port=3002;
}

app.listen(port, function() {
  console.log("Server started on port 3002~");
});


// app.post("/campgrounds",function(req,res){
//   var name=req.body.name_of_img;
//   var image=req.body.url_of_img;
//   var description=req.body.description;
//
//   res.redirect("campgrounds");
// });
