var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types;

var nodemailer = require("nodemailer");
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');

var ENV = process.env;

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: ENV.MAIL_USER,
        pass: ENV.MAIL_PASSWORD
    }
});

function sendMail(grant){
    console.log('sendMail', grant.email, grant.path, grant.token);
    var mailOptions = {
        from: ENV.MAIL_USER, 
        to: grant.email, 
        subject: "made.in document", 
        text: "http://pdocuments.made.net.in" + grant.path+'?t='+grant.token , 
    //     html: "<b>Hello world ✔</b>" 
    }
    
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
    });
};


/**
 * Grant
 * =====
 */

var Grant = new keystone.List('Grant');

Grant.add({
	email:{
            type: Types.Email,
            initial: true,
            required: true,
            index: true
        },
        path:{
            type: Types.Text,
            initial: true,
            required: true 
        },
	token: {
            type: Types.Text,
            initial: true,
            required: false 
        },
        consumed: {
            type: Types.Boolean,
            initial: true,
            required: true,
          'default' : false
        }
    });


function generateToken(email, path){
    console.log('generateToken', email, path);
    return crypto.createHash('md5')
            .update(email)
            .update(path)
            .update(Math.floor(Math.random() * 100000000000)+'')
            .digest('hex')
};

Grant.schema.pre('save', function(next){
    this.token = generateToken(this.email, this.path);
    next();
});

Grant.schema.post('save', function(grant){
    sendMail(grant);
});


/**
 * Registration
 */

Grant.defaultColumns = 'email, token, consumed';
Grant.register();
