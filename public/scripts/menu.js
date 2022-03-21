window.addEventListener("load", function () {
  const socket = io(); // Setup socket
  const params = Array.from(new URLSearchParams(location.search.substring(1)));
  const token = params?.[0]?.[0];

  for (let i = 1; i < params.length; i++) {
    if (params[i][0] === "closed") alert(`Admin has left the game`);
    else if (params[i][0] === "gone") alert(`Game has been deleted`);
    else if (params[i][0] === "locked") alert(`Game has been locked`);
  }

  // Setup event handlers
  socket.on("alert", txt => alert(txt));
  socket.on("redirect", url => (location.href = url));
  socket.on("id-ok", ({ username }) => {
    document.querySelectorAll(".username").forEach(el => el.innerText = username);
    socket.emit("gamelist");
  });
  socket.on("gamelist", games => {
    document.getElementById("game-count").innerText = Object.keys(games).length.toLocaleString("en-GB");
    const ul = document.getElementById("game-list");
    ul.innerHTML = "";
    for (let game in games) {
      ul.insertAdjacentHTML("beforeend", `<li><span title='${games[game].state}'>${games[game].icon}</span> &nbsp; <a href='/join.html?${token}&id=${games[game].id}'>${games[game].name}</a></li>`);
    }
  });

  socket.emit("id", { loc: 1, token });

  document.getElementById("link-create").setAttribute("href", "/create-game.html?" + token);
  document.getElementById("link-logout").setAttribute("href", "/logout/" + token);
  document.getElementById("link-delete").setAttribute("href", "javascript:void(0)");
  document.getElementById("link-delete").addEventListener('click', () => confirm("Delete account? This cannot be undone.") && (location.href = "/delete/" + token));
});