import { Auth } from 'aws-amplify';

export const awsconfig = 
{
    Auth: {
      region: 'ap-northeast-1',
      userPoolId: 'ap-northeast-1_Jyg3H9bVm',
      userPoolWebClientId: '59kvg1mv8r76gbs0jf24c6qrmb',
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