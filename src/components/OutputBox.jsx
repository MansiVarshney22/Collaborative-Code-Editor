import React, {useEffect, useState} from "react";
import {executeCode} from "../../api";
import ACTIONS from "../../common";

const OutputBox = ({editorRef, language, socketRef, roomId}) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);

  useEffect(() => {
    console.log("OutputBox mounted");
  }, []);

  useEffect(() => {
    if (!socketRef?.current) return;
    const socket = socketRef.current;

    if (socket.connected) setIsSocketReady(true);
    else socket.on("connect", () => setIsSocketReady(true));
    // Listen for output syncs from others
    socket.on(ACTIONS.OUTPUT_SYNC, ({output, error}) => {
      setOutput(output);
      setError(error);
      setIsLoading(false);
    });
    socket.on(ACTIONS.OUTPUT_LOADING, ({isLoading}) => {
      setIsLoading(isLoading);
    });

    return () => {
      socket.off(ACTIONS.OUTPUT_SYNC);
      socket.off(ACTIONS.OUTPUT_LOADING);
    };
  }, [socketRef]);

  const handleRunCode = async () => {
    console.log("object");
    const sourceCode = editorRef.current.getValue();
    if (!isSocketReady) {
      console.warn("Socket not ready yet. Try again in a moment.");
      setIsLoading(true); // still show loading locally
    }
    setIsLoading(true);
    setOutput(null);

    console.log(sourceCode);
    if (!sourceCode) return;
    try {
      socketRef.current?.emit(ACTIONS.OUTPUT_LOADING, {
        roomId,
        isLoading: true,
      });

      setIsLoading(true);
      const {run} = await executeCode(language, sourceCode);
      console.log(run.output);
      const formattedOutput = run.output.split("\n");
      setOutput(formattedOutput);
      run.stderr ? setError(true) : setError(false);
      if (isSocketReady) {
        socketRef.current?.emit(ACTIONS.OUTPUT_SYNC, {
          roomId,
          output: formattedOutput,
          error: !!run.stderr,
        });
      }
    } catch (err) {
      console.log(err);
      if (error) {
        setOutput(err.message);
      }
      //create a toast msg over here
    } finally {
      socketRef.current?.emit(ACTIONS.OUTPUT_LOADING, {
        roomId,
        isLoading: false,
      });
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className='language-box'>
        <div>Output</div>
        <button onClick={handleRunCode} type='button'>
          {/* {isLoading
            ? setText("Loading...")
            : setText(`Click "Run Code" to see the output here!`)} */}
          Run Code
        </button>
      </div>

      <div
        className={
          error ? "output-box-container-error" : "output-box-container"
        }
      >
        {/* {output
          ? output.map((line, index) => {
              return <p key={index}>{line}</p>;
            })
          : isLoading?'Loading...': `Click "Run Code" to see the output here!`} */}
        {isLoading ? (
          <p>Loading...</p>
        ) : output ? (
          output.map((line, index) => <p key={index}>{line}</p>)
        ) : (
          <p>Click "Run Code" to see the output here!</p>
        )}
      </div>
    </div>
  );
};

export default OutputBox;
