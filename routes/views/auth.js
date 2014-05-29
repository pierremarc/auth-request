
var keystone = require('keystone'),
    Grant = keystone.list('Grant');
    
    
exports = module.exports = function(req, res) {
    try{
        var uri = req.get('x-original-uri');
        console.log('[auth]', uri);
        var comps = uri.split('?');
        console.log('[auth]', comps.length);
        var path = comps.shift();
        var token = comps.shift().split('=')[1];
    }
    catch(e){
        res.send(403, 'Malformed request');
        return;
    }
//     X-Original-URI
    console.log('[auth]', path, token);
    Grant.model.findOne({path:path, token:token, consumed:false})
        .exec(function(err, grant) {
            console.log('>>', err, grant);
            if(err){
                res.send(401, err);
            }
            else{
                if(grant){
                    grant.consumed = true;
                    grant.save(function(err){
                        if(err){
                            res.send(401, 'Cannot update grant');
                        }
                        else{
                            res.send(201);
                        }
                    });
                }
                else{
                    res.send(401, 'Grant not found');
                }
            }
        });
	
}
