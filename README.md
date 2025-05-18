# 💬 Customer Support Chat System

A real-time customer support chat application built using **Node.js**, **Socket.IO**, **HTML**, and **JavaScript**. It allows customers to connect to available agents, exchange messages, and download chat transcripts after the session ends.

---

## 🚀 Features

- 👥 Real-time chat between customer and agent
- 🪪 Unique session token generation
- 🧑‍💼 Agent login with password
- ⌛ Customer queue system
- ✍️ Typing indicators
- 📄 Transcript download in JSON format
- 🗣️ Feedback form for customers

---

## 🛠 Technologies Used

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- Vanilla HTML, CSS, JavaScript

---

## 📂 Project Structure

customer-support-chat/
│
├── public/
│ ├── index.html # Customer chat interface
│ ├── agent.html # Agent chat interface
│ └── style.css # Styles (optional)
│
├── server.js # Backend server using Express + Socket.IO
├── package.json
└── README.md

yaml
Copy
Edit

---

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/customer-support-chat.git
   cd customer-support-chat
Install dependencies

bash
Copy
Edit
npm install
Run the server

bash
Copy
Edit
node server.js
Access the application

Customer: http://localhost:3000/index.html

Agent: http://localhost:3000/agent.html

🔐 Agent Login
Default agent password: agentpassword123
(For production, make sure to replace this with a secure authentication method.)

📤 Chat Transcript Download
Once the chat ends, both the customer and the agent will see a "Download Transcript" link which downloads the entire chat in .json format.

✍️ Feedback
After ending a chat, customers can submit feedback. It is currently logged to the server console. You can modify the server to store it in a database or file.

📌 To-Do / Future Enhancements
✅ Store chat transcripts in database

✅ Export transcripts as .txt or .pdf

✅ Add user authentication (JWT or sessions)

✅ Admin panel to view past chats

✅ Emoji and image support in chat

✅ Multiple agent routing with availability status

📝 License
This project is open-source and available under the MIT License.

💡 Author
Developed by Your Name

Feel free to ⭐ the repo if you find it helpful!

yaml
Copy
Edit

---

Let me know if you'd like:
- A `LICENSE` file (MIT, GPL, etc.)
- A demo video section with embedded preview
- Deploy instructions for platforms like **Render**, **Vercel**, or **Glitch**

I'll customize it further for you.
