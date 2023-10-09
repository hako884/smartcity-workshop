import { Auth } from 'aws-amplify';
import config from './config';

export const awsconfig = 
{
    Auth: {
        region: config.awsRegion,
        userPoolId: config.userPoolId,
        userPoolWebClientId: config.userPoolClientId,
    },
    API: {
        endpoints: [
            {
                name: 'orion-app',
                endpoint: config.apiEndpoint,
                custom_header: async () => {
                const currentSession = await Auth.currentSession();
                return {
                    Authorization: currentSession.getIdToken().getJwtToken(),
                };
                },
            },
        ],
    }
}

export default awsconfig;