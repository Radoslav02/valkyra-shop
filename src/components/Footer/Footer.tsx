import './Footer.css';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Kontakt</h3>
          <p>Email: <a className="footer-mail" href='https://mail.google.com/'>valkyradesign@gmail.com</a></p>
          <p>Telefon: +381 63 1225 113</p>
        </div>
        <div className="footer-section">
          <h3>Pratite nas</h3>
          <span>
            <a
              href="https://www.facebook.com/profile.php?id=100074060473333"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="https://www.instagram.com/kreativni_studio_valkyra/"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.youtube.com/channel/UCv4m3muznADIPFpA0DgF27Q"
              aria-label="Youtube"
            >
              <YouTubeIcon />
            </a>
          </span>
        </div>
        <div className="footer-section">
          <h3>Adresa</h3>
          <p>Mitrovačka 16, Novi Sad</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 PR. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
