//===================================
// Dependencies
//===================================
require('dotenv').config()

const express = require('express')

const morgan = require('morgan')

const methodOverride = require('method-override')

const mongoose = require('mongoose')

// ==================================
// Database Connection
// ==================================

const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(DATABASE_URL, CONFIG)

mongoose.connection
  .on("open", () => console.log('Connected to Mongo'))
  .on("close", () => console.log("Disconnected"))
  .on("error", (error) => console.log(error))
  
// ================================
// Model
// ================================

const { Schema, model } = mongoose

const animalSchema = new Schema({
  species: String,
  extinct: Boolean,
  location: String,
  lifeExpectancy: Number
})

const Animal = model("Animal", animalSchema)

// ==============================
// App Object
// ==============================
const app = express()

// ==============================
// Middleware
// ==============================
app.use(morgan("tiny"));
app.use(methodOverride("_method"))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// ==============================
// Routes
// ==============================

// Seed Route
app.get("/animals/seed", (req, res) => {
  const startAnimals = [
    {species:"Dodo", extinct: true, location: "Mauritius", lifeExpectancy: 5},
    {species:"Giant Panda", extinct: false, location: "China", lifeExpectancy: 20},
    {species:"Common Raccoon", extinct: false, location: "North America", lifeExpectancy: 3},
    {species:"Iberian Lynx", extinct: false, location: "Iberian Peninsula", lifeExpectancy: 13},
    {species:"Megalodon", extinct: true, location: "The Ocean", lifeExpectancy: 88},
  ]
  Animal.deleteMany({}, (err, data) => {
    Animal.create(startAnimals, (err, data) => {
      res.json(data);
    })
  })

})

// Index Route
app.get("/animals", (req, res) => {
  Animal.find({}, (err, animals) => {
     res.render("animals/index.ejs", {animals})
  })
})

// New Route
app.get("/animals/new", (req, res) => {
  res.render("animals/new.ejs")
  
})

// Destroy Route
app.delete("/animals/:id", (req, res) => {
  const { id } = req.params
  Animal.findByIdAndRemove(id, (err, animal) => {
    res.redirect("/animals")
  })
  
})

// Update Route
app.put("/animals/:id", (req, res) => {
  const { id } = req.params
  console.log(req.body.extinct)
  req.body.extinct = (req.body.extinct === "on")
  console.log('req.body.extinct:', req.body.extinct)
  Animal.findByIdAndUpdate(id, req.body, { new: true }, (err, animal) => {
    res.redirect("/animals")
  })
  
  
})

// Create Route
app.post("/animals", (req, res) => {
  // convert ready to eat to true or false
  req.body.extinct = req.body.extinct === "on" 
  // create the new fruit
  Animal.create(req.body, (err, animal) => {
    //send the user back to index
    res.redirect("/animals");
  });
});

// Edit Route
app.get("/animals/:id/edit", (req, res) => {
  const { id } = req.params; // get id from params
  // get fruit from database
  Animal.findById(id, (err, animal) => {
    //render a template
    res.render("animals/edit.ejs", { animal});
  });
});

  


// Show Route
app.get("/animals/:id", (req, res) => {
  const { id } = req.params

  Animal.findById(id, (err, animal) => {
    console.log(animal)
    res.render("animals/show.ejs", {animal})
  })
})




// ==============================
// Listener
// ==============================
const PORT = process.env.PORT
app.listen(PORT,()=> console.log(`The zoo is open at port ${PORT}`))


