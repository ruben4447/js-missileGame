window.addEventListener('load', () => {
  const socket = io();
  socket.emit("id", { loc: 0 }); // Specify where we are
  socket.on("id-ok", () => {
    document.querySelector("input[name='username']").focus();

    const params = new URLSearchParams(location.search.substring(1));
    params.forEach((value, key) => {
      if (key === 'incorrect') {
        alert('Invalid Username or Passcode');
      } else if (key === 'username') {
        document.querySelector("input[name='username']").value = decodeURIComponent(value);
        document.querySelector("input[name='password']").focus();
      } else if (key === 'unauth') {
        alert('Unauthorised Access.');
      } else if (key === 'logout') {
        alert('Logged out successfully.');
      }
    });

    /** TESTING CODE */
    /**/ document.querySelector("input[name='username']").value = "test";
    /**/ document.querySelector("input[name='password']").value = "123";
    /**/ document.getElementById("login").click();
  });
});

window.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    document.getElementById("login").click();
  }
});