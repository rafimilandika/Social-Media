import { useContext } from "react";
import { LoginContext } from "../Context";
import { useState } from "react";
import { useCallback } from "react";

export default function Registerview() {
  const { handleLogin, handleAddUser } = useContext(LoginContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  function handleNamaRegis(e) {
    setEmail(e.target.value);
  }
  function handlePasswordRegis(e) {
    setPassword(e.target.value);
  }
  function handleUsernameRegis(e) {
    setUsername(e.target.value);
  }
  const KirimData = useCallback(
    (e) => {
      e.preventDefault();
      setError(null);

      if (
        email.trim() === "" ||
        password.trim() === "" ||
        username.trim() === ""
      ) {
        setError("Harap isi semua field");
        return;
      }

      handleAddUser(email, password, username);
      setEmail("");
      setPassword("");
      setUsername("");
    },
    [email, password, username]
  );
  return (
    <>
      <h1>Regsiter</h1>
      <form onSubmit={KirimData}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="inputForm">
          <div className="emailRegsiter">
            <input
              type="email"
              value={email}
              onChange={handleNamaRegis}
              name="email"
              required
              placeholder="Email"
            />
          </div>
          <div className="password">
            <input
              type="pasword"
              value={password}
              onChange={handlePasswordRegis}
              name="password"
              required
              placeholder="Password"
            />
          </div>
          <div className="username">
            <input
              type="text"
              value={username}
              onChange={handleUsernameRegis}
              name="username"
              required
              placeholder="Username"
            />
          </div>
        </div>
        <button type="submit">Kirim</button>
      </form>
      <p>
        Sudah punya akun? <a onClick={handleLogin}>Login</a>
      </p>
    </>
  );
}
