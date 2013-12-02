$(function() {
  // Left editor settings
  var editor1 = ace.edit("editor1");
  editor1.setTheme("ace/theme/chrome");
  editor1.setShowPrintMargin(false);
  editor1.getSession().setMode("ace/mode/c_cpp");

  // Right editor settings
  var editor2 = ace.edit("editor2");
  editor2.setTheme("ace/theme/chrome");
  editor2.setShowPrintMargin(false);
  editor2.getSession().setMode("ace/mode/sh");
  editor2.setReadOnly(true);
  editor2.setHighlightActiveLine(false);

  var doCompile = function(target) {
    var code = editor1.getValue();
    $.ajax({
      type: "POST",
      url: "/compile",
      data: {
        target: target,
        code: code
      },
      success: function(data) {
        console.log(data);
        if (data.err) {
          editor2.setValue(data.err);
        } else {
          editor2.setValue(data.code);
        }
        editor2.navigateFileStart();
      }
    });
  }

  $("#compile-bash").click(function() {
    editor2.getSession().setMode("ace/mode/sh");
    doCompile('bash');
  });

  $("#compile-winbat").click(function() {
    editor2.getSession().setMode("ace/mode/batchfile");
    doCompile('winbat');
  });

  var fetchExample = function(id) {
    $.ajax({
      type: "GET",
      url: "/example",
      data: {id: id},
      success: function(data) {
        editor1.setValue(data);
        editor1.navigateFileStart();
      }
    });
  }

  $("#example-expression").click(fetchExample.bind(this, 'expression'));
  $("#example-command").click(fetchExample.bind(this, 'command'));
  $("#example-condition").click(fetchExample.bind(this, 'condition'));
  $("#example-loop").click(fetchExample.bind(this, 'loop'));
  $("#example-function").click(fetchExample.bind(this, 'function'));
  $("#example-recursion").click(fetchExample.bind(this, 'recursion'));
});
