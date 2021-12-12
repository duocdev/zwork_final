const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { maxHttpBufferSize: 1e8 });
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + 'public/index.html');
});

const users = []
const groups = {}

io.on('connection', (socket) => {
    socket.onAny((event, args) => {
        console.log(`event: `, event, `\nargs: `, args);
    })

    socket.on('disconnect', () => {
        if (socket.nickname) {
            users.splice(users.indexOf(socket.nickname), 1);
            io.emit('users-online-global', users);
            io.emit('recevied-message-global', { nickname: 'Thông báo', message: `${socket.nickname} vừa thoát.` });
        }
        if (socket.group) {
            groups[socket.group].splice(groups[socket.group].indexOf(socket.nickname), 1);
            io.to(socket.group).emit('users-online-group', groups[socket.group]);
            io.to(socket.group).emit('recevied-message-group', { nickname: 'Thông báo', message: `${socket.nickname} vừa thoát.` });
        }
    });

    socket.on('set-nickname', ({ nickname }) => {
        if (users.includes(nickname)) {
            socket.emit('set-nickname-result', { success: false, message: 'Tên này đã được người khác đặt.' });
        } else {
            users.push(nickname);
            socket.nickname = nickname;
            socket.emit('set-nickname-result', { success: true, nickname });
            io.emit('users-online-global', users);
            io.emit('recevied-message-global', { nickname: 'Thông báo', message: `${nickname} vừa tham gia.` });
        }
    })

    socket.on('send-message-global', ({ message }) => {
        io.emit('recevied-message-global', { nickname: socket.nickname, message });
    })

    socket.on('send-file-global', (data) => {
        socket.broadcast.emit('recevied-file-global', { nickname: socket.nickname, file: data.file, filename: data.filename });
    })

    //////////////////////// Chat Room ////////////////////////


    socket.on('join-group', ({ groupName, groupCurrent }) => {
        if (groupCurrent) {
            socket.leave(groupCurrent);
            groups[groupCurrent].splice(groups[groupCurrent].indexOf(socket.nickname), 1);
        }
        socket.join(groupName);
        socket.group = groupName;
        let group = groups[groupName] || [];
        groups[groupName] = group.concat(socket.nickname);
        socket.emit('join-group-result', { success: true, groupCurrent: groupName });
        io.to(groupName).emit('users-online-group', groups[groupName]);
        io.to(groupName).emit('recevied-message-group', { nickname: 'Thông báo', message: `${socket.nickname} vừa tham gia.` });

    })

    socket.on('send-message-group', ({ message }) => {
        io.to(socket.group).emit('recevied-message-group', { nickname: socket.nickname, message });
    })

    socket.on('send-file-group', (data) => {
        socket.to(socket.group).emit('recevied-file-group', { groupName: socket.group, nickname: socket.nickname, file: data.file, filename: data.filename });
    })

})

