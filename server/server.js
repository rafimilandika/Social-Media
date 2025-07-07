require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { useParams } = require("react-router-dom");
const auth = require("./middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { profile } = require("console");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
module.exports = db;

// Coba koneksi ke database saat server dimulai
db.connect((err) => {
  if (err) {
    console.error("Koneksi database gagal:", err.message);
    return;
  }
  console.log("Terhubung ke database MySQL!");
  const createTableUsers = `
       			CREATE TABLE IF NOT EXISTS users (
            		id INT AUTO_INCREMENT PRIMARY KEY,
            		username VARCHAR(255) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password  VARCHAR(255) NOT NULL,
                    photo_profile VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        		)
    		`;
  const createTablePosts = `
       			CREATE TABLE IF NOT EXISTS posts (
            		id INT AUTO_INCREMENT PRIMARY KEY,
            		user_id INT NOT NULL,
            		content TEXT NOT NULL,
                    image_url VARCHAR(255) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        		)
    		`;
  const createTableComments = `
       			CREATE TABLE IF NOT EXISTS comments (
            		id INT AUTO_INCREMENT PRIMARY KEY,
                    post_id INT NOT NULL,
                    user_id INT NOT NULL,
                    content VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        		)
    		`;
  const allCreateTablesQuery = `
    ${createTableUsers};
    ${createTablePosts};
    ${createTableComments};
`;
  db.query(allCreateTablesQuery, (err) => {
    if (err) {
      console.error("Gagal membuat tabel :", err);
      return;
    }
    console.log("Tabel siap (atau sudah ada).");
  });
});

const DEFAULT_PROFILE_PHOTO_PATH = "/user.png";
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    const sql =
      "INSERT INTO users (username, email, password,photo_profile) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [username, email, hashedPassword, DEFAULT_PROFILE_PHOTO_PATH],
      (err, result) => {
        if (err) {
          console.error("Error menambahkan user:", err);
          return res.status(500).json({ error: "Gagal menambahkan user" });
        }
        res.status(201).json({
          id: result.insertId,
          username: username,
          email: email,
          password: password,
        });
      }
    );
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  // console.log(email + " " + password + " ini di server.js");
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password harus diisi." });
  }
  const sql = "SELECT * FROM users WHERE email = ? ";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error menacari user:", err);
      return res.status(500).json({ error: "Gagal mencari user" });
    }
    if (results.length === 0) {
      console.error("email atau password salah:", err);
      return res.status(500).json({ error: "Email atau password salah" });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Error membandingkan password di bcrypt:", bcryptErr);
        // Error internal server saat membandingkan password
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan server saat login." });
      }
      if (!isMatch) {
        return res.status(401).json({ error: "Email atau password salah." });
      }
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
      };
      console.log("DEBUG: JWT_SECRET for signing:", process.env.JWT_SECRET);
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET, // Kunci rahasia dari .env
        { expiresIn: "1h" } // Token akan kadaluarsa dalam 1 jam
      );
      res.status(200).json({
        message: "Login berhasil!",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          create: user.created_at,
          photo_profile: user.photo_profile,
        },
      });
    });
  });
});

app.get("/api/users/:id", auth, (req, res) => {
  const userId = parseInt(req.params.id);

  const sql =
    "SELECT id, username, email, photo_profile, created_at FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ error: "Gagal mengambil data pengguna." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    res.status(200).json({
      message: "Data pengguna berhasil diambil.",
      user: results[0],
    });
  });
});

app.post("/api/cekPassword", (req, res) => {
  const { id, passwordSekarang } = req.body;
  console.log(id + " " + passwordSekarang);
  const sql = "SELECT password FROM users WHERE id = ? ";
  db.query(sql, [id], (err, results) => {
    // console.log(result);
    bcrypt.compare(
      passwordSekarang,
      results[0].password,
      (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error("Error membandingkan password di bcrypt:", bcryptErr);
          return res.status(500).json({
            error: "Terjadi kesalahan server saat memverifikasi password.",
          });
        }

        if (!isMatch) {
          // Password tidak cocok
          return res.status(401).json({ error: "Password Sekarang salah." });
        }

        // Password cocok
        res.status(200).json({
          message: "Password Sekarang benar.",
          hasil: "password benar", // Sesuaikan dengan yang Anda harapkan di frontend
        });
      }
    );
  });
});

const uploadDir = path.join(__dirname, "uploads", "profile_photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Direktori "${uploadDir}" berhasil dibuat.`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Lokasi penyimpanan file
  },
  filename: function (req, file, cb) {
    // Nama file: gunakan ID pengguna + timestamp + ekstensi asli
    // req.user.id tersedia karena middleware 'auth' akan berjalan sebelum multer
    const userId = req.user.id;
    cb(null, `${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Batasan ukuran file: 2MB (2 * 1024 * 1024 bytes)
  fileFilter: (req, file, cb) => {
    // Filter jenis file (hanya gambar)
    const filetypes = /jpeg|jpg|png|gif|webp/; // Tambahkan webp jika diperlukan
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(
      new Error("Hanya file gambar (JPEG, JPG, PNG, GIF, WebP) yang diizinkan!")
    );
  },
}).single("photo_profile");
app.use("/uploads/profile_photos", express.static(uploadDir));

app.put("/api/updateUser/:id", auth, async (req, res) => {
  upload(req, res, async (err) => {
    const userId = req.params.id;
    const { username, email, password } = req.body;
    let photo_profile_path = null;

    // console.log("ini isinya " + username + " dengan id" + userId);
    if (!username || !email) {
      return res.status(400).json({ error: "Data tidak boleh kosong" });
    }
    const checkDuplicateSql =
      "SELECT id, username, email FROM users WHERE (username = ? OR email = ?) AND id != ?";
    db.query(
      checkDuplicateSql,
      [username, email, userId],
      (checkErr, checkResults) => {
        if (checkErr) {
          console.error("Error checking duplicate user data:", checkErr);
          return res
            .status(500)
            .json({ error: "Terjadi kesalahan server saat memeriksa data." });
        }
        if (checkResults.length > 0) {
          // Deteksi mana yang duplikat (username atau email)
          const duplicatedUser = checkResults[0];
          if (duplicatedUser.username === username) {
            return res
              .status(409)
              .json({ error: "Username sudah digunakan oleh pengguna lain." });
          }
          if (duplicatedUser.email === email) {
            return res
              .status(409)
              .json({ error: "Email sudah digunakan oleh pengguna lain." });
          }
          return res
            .status(409)
            .json({ error: "Username atau Email sudah terdaftar." });
        }
      }
    );

    if (req.file) {
      photo_profile_path = `/uploads/profile_photos/${req.file.filename}`;
      const oldUserSql = `SELECT photo_profile FROM users WHERE id = ?`;
      db.query(oldUserSql, [userId], (err, results) => {
        if (!err && results.length > 0) {
          const oldPhotoPath = results[0].photo_profile;
          if (
            oldPhotoPath &&
            oldPhotoPath !== DEFAULT_PROFILE_PHOTO_PATH &&
            oldPhotoPath.startsWith("/uploads/profile_photos/")
          ) {
            const fullOldPhotoPath = path.join(__dirname, oldPhotoPath);
            fs.unlink(fullOldPhotoPath, (unlinkErr) => {
              if (unlinkErr)
                console.error("Error deleting old profile photo:", unlinkErr);
              else
                console.log(`Old profile photo deleted: ${fullOldPhotoPath}`);
            });
          }
        }
      });
    } else {
      const currentPhotoSql = `SELECT photo_profile FROM users WHERE id = ?`;
      db.query(currentPhotoSql, [userId], (err, results) => {
        if (!err && results.length > 0) {
          photo_profile_path = results[0].photo_profile;
        }
      });
    }

    let sqlUpdateFields = [];
    let sqlUpdateParams = [];

    if (photo_profile_path) {
      sqlUpdateFields.push("photo_profile = ?");
      sqlUpdateParams.push(photo_profile_path);
    }

    sqlUpdateFields.push("username = ?");
    sqlUpdateParams.push(username);
    sqlUpdateFields.push("email = ?");
    sqlUpdateParams.push(email);
    if (password) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10); // <-- await di sini
        sqlUpdateFields.push("password = ?");
        sqlUpdateParams.push(hashedPassword);
      } catch (hashErr) {
        console.error("Error hashing new password:", hashErr);
        return res
          .status(500)
          .json({ error: "Gagal memproses password baru." });
      }
    }
    const finalSql = `UPDATE users SET ${sqlUpdateFields.join(
      ", "
    )} WHERE id = ?`;
    sqlUpdateParams.push(userId);
    db.query(finalSql, sqlUpdateParams, (updateErr, result) => {
      if (updateErr) {
        console.error("Error mengupdate Data:", err);
        return res.status(500).json({ error: "Gagal mengupdate Data" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Data tidak ditemukan" });
      }
      db.query(
        "SELECT id, username, email, created_at, photo_profile FROM users WHERE id = ?",
        [userId],
        (fetchErr, fetchResult) => {
          // ... (penanganan error fetch)
          res.status(200).json({
            message: "Profil berhasil diperbarui!",
            user: fetchResult[0], // <-- Mengirim data user terbaru
          });
        }
      );
    });
  });
});
//------------------------------------------POST----------------------------
app.post("/api/post", auth, (req, res) => {
  const user_id = req.user.id;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res
      .status(400)
      .json({ error: "Konten postingan tidak boleh kosong." });
  }

  const sql = "INSERT INTO posts (user_id, content) VALUES (?, ?)";
  db.query(sql, [user_id, content], (err, result) => {
    if (err) {
      console.error("Error menambahkan post:", err);
      return res.status(500).json({ error: "Gagal menambahkan post" });
    }
    res.status(201).json({
      id: result.id,
      content: result.content,
    });
  });
});

app.get("/api/posts", auth, (req, res) => {
  const sql = `
            SELECT 
                p.id, 
                p.user_id, 
                p.content, 
                p.created_at, 
                u.username,
                u.photo_profile,
                COUNT(c.id) AS commentCount
            FROM 
                posts p
            LEFT JOIN 
                users u ON p.user_id = u.id
            LEFT JOIN
                comments c ON p.id = c.post_id
            GROUP BY 
                p.id,
                p.user_id,
                p.content,
                p.created_at,
                u.username
            ORDER BY 
                p.created_at DESC; 
        `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Error mengambil post:", err);
      return res
        .status(500)
        .json({ error: "Gagal mengambil post karena kesalahan server." });
    }
    const postsData =
      Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    res.status(200).json({
      message: "Postingan berhasil diambil!",
      posts: postsData,
    });
  });
});

app.delete("/api/deletePost/:id", auth, (req, res) => {
  postId = req.params.id;
  const deleteSql = "DELETE FROM posts WHERE id = ?";
  db.query(deleteSql, [postId], (deleteErr, result) => {
    if (deleteErr) {
      console.error("Error menghapus Data:", deleteErr);
      return res.status(500).json({ error: "Gagal menghapus Data" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Data tidak ditemukan" });
    }
    res.status(200).json({
      message: "Data berhasil dehapus!",
    });
  });
});

app.post("/api/addComment", auth, (req, res) => {
  const user_id = req.user.id;
  const { post_id, content } = req.body;
  console.log(post_id + " " + user_id + " " + content);
  const sql =
    "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
  db.query(sql, [post_id, user_id, content], (err, result) => {
    if (err) {
      console.error("Error menambahkan komentar:", err);
      return res.status(500).json({ error: "Gagal menambahkan komentar" });
    }
    res.status(201).json({
      message: "Data berhasil ditambahkan!",
    });
  });
});

app.get("/api/viewComments/:id", auth, (req, res) => {
  const postId = parseInt(req.params.id);

  const sql = `
            SELECT 
                c.id, 
                c.post_id, 
                c.content,
                c.created_at, 
                u.username,
                u.photo_profile
            FROM 
                comments c
            JOIN
                users u ON c.user_id = u.id
            WHERE
                c.post_id = ?
            ORDER BY 
                c.created_at ASC;
        `;
  db.query(sql, [postId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ error: "Gagal mengambil komentar." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "komentar tidak ditemukan." });
    }
    const commentsData =
      Array.isArray(results) && Array.isArray(results[0])
        ? results[0]
        : results;
    res.status(200).json({
      message: "Data pengguna berhasil diambil.",
      comments: commentsData,
    });
  });
});

app.get("/api/cariPosts", auth, (req, res) => {
  const searchTerm = req.query.q;
  console.log(searchTerm);
  if (!searchTerm || searchTerm.trim() === "") {
    return res
      .status(200)
      .json({ message: "Tidak ada kata kunci pencarian.", posts: [] });
  }
  const sql = `
              SELECT 
                  p.id, 
                  p.user_id, 
                  p.content, 
                  p.created_at, 
                  u.username,
                  u.photo_profile,
                  COUNT(c.id) AS commentCount
              FROM 
                  posts p
              LEFT JOIN 
                  users u ON p.user_id = u.id
              LEFT JOIN
                  comments c ON p.id = c.post_id
              WHERE
                  p.content LIKE ?
              GROUP BY 
                  p.id,
                  p.user_id,
                  p.content,
                  p.created_at,
                  u.username
              ORDER BY 
                  p.created_at DESC; 
          `;
  const searchPattern = `%${searchTerm}%`;
  db.query(sql, [searchPattern], (err, rows) => {
    if (err) {
      console.error("Error mengambil post:", err);
      return res
        .status(500)
        .json({ error: "Gagal mengambil post karena kesalahan server." });
    }
    res.status(200).json({
      message: "Postingan berhasil dicari!",
      posts: rows,
    });
  });
});
// POST SAYA-----------------------------------------------------------
app.get("/api/postSaya", auth, (req, res) => {
  const user_id = req.user.id;
  const sql = `
            SELECT 
                p.id, 
                p.user_id, 
                p.content, 
                p.created_at, 
                u.username,
                u.photo_profile,
                COUNT(c.id) AS commentCount
            FROM 
                posts p
            LEFT JOIN 
                users u ON p.user_id = u.id
            LEFT JOIN
                comments c ON p.id = c.post_id
            WHERE
                p.user_id = ?
            GROUP BY 
                p.id,
                p.user_id,
                p.content,
                p.created_at,
                u.username
            ORDER BY 
                p.created_at DESC; 
        `;
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error mengambil data post saya:", err);
      return res.status(500).json({ error: "Gagal mengambil data post saya" });
    }
    const postSayaData =
      Array.isArray(results) && Array.isArray(results[0])
        ? results[0]
        : results;
    res.status(200).json({
      message: "berhasil mengambil data post saya",
      posts: postSayaData,
    });
  });
});

// PROFILE DETAIL-------------------------------------------------------
app.get("/api/profileUser/:id", auth, (req, res) => {
  const profileId = parseInt(req.params.id);

  const sql =
    "SELECT id, username, email, photo_profile, created_at FROM users WHERE id = ?";
  db.query(sql, [profileId], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ error: "Gagal mengambil data pengguna." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    res.status(200).json({
      message: "Data pengguna berhasil diambil.",
      profiles: results,
    });
  });
});

app.get("/api/postProfileUser/:id", auth, (req, res) => {
  const profileId = parseInt(req.params.id);
  const sql = `
            SELECT 
                p.id, 
                p.user_id, 
                p.content, 
                p.created_at, 
                u.username,
                u.photo_profile,
                COUNT(c.id) AS commentCount
            FROM 
                posts p
            LEFT JOIN 
                users u ON p.user_id = u.id
            LEFT JOIN
                comments c ON p.id = c.post_id
            WHERE
                p.user_id = ?
            GROUP BY 
                p.id,
                p.user_id,
                p.content,
                p.created_at,
                u.username
            ORDER BY 
                p.created_at DESC; 
        `;
  db.query(sql, [profileId], (err, results) => {
    if (err) {
      console.error("Error mengambil data post user:", err);
      return res.status(500).json({ error: "Gagal mengambil data post user" });
    }
    const postUserData =
      Array.isArray(results) && Array.isArray(results[0])
        ? results[0]
        : results;
    res.status(200).json({
      message: "berhasil mengambil data post user",
      posts: postUserData,
    });
  });
});
// CARI ORANG---------------------------------------------------------------
app.get("/api/getUsers", auth, (req, res) => {
  const sql =
    "SELECT id, username, email, photo_profile, created_at FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.status(500).json({ error: "Gagal mengambil data users." });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "users tidak ditemukan." });
    }

    res.status(200).json({
      message: "Data users berhasil diambil.",
      users: results,
    });
  });
});
app.get("/api/cariUser", auth, (req, res) => {
  const searchTerm = req.query.q;
  // console.log(searchTerm);
  if (!searchTerm || searchTerm.trim() === "") {
    return res
      .status(200)
      .json({ message: "Tidak ada kata kunci pencarian.", posts: [] });
  }
  const sql = `
              SELECT id, username, email, photo_profile, created_at FROM users WHERE username LIKE ?
          `;
  const searchPattern = `%${searchTerm}%`;
  db.query(sql, [searchPattern], (err, rows) => {
    if (err) {
      console.error("Error mengambil user:", err);
      return res
        .status(500)
        .json({ error: "Gagal mengambil user karena kesalahan server." });
    }
    res.status(200).json({
      message: "Postingan berhasil dicari!",
      posts: rows,
    });
  });
});

app.get("/", (req, res) => {
  res.send("Server Node.js (Backend) berjalan dan terhubung ke MySQL!");
});

app.listen(PORT, () => {
  console.log(`Server Node.js berjalan di http://localhost:${PORT}`);
});
