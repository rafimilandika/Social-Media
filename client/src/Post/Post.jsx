import { LoginContext } from "../Context";
import { useContext, useState } from "react";
import axios from "axios";

export default function Post({ onPostSuccess }) {
  const { currentUser } = useContext(LoginContext);
  const [post, setPost] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_POST = "http://localhost:5000/api/post";
  const BACKEND_URL = "http://localhost:5000";

  const HandleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!post.trim()) {
      setError("Postingan tidak boleh kosong.");
      return;
    }
    const dataPost = {
      user_id: currentUser.id,
      content: post,
    };

    try {
      const post = await axios.post(API_POST, dataPost);
      setSuccessMessage(post.data.message || "Postingan berhasil diupload");
      setPost("");
      if (onPostSuccess) {
        onPostSuccess();
      }
    } catch (error) {
      console.error("Error post: ", error);
      const errorMessage =
        error.response?.data?.error || "Gagal mengupload postingan";
      setError(errorMessage);
    }
  };
  return (
    <>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && (
        <p style={{ color: "green" }}>{successMessage}</p>
      )}{" "}
      <div className="Tulispost">
        <form onSubmit={HandleSubmit}>
          <img src={`${BACKEND_URL}${currentUser.photo_profile}`} alt="" />
          <textarea
            name="post"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder="Tulis ide Anda"
          ></textarea>
          <button type="submit">Kirim</button>
        </form>
      </div>
    </>
  );
}
