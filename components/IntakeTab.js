import {useState} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {Button, Input, Icon} from '@rneui/base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DrinkSlider from './DrinkSlider';
import COLORS from './Colors';
import DRINKS from './Drinks';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
  },
  icon: {
    marginTop: 30,
  },
  input: {
    marginLeft: 70,
    marginRight: 70,
  },
  largerTextBlue: {
    alignItems: 'center',
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  largerTextWhite: {
    alignItems: 'center',
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    height: 50,
  },
});

/* TODO: Modify to include percent water intake achieved
and only be sent when some amount was recorded etc */
async function intakeRecordNotification(intake, recommendation) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `You have reached ${((intake * 100) / recommendation).toFixed(
        1,
      )}% of today's water goal!`,
      body: 'Keep up the good work; Every intake record counts.',
      data: {data: 'goes here'},
    },
    trigger: {seconds: 5},
  });
}

export default function IntakeTab({intake, setIntake, recommendation, unit}) {
  const [drinkAmount, setDrinkAmount] = useState(0);
  const [drinkType, setDrinkType] = useState('water');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const camalize = str =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
  const updateDrinkType = text => {
    setDrinkType(text);
    if (camalize(text) in DRINKS) setSubmitDisabled(false);
    else setSubmitDisabled(true);
  };
  return (
    <View style={styles.container}>
      <Icon
        style={styles.icon}
        name="local-drink"
        type="material"
        color={COLORS.primary}
        size={160}
      />
      <Text style={styles.largerTextBlue}>
        Please enter your new liquid intake below
      </Text>
      <DrinkSlider
        drinkAmount={drinkAmount}
        setDrinkAmount={setDrinkAmount}
        unit={unit}
      />
      <Input
        inputContainerStyle={styles.input}
        placeholder="Drink type (ie. water)"
        onChangeText={updateDrinkType}
      />
      <Button
        disabled={submitDisabled}
        buttonStyle={styles.submitButton}
        titleStyle={styles.largerTextWhite}
        title="Submit"
        onPress={async () => {
          Alert.alert('Your entry has been recorded.');
          await AsyncStorage.setItem('@drink_type', drinkType);
          await AsyncStorage.setItem('@drink_amount', drinkAmount.toString());
          const newIntake = intake + drinkAmount;
          await AsyncStorage.setItem('@intake', newIntake.toString());
          setIntake(prev => prev + drinkAmount);
          await intakeRecordNotification(intake + drinkAmount, recommendation);
        }}
      />
    </View>
  );
}
