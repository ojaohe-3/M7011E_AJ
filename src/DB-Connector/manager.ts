const ManagerSchema = mongoose.Schema({
    current: Number,
    maxProduciton: Number,
    production : Number,
    status: Boolean,
    ratio: Number,
    name: String
});
 module.exports = mongoose.model('Manager', ManagerSchema);