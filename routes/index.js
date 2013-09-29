var fs = require('fs');
var child_process = require('child_process');
var temp = require('temp');
var pathToBatsh = '/usr/local/bin/batsh';

exports.index = function(req, res) {
  res.render('index');
};

exports.compile = function(req, res) {
  var target = req.body.target;
  var code = req.body.code;

  var reportError = function(err) {
    res.json({
      err: err
    });
  };

  temp.open('batsh', function(err, info) {
    if (err) {
      reportError(err);
      return;
    }
    fs.write(info.fd, code);
    fs.close(info.fd, function(err) {
      if (err) {
        reportError(err);
        return;
      }
      var srcfile = info.path;
      var subCommand;
      if (target === 'bash') {
        subCommand = 'bash';
      } else if (target === 'winbat') {
        subCommand = 'bat';
      } else {
        // Error
      }
      var cmd = pathToBatsh + ' ' + subCommand + ' "' + srcfile + '"';
      child_process.exec(cmd, function(err, stdout, stderr) {
        if (err) {
          if (stderr.indexOf(srcfile) !== -1) {
            stderr = stderr.slice(srcfile.length + 1);
          }
          reportError(stderr);
        } else {
          res.json({
            code: stdout
          });
        }
      });
    })
  });
};
