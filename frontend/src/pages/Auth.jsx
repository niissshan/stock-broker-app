import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  // ✅ Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Password validation function
  const isValidPassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async () => {

    // REQUIRED FIELDS CHECK
    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill all required fields");
      return;
    }

    // EMAIL FORMAT CHECK
    if (!isValidEmail(email)) {
      alert("Please enter a valid email address (example@gmail.com)");
      return;
    }

    // PASSWORD RULE CHECK
    if (!isValidPassword(password)) {
      alert(
        "Password must contain:\n" +
        "- At least 8 characters\n" +
        "- One uppercase letter\n" +
        "- One lowercase letter\n" +
        "- One number\n" +
        "- One special character (@$!%*?&)"
      );
      return;
    }

    // CONFIRM PASSWORD CHECK (SIGNUP ONLY)
    if (!isLogin && password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/login", {
          email,
          password
        });
        localStorage.setItem("userEmail", res.data.email);
        navigate("/dashboard");
      } else {
        await axios.post("http://localhost:5000/api/signup", {
          email,
          password
        });
        alert("Account created successfully");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">

        <h2>{isLogin ? "Welcome Back!" : "Create Your Account"}</h2>
        <p className="subtitle">
          {isLogin ? "Login to your account" : "Sign up to get started"}
        </p>

        {!isLogin && (
          <input
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          placeholder="Email Address"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            placeholder="Confirm Password"
            type="password"
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}

        <button onClick={handleSubmit}>
          {isLogin ? "Log In" : "Sign Up"}
        </button>

        {isLogin && <span className="forgot">Forgot Password?</span>}

        <p className="switch">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign Up" : " Log In"}
          </span>
        </p>

      </div>
    </div>
  );
}
