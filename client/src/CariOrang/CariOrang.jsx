import axios from "axios";
import { useEffect, useRef, useState } from "react";
export default function CariOrang({ handleIsProfile }) {
  const [users, setUsers] = useState([]);
  const [searchORang, setSearchOrang] = useState("");
  const [hasilSearchOrang, setHasilSearchOrang] = useState([]);
  const searchTimeoutRef = useRef(null);
  const GET_USERS = "http://localhost:5000/api/getUsers";
  const API_CARI_USER = "http://localhost:5000/api/cariUser";
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchGetUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(GET_USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error mengambil data users:", error);
        setUsers([]);
      }
    };
    fetchGetUsers();
  }, []);

  const handleUserId = async (userId) => {
    handleIsProfile(userId);
  };
  const handleSearchOrang = async (e) => {
    const searchKeyword = e.target.value;
    setSearchOrang(searchKeyword);
    if (searchKeyword.trim() === "") {
      setHasilSearchOrang([]);
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(API_CARI_USER, {
          params: { q: searchKeyword },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHasilSearchOrang(response.data.posts);
      } catch (error) {
        console.error("DEBUG: Failed to parse cari user:", error);
      }
    }, 500);
  };
  const usersToDisplay = searchORang.trim() !== "" ? hasilSearchOrang : users;

  return (
    <>
      <div className="cariOrang">
        <input
          type="text"
          placeholder="Cari Orang"
          value={searchORang}
          onChange={handleSearchOrang}
        />
        <div className="listUser">
          {usersToDisplay.map((user) => (
            <>
              <div className="user" onClick={() => handleUserId(user.id)}>
                {user.photo_profile ? (
                  <img src={`${BACKEND_URL}${user.photo_profile}`} alt="" />
                ) : (
                  <img src={`../public/user.png`} alt="" />
                )}
                <h1>{user.username}</h1>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}
