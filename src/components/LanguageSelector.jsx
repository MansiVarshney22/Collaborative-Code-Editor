import React from "react";
import {LANGUAGE_VERSIONS} from "../../common";

const LanguageSelector = ({language, onSelect}) => {
  const languageVersions = Object.entries(LANGUAGE_VERSIONS);
  return (
    <div className="language-box">
      <label htmlFor='language'>Language:</label>
      <select name='' id='' value={language}  onChange={(e)=>onSelect(e.target.value)}>
        <option value={language}>{language}</option>
        {languageVersions.map(([lang, version]) => {
          return (
            <option
              value={lang}
            >{`${lang} ${version}`}</option>
          );
        })}
      </select>
    </div>
  );
};

export default LanguageSelector;
