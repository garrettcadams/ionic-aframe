var router = require('express').Router();
var models = require('../../models');
// var s3client = require('../../lib/s3-client.js');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var AWS = require('aws-sdk');
var envVar = require('../../env');
var fs = require('fs');

console.log(envVar.AWS);

AWS.config.update({
  accessKeyId: envVar.AWS.accessKeyId,
  secretAccessKey: envVar.AWS.secretAccessKey,
  region: envVar.AWS.region
});

var client = new AWS.S3();

router.get('/', function(req, res, next) {
  models.Post.findAll({
    include: [
      {model: models.User, required: true}
    ]
  })
  .then(function(posts) {
    res.send(posts);
  })
  .catch(next);
});

router.post('/', upload.single('file'), function(req, res, next) {
  console.log('file', req.file);
  console.log('body', req.body);
  res.send('hi');
  var params = {
    Body: fs.createReadStream(req.file.path),
    Bucket: 'ionic-aframe-development',
    Key: 'image.jpg',
    ContentLength: req.file.size,
    ContentType: req.file.mimetype,
    ContentEncoding: req.file.encoding
  };

  client.putObject(params, function(err, data) {
      if (err) console.log("ASDFYUBINIINIUNI", err, err.stack); // an error occurred
  else     console.log("ASDFYUBINIINIUNI", data);           // successful response
  })

  // var uploader = s3client.uploadFile(params);
  // uploader.on('error', function(err) {
  //   console.error('unable to upload:', err.stack);
  // });
  // uploader.on('progress', function() {
  //   console.log('progress', uploader.progressMd5Amount,
  //             uploader.progressAmount, uploader.progressTotal);
  // });
  // uploader.on('end', function() {
  //   console.log('done uploading');
  // });
  // models.Post.create(req.body)
  // .then(function(post) {
  //   res.send(post);
  // })
  // .catch(next);
});

router.get('/:id/likes', function(req, res, next) {
  models.Like.findAll({
    where: {
      PostId: req.params.id
    }
  })
  .then(function(likes) {
    res.send(likes);
  })
  .catch(next);
});

router.post('/:id/likes', function(req, res, next) {
  models.Like.create({
    PostId: req.params.id,
    UserId: req.body.userId
  })
  .then(function(like) {
    res.send(like);
  })
  .catch(next);
});

router.get('/:id/likes/:userId', function(req, res, next) {
  models.Like.findOne({
    where: {
      PostId: req.params.id,
      UserId: req.params.userId
    }
  })
  .then(function(like) {
    if (like) {
      res.send(true);
    } else {
      res.send(null);
    }
  })
  .catch(next);
});

router.delete('/:id/likes/:userId', function(req, res, next) {
  models.Like.findOne({
    where: {
      PostId: req.params.id,
      UserId: req.params.userId
    }
  })
  .then(function(like) {
    return like.destroy();
  })
  .then(function(response) {
    res.send(response);
  })
  .catch(next);
});

router.get('/:id', function(req, res, next) {
  models.Post.findOne({
    where: {
      id: req.params.id
    },
    include: [
      {model: models.User, required: true}
    ]
  })
  .then(function(post) {
    res.send(post);
  })
  .catch(next);
});

router.put('/:id', function(req, res, next) {
  models.Post.findById(req.params.id)
  .then(function(post) {
    return post.update(req.body);
  })
  .then(function(updatedPost) {
    res.send(updatedPost);
  })
  .catch(next);
});


router.delete('/:id', function(req, res, next) {
  models.Post.findById(req.params.id)
  .then(function(post) {
    return post.destroy();
  })
  .then(function(response) {
    res.send(response);
  })
  .catch(next);
})

module.exports = router;
