const jwt = require('jsonwebtoken');
const JWT_SECRET = "Sachinisagood$boy";
const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req id
    const token=req.header('authtoken');
    if(!token){
        res.status(401).send({error:"please authenticate using a valid token"})
    }
    try{
        const data=jwt.verify(token,JWT_SECRET);
        req.user=data.user;
        next()
    }
    catch(err){
        res.status(401).send({error:"sorry"})
    }
}
module.exports = fetchuser;