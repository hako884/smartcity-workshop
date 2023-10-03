import { Auth } from 'aws-amplify';

export const awsconfig = 
{
    Auth: {
      region: 'us-east-1',
      // Same Account User Pool
    //   userPoolId: 'us-east-1_BIFcbNEAh',
    //   userPoolWebClientId: '72nv86sc1i02ugcvk5l5mp9cgj',
    //   identityPoolId: 'us-east-1:47784262-7edb-45a1-9f96-ce691a1c8c11',
      // Cross Account User Pool
      userPoolId: 'us-east-1_Gvvd9BxEQ',
      userPoolWebClientId: '1lra567fi40m6mdng15vterh1r',
    },
    API: {
        endpoints: [
            {
                name: 'orion',
                // endpoint: 'http://orion-alb-65818145.us-east-1.elb.amazonaws.com:1026',
                endpoint: 'https://wwub32yo9c.execute-api.us-east-1.amazonaws.com/',
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