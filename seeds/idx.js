if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const helpers = require('./helper');
const Location = require('../models/Locations');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

mongoose.connect('mongodb://127.0.0.1:27017/Locations',{
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});

const func = (helpers) => {
    const rand = Math.floor(Math.random()*helpers.length);
    return helpers[rand];
}

const seedDB = async () => {
    await Location.deleteMany({});
    for(let i = 0 ; i < 200 ; i++) {
        const rand = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        // const geoData = await maptilerClient.geocoding.forward(`${cities[rand].city},${cities[rand].state}`,{limit: 1});
        await new Location({
            author : '675ad44969044f6202a02033',
            location : `${cities[rand].city},${cities[rand].state}`,
            description : func(helpers.descriptors),
            name : func(helpers.places),
            price,
            image: [{
                url: 'https:res.cloudinary.com/dnjrccb62/image/upload/v1734171114/AppBuildPractice/ljwiyqkbslz3cnbn6ho5.png',
                filename: 'AppBuildPractice/ljwiyqkbslz3cnbn6ho5'
            }],
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[rand].longitude,
                    cities[rand].latitude
                ]
            },
            reviews : []
        }).save();
    }
};

const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',async () => {
    console.log("Connected to the Database...");

await seedDB().then(async () => {
    console.log("Database Seeded...");
    const loc = await Location.find({});
    for(const it of loc) {
        console.log(it.geometry.coordinates);
    }
    mongoose.connection.close();
})
});