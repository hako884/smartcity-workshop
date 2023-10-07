import './App.css';
import Fetch from './components/FetchStore';

import { Amplify } from 'aws-amplify';
import { awsconfig } from './constants/aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);

const App = () => (
  <Authenticator>
    {({ signOut, user }) => (
      <main>
        <h1>Hello {user!.username}</h1>
        <h2>Fetch from FIWARE-ORION on AWS</h2>
        <Fetch />
        <button onClick={signOut}>Sign out</button>
      </main>
    )}
  </Authenticator>
);

export default App;