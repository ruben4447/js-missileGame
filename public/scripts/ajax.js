class AjaxRequest {
	static Send(type, file, data, callback) {
		if (type.toLowerCase() == 'get') {
			let request = new XMLHttpRequest();

			let path = file + '?';
			for (let key in data)
				path += key + '=' + data[key] + '&';
			path = path.substring(0, path.length - 1);

			request.open('GET', path);
			request.onload = function () {
				callback(request);
			};
			request.send();
		} else if (type.toLowerCase() == 'post') {
			let request = new XMLHttpRequest();

			let args = '';
			for (let key in data)
				args += key + '=' + data[key] + '&';
			args = args.substring(0, args.length - 1);

			request.open('POST', file);
			request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			request.onload = function () {
				callback(request);
			};
			request.send(args);
		} else throw 'TypeError: Unsupported request type \'' + type + '\'';

		return Date.now();
	}
}