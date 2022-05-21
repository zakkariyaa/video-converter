import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components'
import { CirclesWithBar } from 'react-loader-spinner'


const API_ENDPOINT = process.env.REACT_APP_BACKEND

const App = () => {
  const [fileNames, setFileNames] = useState(null)
  const [audioFiles, setAudioFiles] = useState(null)
  const [loading, setLoading] = useState(false)

  const date = new Date()
  const toastOptions = {
    position: 'bottom-right',
    theme: 'dark',
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
  }

  const ManageFiles = async () => {
    setFileNames(null)
    setAudioFiles(null)
    setLoading(true)

    const blobToDataURL = async (blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.onabort = () => reject(new Error('Read Aborted'))
        reader.readAsDataURL(blob)
      })
    }

    const covertVideo = async (video) => {
      const payload = new FormData()
      payload.append('video', video)
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: payload
      });

      if (!res.ok) {
        toast.error('Coverting video failed', toastOptions)
      }

      const audioBlob = await res.blob()
      const audio = await blobToDataURL(audioBlob)

      return audio
    }

    const { files } = document.querySelector('input')
    if (files.length > 0) {
      const names = []
      const audios = []

      for (let file of files) {
        try {
          const audio = await covertVideo(file)
          audios.push({ file: audio, name: file.name.replace('.mp4', '.mp3') })

        } catch (error) {
          toast.error(error, toastOptions)
        }

        names.push(file.name)
      }

      setFileNames(names)
      setAudioFiles(audios)
      setLoading(false)

    } else {
      toast.error('Please select a file', toastOptions)
    }
  }

  return (
    <>
      <Container>
        <h2>Video to Audio Converter</h2>
        <h4>{date.toDateString()}</h4>
        <p>This is a very fast and efficient video to audio
          converter. It uses WebAssembly ffmpeg on the nodejs server
          which makes it very fast.</p>
        <p>Accepted files: <b>All video file formats are supported</b></p>
        <input type="file" multiple />
        <button onClick={ManageFiles}>Convert</button>
        <FileNames>
          {fileNames ? fileNames.map((el, idx) => <p key={idx}>{idx + 1}- {el}</p>) : null}
        </FileNames>
        {audioFiles && <h3>Here are your audio files ready to be downloaded with a single click</h3>}
        <AudioFiles>
          {audioFiles ? audioFiles.map((el, idx) => <a key={idx} href={el.file} download>File {idx + 1}</a>) : null}
        </AudioFiles>
        {loading && <h3><i>Converting...</i> </h3>}
        {loading && <CirclesWithBar color="blue" ariaLabel="circles-with-indicator" />}
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  width: 50%;
  height: 80vh;
  margin: 2rem auto;
  border-radius: 15px;
  padding: 2rem 3rem;
  background-color: #fff;
  box-shadow: 4px 4px 9px 5px #00000057;
  h2 {
    text-align: center;
  }
  h4, p + p {
    margin-bottom: 2rem;
  }
  input {
    font-size: 1.4rem;
  }
  button {
    padding: 10px;
    margin-left: 3rem;
    font-size: 1.5rem;
    background-color: #0a9396;
    color: white;
    border-radius: 0.4rem;
    border: transparent;
    transition: all 400ms ease;
    cursor: pointer;
    :hover {
      background-color: transparent;
      color: black;
      border: 1px solid #0a9396;
    }
  }
`
const FileNames = styled.div`
  margin-top: 1.5rem;
  p {
    width: 70%;
  }
`
const AudioFiles = styled.div`
  margin-top: 1.9rem;
  display: flex;
  gap: 0.5rem;
  a {
    text-decoration: none;
    font-size: 1.3rem;
    color: inherit;
    padding: 0.7rem;
    border: 1px solid black;
    border-radius: 0.4rem;
    background-color: #023e8a;
    color: white;
    cursor: pointer;
  }
`

export default App;
