

const CellSchema = mongoose.Schema({
    dest: String,
    manager_dest: String,
    prosumer_dest: String,
    name: String,
    pos: {lat: Number, lon: Number},
    manager_service: {type: mongoose.Schema.Type.ObjectId, ref: 'Manager'},
    prosumer_service: {type: mongoose.Schema.Type.ObjectId, ref: 'Prosumer'}
});
module.exports = mongoose.model('Cell', CellSchema);