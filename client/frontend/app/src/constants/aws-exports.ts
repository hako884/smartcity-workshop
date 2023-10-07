import { Auth } from 'aws-amplify';

export const awsconfig = 
{
    Auth: {
      region: 'ap-northeast-1',
      userPoolId: 'ap-northeast-1_SBAcxePZj',
      userPoolWebClientId: '7fbf2jr9t93pedejah4o06a12o',
    },
    API: {
        endpoints: [
            {
                name: 'orion-app',
                endpoint: 'https://ll91xixjpj.execute-api.ap-northeast-1.amazonaws.com/prod',
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