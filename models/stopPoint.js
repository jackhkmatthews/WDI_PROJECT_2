const mongoose = require('mongoose');

const stopPointSchema = new mongoose.Schema({
  lat: {type: String, required: true},
  lng: {type: String, required: true},
  commonName: {type: String, required: true, unique: true},
  id: {type: String, required: true, unique: true},
  lineNames: [{type: String, required: true}],
  lineIds: [{type: String, required: true}]
},{
  timestamps: true
});

module.exports = mongoose.model('StopPoint', stopPointSchema);
