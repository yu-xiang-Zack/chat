import { ReactNode } from "react"

const URI = "/ai/chat"

const services = {
    queryChatResponse: (messages: {content: ReactNode; role: string}[]) => {
        return fetch(URI, {
            method: 'POST',
            body: JSON.stringify({
                messages,
            })
        })
    }
}

export default services