const mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECT)
const db = mongoose.connect;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});


module.exports = mongoose.connect;