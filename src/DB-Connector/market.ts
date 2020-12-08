const MarketSchema = mongoose.Schema({
    name: String,
    cells: [{type: mongoose.Schema.Type.ObjectId, ref: 'Cell'}]
});
module.exports = mongoose.model('Market', MarketSchema);