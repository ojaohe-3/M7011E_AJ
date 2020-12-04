

const ConsumerSchema = mongoose.Schema({
    demand: Number,
    id: String,
});
 module.exports = mongoose.model('Consumer', ConsumerSchema);