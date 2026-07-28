import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Company */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              🌸 BloomBasket
            </h2>

            <p className="text-slate-400 mt-4 leading-7">
              Discover beautiful gifts, elegant decorations,
              personalized photo frames, and premium home décor
              for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Links
            </h3>

            <ul className="space-y-3 text-slate-400">
              <li>
                <Link to="/" className="hover:text-violet-400">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/shop" className="hover:text-violet-400">
                  Shop
                </Link>
              </li>

              <li>
                <Link to="/cart" className="hover:text-violet-400">
                  Cart
                </Link>
              </li>

              <li>
                <Link to="/login" className="hover:text-violet-400">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Contact
            </h3>

            <div className="space-y-4 text-slate-400">

              <div className="flex items-center gap-3">
                <FiMail />
                support@bloombasket.com
              </div>

              <div className="flex items-center gap-3">
                <FiPhone />
                +91 98765 43210
              </div>

              <div className="flex items-center gap-3">
                <FiMapPin />
                Assam, India
              </div>

            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Follow Us
            </h3>

            <div className="flex gap-4 text-2xl">

              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-violet-600 transition"
              >
                <FiFacebook />
              </a>

              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-violet-600 transition"
              >
                <FiInstagram />
              </a>

              <a
                href="#"
                className="bg-slate-800 p-3 rounded-full hover:bg-violet-600 transition"
              >
                <FiTwitter />
              </a>

            </div>
          </div>

        </div>

        <hr className="my-10 border-slate-800" />

        <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">

          <p>
            © 2026 BloomBasket. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link to="/" className="hover:text-violet-400">
              Privacy Policy
            </Link>

            <Link to="/" className="hover:text-violet-400">
              Terms & Conditions
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;