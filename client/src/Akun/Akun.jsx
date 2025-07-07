import { useContext, useState } from "react";
import { LoginContext } from "../Context";
import AkunView from "./AkunView.jsx";
import EditAkun from "./EditAkun.jsx";
export default function Akun({ handletutupLihatAkun }) {
  const { currentUser, onProfileUpdateSuccess } = useContext(LoginContext);
  const [isEditUser, setIsEditUser] = useState(false);

  const handleSaveSuccess = () => {
    if (onProfileUpdateSuccess) {
      onProfileUpdateSuccess();
    }
    setIsEditUser(false);
    if (handletutupLihatAkun) {
      handletutupLihatAkun();
    }
  };

  const handleCancelEdit = () => {
    setIsEditUser(false);
  };

  return (
    <>
      {isEditUser === false ? (
        <AkunView
          currentUser={currentUser}
          onEditClick={() => setIsEditUser(true)}
          onBackClick={handletutupLihatAkun} // Ini untuk menutup Akun secara keseluruhan
        />
      ) : (
        <EditAkun
          currentUser={currentUser}
          onSaveSuccess={handleSaveSuccess} // <-- Pasang callback ini
          onCancelEdit={handleCancelEdit} // <-- Pasang callback ini untuk tombol "Kembali" di form edit
        />
      )}
    </>
  );
}
