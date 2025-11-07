import DynamicFormIcon from "@mui/icons-material/DynamicForm";
import {useEffect, useRef, useState} from "react";
import Client from "./Client";
import CodeEditor from "./CodeEditor";
import {initSocket} from "../../socket";
import {useLocation, useNavigate, Navigate, useParams} from "react-router-dom";
import ACTIONS from "../../common";
import {toast} from "react-toastify";

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const languageRef = useRef("javascript");

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();

  const handleErrors = () => {
    toast.error("Socket connection failed!");
    reactNavigator("/");
  };

  useEffect(() => {
    console.log("EditorPage mounted ✅");
    const init = async () => {
      console.log("Calling initSocket() ✅", initSocket);
      socketRef.current = await initSocket();
      const _socket = socketRef.current;
      _socket.on("connect_error", (err) => handleErrors(err));
      _socket.on("connect_failed", (err) => handleErrors(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
        if (username !== location?.state?.username) {
          toast.success(`${username} joined the room`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
          roomId,
          language: languageRef.current || "javascript",
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.REQUEST_SYNC, ({socketId}) => {
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current || "",
          socketId,
        });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
        toast.success(`${username} is disconnected`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.disconnect();
      }
    };
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room Id copied");
    } catch (error) {
      toast.error("Could not copy the Room Id");
      console.log(error, "Error while copying the room Id");
    }
  };

  const leaveRoom = () => {
    reactNavigator("/");
  };

  !roomId && <Navigate to='/' />;
  return (
    <div className='editor-page-main-container'>
      <div className='editor-page-left-container'>
        <div className='editor-page-left-column'>
          <div className='editor-icon'>
            <div className='iconClass'>
              <DynamicFormIcon fontSize='large' />
            </div>
            <div className='headerWrapper-right'>
              <h1>Code Sync</h1>
              <p>Realtime collaboration</p>
            </div>
          </div>
          <div className='editor-left-body-container'>
            <h3 className='user-status'>Connected</h3>
            <div className='editor-left-body'>
              <div className='editor-left-body-section'>
                {clients.map((client) => (
                  <Client username={client.username} key={client.socketId} />
                ))}
              </div>
              <div className='editor-button-container'>
                <button
                  type='button'
                  className='btn copyBtn'
                  onClick={copyRoomId}
                >
                  Copy Room Id
                </button>
                <button
                  type='button'
                  className='btn leaveBtn'
                  onClick={leaveRoom}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='editor-page-right-column'>
        {socketRef.current && (
          <CodeEditor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              console.log(code, "CODEEE");
              codeRef.current = code;
            }}
            languageRef={languageRef}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPage;
