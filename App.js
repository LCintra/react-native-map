import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import busIcon from './assets/bus.png'
import { Image } from 'react-native';
import * as Location from 'expo-location';
import APIKEY from './consts/apikey';

export default function App() {
  const screen = Dimensions.get('window');
  const ASPECT_RATIO = screen.width / screen.height;
  const LATITUDE_DELTA = 0.04;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const intervalRef = useRef();
  const [cords, setCords] = useState({
    currentCords: {
      latitude: -20.53097117862155,
      longitude: -47.38140156039898,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    endCords: {
      latitude: -20.530973810929463,
      longitude: -47.38932304847428,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  })
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(false);

  const updateLocation = async () => {
    console.log('Atualizou A Loc')
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
    
    setCords({...cords,currentCords: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }})
  }

  const {currentCords, endCords} = cords
  const mapRef = useRef()

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLocationStatus(false);
        return;
      }
      setLocationStatus(true);
    })();
    updateLocation()
  }, []);

  useEffect(() => {
    if(locationStatus) {
      intervalRef.current = setInterval(updateLocation, 6000);
      return () => {
        clearInterval(intervalRef.current);
      };
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{flex: 4}}
        initialRegion={currentCords}
        // https://github.com/react-native-maps/react-native-maps/issues/1003
      >
        <Marker 
          coordinate={endCords}
        />
        <Marker 
          coordinate={currentCords}
        >
          <Image
            source={busIcon}
            style={{width: 26, height: 28}}
            resizeMode="contain"
          />
        </Marker>
        <MapViewDirections
        origin={currentCords}
        destination={endCords}
        apikey={APIKEY}
        strokeWidth={3}
        optimizeWaypoints={true}
        // onReady={result => {
        //   mapRef.current.fitToCoordinates(result.coordinates,{
        //     edgePadding: {
        //       right: 30,
        //       bottom: 300,
        //       left: 30,
        //       top: 100, 
        //     },
        //     animated: true,
        //   })
        // }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  personIcon: {
    width: '10%',
    height: '15%'
  }
});
