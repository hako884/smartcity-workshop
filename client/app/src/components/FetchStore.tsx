import { useState, useEffect } from 'react'
import { API } from 'aws-amplify';

const Fetch = () => {

    const [store, setStore] = useState<any>([])
    const [relatedEntities, setRelated] = useState<any>([])

    useEffect(() => {
        // Storeの情報を取得する
        const storeId = 'urn:ngsi-ld:Store:001'
        const myInitStore = {
            headers: {}, // OPTIONAL
            queryStringParameters:{options: 'keyValues'}
        };
        API.get('orion', 'v2/entities/'+storeId, myInitStore)
        .then(res => {
            // debug
            console.log('responce store entity data');
            console.log(res);
            // create image
            const zoom = 15
            const tilesPerRow = Math.pow(2, zoom);
            let longitude = res.location.coordinates[0];
            let latitude = res.location.coordinates[1];
        
            longitude /= 360;
            longitude += 0.5;
            latitude = 0.5 - Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)) / Math.PI / 2.0;
        
            res.location.image = 'https://a.tile.openstreetmap.org/' +
                zoom +
                '/' +
                Math.floor(longitude * tilesPerRow) +
                '/' +
                Math.floor(latitude * tilesPerRow) +
                '.png';
            // set
            setStore(res)
        })
        .catch(error => alert(error))

        // Storeに紐づくEntityを取得する
        const myInitRelated = {
            headers: {}, // OPTIONAL
            queryStringParameters:{q: 'refStore=='+storeId, options: 'count', attrs: 'type'}
        };
        API.get('orion', 'v2/entities', myInitRelated)
        .then(res => {
            console.log('responce store related entity data');
            console.log(res);
            setRelated(res)
        })
        .catch(error => alert(error))
    },[])

    return (
        <div>
            <h2 key={store.id}>Store Name: {store.name}</h2>
            {store.location ? <img src={store.location.image} alt="location image"/> : <img src="" alt="location image"/>}
            <p>Related Entities:</p>
            <ul>
                {
                    relatedEntities.map((post: any) => <li key={post.id}>ID: {post.id}, Type: {post.type}</li>)
                }
            </ul>
        </div>
    )
}

export default Fetch