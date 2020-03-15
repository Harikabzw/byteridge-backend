const config = require('config.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
var getIP = require('ipware')().get_ip;
const requestIp = require('request-ip');


module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    signout,
    getAuditsList,
    delete: _delete
};

async function authenticate(contdata) {
    console.log('contdata.body',contdata.body.username)
    var username=contdata.body.username

    // var ipInfo = getIP(contdata);
   
    // console.log(ipInfo,username);
    const user = await User.findOne({ username });
    console.log('user',user,bcrypt.compareSync(contdata.body.password, user.hash))
    if (user && bcrypt.compareSync(contdata.body.password, user.hash)) {
        // var ipInfo = getIP(contdata);
        // console.log(ipInfo);
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        console.log('user',user)
        var ipInfo = getIP(contdata);
        console.log(contdata.connection.remoteAddress)
        const clientIp = requestIp.getClientIp(contdata); 
        console.log('ipInfo',ipInfo,clientIp);
       const updateUser= await User.findOneAndUpdate({username},{$set:{lastLoginTime:new Date(),clientIp:ipInfo.clientIp}})
     if(updateUser){
        return {
            ...userWithoutHash,
    
            token
        };
     }
     
    }
}
async function signout(contdata) {
    console.log('tttttt',contdata.headers.authorization,contdata.headers.authorization['Bearer'])
    var username=contdata.body.username
    const user = await User.findOne({ username });
   console.log('user',user)
    if (user && contdata.headers.authorization) {
       const updateUser= await User.findOneAndUpdate({username},{$set:{lastLogoutTime:new Date()}},{new: true, useFindAndModify: false})
     if(updateUser){
        return {
            user,
    
            
        };
     }
     else{
         return {
             "message":"User Not Found"
         }
     }
    }
    
}

async function getAll() {
    
    return await User.find().select('-hash');
}
async function getAuditsList(req) {
    console.log('req',req.role)
    if(req.role=='Auditor'||req.role=='auditor'){
        var page = parseInt(req.page - 1) || 0; //for next page pass 1 here
        var limit = parseInt(req.limit) || 3;
        var Audits= await User.find().skip(limit * page).limit(limit)
        var auditsCount =await User.countDocuments({})
        return {audits:Audits,totalAudits:auditsCount}
    }
   
}


async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    console.log(userParam)
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save(function(res){
        console.log(res)
        if(res) throw res
    });
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}