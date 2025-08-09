import { useEffect, useState } from "react";
import "./Profile.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loading } from "../components/loading";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="app page-root">
        <Header />
        <div className="profile-page">
          <Loading message="Loading profile..." fullScreen={false} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app page-root">
        <Header />
        <div className="profile-page">
          <div className="profile-card">
            <h2>Profile Not Found</h2>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app page-root">
      <Header />
      <div className="profile-page">
        <div className="profile-card">
          <h2>My Profile</h2>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
