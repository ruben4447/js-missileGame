window.addEventListener("load", () => {
	const socket = io();

	socket.on("id-ok", () => {
		const i_username = document.getElementById("username");
		const i_password = document.getElementById("password");

		function createAccount() {
			socket.emit("create-account", { username: i_username.value, password: i_password.value });
		}

		document.getElementById("create").addEventListener("click", createAccount);

		socket.on("alert", text => alert(text));

		socket.on("creation-failed", () => {
			i_username.value = "";
			i_password.value = "";
			alert(`Account creation failed - username already exists`);
		});

		socket.on("account-created", username => {
			location.href = '/index.html?username=' + username;
		});

		window.addEventListener("keydown", e => {
			if (e.key === "Enter") createAccount();
		});
	});

	socket.emit("id", { loc: 0 });
});