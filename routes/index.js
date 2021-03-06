var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next)
{
  res.render('index');
});

router.get('/room/:id', function(req, res, next)
{
  res.render('room', {id: req.params.id});
});

module.exports = router;