//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Harsimran:1234@cluster0.dosou5z.mongodb.net/todolistDB"); 

const itemSchema = {
  name:String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name:"Welcome to your To Do list"
})

const item2 = new Item({
  name: "Hit the + button to add a new Item"
})

const item3 = new Item({
  name: "<-- Hit this to delete Item"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find().then((foundItems)=>{
    // console.log(foundItems) 
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then(function(){
        console.log("Successfuly save default items to DB");
      })
      .catch(function(err){
        console.log(err); 
      })   
      res.redirect("/");   
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
  })
  .catch((err)=>{
    console.log(err);
  })

});

app.get("/:currentListName",(req,res)=>{
  const customListName = _.capitalize(req.params.currentListName);

  List.findOne({name:customListName}).then((foundList => {
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      }); 
    
      list.save();
      res.redirect("/" + customListName);
    }
    else{
      res.render("list", {listTitle:  foundList.name, newListItems: foundList.items})
    }
  }))


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === date.getDate()){
    item.save();
    res.redirect("/"); 
  }
  else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", (req,res)=>{ 
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; 

  if(listName === date.getDate()){
    const itemToBeDeleted = Item({
      _id: checkedItemId
    });
  
    itemToBeDeleted.deleteOne();
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:checkedItemId}}})
    .then(()=>{
      res.redirect("/" + listName);
    })
  }
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
