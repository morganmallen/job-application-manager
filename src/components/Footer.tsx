import logo from "../assets/NextStep-logo.svg";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo-section">
          <img src={logo} alt="NextStep Logo" className="footer-logo" />
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>Email: info@nextstep.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Main St, Testtown, USA</p>
        </div>
        <div className="footer-col">
          <h4>Group 7</h4>
          <p>Morgan Allen</p>
          <p>Andres Aaron Pluska</p>
          <p>James Charlie Ibasco Salva</p>
          <p>Jose Luis Martinez Rivera</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
