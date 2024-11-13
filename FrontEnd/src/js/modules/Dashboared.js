import React, { useEffect, useRef, useState } from "react";
import ph2 from "../../photo/social.jpg";
import verfication from "../../photo/Instagram Meta Verified Badge PNG.png";
import sendersound from "../../photo/send-sound.mp3";
import recivesound from "../../photo/recive-sound.mp3";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import { useNavigate } from "react-router-dom";
export default function Dashboared() {
  let [user, setuser] = useState(
    JSON.parse(localStorage.getItem("user:detail"))
  );
  let [users, setusers] = useState([]);
  let [myacount, setmyacount] = useState({});
  let [conversation, setconversation] = useState([]);
  let [messages, setmessages] = useState({});
  let [message, setmessage] = useState("");
  let [receivername, setreceivername] = useState("");
  let [secoundName, setsecoundName] = useState("");
  let [receiveremail, setreceiveremail] = useState();
  let [reciverID, setreciverID] = useState();
  let [reciverconversation, setreciverconversation] = useState();
  let [socket, setsocket] = useState(null);
  let [photo, setphoto] = useState();
  let [loading, setloading] = useState();
  let [onlineUsers, setonlineUsers] = useState([]);
  let [recivedMessages, setrecivedMessages] = useState();
  const [unreadConversations, setUnreadConversations] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const sendSound = new Audio(sendersound);
  const reciveSound = new Audio(recivesound);
  const navigate = useNavigate();
  const drdsh = useRef();
  const btn1 = useRef();
  const prof = useRef();
  const peopole = useRef();
  const viewchat = useRef();

  useEffect(() => {
    // get permission for Notification
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // updata the conversation id if the conversation has messages with or whene move to anthoer conversation
    if (messages?.mes) {
      if (reciverconversation === "new" && messages.mes.length > 0) {
        setreciverconversation(messages.mes[0].message.conversationId);
      }
    }
    // console.log("reciverconv", reciverconversation); debugging code
  }, [reciverconversation, reciverID]);

  useEffect(() => {
    // set socket
    const newsocket = io("https://dardesh2.onrender.com");
    setsocket(newsocket);
  }, []);
  useEffect(() => {
    // reach to bottom of the chat every new message
    if (drdsh.current) {
      drdsh.current.scrollIntoView();
    }
  }, [messages?.mes]);
  useEffect(() => {
    // handle socket to get and receive messages , get new conversation and get notfication

    if (!socket) return;

    socket.emit("addUsers", user?.id);
    socket.on("getUsers", (users) => {
      setonlineUsers(() => {
        const newOnlineUsers = users.map((u) => u.userId); // استخدام القائمة الحالية من المستخدمين المتصلين فقط
        return newOnlineUsers;
      });
      console.log("Users list:", users.length); // debugging code
    });
    socket.on("getMessage", (data) => {
      setrecivedMessages(data.conversation);
      reciveSound.play();
      console.log("data", data); //debugging code
      setmessages((prev) => ({
        ...prev,
        mes: [
          ...(prev?.mes || []),
          {
            user: data.user,
            message: data.message,
          },
        ],
      }));
      setUnreadConversations((prev) => {
        if (!prev.includes(data.conversation)) {
          return [...prev, data.conversation];
        }
        return prev;
      });
      console.log(data.conversation);

      // if (Notification.permission === "granted") {
      //   new Notification("رسالة جديدة", {
      //     body: `${data.user.firstName}: ${data.message.message}`,
      //     icon: "../../photo/avatar.png",
      //   });
      // }
    });

    socket.on("getconversation", (data) => {
      setconversation((prev) => [
        ...prev,

        {
          conversationId: data.conversationId,
          userData: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            id: data.id,
            photo: data.photo,
            quite: data.quite,
          },
        },
      ]);
    });
  }, [socket]);

  useEffect(() => {
    // get all conversation from backend
    const Loggedinuser = JSON.parse(localStorage.getItem("user:detail"));
    const fetchconversation = async () => {
      const res = await fetch(
        `https://dardesh2.onrender.com/api/conversation/${Loggedinuser.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resdata = await res.json();
      setconversation(resdata);
    };

    fetchconversation();
  }, []);

  useEffect(() => {
    //get all users from backend
    const fetchusers = async () => {
      const res = await fetch(
        `https://dardesh2.onrender.com/api/users?userId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resdata = await res.json();
      setusers(resdata);
    };
    fetchusers();
  }, []);
  useEffect(() => {
    //get all users from backend
    const feychmyUser = async () => {
      const res = await fetch(
        `https://dardesh2.onrender.com/api/myacount?userId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resdata = await res.json();
      setmyacount(resdata);
      console.log("user Id", resdata);
    };
    feychmyUser();
  }, []);

  useEffect(() => {
    console.log(myacount);
  }, [myacount]);

  const fetchMessages = async (
    // important function that get the conversation info and messages from backend to revelie it to user
    conversationId,
    username,
    lastName,
    email,
    id,
    photoviwe
  ) => {
    try {
      setloading(true);
      console.log(loading);
      if (conversationId === "social") {
        const res = await fetch(
          "https://dardesh2.onrender.com/api/message/social",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const resdata = await res.json();
        setmessages({
          mes: Array.isArray(resdata) ? resdata : [],
          receiver: username,
        });
        console.log("username of socail", username);
        setreceivername(username);
        setsecoundName(lastName);
        setreceiveremail(email);
        setreciverID(id);
        setreciverconversation(conversationId);
        setphoto(photoviwe);
      } else {
        const res = await fetch(
          `https://dardesh2.onrender.com/api/message/${conversationId}?senderId=${user.id}&&receverId=${id}`,
          {
            method: "GET",

            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );
        const resdata = await res.json();

        setmessages({
          mes: Array.isArray(resdata) ? resdata : [],
          receiver: username,
        });
        setreceivername(username);
        setreceiveremail(email);
        setreciverID(id);
        setreciverconversation(conversationId);
        setphoto(photoviwe);
      }
    } finally {
      setloading(false);
    }
  };

  const sendMessages = async (e) => {
    // anthoer important function it send messages to backend and fetchMessages function take that info
    e.preventDefault();
    if (message.length !== 0) {
      if (messages.mes.length === 0) {
        socket.emit("getconversation", {
          conversationId: reciverconversation,
          firstName: receivername,
          email: receiveremail,
          id: reciverID,
          senderId: user.id,
        });
      }

      const res = await fetch("https://dardesh2.onrender.com/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversationId: reciverconversation,
          senderId: user.id,
          message,
          receverId: reciverID,
        }),
      });

      const resdata = await res.json();
      console.log(resdata.conversationId);

      setmessage("");
      socket?.emit("getMessage", {
        senderId: user.id,
        reciverId: reciverID,
        message,
        conversation: resdata.conversationId,
      });
      sendSound.play();
      // console.log("message", messages); debugging code

      setreciverconversation(resdata.conversationId);

      // console.log("conversation id from sender", resdata.conversationId); debugging code
    }
  };

  function Loading() {
    return (
      <div>
        <button
          onClick={() => {
            viewchat.current.classList.remove("active2");
          }}
          className="back"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="loadingcontact"></div>
        <div className="loadingMyMess"></div>
        <div className="loadingUserMess"></div>
        <div className="loadingMyMess"></div>
        <div className="loadingUserMess"></div>
        <div className="loadingMyMess"></div>
        <div className="loadingUserMess"></div>
        <div className="loadingUserMess"></div>
      </div>
    );
  }

  function Profile() {
    // React function that return information of user
    return (
      <>
        <div ref={prof} className="profileviwe display">
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              margin: "10px auto 0",
              width: "fit-content",
            }}
          >
            <img
              alt=""
              src={myacount.photo}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "1px solid black",
                objectFit: "cover",
              }}
            />
            <div>
              <h3 style={{ textTransform: "capitalize", color: "white" }}>
                {myacount.firstName}.{myacount.lastName}
              </h3>
              <p style={{ marginTop: "10px", color: "white" }}>{user.email}</p>
            </div>
            <button
              onClick={() => {
                navigate("/users");
              }}
              style={{
                backgroundColor: "var(--color4)",
                border: "none",
                padding: "5px 10px",
                color: "white",
                borderRadius: "8px",
                marginLeft: "10px",
                letterSpacing: "1px",
                cursor: "pointer",
                zIndex: "1",
                position: "relative",
              }}
            >
              Edit
            </button>
          </div>
          <p
            style={{
              fontSize: "25px",
              textTransform: "capitalize",
              width: "fit-content",
              margin: "10px auto",
              color: "white",
            }}
          >
            {myacount.quite}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="logout"
          >
            logout
          </button>
        </div>
      </>
    );
  }

  const addEmoji = (emojiObject) => {
    // function for emoji 😊
    setmessage((previnput) => previnput + emojiObject.emoji);
  };
  const isUnreadsocail =
    unreadConversations.includes("social") && reciverconversation !== "social";
  return (
    <>
      <div className="dashboared">
        <button
          onClick={() => {
            peopole.current.classList.toggle("active");
          }}
          className="seeUsers"
        >
          <i className="fa-solid fa-users"></i>
        </button>
        <div className="chats">
          <div
            onClick={() => {
              prof.current.classList.toggle("display");
            }}
            className="profile"
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Profile />
            <div style={{ position: "relative", width: "fit-content" }}>
              <img
                alt=""
                src={myacount.photo}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  border: "2px solid red",
                  objectFit: "cover",
                }}
              />
              {user.email === "almogany86@gmail.com" ? (
                <img
                  style={{
                    width: "25px",
                    height: "25px",
                    objectFit: "cover",
                    position: "absolute",
                    top: "0",
                    left: "0",
                  }}
                  src={verfication}
                  alt=""
                />
              ) : (
                ""
              )}
            </div>
            <div>
              <h3 style={{ textTransform: "capitalize", color: "white" }}>
                {myacount.firstName}.
                {myacount.lastName ? myacount.lastName[0] : myacount.lastName}
              </h3>
              <p
                style={{ marginTop: "10px", color: "white", fontSize: "12px" }}
              >
                {user.email}
              </p>
            </div>
          </div>
          <hr
            style={{
              backgroundColor: "black",
              border: "none",
              height: "1px",
              marginTop: "10px",
            }}
          />
          <p
            style={{
              margin: "20px 0",
              textTransform: "capitalize",
              letterSpacing: "2px",
              fontSize: "20px",
              paddingLeft: "10px",
              color: "#da0000",
              fontWeight: "bold",
            }}
          >
            masseges
          </p>
          <div className="contacts">
            <div
              className="socailContacts"
              onClick={() => {
                setUnreadConversations((prev) =>
                  prev.filter((id) => id !== "social")
                );
                viewchat.current.classList.toggle("active2");

                fetchMessages("social", "social comunity", "", "", "", ph2);
              }}
            >
              <div className="contact">
                <img
                  alt=""
                  src={ph2}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    border: "2px solid red",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h3>Socail comunity</h3>
                </div>
                {isUnreadsocail ? (
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "blue",
                      position: "absolute",
                      top: "0px",
                      right: "5px",
                    }}
                  ></span>
                ) : (
                  ""
                )}
              </div>
            </div>
            {conversation.length > 0 ? (
              conversation.map(({ conversationId, userData }, index) => {
                if (conversationId === "new") {
                  conversationId = recivedMessages;
                }
                const isUnread =
                  unreadConversations.includes(conversationId) &&
                  conversationId !== reciverconversation;
                return (
                  <div
                    key={index}
                    className="contact"
                    onClick={(e) => {
                      setUnreadConversations((prev) =>
                        prev.filter((id) => id !== conversationId)
                      );
                      viewchat.current.classList.toggle("active2");
                      fetchMessages(
                        conversationId,
                        userData.firstName,
                        userData.lastName,
                        userData.email,
                        userData.id,
                        userData.photo
                      );
                    }}
                  >
                    <img
                      alt=""
                      src={userData.photo}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        border: "2px solid red",
                        objectFit: "cover",
                      }}
                    />

                    <div>
                      <h3>
                        {userData.firstName}.{userData.lastName[0]}
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          textTransform: "capitalize",
                          fontWeight: "bold",
                          marginTop: "5px",
                        }}
                      >
                        {userData.quite}
                      </p>
                    </div>
                    {userData.email === "almogany86@gmail.com" ? (
                      <img
                        alt=""
                        src={verfication}
                        style={{
                          width: "25px",
                          height: "25px",
                          borderRadius: "50%",
                          border: "1px solid black",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      ""
                    )}
                    {isUnread ? (
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "blue",
                          position: "absolute",
                          top: "0px",
                          right: "5px",
                        }}
                      ></span>
                    ) : (
                      ""
                    )}
                    {onlineUsers.includes(userData.id) ? (
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "green",
                          position: "absolute",
                          top: "10px",
                        }}
                      ></span>
                    ) : (
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: "red",
                          position: "absolute",
                          top: "10px",
                        }}
                      ></span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: "center", textTransform: "capitalize" }}>
                no coversation
              </div>
            )}
          </div>
        </div>
        <div ref={viewchat} className="viewchat">
          {loading ? (
            <Loading />
          ) : (
            <>
              <button
                onClick={() => {
                  viewchat.current.classList.remove("active2");
                }}
                className="back"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div>
                {messages.receiver ? (
                  <>
                    <div>
                      <div className="contactviwe">
                        <div className="info">
                          <img
                            alt=""
                            src={photo}
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              border: "2px solid red",
                              margin: " 0 20px",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <h3 style={{ color: "white" }}>{receivername}</h3>
                            <p
                              style={{
                                fontSize: "12px",
                                textTransform: "none",
                                color: "white",
                              }}
                            >
                              {reciverconversation === "social"
                                ? ""
                                : onlineUsers.includes(reciverID)
                                ? "online"
                                : "offline"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="drdsh">
                        <div className="chats2">
                          {messages?.mes?.length > 0 ? (
                            messages?.mes?.map(
                              (
                                {
                                  message: { message, conversationId },
                                  user: { id, firstName, photo, email },
                                },
                                index
                              ) => {
                                if (conversationId === reciverconversation) {
                                  if (conversationId === "social") {
                                    return (
                                      <>
                                        <div style={{ position: "relative" }}>
                                          <div
                                            key={index}
                                            className={
                                              id === user.id
                                                ? "mymassege"
                                                : "usermassege"
                                            }
                                          >
                                            <span
                                              className={
                                                id === user.id
                                                  ? "myName"
                                                  : "userName"
                                              }
                                            >
                                              {firstName}
                                            </span>
                                            {message}
                                          </div>
                                          <div>
                                            <img
                                              className={
                                                id === user.id
                                                  ? "myPhoto"
                                                  : "userPhoto"
                                              }
                                              src={photo}
                                              alt=""
                                            />
                                            {email ===
                                            "almogany86@gmail.com" ? (
                                              <img
                                                className={`messVer ${
                                                  id === user.id
                                                    ? "right"
                                                    : "left"
                                                }`}
                                                src={verfication}
                                                alt=""
                                              />
                                            ) : (
                                              ""
                                            )}
                                          </div>
                                        </div>
                                        <div key={id} ref={drdsh}></div>
                                      </>
                                    );
                                  } else {
                                    return (
                                      <>
                                        <div style={{ position: "relative" }}>
                                          <div
                                            key={index}
                                            className={
                                              id === user.id
                                                ? "mymassege"
                                                : "usermassege"
                                            }
                                          >
                                            {message}
                                          </div>
                                          <div>
                                            <img
                                              className={
                                                id === user.id
                                                  ? "myPhoto"
                                                  : "userPhoto"
                                              }
                                              src={photo}
                                              alt=""
                                            />
                                            {email ===
                                            "almogany86@gmail.com" ? (
                                              <img
                                                className={`messVer ${
                                                  id === user.id
                                                    ? "right"
                                                    : "left"
                                                }`}
                                                src={verfication}
                                                alt=""
                                              />
                                            ) : (
                                              ""
                                            )}
                                          </div>
                                        </div>
                                        <div key={id} ref={drdsh}></div>
                                      </>
                                    );
                                  }
                                }
                              }
                            )
                          ) : (
                            <div
                              style={{
                                textTransform: "capitalize",
                                margin: "50px auto",
                                width: "fit-content",
                                fontSize: "20px",
                              }}
                            >
                              no messages
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text">
                      <input
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            btn1.current.click();
                          }
                        }}
                        value={message}
                        onChange={(e) => {
                          setmessage(e.target.value);
                        }}
                        type="text"
                        placeholder="Type a massege"
                        className="massege"
                      />
                      <button
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        onClick={() => setShowPicker(!showPicker)}
                      >
                        😊
                      </button>
                      {showPicker && <EmojiPicker onEmojiClick={addEmoji} />}
                      <button
                        disabled={message.length === 0 ? true : false}
                        ref={btn1}
                        onClick={(e) => {
                          sendMessages(e);
                          setShowPicker(false);
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      margin: "50px auto",
                      width: "fit-content",
                      height: "475px",
                      color: "white",
                    }}
                  >
                    select chat
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div ref={peopole} className="peopole">
          <h3
            style={{
              color: "#da0000",
              margin: "10px",
              padding: "20px",
              borderBottom: "1px solid black",
            }}
          >
            People
          </h3>
          <div className="users">
            {users.length > 0
              ? users?.map(({ user }, index) => {
                  return (
                    <div
                      onClick={(e) => {
                        viewchat.current.classList.toggle("active2");

                        fetchMessages(
                          "new",
                          user.firstName,
                          user.lastName,
                          user.email,
                          user.receverId,
                          user.photo
                        );
                      }}
                      key={index}
                      className="contact"
                    >
                      <img
                        alt=""
                        src={user.photo}
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          border: "1px solid black",
                          objectFit: "cover",
                        }}
                      />
                      <div className="userinfo">
                        <h3
                          style={{
                            textTransform: "capitalize",
                          }}
                        >
                          {user.firstName}.{user.lastName[0]}
                        </h3>
                        <p
                          style={{
                            fontSize: "13px",
                            textTransform: "capitalize",
                            fontWeight: "bold",
                            marginTop: "5px",
                          }}
                        >
                          {user.quite}
                        </p>
                      </div>
                      {onlineUsers.includes(user.receverId) ? (
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "green",
                            position: "absolute",
                            top: "10px",
                          }}
                        ></span>
                      ) : (
                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: "red",
                            position: "absolute",
                            top: "10px",
                          }}
                        ></span>
                      )}
                      {user.email === "almogany86@gmail.com" ? (
                        <img
                          alt=""
                          src={verfication}
                          style={{
                            width: "25px",
                            height: "25px",
                            borderRadius: "50%",
                            border: "1px solid black",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  );
                })
              : "no conversation"}
          </div>
        </div>
      </div>
    </>
  );
}

{
}
