import { StatusBar } from 'expo-status-bar';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {useEffect} from "react";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

async function scheduleLocalNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "¡Es hora de revisar el marketplace!",
      body: "Hay nuevos productos esperándote",
    },
    trigger: {
      seconds: 60,
    },
  });
}


export default function App() {

  async function registerForPushNotificationsAsync() {

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get permission!');
        return;
      }
    } else {
      alert('Must use physical device for Push Notifications');
      return;
    }

    console.log('d')
    await scheduleLocalNotification();
  }

  useEffect(() => {
    const result = registerForPushNotificationsAsync().catch(console.error);
  }, []);


  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida en primer plano!', notification);
    });

    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación recibida en segundo plano!', response);
    });

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
