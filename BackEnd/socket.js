import http from "http";
import { Server } from "socket.io";
import express from "express";
import Users from "./modules/Users.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  socket.on("joinGroupChat", (conversationId) => {
    if (conversationId === "social") {
      socket.join("social");
    }
  });
  socket.on("addUsers", (userId) => {
    const userExist = users.find((user) => user.userId === userId);
    if (!userExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUsers", users);
    } else {
      io.emit("getUsers", users);
    }
  });
  socket.on(
    "getMessage",
    async ({ senderId, reciverId, message, conversation }) => {
      const user = await Users.findById(senderId);

      if (conversation === "social") {
        const groupUsers = users.map((user) => user.socketId);
        io.to(groupUsers).emit("getMessage", {
          senderId,
          message: { message, conversationId: conversation },
          conversation,
          reciverId,
          user: {
            id: user._id,
            firstName: user.firstName,
            email: user.email,
            photo: user.photos,
          },
        });
      } else {
        const receiver = users.find((user) => user.userId === reciverId);
        const sender = users.find((user) => user.userId === senderId);

        if (receiver) {
          io.to(receiver.socketId)
            .to(sender.socketId)
            .emit("getMessage", {
              senderId,
              message: { message, conversationId: conversation },
              conversation,
              reciverId,
              user: {
                id: user._id,
                firstName: user.firstName,
                email: user.email,
                photo: user.photos,
              },
            });
        } else {
          io.emit("getMessage", {
            senderId,
            message: { message, conversationId: conversation },
            conversation,
            reciverId,
            user: {
              id: user._id,
              firstName: user.firstName,
              email: user.email,
              photo: user.photos,
            },
          });
        }
      }
    }
  );

  socket.on(
    "getconversation",
    async ({ conversationId, firstName, email, id, senderId }) => {
      const sender = users.find((user) => user.userId === senderId);
      const reciver = users.find((user) => user.userId === id);
      const senderUser = await Users.findById(senderId);
      const receiverUser = await Users.findById(id);
      if (reciver && sender) {
        io.to(reciver.socketId).emit("getconversation", {
          conversationId,
          firstName: senderUser.firstName,
          lastName: senderUser.lastName,
          email: senderUser.email,
          id: senderUser._id,
          photo: senderUser.photos,
          quite: sender.quite,
        });
        io.to(sender.socketId).emit("getconversation", {
          conversationId,
          firstName: receiverUser.firstName,
          lastName: receiverUser.lastName,
          email: receiverUser.email,
          id: receiverUser._id,
          photo: receiverUser.photos,
          quite: receiverUser.quite,
        });
      } else {
        io.to(sender.socketId).emit("getconversation", {
          conversationId,
          firstName: receiverUser.firstName,
          lastName: receiverUser.lastName,
          email: receiverUser.email,
          id: receiverUser._id,
          photo: receiverUser.photos,
          quite: receiverUser.quite,
        });
      }
    }
  );
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

export { app, io, server };
