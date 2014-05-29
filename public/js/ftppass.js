/*
 * 
 * ftppass.js
 * 
 * 
 */

function makePath(root, name){
    if('/' === root){
        return root+name;
    }
    return root+'/'+name;
};

function wrap($el, lab){
    var $w = $('<div />').addClass('wrapper');
    if(lab){
        $w.html('<h4>'+lab+'</h4>');
    }
    $w.append($el);
    return $w;
};

function Form(container, path, dir){
    var $F = $('<div role="form" method="post"  action="/keystone/grants" />');
//     var $path = $('<input type="hidden" name="path" value="'+path+'" />');
//     var $action = $('<input type="hidden" name="action" value="create" />');
    var $email = $('<input type="email" name="email" class="form-control field type-email" />');
    var $submit = $('<button class="btn btn-default btn-save">Validate</button>');
    
    $submit.on('click', function(e){
        
        var pdata = {
            action:'create',
            path: path,
            email: $email.val(),
        };
        $.post( "/keystone/grants", pdata, function( data ) {
            if(dir){
                dir.showDirectory();
            }
        });
    });
    
    
//     $F.append($path);
//     $F.append($action);
    $F.append(wrap($email, 'e-mail'));
    $F.append(wrap($submit));
    
    container.html($F);
};


function Dir(options){
    this.container = options.container;
    this.fs = options.fs;
    this.parents = ['/'];
};


_.extend(Dir.prototype, {
    
    showDirectory:function(){
        var cd = this.fs;
        var ps = this.parents;
        _.each(ps, function(d){
            cd = cd[d];
        });
        
        var root = '/' + ps.slice(1).join('/');
        this.container.empty();
        this.container.append('<div class="path">'+root+'</div>');
        if(ps.length > 1){
            var up = $('<div class="up">↩</div>');
            up.on('click', this.showParent.bind(this));
            this.container.append(up);
        }
        var self = this;
        _.each(cd, function(v, k){
//             console.log(v,k);
            if(typeof v === 'boolean'){
                var F = $('<div class="file" data-path="'+makePath(root, k)+'">'+k+'</div>');
                F.on('click', function(e){
                    Form(self.container, makePath(root, k), self);
                });
                self.container.append(F);
            }
            else{
                var D = $('<div class="dir" data-key="'+k+'">▸ '+k+'</div>');
                D.on('click', function(e){
                    self.parents.push(k);
                    self.showDirectory();
                });
                self.container.append(D);
            }
        });
    },
    
    showParent: function(){
        if(this.parents.length <= 1){
            return;
        }
        this.parents.pop();
        this.showDirectory();
    },
    
});

$(document).ready(function(){
    var d = new Dir({
        container: $('.filer'),
        fs: dirs
    });
    
    d.showDirectory();
});

