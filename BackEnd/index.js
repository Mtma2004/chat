import "./DB/conection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "./modules/Users.js";
import Convarsation from "./modules/Convarsation.js";
import Messeges from "./modules/Meseges.js";
import express, { response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { app, server } from "./socket.js";
import path from "path";

// Users.deleteMany({}).then(() => console.log("deleted"));
// Messeges.deleteMany({}).then(() => console.log("deleted"));
// Convarsation.deleteMany({}).then(() => console.log("deleted"));

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "FrontEnd", "build")));

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const port = process.env.PORT;

app.post("/api/sign_up", async (req, res) => {
  try {
    const { firstName, lastName, age, email, password } = req.body;
    if (!firstName || !lastName || !age || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    const already = await Users.findOne({ email });
    if (already) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newuser = new Users({ firstName, lastName, age, email });
    bcrypt.hash(password, 10, async (err, hashpassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }

      newuser.set("password", hashpassword);
      await newuser.save();

      // إنشاء التوكن باستخدام JSON Web Token
      const payload = {
        userid: newuser._id,
        email: newuser.email,
      };
      const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
      jwt.sign(
        payload,
        JWT_SECRET_KEY,
        {
          expiresIn: 84600, // يوم واحد
        },
        async (err, token) => {
          if (err) {
            return res.status(500).json({ message: "Error generating token" });
          }

          // حفظ التوكن في قاعدة البيانات
          await Users.updateOne(
            { _id: newuser._id },
            {
              $set: { token },
            }
          );

          // إعادة استجابة تشمل بيانات المستخدم والتوكن
          console.log(newuser);
          return res.status(200).json({
            user: {
              id: newuser._id,
              firstName: newuser.firstName,
              lastName: newuser.lastName,
              age: newuser.age,
              email: newuser.email,
            },
            token: token,
            message: "User saved successfully",
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during sign-up" });
  }
});

app.post("/api/quotes", async (req, res) => {
  try {
    const { quite, photos } = req.body;
    const email = req.query.email;
    const user = await Users.findOne({ email });

    if (!quite) {
      return res.status(400).json({ mes: "please write quite" });
    } else {
      await user.updateOne({
        $set: { quite, photos },
      });
      return res.status(200).json({ mes: "user update" });
    }
  } catch (error) {
    return res.status(500).send("an error occurred");
  }
});

app.post("/api/sign_in", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "please fill all requier fields" });
    } else {
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "email or password is incorect" });
      } else {
        // incorrect password
        const validatuser = await bcrypt.compare(password, user.password);
        if (!validatuser) {
          res.status(400).json({ message: "email or password is incorect" });
        } else {
          const payload = {
            userid: user.id,
            email: user.email,
          };
          const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            {
              expiresIn: 84600,
            },
            async (err, token) => {
              await Users.updateOne(
                { _id: user._id },
                {
                  $set: { token },
                }
              );
              user.save();
              return res.status(200).json({
                user: {
                  id: user._id,
                  firstName: user.firstName,
                  email: user.email,
                },
                token: user.token,
              });
            }
          );
        }
      }
    }
  } catch (error) {}
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receverId } = req.body;
    const newConvarsation = new Convarsation({
      members: { senderId, receverId },
    });
    await newConvarsation.save();
    res.status(200).json({ mes: "Convarsation created sucssfully" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/conversation/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversation = await Convarsation.find({
      $or: [{ "members.senderId": userId }, { "members.receverId": userId }],
    }).lean();

    const conversationUserData = await Promise.all(
      conversation.map(async (conv) => {
        const receiver = conv.members.find(
          (member) => member.receverId === userId || member.senderId === userId
        );

        const receverId =
          receiver.senderId === userId ? receiver.receverId : receiver.senderId;

        const userData = await Users.findById(receverId);
        console.log("userdata from conversation", userData);
        console.log("receiverid from conversation", receverId);
        return {
          userData: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            id: userData._id,
            photo: userData.photos,
            quite: userData.quite,
          },
          conversationId: conv._id,
        };
      })
    );

    res.status(200).json(conversationUserData);
  } catch (error) {
    console.error("Error fetching conversation data:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receverId } = req.body;
    if (!senderId || !message)
      return res.status(400).send("please fill all required fields");

    // تحقق مما إذا كانت المحادثة جديدة

    if (conversationId === "social") {
      const newMessage = new Messeges({
        conversationId: "social",
        senderId,
        message,
      });

      await newMessage.save();
      res.status(200).json({
        mes: "message sent successfully",
        conversationId: "social",
      });
    } else {
      let conversation = null;
      if (conversationId === "new" && receverId) {
        // ابحث عن محادثة موجودة بين المرسل والمستقبل
        conversation = await Convarsation.findOne({
          $or: [
            { members: { senderId, receverId } },
            { members: { senderId: receverId, receverId: senderId } },
          ],
        });

        // إذا لم تكن المحادثة موجودة، قم بإنشاء محادثة جديدة
        if (!conversation) {
          const newConvarsation = new Convarsation({
            members: { senderId, receverId },
          });
          await newConvarsation.save();
          conversation = newConvarsation;
        }
      } else {
        // إذا كانت المحادثة موجودة بالفعل، استخدم `conversationId` المقدم
        conversation = await Convarsation.findById(conversationId);
      }

      // الآن استخدم المحادثة الحالية لإضافة الرسالة
      const newMessage = new Messeges({
        conversationId: conversation._id,
        senderId,
        message,
      });

      await newMessage.save();
      res.status(200).json({
        mes: "message sent successfully",
        conversationId: conversation._id,
      });
    }
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ mes: "An error occurred while sending the message" });
  }
});
app.get("/api/message/social", async (req, res) => {
  try {
    const messages = await Messeges.find({ conversationId: "social" });
    const messageUserData = await Promise.all(
      messages.map(async (mes) => {
        const user = await Users.findById(mes.senderId);
        return {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            photo: user.photos,
          },
          message: mes,
        };
      })
    );
    res.status(200).json(messageUserData);
  } catch (error) {
    console.error("Error fetching social messages:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const checkMessages = async (convid) => {
      const messages = await Messeges.find({ conversationId: convid });
      const messageUserData = await Promise.all(
        messages.map(async (mes) => {
          const user = await Users.findById(mes.senderId);
          return {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              photo: user.photos,
            },
            message: mes,
          };
        })
      );
      res.status(200).json(messageUserData);
    };

    const { conversationId } = req.params;
    const { senderId, receverId } = req.query;

    if (conversationId === "new") {
      const existingConversations = await Convarsation.findOne({
        $or: [
          {
            members: {
              $elemMatch: { senderId: senderId, receverId: receverId },
            },
          },
          {
            members: {
              $elemMatch: { senderId: receverId, receverId: senderId },
            },
          },
        ],
      });

      if (existingConversations) {
        // If a previous conversation exists, get its messages
        checkMessages(existingConversations._id);
      } else {
        // Optionally, create a new conversation if none exists
        return res.status(200).json({
          message: "No existing conversation found",
          senderId: senderId,
          receiverId: receverId,
          conversation: conversationId,
        });
      }
    } else {
      // Fetch messages for the provided conversation ID
      checkMessages(conversationId);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const { userId } = req.query;

    const users = await Users.find({ _id: { $ne: userId } });
    // استخدم $ne لاستبعاد المستخدم الحالي
    const userData = await Promise.all(
      users.map((us) => {
        console.log(us);
        return {
          user: {
            email: us.email,
            firstName: us.firstName,
            lastName: us.lastName,
            receverId: us._id,
            photo: us.photos,
            quite: us.quite,
          },
        };
      })
    );
    res.status(200).json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/api/myacount", async (req, res) => {
  try {
    const userId = req.query.userId; // افترض أنك ترسل userId كاستعلام
    console.log("userId", userId);
    const user = await Users.findOne({ _id: userId });
    const userData = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      receverId: user._id,
      photo: user.photos,
      quite: user.quite,
    };
    console.log("userId info", userData);
    res.status(200).json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "FrontEnd", "build", "index.html"));
});

server.listen(port, () => {
  console.log("listning on port " + port);
});
