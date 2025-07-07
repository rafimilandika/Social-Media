import React from "react";
export default function AkunView({ currentUser, onBackClick, onEditClick }) {
  const BACKEND_URL = "http://localhost:5000";
  return (
    <>
      <div className="akunView">
        <div className="kembali">
          <button onClick={onBackClick}>
            <i class="fa-solid fa-arrow-left"></i> kembali
          </button>
        </div>
        <img src={`${BACKEND_URL}${currentUser.photo_profile}`} alt="" />
        <div className="dataUser">
          <h1>{currentUser.username}</h1>
          <h2>{currentUser.email}</h2>
        </div>
        <div className="edit">
          <button onClick={onEditClick}>
            Edit
            <i class="fa-solid fa-user-pen"></i>
          </button>
        </div>
      </div>
    </>
  );
}
