const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  console.log("DEBUG: Auth middleware mulai.");
  const token = req.header("Authorization");

  if (!token) {
    console.log("DEBUG: No token provided in header.");
    return res.status(401).json({ msg: "Tidak ada token, otorisasi ditolak." });
  }

  const tokenParts = token.split(" "); // karena nanri isinya bearer isi_toen
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    console.log("DEBUG: Invalid token format.");
    return res.status(401).json({ msg: "Format token tidak valid." });
  }
  const actualToken = tokenParts[1];
  try {
    // Verifikasi token
    console.log("DEBUG: JWT_SECRET for verifying:", process.env.JWT_SECRET);
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log(
      "DEBUG: Token successfully verified. Decoded payload:",
      decoded
    );

    // Tambahkan user dari payload token ke objek request
    req.user = decoded;
    next(); // Lanjutkan ke route handler
  } catch (err) {
    console.error("DEBUG: Token verification failed:", err.message);
    res.status(401).json({ msg: "Token tidak valid." });
  }
};
