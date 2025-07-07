import { useContext, useState } from "react";
import { LoginContext } from "../Context";
import axios from "axios";

export default function Timeline({
  onDeleteSuccess,
  posts,
  handleCommntSuccess,
  handleIsProfile,
}) {
  const { currentUser } = useContext(LoginContext);
  const [komentar, setKomentar] = useState("");
  const [openCommentForPostId, setOpenCommentForPostId] = useState(null);
  const [listKomenId, setListKomenId] = useState(null);
  const [listKomentar, setListKomentar] = useState([]);

  const API_ADD_COMMENT_URL = "http://localhost:5000/api/addComment";
  const BACKEND_URL = "http://localhost:5000";

  const handleDeletePost = async (id) => {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus postingan ini?`
    );

    if (!isConfirmed) {
      return;
    }
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/deletePost/${id}`
      );
      console.log(response.data.message);
      alert(response.data.message);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error menghapus postingan:", error);
      const errorMessage =
        error.response?.data?.error || "Gagal menghapus postingan.";
      alert(errorMessage);
    }
  };
  const handleKomenButton = (postId) => {
    setOpenCommentForPostId(openCommentForPostId === postId ? null : postId);
    setKomentar("");
  };

  const handleSubmitComment = async (postId) => {
    if (!komentar.trim()) {
      alert("Komentar tidak boleh kosong.");
      return;
    }
    const KomentarData = {
      post_id: postId,
      user_id: currentUser.id,
      content: komentar,
    };
    try {
      const response = await axios.post(API_ADD_COMMENT_URL, KomentarData);
      setOpenCommentForPostId(null);
      setKomentar("");
      if (handleCommntSuccess) {
        handleCommntSuccess();
      }
    } catch (error) {
      console.error("Error add comment:", err);
    }
  };
  const handleLIhatKomentar = async (postId) => {
    if (listKomenId === postId) {
      setListKomenId(null);
      setListKomentar([]);
      return;
    }

    setListKomenId(postId);
    setListKomentar([]);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/viewComments/${postId}`
      );
      const fetchedComments = response.data.comments;
      setListKomentar(fetchedComments);
    } catch (error) {
      console.error("Error mengambil komentar:", error);
      setListKomentar([]);
    }
  };
  const klikProfile = async (userId) => {
    // alert(userId);
    handleIsProfile(userId);
  };
  if (!Array.isArray(posts) || posts.length === 0) {
    return <p>Belum ada postingan untuk ditampilkan.</p>; // Atau pesan lain
  }
  return (
    <>
      <div className="timeline">
        {posts && posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <>
                <div className="post" key={post.id}>
                  <div
                    className="gambar"
                    onClick={() => klikProfile(post.user_id)}
                  >
                    <img src={`${BACKEND_URL}${post.photo_profile}`} alt="" />
                  </div>
                  <div className="isi">
                    <div className="userPost">
                      <h4 onClick={() => klikProfile(post.user_id)}>
                        {post.username}
                      </h4>
                      <h5>{new Date(post.created_at).toLocaleDateString()}</h5>
                    </div>
                    <div className="hapusPost">
                      {currentUser.id === post.user_id ? (
                        <>
                          <button onClick={() => handleDeletePost(post.id)}>
                            <i class="fa-solid fa-trash"></i>
                          </button>
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className="isi_postingan">
                      <h3>{post.content}</h3>
                    </div>
                    <div className="komentar">
                      <button
                        className="tombolKomentar"
                        onClick={() => handleKomenButton(post.id)}
                      >
                        Komentar
                      </button>
                      {openCommentForPostId === post.id && (
                        <>
                          <div className="buatKomentar">
                            <img
                              src={`${BACKEND_URL}${currentUser.photo_profile}`}
                              alt=""
                            />
                            <textarea
                              value={komentar}
                              onChange={(e) => setKomentar(e.target.value)}
                              placeholder="Tulis komentar Anda..."
                              rows="4"
                            ></textarea>
                            <button
                              onClick={() => handleSubmitComment(post.id)}
                            >
                              Kirim Komentar
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <h5
                      className="totalKomentar"
                      onClick={() => handleLIhatKomentar(post.id)}
                    >
                      ada {post.commentCount} komentar
                    </h5>
                    {listKomenId === post.id && (
                      <>
                        {/* {listKomentar.length === 0 && <p>belum ada komentar</p>} */}
                        {listKomentar.map((comment) => (
                          <div className="listKomentar" key={comment.id}>
                            <img
                              src={`${BACKEND_URL}${comment.photo_profile}`}
                              alt=""
                            />
                            <div className="isiListKomentar">
                              <h4>{comment.username}</h4>
                              <h6>
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </h6>
                              <h5>{comment.content}</h5>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <div className="garisPembagi"></div>
              </>
            ))}
          </>
        ) : (
          <div className="belumPosting">
            <h1>belum ada postingan</h1>
          </div>
        )}
      </div>
    </>
  );
}
