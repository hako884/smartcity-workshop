import './App.css';
import Fetch from './components/FetchStore';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { awsconfig } from './constants/aws-exports';
Amplify.configure(awsconfig);

import { Box } from "@chakra-ui/react";

const App = () => (
  <Authenticator>
    {({ signOut, user }) => (
      <main>
        <Box px={4} bgColor="gray.200" mb={4} p={4} w="100%">
          <h1>Hello {user!.username}</h1>
          <h2>Fetch from FIWARE-Orion on AWS</h2>
        </Box>
        <Fetch />
        <Box textAlign={'left'} fontSize={20}>
          <button onClick={signOut}>Sign out</button>
        </Box>
      </main>
    )}
  </Authenticator>
);

export default App;