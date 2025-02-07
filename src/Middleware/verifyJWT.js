import jwt from 'jsonwebtoken'

export function verifyJWT(req, res, next) {
  const token = req.headers['access-token'];
  if (!token || token == "null" || token == undefined) {
    return res.status(500).json({ success: false, message: 'É necessário estar logado para ter acesso a essa funcionalidade' });
  }

  else{
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) {  
        return res.status(501).json({ success: false, message: 'Token expirado, faça o login novamente' })
      };
      next();
    });
  }
}