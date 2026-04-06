import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginWithGoogleAsync } from "../store/authSlice.js";
import { RootState, AppDispatch } from "../store/index.js";
import "../styles/LoginPage.css";

export const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginWithGoogleAsync());
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-hero">
        <p className="eyebrow">Firebase Auth + Realtime Database</p>
        <h1>Smart Timetable Scheduler</h1>
        <p className="hero-copy">
          Sign in with your Google account to manage timetable data and persist user profiles in Firebase Realtime Database.
        </p>
      </div>

      <div className="login-card">
        <div className="login-card-header">
          <p className="subtitle">Coordinator Portal</p>
          <h2>Secure Google sign-in</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Connecting to Google..." : "Continue with Google"}
          </button>
        </form>

        <div className="demo-credentials">
          <p className="info-label">Firebase setup</p>
          <p>Enable Google sign-in in Firebase Authentication.</p>
          <p>Signed-in users are stored under <span>users/&lt;uid&gt;</span> in Realtime Database.</p>
        </div>
      </div>
    </div>
  );
};
