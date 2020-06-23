const express     = require('express');
const mongoose    = require('mongoose');
const router      = express.Router();
const axios       = require('axios')
const Trail       = require('../models/trail-model');
const User        = require('../models/user-model')
const uploadCloud = require('../configs/cloudinary');




//const parser = require('../configs/cloudinary');



// get all trails
router.post('/getTrails', (req, res, next) => {
  const {lat, lng, slider, results} = req.body
  //console.log(req.body)
  let trails = []

  function arePointsNear(checkPoint, centerPoint, km) { // returns true if two points are nearby based on amount of km. In this case I use 321km or 200 miles. (same as API)
    let ky = 40000 / 360;
    let kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    let dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    let dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    return Math.sqrt(dx * dx + dy * dy) <= km;
  }

  axios.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=${slider}&maxResults=${results}&key=${process.env.HKINGPROJECT_API_KEY}`)
  .then(response => {
    let newArr = response.data.trails
    newArr.forEach(trail => trails.push(trail))
  }) 
  .then(() => {
    Trail.find()
    .then(theTrails => {
      theTrails.map(trail => {
        let trailCheck = {lat: trail.latitude, lng: trail.longitude}
        if (arePointsNear(trailCheck, {lat, lng}, slider)) {
          trails.push(trail)
        } 
      })
    })
    .then(() => {
      res.status(200).json(trails)
    })
  })
  .catch(err => next(err))
})

// create trail
router.post('/createTrail', uploadCloud.single('trailimage'), (req, res, next) => {
  // console.log(req.body)
  const {name, summary, latitude, longitude, difficulty, rating} = req.body
  Trail.create({
    name,
    summary,
    imgSmall: req.file.path,
    difficulty,
    stars: rating,
    latitude,
    longitude,
    owner: req.user._id
  })
  .then(trail => {
    User.updateOne({_id:req.user._id},{$push: { trails:trail._id }})
    .then(() => {
      res.status(200).json({message : `Thank you for submitting a new trail ${req.user.username} !`});
    })
  })
  .catch(err => {
  res.status(400).json(err);
  })
});

// add trail to favorite
router.post('/addToFavorite', (req, res, next) => {
  
  const { imgSmall, name, difficulty, stars, summary, latitude, longitude } = req.body.trail
  
  Trail.find({name})
  .then(response => {
    console.log(response)
    if(Array.isArray(response) && response.length === 0) {
      Trail.create({
        name,
        summary,
        imgSmall,
        difficulty,
        stars,
        latitude,
        longitude,
      })
      .then(trail => {
        console.log(trail)
        User.updateOne({ _id:req.user.id },{$push: { likedTrails:trail._id }})
        .then(() => {
          res.status(200).json({message: 'trail created and then succesfully added'})
        })
        .catch(e => console.log(e))
      })
    } else {

      User.exists({likedTrails: response[0]._id})
      .then(boolean => {
        //console.log(user[0].likedTrails)
        //console.log(response[0]._id)
        //let check = user[0].likedTrails.includes(response[0]._id)
        

        if(boolean) {

          res.status(200).json({message: 'this trail has already been added'})
          return

        } else {
          
          User.updateOne({_id:req.user.id},{$push: { likedTrails: response[0]._id }})
          .then(() => {
            res.status(200).json({message: 'trail succesfully added'})
          })
          .catch(e => console.log(e))
        }
      })
      .catch(e => console.log(e))
    }
  })
})

// get trails from user
router.get('/fetchUserTrails', (req, res, next) => {
    User.findById(req.user.id).populate('trails')
    .then(response => {
        res.status(200).json(response.trails)
    })
    .catch(e => next(e))
});

// get favorite trails from user
router.get('/fetchFavoriteUserTrails', (req, res, next) => {
  User.findById(req.user.id).populate('likedTrails')
  .then(response => {
      res.status(200).json(response.likedTrails)
  })
  .catch(e => next(e))
});

// delete trail 
router.post('/deleteTrail', (req, res, next) => {
  const { id, type } = req.body
  console.log(req.body)
  if(type === 'trails') {
    User.updateOne({ _id:req.user.id },{$pull: { trails: id }})
    .then(() => {
      res.status(200).json({message: 'trail removed succesfully'})
    })
    .catch(e => next(e))
  } 

  if(type === 'favoriteTrails') {
    User.updateOne({ _id:req.user.id },{$pull: { likedTrails: id }})
    .then(() => {
      res.status(200).json({message: 'trail removed succesfully'})
    })
    .catch(e => next(e))
  }
 
})

   
module.exports = router;
