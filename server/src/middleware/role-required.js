function roleRequired(allowedRoles) {
  return function checkRole(req, res, next) {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const currentRole = req.auth && req.auth.role ? req.auth.role : "";
    if (!roles.includes(currentRole)) {
      return res.status(403).json({ error: "Forbidden: insufficient role permissions." });
    }
    return next();
  };
}

module.exports = {
  roleRequired
};
