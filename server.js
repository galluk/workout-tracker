require('dotenv').config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const mongojs = require("mongojs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

const databaseUrl = `mongodb+srv://mongoLG:${encodeURIComponent(process.env.DB_PASS)}@cluster0.xoyrx.mongodb.net/workout_db`;

mongoose.connect(
  process.env.MONGODB_URI || databaseUrl, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// get all the workouts
app.get("/api/workouts", (req, res) => {
  db.Workout.find()

    .then(dbWorkouts => {
      // call custom method in the mongo model for total duration
      const allWorkouts = dbWorkouts;
      allWorkouts.forEach(workout => workout.setTotalDuration());
      res.json(allWorkouts);
    })
    .catch(err => {
      res.json(err);
    });
});

// get the workout for the supplied id
app.get("/exercise?", (req, res) => {
  if (req.query.id) {
    console.log('getting exercise?');
    db.Workout.findOne({ _id: mongojs.ObjectId(req.query.id) })
      .then(dbWorkout => {
        res.sendFile(path.join(__dirname, "public/exercise.html"));
      })
      .catch(err => {
        res.json(err);
      });
  }
  else {
    res.sendFile(path.join(__dirname, "public/exercise.html"));
  }
});

// show the stats page
app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, "public/stats.html"));
});

app.get("/api/workouts/range", (req, res) => {
  db.Workout.find()
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

// add a new workout
app.post("/api/workouts", (req, res) => {
  const newWorkout = req.body;
  newWorkout.day = new Date();

  db.Workout.create(newWorkout, (error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.json(data);
    }
  });
});

// add new exercise to the workout with the given id
app.put("/api/workouts/:id", (req, res) => {
  // get the workout
  console.log('req.body: ' + JSON.stringify(req.body));
  
  db.Workout.updateOne(
    { _id: mongojs.ObjectId(req.params.id) },
    { $push: {'exercises': req.body } }
  ).then(updatedWorkout => {
    console.log('update result: ' + JSON.stringify(updatedWorkout));
    res.json(updatedWorkout);
  })
  .catch(err => {
    res.json(err);
  });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
