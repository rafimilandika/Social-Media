import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { LoginContext } from "../Context.js";
export default function Message({
  profileToMessageUserData,
  profileToMessageUserId,
}) {
  const GET_USERS = "http://localhost:5000/api/getUsers";
  const API_GET_USER_BY_ID = "http://localhost:5000/api/getUsersById";
  const API_CARI_USER = "http://localhost:5000/api/cariUser";
  const BACKEND_URL = "http://localhost:5000";

  const API_GET_OR_CREATE_CONVERSATION =
    "http://localhost:5000/api/conversation";
  // const API_GET_MESSAGES = "http://localhost:5000/api/messages";
  const API_GET_MESSAGES_FETCH = "http://localhost:5000/api/messagesFetch";
  const API_CREATE_MESSAGES = "http://localhost:5000/api/createMessage";
  const GET_CONVERSATION = "http://localhost:5000/api/getConversation";
  const API_GET_LATEST_MESSAGES = "http://localhost:5000/api/getLatestMessage";
  const API_UPDATE_LATEST_CONVERSATION =
    "http://localhost:5000/api/updateLatestConversation";

  const [isPercakapanBaru, setIsPercakapanBaru] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchORang, setSearchOrang] = useState("");
  const [hasilSearchOrang, setHasilSearchOrang] = useState([]);
  const searchTimeoutRef = useRef(null);
  const [userIdMessage, setUserIdMessage] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMessages, setIsMessages] = useState(false);
  const { currentUser } = useContext(LoginContext);
  const [isiPesan, setIsiPesan] = useState("");
  const [listConv, setListConv] = useState([]);
  const [conversationUpdatedFlag, setConversationUpdatedFlag] = useState(0);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    const fetchGetConversation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(GET_CONVERSATION, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setListConv(response.data.conversation);
      } catch (error) {
        console.error("Error mengambil data users:", error);
      }
    };
    fetchGetConversation();
  }, [GET_CONVERSATION, conversationUpdatedFlag]);

  const fetchGetMessages = async (currentConvId) => {
    if (!currentConvId) {
      console.warn("ConvId is null or undefined, cannot fetch messages.");
      setMessages([]);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const getMessagesResponse = await axios.get(API_GET_MESSAGES_FETCH, {
        params: { convId: currentConvId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages(getMessagesResponse.data.messages);
    } catch (error) {
      console.error("Error mengambil data users:", error);
      setMessages([]);
    }
  };

  const handlePercakapanBaru = async (e) => {
    e.preventDefault();
    setIsPercakapanBaru((prev) => !prev);
    if (isPercakapanBaru) {
      setSearchOrang("");
      setHasilSearchOrang([]);
      setUserIdMessage(null);
      setTargetUser(null);
      setConvId(null);
      setMessages([]);
      setIsMessages(false);
      setIsiPesan("");
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }
  };
  const handleSearchOrang = async (e) => {
    const searchKeyword = e.target.value;
    setSearchOrang(searchKeyword);
    if (searchKeyword.trim() === "") {
      setHasilSearchOrang([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
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

  const handleUserId = async (selectedUserId, selectedUserdata) => {
    setUserIdMessage(selectedUserId);
    setTargetUser(selectedUserdata);

    setIsPercakapanBaru(false);
    setIsMessages(false);
    setMessages([]);
    setConvId(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const getConvResponse = await axios.post(
        API_GET_OR_CREATE_CONVERSATION,
        {
          targetUserId: selectedUserId,
          currentUserId: currentUser.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const conversationId = getConvResponse.data.conversationId;
      if (!conversationId) {
        throw new Error("Gagal mendapatkan atau membuat conversation ID.");
      }
      setConvId(conversationId);
      await fetchGetMessages(conversationId);
      setIsMessages(true);
    } catch (error) {
      console.error("Error mengambil data conversation:", error);
      setConvId(null);
      setMessages([]);
    }
  };

  const handleIsiPesan = async (e) => {
    setIsiPesan(e.target.value);
  };

  const handleKirimPesan = async () => {
    if (!isiPesan.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const postMessage = await axios.post(
        API_CREATE_MESSAGES,
        {
          conversationId: convId,
          sender_id: currentUser.id,
          content: isiPesan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsiPesan("");
      const messagesId = postMessage.data.messagesId;
      const getLatestMessages = await axios.get(
        API_GET_LATEST_MESSAGES,
        {
          params: { messagesId: messagesId },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const latestTime = getLatestMessages.data.latestMessage.created_at;
      const updateLatestConv = await axios.put(
        API_UPDATE_LATEST_CONVERSATION,
        {
          latestTime: latestTime,
          convId: convId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConversationUpdatedFlag((prev) => prev + 1);
      await fetchGetMessages(convId);
    } catch (error) {
      console.error("Error mengambil data conversation:", error);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Menambahkan !e.shiftKey agar Enter+Shift bisa untuk newline
      e.preventDefault(); // Mencegah newline default pada textarea/input
      handleKirimPesan();
    }
  };
  const handleMessagetoConv = async (userTujuan) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const getUserResponse = await axios.get(API_GET_USER_BY_ID, {
        params: { userTujuan },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = getUserResponse.data.user;
      handleUserId(userTujuan, user);
    } catch (error) {
      console.error("Error mengambil data users:", error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (profileToMessageUserId && profileToMessageUserData) {
      handleUserId(profileToMessageUserId, profileToMessageUserData);
    }
  }, [profileToMessageUserId, profileToMessageUserData, currentUser.id]);

  return (
    <>
      <div className="messages">
        <h1>Message</h1>
        {!isMessages && (
          <>
            <div className="percakapanBaru">
              <button onClick={handlePercakapanBaru}>
                {isPercakapanBaru ? "kembali" : "Percakapan Baru"}
              </button>
            </div>
            {isPercakapanBaru ? (
              <>
                <div className="listUserMessages">
                  <input
                    type="text"
                    placeholder="Cari Orang"
                    value={searchORang}
                    onChange={handleSearchOrang}
                  />
                  {usersToDisplay.length > 0 ? (
                    <>
                      {usersToDisplay.map((user) => (
                        <>
                          <div
                            className="user"
                            onClick={() => handleUserId(user.id, user)}
                          >
                            <div className="userImg">
                              {user.photo_profile ? (
                                <img
                                  src={`${BACKEND_URL}${user.photo_profile}`}
                                  alt=""
                                />
                              ) : (
                                <img src={`../public/user.png`} alt="" />
                              )}
                            </div>
                            <h1>{user.username}</h1>
                          </div>
                        </>
                      ))}
                    </>
                  ) : (
                    searchORang.trim() !== "" && (
                      <p>Tidak ada pengguna ditemukan.</p>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="convList">
                {listConv.length > 0
                  ? listConv.map((conv) => (
                      <div
                        className="conv"
                        key={conv.conversation_id}
                        onClick={() => handleMessagetoConv(conv.other_user_id)}
                      >
                        <img
                          src={
                            conv.other_photo_profile
                              ? `${BACKEND_URL}${conv.other_photo_profile}`
                              : `../public/user.png` // Fallback image
                          }
                          alt={conv.other_username}
                          className="conversation-photo" // Tambahkan className untuk styling
                        />
                        <div className="convIsi">
                          <h1>{conv.other_username}</h1>
                          <h4>
                            {(() => {
                              const words =
                                conv.last_message_content.split(" ");
                              if (words.length > 6) {
                                return words.slice(0, 6).join(" ") + "...";
                              }
                              return conv.last_message_content;
                            })()}
                          </h4>
                        </div>
                      </div>
                    ))
                  : ""}
              </div>
            )}
          </>
        )}

        {isMessages && (
          <div className="chat-area">
            <div className="chatAtas">
              <div className="back">
                <button onClick={() => setIsMessages(false)}>
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
              </div>
              {targetUser && ( // Tampilkan info user yang sedang diajak chat
                <div className="chat-header">
                  <img
                    src={
                      targetUser.photo_profile
                        ? `${BACKEND_URL}${targetUser.photo_profile}`
                        : `../public/user.png`
                    }
                    alt={targetUser.username}
                  />
                  <h2>{targetUser.username}</h2>
                </div>
              )}
            </div>

            <div className="messages-list">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-item ${
                      message.sender_id === currentUser.id ? "sent" : "received"
                    }`}
                  >
                    <p className="message-content">{message.content}</p>
                    <span className="message-time">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p>Belum ada pesan di percakapan ini. Mulai chat sekarang!</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-area">
              <input
                type="text"
                placeholder="Ketik pesan..."
                value={isiPesan}
                onChange={handleIsiPesan}
                onKeyPress={handleInputKeyPress}
              />
              <button onClick={handleKirimPesan}>
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
