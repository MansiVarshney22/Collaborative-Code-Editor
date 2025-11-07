import { LANGUAGE_VERSIONS } from "./common"
import axios from "axios";

const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})

export const executeCode = async (language, sourceCode) => {
    console.log(LANGUAGE_VERSIONS[language])
    const response = await API.post("/execute", {
        "language": language,
        "version": LANGUAGE_VERSIONS[language],
        "files": [
            {
            "content": sourceCode
            }
        ],
    })
    
    return response.data
}