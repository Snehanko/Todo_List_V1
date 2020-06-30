//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Admin-Snehanko:test123@cluster0.a5toi.mongodb.net/todoListDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set('useFindAndModify',false)
const itemSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"welcome To todoList"
});

const item2=new Item({
  name:"Type To enter A new task"
});

const item3=new Item({
  name:"<-- Press here to eneter the details"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);



app.get("/", function(req, res) {
  Item.find({},function(err,item){

    if(item.length===0)
    {
      Item.insertMany([item1,item2,item3],function(err){
        if(err)
        {
          console.log(err);
        }
      
        else{
          console.log("Data Enterred successfully");
        }
      })
      res.redirect("/");
    } 
  else{
      res.render("list", {listTitle: "Today", newListItems: item});
    }
  })
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new list        
          const list = new List({
          name:customListName,
          items:defaultItems
          });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //Show the Found One
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;

  const newItem=new Item({
    name:itemName
  });

  if(listName==="Today")
  {
    newItem.save();

  res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundlist){
      if(!err){
        foundlist.items.push(newItem);
        foundlist.save();
        res.redirect("/"+listName);
      }
      else{
        console.log("Exicuting Error");
      }
    })
  }

  
});

app.post("/delete",function(req,res){
  const itemCheckedId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.deleteOne({_id:itemCheckedId},(err)=>{
      if(err)
      {console.log(err);}
      else{
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemCheckedId}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    })
  }
  
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
