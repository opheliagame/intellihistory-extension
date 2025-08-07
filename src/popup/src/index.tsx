import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';


const Timer = ({recording, hours, minutes, seconds}: {recording: boolean, hours: number, minutes: number, seconds: number}) => {
  if(recording === false) {
    return (
      <p>00:00:00</p>
    )
  }  

  return (
    <>
      <p>{hours%24}:{minutes%60}:{seconds%60}</p>
    </>
  )
}

const SessionForm = ({recording, handleSNameChange, beginSession, stopSession}: {recording: boolean, handleSNameChange: any, beginSession: any, stopSession: any}) => {
  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    handleSNameChange(event.currentTarget.value)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if(recording === false) {
      beginSession(event)
    }
    else {
      stopSession(event)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input type='text' onChange={handleInput} />
      <button type='submit'>
        {recording === false ? 'begin ' : 'stop '} 
        session</button>
    </form>
  )
  
}

const DisplayDetails = (props: {sessionName: String, history: any}) => {
  return (
    <div>
      <p>{props.sessionName}</p>
      {Object.values(props.history).map((h, id) => 
        <p key={id}>{h}</p>  
      )}
    </div>
  )
}

const App = () => {
  const [recording, setRecording] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [history, setHistory] = useState({})
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    let interval = undefined;
    if (recording) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
        setMinutes(minutes => (seconds / 60));
        setHours(hours => (minutes / 60)) 

      }, 1000);
    } else if (!recording && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording, seconds, minutes, hours])
  

  const handleSNameChange = (session: string) => {
    chrome.storage.sync.set({sessionName: session}, function() {
      console.log(`Chrome: Session name is set to ${session}`)
    })
    setSessionName(session)
  }

  const beginSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRecording(true)
    chrome.storage.sync.set({recording: true, sHistory: {}}, function() {
      console.log('Chrome: Recording is set to true')
      console.log('Chrome: History init')
    })
  }

  const stopSession = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRecording(false)
    setSeconds(0)
    setMinutes(0)
    setHours(0)
    chrome.storage.sync.set({recording: false}, function() {
      console.log('Chrome: Recording is set to false')
    })
  }

  return (
    <div>
      <SessionForm 
        recording={recording} 
        handleSNameChange={handleSNameChange} 
        beginSession={beginSession}
        stopSession={stopSession}/>

      <Timer recording={recording} hours={hours} minutes={minutes} seconds={seconds} />

      <DisplayDetails 
        sessionName={sessionName}
        history={history}
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
