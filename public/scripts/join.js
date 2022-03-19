window.addEventListener("load", () => {
  const socket = io();
  const params = new URLSearchParams(location.search.substring(1)), token = Array.from(params)?.[0]?.[0], gameID = params.get("id");

  socket.on("alert", text => alert(text));
  socket.on("redirect", url => location.href = url);
  socket.on("goto-game", () => location.href = `/game.html?${token}?id=${gameID}`);
  socket.on("id-ok", game => {
    document.getElementById("link-back").href = "/menu.html?" + token;

    if (game === null) {
      alert(`Game does not exist [ID=${gameID}]`);
      location.href = "/menu.html?" + token;
    } else {
      document.querySelectorAll(".game-name").forEach(e => e.innerText = game.name);
      const container = document.getElementById("container");
      container.innerHTML = "";

      container.insertAdjacentHTML("beforeend", `<p>Game State: <span>${game.icon}</span> ${game.state}</p>`);
      let onenter;

      if (game.winner !== null) {
        container.insertAdjacentHTML("beforeend", "<p>This game has a winner and therefore is not accepting any players</p>");
        container.insertAdjacentHTML("beforeend", `<p>Winner: <strong>${game.winner}</strong></p>`);
      } else if (game.state === "closed") {
        container.insertAdjacentHTML("beforeend", "<p><em>Only the game creator who knows the game password can open this game.<br>If you wish to join this game, please wait until it has been opened.</em></p>");
        let p = document.createElement("p");
        let input = document.createElement("input");
        input.type = "password";
        input.placeholder = "Game Password";
        p.appendChild(input);
        container.appendChild(p);
        let btn = document.createElement("button");
        btn.innerText = "Open Game";
        btn.addEventListener("click", () => socket.emit("join-game", { password: input.value.trim() }));
        onenter = () => btn.click();
        container.appendChild(btn);
      } else if (game.state === "open") {
        container.insertAdjacentHTML("beforeend", "<p><em>One person is in the game. Enter game join code to join them.</em></p>");
        let p = document.createElement("p");
        let input = document.createElement("input");
        input.type = "password";
        input.placeholder = "Join Code";
        p.appendChild(input);
        container.appendChild(p);
        let btn = document.createElement("button");
        btn.innerText = "Join Game";
        btn.addEventListener("click", () => socket.emit("join-game", { code: +input.value.trim() }));
        onenter = () => btn.click();
        container.appendChild(btn);
      } else if (game.state === "full") {
        container.insertAdjacentHTML("beforeend", "<p>&#128683; This game cannot be joined as it is currently full &#128683;</p>");
      } else if (game.state === "locked") {
        container.insertAdjacentHTML("beforeend", "<p>&#128274; This game has been locked and cannot be accessed at this time &#128274;</p>");
      } else {
        container.insertAdjacentHTML("beforeend", `<em>Internal Error: unknown game state</em>`);
      }

      window.addEventListener("keydown", e => {
        if (onenter && e.key === "Enter") onenter();
      });
    }
  });

  socket.emit("id", { token, loc: 3, gameID });
});