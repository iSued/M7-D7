/* eslint-disable no-restricted-globals */
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import io from "socket.io-client";
import {
  Modal,
  InputGroup,
  FormControl,
  Button,
  Col,
  Row,
} from "react-bootstrap";

const connOpt = {
  transports: ["websocket", "polling"],
};

let socket = io("https://striveschool-api.herokuapp.com", connOpt);

function App() {
  const [receiver, setReceiver] = useState("");
  const [list, setList] = useState([null]);
  const [username, setUsername] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    socket.on("connect", () => console.log("connected to socket"));
    socket.on("list", (list) => {
      setList([...list]);
    });
    socket.on("chatmessage", (msg) => {
      console.log(msg);
      setMessages((messages) => messages.concat(msg));
    });
    console.log("this are the fucking messages", messages);

    socket.on("connect", () => console.log("connected to socket"));

    return () => socket.removeAllListeners();
  }, []);

  const handleMessage = (e) => {
    setMessage(e.currentTarget.value);
  };
  console.log("this is the receiver", receiver);
  const sendMessage = (e) => {
    e.preventDefault();
    if (message !== "") {
        text: message,
      socket.emit(
        "chatmessage",
        {
          to: receiver,
          text: message,
        },
        setMessages((messages) =>
          messages.concat({ from: username, to: receiver, msg: message })
        )
      );

      setMessage("");
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    socket.emit("setUsername", { username });
  };

  return (
    <>
      <Row>
        <Col className="col-3">
          <ul>
            {list
              .filter((user) => {
                return user !== username;
              })
              .map((user, i) => (
                <li key={i} onClick={(e) => setReceiver(e.target.innerText)}>
                  <strong>{user}</strong>
                </li>
              ))}
          </ul>
        </Col>
        <Col className="col-9">
          <h1>{receiver}</h1>
          <div className="App">
            <ul id="messages">
              {messages
                .filter((user) => {
                  return (
                    user.from === receiver ||
                    (user.from === username && user.to === receiver)
                  );
                })
                .map((msg, i) => (
                  <li
                    key={i}
                    className={msg.from === username ? "ownMessage" : "message"}
                  >
                    <strong>{msg.from}</strong> {msg.msg}
                  </li>
                ))}
            </ul>
            <form id="chat" onSubmit={sendMessage}>
              <input
                autoComplete="off"
                value={message}
                onChange={handleMessage}
              />
              <Button type="submit" className="rounded-0">
                Send
              </Button>
            </form>
          </div>
          <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showModal}
            onHide={toggleModal}
          >
            <Modal.Header>
              <Modal.Title>Set username</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <InputGroup className="mb-3">
                <FormControl
                  onChange={(e) => setUsername(e.currentTarget.value)}
                ></FormControl>
              </InputGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={toggleModal}>Submit</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </>
  );
}

export default App;
