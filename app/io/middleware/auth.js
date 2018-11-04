
const PREFIX = "room";

const log = console.log;

module.exports = () => {
	return async (ctx, next) => {
		const {app, socket, logger, helper} = ctx;
		const id = socket.id;
		const nsp = app.io.of("/");
		const query = socket.handshake.query;

		const {room, userId, token} = query;
		const rooms = [room];

		log("#user_info", id, room,userId);

		const tick = (id, msg) => {
			log("#tick", id, msg);
			socket.emit(id, helper.parseMsg("deny", msg));

			nsp.adapter.remoteDisconnect(id, true, err => {
				log(err);
			});
		}

		log("#join", room);

		socket.join(room);
		
		nsp.adapter.clients(rooms, (err, clients) => {
			log("#online_join", clients);

			nsp.to(room).emit("online", {
				clients,
				action: "join",
				target: "participator",
				message: `User(${id}) joined`,
			});
		});

		//setInterval(() => {
			//nsp.to(room).emit(id, "hello world");
			//nsp.to(room).emit("online", "hello world");
		//}, 1000);

		await next();

		log("#leave", room);

		nsp.adapter.clients(rooms, (err, clients) => {
			log("#online_leave", clients);

			nsp.to(room).emit("online", {
				clients,
				action: "leave",
				target: "participator",
				message: `User(${id}) leaved`,
			});
		});
	}
}
