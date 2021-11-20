
$(document).ready(() => {

    // todo: init
    $('#main').hide();
    var _NICKNAME = '';
    var _GROUP = null;
    $('#nickname').focus();

    // todo: alert function
    function alert(message, type, element) {
        var wrapper = document.createElement('div')
        wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
        element.append(wrapper)
    }

    // todo: init socket.io

    const socket = io();

    socket.onAny((event, args) => {
        console.log(`event: `, event, `\nargs: `, args);
    })



    // todo: set nickname function
    const setNickname = () => {
        const nickname = $('#nickname').val()
        if (nickname.length > 0) {
            socket.emit('set-nickname', { nickname: nickname })
        } else {
            alert('Vui lòng đặt tên', 'danger', $('#alert-login'))
        }
    }

    // todo: set listener click on button set-nickname
    $('#btn-set-nickname').on('click', () => { setNickname() })
    $('#nickname').on('keypress', (e) => {
        if (e.keyCode === 13) {
            $('#btn-set-nickname').click();
        }
    });

    // todo: listen result set nickname
    socket.on('set-nickname-result', (data) => {
        if (data.success) {
            $('#main').show()
            $('#login').hide()
            _NICKNAME = data.nickname

        } else {
            alert(data.message, 'danger', $('#alert-login'))
        }
    })

    // todo: get list users online global
    socket.on('users-online-global', (data) => {
        $('#users-online-global').html('')
        data.forEach(element => {
            $('#users-online-global').append(`<li class=" list-group-item">${element}</li>`)
        });
    })

    // todo: send message function
    const sendMessage = () => {
        const message = $('#chat-global').val()
        if (message.length > 0) {
            socket.emit('send-message-global', { message: message })
            $('#chat-global').val('')
            $('#chat-global').focus()
        } else {
            alert('Vui lòng nhập tin nhắn', 'danger', $('#alert-chat-global'))
        }
    }

    // todo: set listener click on button send-message-global
    $('#btn-send-message-global').on('click', () => { sendMessage() })
    $('#chat-global').on('keypress', (e) => {
        if (e.keyCode === 13) {
            $('#btn-send-message-global').click();
        }
    });

    // todo: listen recevied message
    socket.on('recevied-message-global', (data) => {
        if (data.nickname == 'Thông báo') {
            $('#message-global').append(`<p style='color:red'> ${data.nickname}: ${data.message}</p>`)
        } else if (data.nickname == _NICKNAME) {
            $('#message-global').append(`<p> Bạn: ${data.message}</p>`)
        } else {
            $('#message-global').append(`<p> ${data.nickname}: ${data.message}</p>`)
        }
        $('#message-global').scrollTop($('#message-global')[0].scrollHeight)
    })

    // todo: send file global
    const sendFileGlobal = () => {
        const file = $('#file-global').prop('files')[0]
        if (file) {
            const blob = new Blob([file], { type: 'application/octet-stream' })
            if (file.size < 1024 * 1024 * 10)
                socket.emit('send-file-global', { file: blob, filename: file.name })
        } else {
            alert('File phải nhỏ hơn 10MB', 'danger', $('#alert-chat-global'))
        }
        $('#file-global').val('')
    }

    // todo: set listener click on input send-file-global
    $('#file-global').on('change', () => { sendFileGlobal() })

    // todo: listen recevied file global
    socket.on('recevied-file-global', (data) => {
        alert(`Bạn vừa nhận file từ ${data.nickname} `, 'success', $('#alert-chat-global'))
        const file = new Blob([data.file], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = data.filename;
        link.click();
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 10000);
    })

    //////////////////////////////////////

    // todo: join group function
    const joinGroup = () => {
        const groupName = $('#group-name').val()
        if (groupName.length > 0) {
            socket.emit('join-group', { groupName: groupName, groupCurrent: _GROUP })
        } else {
            alert('Vui lòng nhập mã nhóm', 'danger', $('#info-group'))
        }
    }

    // todo: set listener click on button join-group
    $('#btn-join-group').on('click', () => { joinGroup() })

    // todo: listen result join group
    socket.on('join-group-result', (data) => {
        if (data.success) {
            _GROUP = data.groupCurrent
            $('#info-group').html(`Mã nhóm hiện tại là: ${_GROUP}`)
            $('#message-group').html('')
        }
    })

    // todo: send message group function
    const sendMessageGroup = () => {
        const message = $('#chat-group').val()
        if (message.length > 0) {
            socket.emit('send-message-group', { message: message })
            $('#chat-group').val('')
            $('#chat-group').focus()
        } else {
            alert('Vui lòng nhập tin nhắn', 'danger', $('#alert-chat-group'))
        }
    }

    // todo: set listener click on button send-message-group
    $('#btn-send-message-group').on('click', () => { sendMessageGroup() })
    $('#chat-group').on('keypress', (e) => {
        if (e.keyCode === 13) {
            $('#btn-send-message-group').click();
        }
    })

    // todo: listen recevied message group
    socket.on('recevied-message-group', (data) => {
        if (data.nickname == 'Thông báo') {
            $('#message-group').append(`<p style='color:red'> ${data.nickname}: ${data.message}</p>`)
        } else if (data.nickname == _NICKNAME) {
            $('#message-group').append(`<p> Bạn: ${data.message}</p>`)
        } else {
            $('#message-group').append(`<p> ${data.nickname}: ${data.message}</p>`)
        }
        $('#message-group').scrollTop($('#message-group')[0].scrollHeight)
    })

    // todo: send file group
    const sendFileGroup = () => {
        const file = $('#file-group').prop('files')[0]
        if (file) {
            const blob = new Blob([file], { type: 'application/octet-stream' })
            if (file.size < 1024 * 1024 * 10)
                socket.emit('send-file-group', { file: blob, filename: file.name })
        } else {
            alert('File phải nhỏ hơn 10MB', 'danger', $('#alert-chat-group'))
        }
        $('#file-group').val('')
    }

    // todo: set listener click on input send-file-group
    $('#file-group').on('change', () => { sendFileGroup() })

    // todo: listen recevied file group
    socket.on('recevied-file-group', (data) => {
        alert(`Bạn vừa nhận file từ ${data.nickname} trong nhóm ${data.groupName} `, 'success', $('#alert-chat-group'))
        const file = new Blob([data.file], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = data.filename;
        link.click();
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 10000);
    })

    // todo: get users online group
    socket.on('users-online-group', (data) => {
        $('#users-online-group').html('')
        data.forEach(element => {
            $('#users-online-group').append(`<li class=" list-group-item">${element}</li>`)
        })
    })

})