import { useCallback, useContext, useState } from "react";
import { LoginContext } from "../Context";
export default function Loginview() {
  const { handleRegister, handleCheckUser } = useContext(LoginContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function handleEmail(e) {
    setEmail(e.target.value);
  }
  function handlePassword(e) {
    setPassword(e.target.value);
  }
  const KirimData = useCallback(
    (e) => {
      e.preventDefault();
      setError(null);

      if (email.trim() === "" || password.trim() === "") {
        setError("Harap isi semua field");
        return;
      }

      handleCheckUser(email, password);
      setEmail("");
      setPassword("");
    },
    [email, password]
  );
  return (
    <>
      <h1>LOGIN</h1>
      <form onSubmit={KirimData}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="inputForm">
          <div className="emailLogin">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmail}
              placeholder="Email"
            />
          </div>
          <div className="passwordLogin">
            <input
              type="password"
              name="password"
              value={password}
              onChange={handlePassword}
              placeholder="Password"
            />
          </div>
        </div>
        <button type="submit">Masuk</button>
      </form>
      <p>
        Belum punya akun? <a onClick={handleRegister}>Regsiter</a>
      </p>
    </>
  );
}
