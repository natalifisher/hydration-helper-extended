import {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeTab from './HomeTab';
import IntakeTab from './IntakeTab';
import ExerciseTab from './ExerciseTab';
import SettingsTab from './SettingsTab';
import TrendsTab from './TrendsTab';
import {
  intakeIcon,
  exerciseIcon,
  waterIcon,
  settingsIcon,
  trendsIcon,
} from './TabIcons';
import COLORS from './Colors';
// import HealthAPI from '../services/healthKitAPI';
import DailyEntry from './DailyEntry';
import {getCurrentDate} from '../util/getCurrentDate';
import useStorageData from '../hooks/useStorageData';
import useUnitChange from '../hooks/useUnitChange';
import useRecommendation from '../hooks/useRecommendation';

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: COLORS.iceBlue,
    height: 110,
  },
  headerTitleStyle: {
    color: COLORS.primarySelected,
    flex: 1,
    fontSize: 18,
    marginTop: 15,
  },
  tabBarItemStyle: {
    height: 50,
    marginTop: 20,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBarStyle: {
    backgroundColor: COLORS.iceBlue,
    height: 100,
    position: 'absolute',
  },
});

const Tab = createBottomTabNavigator();
// const healthAPI = new HealthAPI();

export default function Tabs() {
  const [recommendation, setRecommendation] = useState(120);
  const [intake, setIntake] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [age, setAge] = useState('21');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('72');
  const [weight, setWeight] = useState('160');
  const [unit, setUnit] = useState('us-system');
  const [temperature, setTemperature] = useState(0);
  const [newDay, setNewDay] = useState(false);
  const dataFetched = useStorageData(
    setIntake,
    setExercise,
    setAge,
    setGender,
    setHeight,
    setWeight,
    setUnit,
    setTemperature,
  );
  useUnitChange(
    unit,
    recommendation,
    setRecommendation,
    setIntake,
    setHeight,
    setWeight,
  );
  useRecommendation(
    dataFetched,
    temperature,
    unit,
    age,
    gender,
    height,
    weight,
    exercise,
    setRecommendation,
  );

  const getTimeCategory = time => {
    const hours = time.split(':')[0];
    if (hours <= 12) return 'morning';
    if (hours <= 18) return 'afternoon';
    return 'evening';
  };

  const updateDrinkScores = async () => {
    let drinkScores = await AsyncStorage.getItem('@drinkScores');
    if (drinkScores) drinkScores = JSON.parse(drinkScores);
    else drinkScores = {};
    const keyList = [];
    const entriesList = JSON.parse(await AsyncStorage.getItem('@entries'));
    if (!entriesList) return;
    for (let i = 0; i < entriesList.length; i += 1) {
      if (entriesList[i].drinkType === 'water') continue;
      const timeCategory = getTimeCategory(entriesList[i].drinkTime);
      const key = `${entriesList[i].drinkType}-${timeCategory}`;
      if (keyList.includes(key)) continue;
      if (!drinkScores.hasOwnProperty(key)) {
        drinkScores[key] = 50;
      } else if (drinkScores[key] < 100)
        drinkScores[key] = Math.min(drinkScores[key] + 10, 100);
      keyList.push(key);
    }
    Object.keys(drinkScores).forEach(key => {
      if (!keyList.includes(key)) drinkScores[key] -= 5;
    });
    await AsyncStorage.setItem('@drinkScores', JSON.stringify(drinkScores));
  };

  const updatePerformanceScore = async () => {
    let performanceScore = parseInt(
      await AsyncStorage.getItem('@performanceScore'),
      10,
    );
    if (intake > recommendation) performanceScore += 5;
    else performanceScore -= 5;
    await AsyncStorage.setItem(
      '@performanceScore',
      performanceScore.toString(),
    );
  };

  useEffect(() => {
    if (!dataFetched) return;
    const resetDay = newDate => {
      updateDrinkScores();
      updatePerformanceScore();
      AsyncStorage.setItem('@intake', '0');
      AsyncStorage.setItem('@entries', JSON.stringify([]));
      AsyncStorage.setItem('@exercise', '0');
      setIntake(0);
      setExercise(0);
      AsyncStorage.setItem('@current_day', newDate);
    };
    const checkCurrentDay = async () => {
      const d1 = await AsyncStorage.getItem('@current_day');
      const d2 = getCurrentDate(0);
      if (d1 !== d2) {
        const drinkEntries = await AsyncStorage.getItem('@entries');
        const dailyEntry = new DailyEntry(
          recommendation,
          intake,
          drinkEntries,
          exercise,
        );
        await AsyncStorage.setItem(`@${d1}`, JSON.stringify(dailyEntry));
        resetDay(d2);
        setNewDay(true);
      }
    };
    checkCurrentDay();
  }, [dataFetched]);

  return (
    <Tab.Navigator
      initialRouteName="Water Intake"
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarActiveTintColor: COLORS.primarySelected,
        tabBarInactiveTintColor: COLORS.primaryFaded,
        headerStyle: styles.headerStyle,
        headerTitleStyle: styles.headerTitleStyle,
      }}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: waterIcon,
          headerTitle: `Progress: ${((intake * 100) / recommendation).toFixed(
            1,
          )}%`,
        }}>
        {() => (
          <HomeTab
            recommendation={recommendation}
            unit={unit}
            temperature={temperature}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Intake"
        options={{
          tabBarIcon: intakeIcon,
          headerTitle: `Current water intake: ${intake.toFixed(0)} ${
            unit === 'us-system' ? 'oz' : 'ml'
          }`,
        }}>
        {() => (
          <IntakeTab
            intake={intake}
            setIntake={setIntake}
            recommendation={recommendation}
            unit={unit}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Exercise"
        options={{
          tabBarIcon: exerciseIcon,
          headerTitle: `You exercised for ${exercise} minutes today!`,
        }}>
        {() => <ExerciseTab exercise={exercise} setExercise={setExercise} />}
      </Tab.Screen>
      <Tab.Screen
        name="Trends"
        options={{
          tabBarIcon: trendsIcon,
          headerTitle: `Remember: Progress isn't linear`,
        }}>
        {() => (
          <TrendsTab
            recommendation={recommendation}
            intake={intake}
            unit={unit}
            newDay={newDay}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: settingsIcon,
          headerTitle: 'Settings',
        }}>
        {() => (
          <SettingsTab
            // healthAPI={healthAPI}
            age={age}
            setAge={setAge}
            gender={gender}
            setGender={setGender}
            height={height}
            setHeight={setHeight}
            weight={weight}
            setWeight={setWeight}
            unit={unit}
            setUnit={setUnit}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
