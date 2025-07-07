import Login from "./Login/Loginview.jsx";
import Register from "./Register/Registerview.jsx";
import { useContext } from "react";
import { LoginContext } from "./Context";
import "./css/awal.css";
export default function Awal() {
  const { isLogin } = useContext(LoginContext);
  return (
    <>
      <div className="kontenerAwal">
        <div className="background">
          <img src="/public/awal/bg.png" alt="" />
        </div>
        <div className="formAwal">
          {/* <img src="/public/logo1.png" alt="" /> */}
          {isLogin === true ? <Login /> : <Register />}
        </div>
      </div>
    </>
  );
}
