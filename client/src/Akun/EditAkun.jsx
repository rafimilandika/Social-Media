import { useEffect, useState } from "react";
import axios from "axios";

export default function EditAkun({ currentUser, onSaveSuccess, onCancelEdit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwordSekarang, setPasswordSekarang] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [passwordBaruConf, setPasswordBaruConf] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditPassword, setIsEditPassword] = useState(false);

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState("");

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setEmail(currentUser.email || "");
      setPasswordSekarang("");
      setPasswordBaru("");
      setPasswordBaruConf("");
      setError("");
      setSuccessMessage("");
      setIsEditPassword(false);
      setProfilePhotoPreview(`${BACKEND_URL}${currentUser.photo_profile}`);
      setProfilePhotoFile(null);
    }
  }, [currentUser]);

  const API_CEK_PASSWORD_URL = "http://localhost:5000/api/cekPassword";
  const API_UPDATE_USER_URL = `http://localhost:5000/api/updateUser/${currentUser?.id}`;

  const BACKEND_URL = "http://localhost:5000";

  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
      setError("");
    } else {
      setProfilePhotoFile(null);
      setProfilePhotoPreview(`${BACKEND_URL}${currentUser?.photo_profile}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!username.trim() || !email.trim()) {
      setError("Username dan Email tidak boleh kosong.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    if (profilePhotoFile) {
      formData.append("photo_profile", profilePhotoFile);
    }

    try {
      if (isEditPassword) {
        if (
          !passwordSekarang.trim() ||
          !passwordBaru.trim() ||
          !passwordBaruConf.trim()
        ) {
          setError("Semua field password harus diisi.");
          return;
        }
        if (passwordBaru !== passwordBaruConf) {
          setError("Password Baru dan Konfirmasi Password Baru tidak cocok.");
          return;
        }
        await axios.post(API_CEK_PASSWORD_URL, {
          id: currentUser.id,
          passwordSekarang: passwordSekarang,
        });

        formData.append("password", passwordBaru);
      }
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Sesi tidak valid. Harap login kembali.");
        return;
      }
      const updateResponse = await axios.put(API_UPDATE_USER_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccessMessage(
        updateResponse.data.message || "Profil berhasil diperbarui!"
      );
      if (onSaveSuccess) {
        onSaveSuccess();
        console.log("onSaveSuccess() dipanggil dari EditAkun!");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage =
        err.response?.data?.error || "Gagal memperbarui profil. Coba lagi.";
      setError(errorMessage);
      setSuccessMessage("");
    }
  };
  const handleToogleEditPassword = async (e) => {
    e.preventDefault();
    setIsEditPassword((prev) => !prev);
    setPasswordSekarang("");
    setPasswordBaru("");
    setPasswordBaruConf("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}{" "}
      <div className="editAkun">
        <form onSubmit={handleSubmit}>
          <div className="username">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="email">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* ini bagaian input gambar */}
          <div className="gambar-profil">
            {" "}
            <label htmlFor="photo_profile">Photo Profil</label>
            {profilePhotoPreview && (
              <img
                src={profilePhotoPreview}
                alt="Profile Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "10px",
                  display: "block",
                }}
              />
            )}
            <input
              type="file"
              id="photo_profile"
              name="photo_profile"
              accept="image/*"
              onChange={handlePhotoFileChange}
            />
          </div>
          <button type="button" onClick={handleToogleEditPassword}>
            {isEditPassword ? "Batalkan Edit Password" : "Edit Password"}
          </button>
          {isEditPassword ? (
            <>
              <div className="passwordSekarang">
                <label htmlFor="password_sekarang">Password Sekarang</label>
                <input
                  type="password"
                  name="password_sekarang"
                  value={passwordSekarang}
                  onChange={(e) => setPasswordSekarang(e.target.value)}
                />
              </div>
              <div className="passwordBaru">
                <label htmlFor="Password_baru">Password Baru</label>
                <input
                  type="password"
                  name="password_baru"
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                />
              </div>
              <div className="passwordBaruC">
                <label htmlFor="Password_baru_conf">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  name="Password_baru_conf"
                  value={passwordBaruConf}
                  onChange={(e) => setPasswordBaruConf(e.target.value)}
                />
              </div>
            </>
          ) : (
            ""
          )}
          <button type="submit">Simpan</button>
          <button type="button" onClick={onCancelEdit}>
            Kembali
          </button>
        </form>
      </div>
    </>
  );
}
