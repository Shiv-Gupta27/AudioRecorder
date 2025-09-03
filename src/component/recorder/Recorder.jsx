
import React from "react";
import { useState, useRef } from "react";

function Recording(){

    const [recorder, setrecorder] = useState(false);
    const [transcriptions,setTranscriptions] = useState(
        JSON.parse(localStorage.getItem("transcriptions")) || []
    );

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // start recording

    const startRecording = async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const mediarecorder = new MediaRecorder(stream);

        mediarecorder.ondataavailable = (event)=>{
            audioChunksRef.current.push(event.data)
        }

        mediarecorder.onstop = async ()=>{
            const audioBlob = new Blob(audioChunksRef.current, {type:"audio/webm"})
            audioChunksRef.current = [];
            sendToWhisper(audioBlob);
        }

        mediarecorder.start();
        mediaRecorderRef.current = mediarecorder;
        setrecorder(true);


    }

    const sendToWhisper = async (audioBlob)=>{
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        const text = result.text;
        console.log("Transcription:", result.text);

        const newTranscriptions = [
            ...transcriptions,
            { id: Date.now(), text },
        ];
        setTranscriptions(newTranscriptions);
        localStorage.setItem("transcriptions", JSON.stringify(newTranscriptions));

    }

    const stopRecording = async ()=>{
        mediaRecorderRef.current.stop();
        setrecorder(false)
    }



    return(
    <div>
        {recorder?<button onClick={(e)=>stopRecording()}>Stop Recording</button>:<button onClick={(e)=>startRecording()}>Start Recording</button>}

    </div>);
}

export default Recording;
