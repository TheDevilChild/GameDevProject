const chatsList = document.getElementById('chatsList');
const chatContainer = document.getElementById('chatContainer');
const messageContainer = document.getElementById('messageContainer');
const currentChatName = document.getElementById('currentChatName');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const messageContent = document.getElementById('messageContent');
const noMessageContainer = document.getElementById('noMessageContainer');
const chatIcon = document.getElementById('chatIcon');
const socket = io();
const renderChatsList = async () => {
	const followingUsers = await axios.get(`/api/users/${currentUser._id}/following`);
	console.log(followingUsers);
	let i = 0;
	followingUsers.data.forEach(user => {
		if(i%2 == 0)
		chatsList.insertAdjacentHTML('beforeend', createChatsListItem(user));
		i++;
	})
}

const createChatsListItem = (user) => {
	return `
	<div id="${user._id}" class="user-info chat-list">
		<img src="${user.profilePic}" class = "chat-list-img"></img>
		<span class="chat-list-user">
	${user.fullname}
		</span>
	</div>	`
}
chatsList.addEventListener('click', async (e) => {
	if (e.target.closest('.user-info')) {
		const id = e.target.closest('.user-info').id;
		const chat = await axios.get(`/api/chats/${id}/${currentUser._id}`);
		socket.emit('join-chat-room', chat.data._id);
		console.log(chat);
		renderChat(chat.data);
	}
})

sendMessageBtn.addEventListener('click', async () => {
	const messageText = messageContent.value;
	const chatId = sendMessageBtn.dataset.chatId;
	if (messageText.trim() != '') {
		noMessageContainer.classList.add('hidden');
		const messageData = {
			content: messageText,
			chatId: chatId,
			sender: currentUser._id
		}
		const message = await axios.post('/api/messages', messageData)
			.catch(err => { console.log(err) });
		socket.emit('message-received', { message, chatId });
		messageContent.value = '';
		messageContainer.insertAdjacentHTML('beforeend', createMessage(message.data));
		messageContainer.scrollTop = messageContainer.scrollHeight;

	}

})

messageContent.addEventListener('keyup', (e) => {
	if (e.key == 'Enter') {
		sendMessageBtn.click();
	}

})

const renderChat = (chat) => {
	const user = chat.chatMembers.find(user => user._id != currentUser._id);
	currentChatName.innerText = user.fullname;
	sendMessageBtn.dataset.chatId = chat._id;
	chatIcon.setAttribute('src', user.profilePic);
	renderMessages(chat.chatMessages);
	messageContainer.scrollTop = messageContainer.scrollHeight;

}

const renderMessages = async (messages) => {
	messageContainer.innerHTML = '';
	console.log(messages);
	if (messages.length == 0) {
		noMessageContainer.classList.remove('hidden');
	} else {
		messages.forEach(message => {
			noMessageContainer.classList.add('hidden');
			messageContainer.insertAdjacentHTML('beforeend', createMessage(message));
		})
	}
}

const createMessage = (message) => {
	let sentOrReceived = '';
	if (message.sender._id != currentUser._id) {
		sentOrReceived = 'received';
	} else {
		sentOrReceived = 'sent';
	}
	return `<div class="message-container-${sentOrReceived} message-container">
	<div class="message">
		${message.content}
	</div>
</div>`;
}

socket.on('message-received', (message) => {
	messageContainer.insertAdjacentHTML('beforeend', createMessage(message.data));
	messageContainer.scrollTop = messageContainer.scrollHeight;
})

renderChatsList();