function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#222",
        color: "white",
      }}
    >
      <h2>BloomBasket</h2>

      <div>
        <a href="#" style={{ color: "white", marginRight: "20px" }}>
          Home
        </a>
        <a href="#" style={{ color: "white", marginRight: "20px" }}>
          Shop
        </a>
        <a href="#" style={{ color: "white", marginRight: "20px" }}>
          Cart
        </a>
        <a href="#" style={{ color: "white" }}>
          Login
        </a>
      </div>
    </nav>
  );
}

export default Navbar;