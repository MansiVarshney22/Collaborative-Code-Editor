import React, {useState, useEffect, useRef} from "react";
import {Editor} from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import ACTIONS, {CODE_SNIPPETS} from "../../common";
import OutputBox from "./OutputBox";

function CodeEditor({socketRef, roomId, onCodeChange, languageRef}) {
  const editorRef = useRef(null);
  const [language, setLanguage] = useState(
    languageRef?.current || "javascript"
  );

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
    // Called when Monaco editor is ready

    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.REQUEST_SYNC, {roomId});
    }
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue();
      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {roomId, code});
      }
      onCodeChange(code);
    });
  };

  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    const handleCodeChange = ({code}) => {
      onCodeChange(code);
      console.log("object", code);
      if (code && editorRef.current) {
        const current = editorRef.current.getValue();
        if (current !== code) editorRef.current.setValue(code);
      }
    };
    const handleLanguageChange = ({language}) => {
      setLanguage(language);
      editorRef.current?.setValue(CODE_SNIPPETS[language]);
    };
    socket.on(ACTIONS.CODE_CHANGE, handleCodeChange);
    socket.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
    return () => {
      socket.off(ACTIONS.CODE_CHANGE, handleCodeChange);
      socket.off(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
    };
  }, [socketRef.current]);

  // Handle language switch
  const onSelect = (lang) => {
    setLanguage(lang);
    if (languageRef) languageRef.current = lang;

    editorRef.current?.setValue(CODE_SNIPPETS[lang]);

    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomId,
      language: lang,
    });
  };

  return (
    <div className='code-block'>
      <div className='editor-block'>
        <LanguageSelector language={language} onSelect={onSelect} />
        <Editor
          height='75vh'
          language={language}
          theme='vs-dark'
          defaultValue={CODE_SNIPPETS[language]}
          onMount={onMount}
        />
      </div>
      <div className='output-block'>
        <OutputBox
          editorRef={editorRef}
          language={language}
          socketRef={socketRef}
          roomId={roomId}
        />
      </div>
    </div>
  );
}

export default CodeEditor;
