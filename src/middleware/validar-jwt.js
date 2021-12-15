import jwt from "jsonwebtoken";

const secret = "@SecretKey@";

export const validarJwt = (req, res, next) => {
    let token = "";

 
    token = req.headers["x-access-token"] || req.headers["authorization"];
    if(!token){
        req.user = {auth: false}
        return next();
    }

    if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);
        console.log(token);
    }
    try {
        const {uid, nombre, rol} = jwt.verify(token,process.env.Secret_JWT);
        console.log(uid, nombre, rol);
        req.user = {auth: true, rol: rol, id: uid};
        return next();

    } catch(error){
        req.user = {auth: false}
        return next();
    }
};