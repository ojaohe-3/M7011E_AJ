const ManagerSchema = mongoose.Schema({
    id: String,
    current: Number,
    maxProduciton: Number,
    production : Number,
    status: Boolean,
    ratio: Number,
    destination: String
});
 module.exports = mongoose.model('Manager', ManagerSchema);