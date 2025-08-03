import { useEffect, useState } from "react";
import "./Profile.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Profile = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="app page-root">
      <Header />
      <div className="profile-page">
        <div className="profile-card">
          <h2>My Profile</h2>
          {user ? (
            <>
              <div className="profile-field">
                <label>First Name</label>
                <p>{user.first_name}</p>
              </div>
              <div className="profile-field">
                <label>Last Name</label>
                <p>{user.last_name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-field">
                <label>User ID</label>
                <p>{user.userID}</p>
              </div>
            </>
          ) : (
            <p className="loading">Loading profile...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
