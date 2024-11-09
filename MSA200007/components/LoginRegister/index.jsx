import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", { login_name: loginName });
      onLogin(response.data); // Set user data on successful login
      navigate("/users/" + response.data._id); // Redirect to the user's page
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message); // Log detailed error
      setError("Login failed. Please check your login name.");
    }
  };
  

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Enter login name"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginRegister;