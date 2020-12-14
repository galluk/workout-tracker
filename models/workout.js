const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ExerciseSchema = new Schema({
  type: {type: String, trim: true},
  name: {type: String, trim: true},
  duration: Number,
  weight: Number,
  reps: Number,
  sets: Number,
  distance: Number  
});

const WorkoutSchema = new Schema({
  day: {
    type: Date
  },
  exercises: [ExerciseSchema],
  totalDuration: Number
});

WorkoutSchema.methods.setTotalDuration = function() {
  this.totalDuration = Object.values(this.exercises).reduce((total, {duration}) => total + duration, 0);
  return this.totalDuration;
};

const Workout = mongoose.model('Workout', WorkoutSchema);

module.exports = Workout;