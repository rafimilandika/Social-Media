import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { LoginContext } from "../Context";

export default function Profile({ profileId, handleProfileMessage }) {
  const { currentUser } = useContext(LoginContext);
  const [profiles, setprofiles] = useState([]);
  const [userPost, setUserPost] = useState([]);
  const [komentar, setKomentar] = useState("");
  const [openCommentForPostId, setOpenCommentForPostId] = useState(null);
  const [listKomenId, setListKomenId] = useState(null);
  const [listKomentar, setListKomentar] = useState([]);

  const BACKEND_URL = "http://localhost:5000";
  const API_ADD_COMMENT_URL = "http://localhost:5000/api/addComment";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/profileUser/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setprofiles(response.data.profiles);
      } catch (error) {
        console.error("Error mengambil data profile:", error);
        setprofiles([]);
      }
    };
    const fetchPostProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/postProfileUser/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserPost(response.data.posts);
      } catch (error) {
        console.error(
          "DEBUG: Gagal mengambil data post terbaru di fetchPost:",
          error
        );
      }
    };
    fetchProfile();
    fetchPostProfile();
  }, [profileId]);

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
    } catch (err) {
      console.error("Error add comment:", err);
    }
  };
  const handleKomenButton = (postId) => {
    setOpenCommentForPostId(openCommentForPostId === postId ? null : postId);
    setKomentar("");
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
  const handleKirimPesan = async (profileId) => {
    handleProfileMessage(profileId);
  };
  return (
    <div className="profile">
      {profiles.map((profile) => (
        <div className="profileUser">
          <img src={`${BACKEND_URL}${profile.photo_profile}`} alt="" />
          <div className="profileUserDetail">
            <h1>{profile.username}</h1>
            <h2>{profile.email}</h2>
            {currentUser.id !== profile.id ? (
              <div className="tombolKirimPesan">
                <button onClick={() => handleKirimPesan(profile.id)}>
                  Kirim Pesan
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      ))}
      <div className="garisPembagi"></div>
      <div className="postSaya">
        {userPost && userPost.length > 0 ? (
          <>
            {userPost.map((post) => (
              <>
                <div className="post" key={post.id}>
                  <div className="gambar">
                    <img src={`${BACKEND_URL}${post.photo_profile}`} alt="" />
                  </div>
                  <div className="isi">
                    <div className="userPost">
                      <h4>{post.username}</h4>
                      <h5>{new Date(post.created_at).toLocaleDateString()}</h5>
                    </div>
                    {currentUser.id === profileId ? (
                      <div className="hapusPost">
                        <button onClick={() => handleDeletePost(post.id)}>
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
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
    </div>
  );
}
