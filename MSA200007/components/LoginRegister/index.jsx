import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function LoginRegister({ onLogin }) {
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerLoginName, setRegisterLoginName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [occupation, setOccupation] = useState("");
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  const navigate = useNavigate();

  // Clears all the registration Fields
  const clearRegistrationFields = () => {
    setRegisterLoginName("");
    setRegisterPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setLocation("");
    setDescription("");
    setOccupation("");
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post("/admin/login", { login_name: loginName, password: loginPassword });
      onLogin(response.data); // Set user data on successful login
      navigate("/users/" + response.data._id); // Redirect to the user's detail page
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message); // Log detailed error
      setLoginError("Login failed. Please check your login name and password.");
      setRegisterError(""); // Clear register error message if any
    }
  };

  // Handle registration attempt
  const handleRegister = async () => {
    setLoginName("");
    setLoginPassword("");
    setLoginError(""); // Clear login error message if any

    if (registerPassword !== confirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    try {
      await axios.post("/user", {
        login_name: registerLoginName,
        password: registerPassword,
        first_name: firstName,
        last_name: lastName,
        location,
        description,
        occupation,
      });

      setRegisterSuccess("Registration successful! You can now log in.");
      setRegisterError(""); // Clear any previous error message for registration
      clearRegistrationFields();
    } catch (err) {
      setRegisterError(err.response?.data || "Registration failed. Please try again.");
      setRegisterSuccess("");
    }
  };
  
  return (
    <div className="login-register-container">
      <div className="login-section">
        <h2>Login</h2>
        {loginError && <p className="error-message">{loginError}</p>}
        <input
          type="text"
          placeholder="Enter login name"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
  
      <div className="register-section">
        <h2>Register</h2>
        {registerSuccess && <p className="success-message">{registerSuccess}</p>}
        {registerError && <p className="error-message">{registerError}</p>}
        <input
          type="text"
          placeholder="Enter login name"
          value={registerLoginName}
          onChange={(e) => setRegisterLoginName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={registerPassword}
          onChange={(e) => setRegisterPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />
        <button onClick={handleRegister}>Register Me</button>
      </div>
    </div>
  );  
}

export default LoginRegister;