const mongoose = require('mongoose');
const reviewModel = require('./Reviews');

const main = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/Locations');
}

main().then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

const locationSchema = new mongoose.Schema({
    name : {
        type : String
    },
    price : {
        type : Number
    },
    location : {
        type : String,
        required : true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description : {
        type : String,
        required : true
    },
    image : [
        {
            url: String,
            filename: String
        }
    ],
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Reviews'
        }
    ],
    deleteImages: []
},{
    toJSON: {virtuals: true}
});

locationSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/locations/${this._id}">${this.name}</a></strong>
    <p>${this.description.substring(0,20)}...</p>`;
})

locationSchema.post('findOneAndDelete',async(doc) => {
    if(doc.reviews.length) {
        await reviewModel.deleteMany({
            _id : {$in : doc.reviews}
        })
    }
})

const locationModel = new mongoose.model('Locations',locationSchema);

module.exports = locationModel;