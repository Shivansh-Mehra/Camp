const Location = require('.././models/Locations');
const {cloudinary} = require('../cloudinary');
const maptilerClient = require('@maptiler/client');
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


module.exports.index = async (req,res) => {
    const locs = await Location.find({});
    if(!locs) {
        req.flash('error','unable to load the locations at the moment! please try again!!');
        res.redirect('/');
    }
    res.render('locations/index',{locs});
}

module.exports.newLocationForm = (req,res) => {
    res.render('locations/new');
}

module.exports.createNewLocation = async(req,res,next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.location, {limit: 1});
    const newLocation = new Location(req.body);
    newLocation.geometry = geoData.features[0].geometry;
    console.log(newLocation.geometry);
    newLocation.image = req.files.map(f => ({url: f.path, filename: f.filename}));
    newLocation.author = req.user._id;
    await newLocation.save();
    req.flash('success',"successfully created a new campground")
    res.redirect('/locations');
}

module.exports.editForm = async(req,res) => {
    const {id} = req.params;
    const location = await Location.findById(id);
    if(!location) {
        req.flash('error','unable to load up the edit page for this particular location ATM!');
        res.redirect('/locations/id');
    }
    res.render('locations/edit',{location});
}

module.exports.editLocation = async(req,res) => {
    const {id} = req.params;
    await Location.findByIdAndUpdate(id,req.body,{runValidators : true});
    const location = await Location.findById(id);
    const images = req.files.map(f => ({url: f.path, filename: f.filename}));
    location.image.push(...images);
    await location.save();
    req.flash('success','successfully updated the information!');
    res.redirect('/locations/'+id);
}

module.exports.deleteLocation = async(req,res) => { 
    const {id} = req.params;
    await Location.findByIdAndDelete(id);
    req.flash('success','successfully deleted the location!');
    res.redirect('/locations');
}

module.exports.displayLocation = async(req,res) => {
    const {id} = req.params;
    const location = await Location.findById(id).populate('author');
    console.log(location);
    if(!location) {
        req.flash('error','unable to load up information about this location');
        res.redirect('/locations');
    }
    res.render('locations/displaySpecificLocation',{location});
}

module.exports.deleteImages = async (req,res) => {
    const {id} = req.params;
    const location = await Location.findById(id);
    if(!location) {
        req.flash('error','unable to load up the delete images page for this particular location ATM!');
        res.redirect('/locations/id');
    }
    res.render('locations/deleteImages',{location});
}

module.exports.deleteSelectedImages = async (req,res) => {
    const {id} = req.params;
    const location = await Location.findById(id);
    const {deletedImages} = req.body;
    if(deletedImages){
        await location.updateOne({$pull : {image : {filename : {$in : deletedImages}}}});
    }
    for(const img of deletedImages) {
        await cloudinary.uploader.destroy(img);
    }
    req.flash('success','successfully deleted the selected images!');
    res.redirect('/locations/'+id);
}
