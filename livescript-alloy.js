// Generated by CoffeeScript 1.9.2
var Application, Compiler, Generator, app, directory, fs, jade, livescript, match, path, promptly, sty;

fs = require("fs");

path = require("path");

match = require("match-files");

promptly = require("promptly");

livescript = require("livescript");

jade = require("jade");

sty = require('sty');

app = null;

directory = process.cwd();

console.info = function(msg) {
  return console.log(sty.red(msg));
};

console.debug = function(msg) {
  return console.log(sty.green(msg));
};

Application = (function() {
  var getFileType;

  function Application() {
    app = this;
    this.program = require('commander');
    this.titanium = null;
    this.program.version('0.0.5').usage('[COMMAND] [OPTIONS]').option('-p, --platform [platform]', '(watch) When done, run titanium on `platform`').option('-d, --directory [dirname]', 'Set source directory (default `src/`)');
    this.program.command('compile').alias('c').description('Just compile.').action(this.compile);
    this.program.command('watch').alias('w').description('Watch file changes & compile.').action(this.watch);
    this.program.command('build <platform>').alias('b').description('Run titanium on `platform`').action(this.build);
    this.program.command('new').alias('n').description('Setup the lazy-alloy directory structure.').action(this.setup);
    this.program.command('generate [type] [name]').alias('g').description('Generate a new (lazy-)alloy type such as a controller.').action(this.generate);
    this.program.parse(process.argv);
  }

  Application.prototype.start = function() {
    this.subfolder = this.program.directory ? this.program.directory.charAt(subfolder.length - 1) !== '/' ? this.program.directory += '/' : void 0 : 'src/';
    return this.compiler = new Compiler(this.subfolder);
  };

  Application.prototype.compile = function() {
    app.start();
    return app.compiler.all();
  };

  Application.prototype.build = function(platform) {
    var alloy, exec, spawn;
    if (platform == null) {
      platform = app.program.platform;
    }
    app.start();
    spawn = require("child_process").spawn;
    exec = require("child_process").exec;
    if (app.titanium !== null) {
      console.info("stopping titanium...");
      app.titanium.kill();
    }
    alloy = exec("alloy compile", function(error, stdout, stderr) {
      if (stdout) {
        console.debug(stdout);
      }
      if (stderr) {
        return console.log(stderr);
      }
    });
    return alloy.on('exit', (function(_this) {
      return function(code) {
        console.log("alloy stopped with code " + code);
        if (code !== 1) {
          console.info("starting titanium...");
          _this.titanium = spawn("titanium", ["build", "-p", platform]);
          _this.titanium.stdout.on("data", function(data) {
            return console.log("titanium: " + data);
          });
          _this.titanium.stderr.on("data", function(data) {
            return console.log("titanium: " + data);
          });
          return _this.titanium.on("exit", function(code) {
            return console.log("titanium exited with code " + code);
          });
        }
      };
    })(this));
  };

  Application.prototype.watch = function() {
    var watchr;
    app.start();
    watchr = require("watchr");
    console.info("Waiting for file change...");
    watchr.watch({
      ignoreHiddenFiles: true,
      paths: [directory],
      listeners: {
        error: function(err) {
          return console.log("an error occured:", err);
        },
        change: (function(_this) {
          return function(changeType, filePath, fileCurrentStat, filePreviousStat) {
            var file;
            if (changeType !== "create" && changeType !== "update") {
              return;
            }
            file = getFileType(filePath);
            if (!file) {
              return;
            }
            app.compiler.files([filePath], file.fromTo[0], file.fromTo[1]);
            if (app.program.platform) {
              return app.build();
            }
          };
        })(this)
      }
    });
    return {
      next: function(err, watchers) {
        if (err) {
          return console.log("watching everything failed with error", err);
        } else {
          return console.debug("Waiting for file change...");
        }
      }
    };
  };

  Application.prototype.setup = function() {
    app.start();
    return new Generator().setup(app.subfolder);
  };

  Application.prototype.generate = function(type, name) {
    app.start();
    app.type = type;
    app.name = name;
    return app.ensureType();
  };

  Application.prototype.ensureType = function() {
    var generators;
    if (app.type) {
      return app.ensureName();
    } else {
      generators = ['controller', 'view', 'model', 'widget'];
      console.debug('What should I generate?');
      return promptly.choose(generators.join(', ') + ': ', generators, app.ensureName);
    }
  };

  Application.prototype.ensureName = function(i, type) {
    if (type) {
      app.type = type;
    }
    if (app.name) {
      return app.startGenerator();
    } else {
      return promptly.prompt("Please enter a name for your " + app.type + ": ", function(err, name) {
        return app.startGenerator(name);
      });
    }
  };

  Application.prototype.startGenerator = function(name) {
    if (name) {
      app.name = name;
    }
    return new Generator().generate(app.type, app.name);
  };

  getFileType = function(path) {
    var inpath;
    inpath = function(name) {
      return !!~path.indexOf(name);
    };
    if (inpath(".jade")) {
      return {
        type: "view",
        fromTo: ["jade", "xml"]
      };
    }
    if (inpath("widgets/view")) {
      return {
        type: "widgets/view",
        fromTo: ["jade", "xml"]
      };
    }
    if (!inpath(".ls")) {
      return null;
    }
    if (inpath("styles/")) {
      return {
        type: "style",
        fromTo: ["ls", "tss"]
      };
    }
    if (inpath("alloy.ls")) {
      return {
        type: "alloy",
        fromTo: ["ls", "js"]
      };
    }
    if (inpath("controllers/")) {
      return {
        type: "controller",
        fromTo: ["ls", "js"]
      };
    }
    if (inpath("models/")) {
      return {
        type: "model",
        fromTo: ["ls", "js"]
      };
    }
    if (inpath("lib/")) {
      return {
        type: "library",
        fromTo: ["ls", "js"]
      };
    }
    if (inpath("widgets/style")) {
      return {
        type: "widgets/style",
        fromTo: ["ls", "tss"]
      };
    }
    if (inpath("widgets/controller")) {
      return {
        type: "widgets/controller",
        fromTo: ["ls", "js"]
      };
    }
  };

  return Application;

})();

Compiler = (function() {
  Compiler.prototype.logger = console;

  function Compiler(subfolder1) {
    this.subfolder = subfolder1 != null ? subfolder1 : 'src/';
  }

  Compiler.prototype.views = function() {
    return this.process("views/", "jade", "xml");
  };

  Compiler.prototype.controllers = function() {
    return this.process("controllers/", "ls", "js");
  };

  Compiler.prototype.models = function() {
    return this.process("models/", "ls", "js");
  };

  Compiler.prototype.styles = function() {
    return this.process("styles/", "ls", "tss");
  };

  Compiler.prototype.widgets = function() {
    var j, len, results, widget, widgets;
    widgets = fs.readdirSync(this.subfolder + "/widgets");
    results = [];
    for (j = 0, len = widgets.length; j < len; j++) {
      widget = widgets[j];
      this.process("widgets/" + widget + "/views/", "jade", "xml");
      this.process("widgets/" + widget + "/styles/", "ls", "tss");
      results.push(this.process("widgets/" + widget + "/controllers/", "ls", "js"));
    }
    return results;
  };

  Compiler.prototype.lib = function() {
    return this.process("lib/", "ls", "js");
  };

  Compiler.prototype.alloy = function() {
    return this.process("./alloy.ls", "ls", "js");
  };

  Compiler.prototype.all = function() {
    this.views();
    this.controllers();
    this.styles();
    this.widgets();
    this.lib();
    return this.alloy();
  };

  Compiler.prototype.process = function(path, from, to) {
    var filter;
    path = this.subfolder + path;
    this.logger.info("Preprocessing " + from + " files in " + path);
    filter = function(dir) {
      return dir.indexOf("." + from) !== -1 && dir.indexOf(".") !== 0;
    };
    return match.find(process.cwd() + "/" + path, {
      fileFilters: [filter]
    }, (function(_this) {
      return function(err, files) {
        return _this.files(files, from, to);
      };
    })(this));
  };

  Compiler.prototype.file = function(from, output, type) {
    var compiled, data;
    this.logger.debug("Building " + type + ": " + from + " --> " + output);
    data = fs.readFileSync(from, 'utf8');
    compiled = this.build[type](data);
    this.mkdirPSync(output.split('/').slice(0, -1));
    return fs.writeFileSync(output, compiled, 'utf8');
  };

  Compiler.prototype.files = function(files, from, to, to_path) {
    var file, j, k, len, len1, output, paths, results;
    if (files.length === 0) {
      return this.logger.debug("No '*." + from + "' files need to preprocess.. " + files.length + " files");
    }
    paths = ['app', 'app/controllers', 'app/styles', 'app/views', 'app/lib'];
    for (j = 0, len = paths.length; j < len; j++) {
      path = paths[j];
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    }
    results = [];
    for (k = 0, len1 = files.length; k < len1; k++) {
      file = files[k];
      if (!!~file.indexOf("lazyalloy")) {
        break;
      }
      output = file.substring(0, file.length - from.length).toString() + to;
      if (process.platform === 'win32') {
        output = output.replace(/\\/g, '/');
      }
      output = output.replace(new RegExp('(.*)' + this.subfolder), '$1app/');
      results.push(this.file(file, output, to));
    }
    return results;
  };

  Compiler.prototype.build = {
    xml: function(data) {
      return jade.compile(data, {
        pretty: true
      })(this);
    },
    tss: function(data) {
      data = this.js(data);
      return (data.replace("};", "")).replace("var tss;\n\ntss = {\n", "");
    },
    js: function(data) {
      return livescript.compile(data.toString(), {
        bare: true
      });
    },
    json: function(data) {
      return data;
    }
  };

  Compiler.prototype.mkdirPSync = function(segments, pos) {
    var segment;
    if (pos == null) {
      pos = 0;
    }
    if (pos >= segments.length) {
      return;
    }
    segment = segments[pos];
    path = segments.slice(0, +pos + 1 || 9e9).join('/');
    if (path.length > 0) {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    }
    return this.mkdirPSync(segments, pos + 1);
  };

  return Compiler;

})();

Generator = (function() {
  var createController, createLibrary, createModel, createStyle, createView, createWidget, execUnlessExists, mkdir, not_yet_implemented, touch;

  function Generator() {}

  Generator.prototype.setup = function(subfolder) {
    console.info("Setting up folder structure at " + subfolder);
    mkdir(subfolder);
    mkdir(subfolder + 'views');
    mkdir(subfolder + 'styles');
    mkdir(subfolder + 'controllers');
    mkdir(subfolder + 'widgets');
    mkdir(subfolder + 'lib');
    console.debug('Setup complete.');
    return process.exit();
  };

  Generator.prototype.generate = function(type, name) {
    switch (type) {
      case 'controller':
        createController(name);
        break;
      case 'model':
        createModel(name);
        break;
      case 'jmk':
        not_yet_implemented();
        break;
      case 'model':
        createModel(name);
        break;
      case 'migration':
        not_yet_implemented();
        break;
      case 'view':
        createView(name);
        break;
      case 'widget':
        createWidget(name);
        break;
      case 'lib':
        createLibrary(name);
        break;
      default:
        console.info("Don't know how to build " + type);
    }
    return process.exit();
  };

  createController = function(name) {
    console.debug("Creating controller " + name);
    touch(app.subfolder + 'controllers/' + name + '.ls');
    return createView(name);
  };

  createView = function(name) {
    console.debug("Building view " + name);
    touch(app.subfolder + 'views/' + name + '.jade');
    return createStyle(name);
  };

  createStyle = function(name) {
    console.debug("Building style " + name);
    return touch(app.subfolder + 'styles/' + name + '.ls');
  };

  createModel = function(name) {
    console.debug("Building model " + name);
    return touch(app.subfolder + 'models/' + name + '.ls');
  };

  createWidget = function(name) {
    console.debug("Creating widget " + name);
    mkdir(app.subfolder + 'widgets/');
    mkdir(app.subfolder + 'widgets/' + name);
    mkdir(app.subfolder + 'widgets/' + name + '/controllers/');
    mkdir(app.subfolder + 'widgets/' + name + '/views/');
    mkdir(app.subfolder + 'widgets/' + name + '/styles/');
    touch(app.subfolder + 'widgets/' + name + '/controllers/widget.ls');
    touch(app.subfolder + 'widgets/' + name + '/views/widget.jade');
    return touch(app.subfolder + 'widgets/' + name + '/styles/widget.ls');
  };

  createLibrary = function(name) {
    console.debug("Creating library " + name);
    return touch(app.subfolder + 'lib/' + name + '.ls');
  };

  not_yet_implemented = function() {
    console.info("This generator hasn't been built into lazy-alloy yet. Please help us out by building it in:");
    return console.info("https://github.com/vastness/lazy-alloy");
  };

  mkdir = function(path) {
    return execUnlessExists(fs.mkdirSync, path);
  };

  touch = function(path) {
    return execUnlessExists(fs.openSync, path, 'w');
  };

  execUnlessExists = function(fn, path, attr) {
    if (attr == null) {
      attr = null;
    }
    if (fs.existsSync(path)) {
      return console.debug(path + " already exists, doing nothing");
    } else {
      return fn(path, attr);
    }
  };

  return Generator;

})();

module.exports = new Application;
