var express = require('express');
var router = express.Router();
var QRCode = require('qrcode');
var crypto = require('crypto');

/* GET home page — redirect to a fresh ID if none present. */
router.get('/', function(req, res, next) {
  var id = req.query.id;
  if (!id) {
    return res.redirect('/?id=' + crypto.randomUUID());
  }
  var baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  var viewUrl = baseUrl + '/api/view?id=' + id;
  QRCode.toDataURL(viewUrl, { width: 96, margin: 1, color: { dark: '#444444', light: '#ffffff' } }, function(err, viewQr) {
    res.render('index', { title: 'myRemoteTimer', viewQr: viewQr || '', timerId: id });
  });
});

module.exports = router;
