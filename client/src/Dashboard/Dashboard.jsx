import { useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../Context";
import axios from "axios";
import "../css/dashboard.css";
import Akun from "../Akun/Akun.jsx";
import Post from "../Post/Post.jsx";
import Timeline from "../Timeline/Timeline.jsx";
import PostSaya from "../PostsSaya/PostSaya.jsx";
import Profile from "../Profile/Profile.jsx";
import CariOrang from "../CariOrang/CariOrang.jsx";
import Message from "../Message/Message.jsx";

export default function Dashboard() {
  const { currentUser, handleLogout } = useContext(LoginContext);
  const [lihatAkun, setLihatAkun] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postSaya, setPostSaya] = useState(false);
  const [cariPost, setCariPost] = useState("");
  const [hasilCariPost, setHasilCariPost] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [isProfile, setIsProfile] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [cariOrang, setCariOrang] = useState(false);
  const [message, setMessage] = useState(false);
  const [profileToMessageUserId, setProfileToMessageUserId] = useState(null);
  const [profileToMessageUserData, setProfileToMessageUserData] = useState([]);
  // const [activeView, setActiveView] = useState('profile');

  const API_POSTS_URL = "http://localhost:5000/api/posts";
  const API_CARI_POST = "http://localhost:5000/api/cariPosts";
  const API_GET_USER_ID = "http://localhost:5000/api/getUsersById";

  const BACKEND_URL = "http://localhost:5000";

  const fetchPosts = async () => {
    try {
      const response = await axios.get(API_POSTS_URL);
      const fetchedPosts = response.data.posts;
      setPosts(fetchedPosts);
      localStorage.setItem("posts", JSON.stringify(fetchedPosts));
    } catch (error) {
      console.error(
        "DEBUG: Gagal mengambil data post terbaru di fetchPost:",
        error
      );
    }
  };

  const handleNewPostSuccess = async () => {
    await fetchPosts();
  };

  const handleDeletePostSuccess = async () => {
    await fetchPosts();
  };
  const handleCommntSuccess = async () => {
    await fetchPosts();
  };

  useEffect(() => {
    const loadAndFetchPost = async () => {
      const postsJson = localStorage.getItem("posts");

      if (postsJson) {
        try {
          const parsedPost = JSON.parse(postsJson);
          setPosts(parsedPost);
        } catch (error) {
          console.error("DEBUG: Failed to parse post:", error);
          localStorage.removeItem("posts");
        }
      }
      await fetchPosts();
    };

    loadAndFetchPost();
  }, []);

  function handleLihatAkun(e) {
    e.preventDefault();
    setLihatAkun(true);
  }
  function handletutupLihatAkun() {
    setLihatAkun(false);
  }
  const handlePostSaya = async (e) => {
    e.preventDefault();
    setPostSaya((prev) => !prev);
    setIsProfile(false);
    setCariOrang(false);
    setMessage(false);
  };
  const handleCariOrang = async (e) => {
    e.preventDefault();
    setCariOrang((prev) => !prev);
    setIsProfile(false);
    setPostSaya(false);
    setProfileId(null);
    setMessage(false);
  };
  const handleMessage = async (e) => {
    e.preventDefault();
    setMessage((prev) => !prev);
    setIsProfile(false);
    setPostSaya(false);
    setProfileId(null);
    setCariOrang(false);
    setProfileToMessageUserId(null);
    setProfileToMessageUserData([]);
  };

  const HandleCariPost = async (e) => {
    const searchKeyword = e.target.value;
    setCariPost(searchKeyword);
    if (searchKeyword.trim() === "") {
      setHasilCariPost([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(API_CARI_POST, {
          params: { q: searchKeyword },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHasilCariPost(response.data.posts);
      } catch (error) {
        console.error("DEBUG: Failed to parse cari post:", error);
      }
    }, 500);
  };
  const postsToDisplay = cariPost.trim() !== "" ? hasilCariPost : posts;
  const handleProfileMessage = async (userId) => {
    setProfileToMessageUserId(userId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const getUserData = await axios.get(
        API_GET_USER_ID,
        {
          params: { userTujuan: userId },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = getUserData.data.user;
      setProfileToMessageUserData(userData);
      setMessage(true);
      setIsProfile(false);
      setPostSaya(false);
      setProfileId(null);
      setCariOrang(false);
      // setActiveView('message')
      console.log(userId);
    } catch (error) {
      console.error("Error mengambil data conversation:", error);
      setProfileToMessageUserId(null);
      setProfileToMessageUserData(null);
      // setActiveView('profile');
    }
  };
  function handleIsProfile(userId) {
    setCariOrang(false);
    setPostSaya(false);
    setMessage(false);
    if (profileId === userId) {
      setIsProfile(false);
      setProfileId(null);
      return;
    }
    setIsProfile(true);
    setProfileId(userId);
  }
  // profileToMessageUserData ? alert(profileToMessageUserData.username) : "";
  return (
    <>
      <div
        className={`kontenerDashboard ${
          postSaya || isProfile || cariOrang || message
            ? "with-right-sidebar"
            : ""
        }`}
      >
        <div className="kiri">
          <div className="logo">
            <img src="../public/logo2.png" alt="" />
          </div>
          {lihatAkun ? (
            <Akun handletutupLihatAkun={handletutupLihatAkun} />
          ) : (
            ""
          )}

          {lihatAkun === false ? (
            <div className="akun" onClick={handleLihatAkun}>
              <img src={`${BACKEND_URL}${currentUser.photo_profile}`} alt="" />
              <h2>{currentUser.username}</h2>
            </div>
          ) : (
            ""
          )}
          <div className="fungsiSidebar">
            <div className="SidebarPostSaya" onClick={handlePostSaya}>
              <i class="fa-solid fa-address-card"></i>
              <h3>Post Saya</h3>
            </div>
            <div className="SidebarCariOrang" onClick={handleCariOrang}>
              <i class="fa-solid fa-magnifying-glass"></i>
              <h3>Cari Orang</h3>
            </div>
            <div className="SidebarMessage" onClick={handleMessage}>
              <i class="fa-solid fa-paper-plane"></i>
              <h3>Pesan</h3>
            </div>
          </div>
          <div className="logout">
            <button onClick={handleLogout}>
              <h3>Logout</h3>
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        <div className="tengah">
          <div className="title">
            <h1>Dashboard</h1>
          </div>
          <div className="searchPost">
            <input
              type="text"
              placeholder="Cari Postingan"
              value={cariPost}
              onChange={HandleCariPost}
            />
          </div>
          <Post onPostSuccess={handleNewPostSuccess} />
          <Timeline
            onDeleteSuccess={handleDeletePostSuccess}
            posts={postsToDisplay}
            handleCommntSuccess={handleCommntSuccess}
            handleIsProfile={handleIsProfile}
          />
        </div>
        {postSaya ? (
          <div className="kanan">
            <PostSaya />
          </div>
        ) : (
          ""
        )}
        {isProfile ? (
          <div className="kanan">
            <Profile
              profileId={profileId}
              handleProfileMessage={handleProfileMessage}
            />
          </div>
        ) : (
          ""
        )}
        {cariOrang ? (
          <div className="kanan">
            <CariOrang handleIsProfile={handleIsProfile} />
          </div>
        ) : (
          ""
        )}
        {message ? (
          <div className="kanan">
            <Message
              profileToMessageUserData={profileToMessageUserData}
              profileToMessageUserId={profileToMessageUserId}
            />
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
