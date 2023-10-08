import { useState, useEffect } from 'react'
import { Flex, Center, Text, Box, Stack, Image, Spacer } from '@chakra-ui/react'
import { API } from 'aws-amplify';

const Fetch = () => {

    const [store, setStore] = useState<any>('')
    const [storeAddr, setStoreAddr] = useState<any>('')
    const [storeCond, setStoreCond] = useState<any>('')
    const [storeImg, setStoreImg] = useState<any>('')
    // const [relatedEntities, setRelated] = useState<any>([])

    useEffect(() => {
        // Storeの情報を取得する
        // const storeId = 'urn:ngsi-ld:Store:001'
        const myInitStore = {
            headers: {}, // OPTIONAL
        };
        API.get('orion-app', '/api/hello', myInitStore)
        .then(res => {
            // console.log(typeof(res))
            console.log(res)
            setStore(res.message)
            setStoreCond(res.message.conditions)
            setStoreAddr(res.message.address)

            // create image
            const zoom = 15
            const tilesPerRow = Math.pow(2, zoom);
            let longitude = res.message.location.coordinates[0];
            let latitude = res.message.location.coordinates[1];
        
            longitude /= 360;
            longitude += 0.5;
            latitude = 0.5 - Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)) / Math.PI / 2.0;
        
            setStoreImg('https://a.tile.openstreetmap.org/' +
            zoom +
            '/' +
            Math.floor(longitude * tilesPerRow) +
            '/' +
            Math.floor(latitude * tilesPerRow) +
            '.png')
        })
        .catch(error => alert(error))
    },[])

    return (
        <div>
            <Box mb={2}>
                <Text color={'black'} textAlign={'left'} fontSize={32} fontWeight={600}>
                    {store.name ? store.name : ''}
                </Text>
            </Box>
            <Flex mb={6}>
                <Center w='60%'>
                    <Image
                        boxSize='500px'
                        height='300px'
                        objectFit='cover'
                        src={storeImg}
                        alt='location image'
                        fallbackSrc=''
                    />
                </Center>
                <Spacer/>
                <Box w={'36%'}>
                    <Stack textAlign={'left'} fontSize={20} lineHeight={1}>
                        <Text>
                            Address:
                        </Text>
                        <Text fontWeight={'bold'}>
                            {storeAddr.streetAddress ? storeAddr.streetAddress : ''}{<br/>}
                            {storeAddr.addressLocality ? storeAddr.addressLocality : ''}{<br/>}
                            {storeAddr.addressRegion ? storeAddr.addressRegion : ''}
                        </Text>
                        <Text>
                            Postal Code:
                        </Text>
                        <Text fontWeight={'bold'} mb={4}>
                            {storeAddr.postalCode ? storeAddr.postalCode : ''}
                        </Text>
                        <Text>
                            Temperature:
                        </Text>
                        <Text fontWeight={'bold'} mb={4}>
                            {storeCond.temperature ? storeCond.temperature : ''}℃
                        </Text>
                        <Text>
                            Humidity:
                        </Text>
                        <Text fontWeight={'bold'} mb={4}>
                            {storeCond.humidity ? storeCond.humidity : ''}%
                        </Text>
                    </Stack>
                </Box>
            </Flex>
        </div>
    )
}

export default Fetch