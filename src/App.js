/* eslint-disable react/no-array-index-key */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable react/button-has-type */
import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import avatarPic from './Images/avatar.svg';

const firebaseConfig = {
  apiKey: 'AIzaSyAy7_gV6P_nhrFG-iyT-FQzt_VloyIEkYA',
  authDomain: 'chat-app-d85d5.firebaseapp.com',
  projectId: 'chat-app-d85d5',
  storageBucket: 'chat-app-d85d5.appspot.com',
  messagingSenderId: '867244762012',
  appId: '1:867244762012:web:0e5aea6e3bac60b5b61e59',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="appTitle">Comet Chat 💬</h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getAuth(), provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p className="text homepageText">
        Comet Chat app, sign in with your google email to participate in the
        group chat
      </p>
      <p className="cometLogo">☄️</p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const recentMessagesQuery = query(
    collection(getFirestore(), 'messages'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const [messages] = useCollectionData(recentMessagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    await addDoc(collection(getFirestore(), 'messages'), {
      name: getAuth().currentUser.displayName,
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}

        <span ref={dummy} />
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type message"
        />

        <button type="submit" disabled={!formValue}>
          ☄️
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, name } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || avatarPic} alt="" />
        <p className="text messageBubble">
          <b className="nameTag">{`${name} Says:`}</b>
          <br /> {text}
        </p>
      </div>
    </div>
  );
}

export default App;
