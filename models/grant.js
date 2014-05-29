var _ = require('underscore'),
	keystone = require('keystone'),
	Types = keystone.Field.Types;

var fs = require('fs');
var ejs = require('ejs');
var nodemailer = require("nodemailer");
var crypto = require('crypto');
var md5sum = crypto.createHash('md5');

var ENV = process.env;

var mailTemplate = fs.readFileSync(ENV.AUTH_MAIL_TEMPLATE, {encoding:'UTF-8'});
var template = ejs.compile(mailTemplate);

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
    host: ENV.AUTH_MAIL_SMTP_HOST,
    port: ENV.AUTH_MAIL_SMTP_PORT,
    secureConnection: ENV.AUTH_MAIL_SMTP_SECURE ? true : false,
    auth: {
        user: ENV.AUTH_MAIL_USER,
        pass: ENV.AUTH_MAIL_PASSWORD
    }
});

function sendMail(grant){
    console.log('sendMail', grant.email, grant.path, grant.token);
    var mailOptions = {
        from: ENV.AUTH_MAIL_USER,
        to: grant.email,
        subject: "[made.in] document request",
        text: template(grant),
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
