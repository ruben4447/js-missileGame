window.addEventListener("load", () => {
  const socket = io();
  const token = Array.from(new URLSearchParams(location.search.substring(1)))?.[0]?.[0];

  const divCreateGame = document.getElementById("div-create-game");
  const divCreatedGame = document.getElementById("div-created-game");
  const i_name = document.getElementById("input-name");
  const i_password = document.getElementById("input-password");
  divCreatedGame.setAttribute("hidden", "hidden");

  socket.on("alert", text => alert(text));
  socket.on("redirect", url => (location.href = url));
  socket.on("id-ok", () => {
    function createGame() {
      socket.emit("create-game", { name: i_name.value, password: i_password.value });
    }

    document.getElementById("btn-create").addEventListener("click", createGame);
    document.querySelectorAll(".link-menu").forEach(e => e.href = "/menu.html?" + token);

    socket.on("creation-failed", () => {
      i_name.value = "";
      i_password.value = "";
      alert(`Game creation failed - game with this name already exists`);
    });

    socket.on("game-created", ({ name, code }) => {
      document.getElementById("span-name").innerText = name;
      document.getElementById("span-code").innerText = code;
      divCreateGame.setAttribute("hidden", "hidden");
      divCreatedGame.removeAttribute("hidden");
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Enter") createGame();
    });
  });

  socket.emit("id", { token, loc: 2 });
});