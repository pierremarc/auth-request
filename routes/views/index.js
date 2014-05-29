var keystone = require('keystone');
var walk = require('walk');
var _ = require('underscore');

var ENV = process.env;


var rDir = ENV.AUTH_DIRECTORY;




exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	
        var dirwalker = walk.walk(rDir);
        var rL = rDir.length;
        var files = [];
        var dirs = {'/':{}};
        dirwalker.on('directories', function(root, dirStatsArray, next){
            var roots = root.slice(rL).split('/');
            roots.shift();
            var parent = dirs['/'];
            _.each(roots, function(r){
                if(!(r in parent)){
                    parent[r] = {};
                }
                parent = parent[r];
            });
            _.each(dirStatsArray, function(d){
                parent[d.name] = {};
            });
            next();
        });
        
        dirwalker.on("end", function () {
            var walker = walk.walk(rDir);
            walker.on("file", function (root, fileStats, next) {
                var roots = root.slice(rL).split('/');
                roots.shift();
                var parent = dirs['/'];
                _.each(roots, function(r){
                    if(!(r in parent)){
                        parent[r] = {};
                    }
                    parent = parent[r];
                });
                parent[fileStats.name] = true;
                next();
            });
            walker.on("end", function () {
                console.log(dirs);
                view.render('index', {dirs:dirs, jsonDirs:JSON.stringify(dirs)});
            });
        });
	
}
