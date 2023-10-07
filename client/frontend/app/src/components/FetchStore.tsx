import { useState, useEffect } from 'react'
import { API } from 'aws-amplify';

const Fetch = () => {

    const [store, setStore] = useState('')
    // const [relatedEntities, setRelated] = useState<any>([])

    useEffect(() => {
        // Storeの情報を取得する
        // const storeId = 'urn:ngsi-ld:Store:001'
        const myInitStore = {
            headers: {}, // OPTIONAL
        };
        API.get('orion-app', '/api/hello', myInitStore)
        .then(res => {
            console.log(typeof(res))
            console.log(res)
            setStore(res.message.name)
        })
        .catch(error => alert(error))

        // // Storeに紐づくEntityを取得する
        // const myInitRelated = {
        //     headers: {}, // OPTIONAL
        //     queryStringParameters:{q: 'refStore=='+storeId, options: 'count', attrs: 'type'}
        // };
        // API.get('orion', 'v2/entities', myInitRelated)
        // .then(res => {
        //     console.log('responce store related entity data');
        //     console.log(res);
        //     setRelated(res)
        // })
        // .catch(error => alert(error))
    },[])

    return (
        <div>
            <p>{store}</p>
        </div>
    )
}

export default Fetch