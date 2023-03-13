import AsyncStorage from '@react-native-async-storage/async-storage';
import {Card, Tab, Text} from '@rneui/base';
import {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {AccordionList} from 'react-native-accordion-list-view';
import {BarChart} from 'react-native-gifted-charts';
import {getCurrentDate, getDayOfWeek} from '../util/getCurrentDate';
import COLORS from './Colors';

const styles = StyleSheet.create({
  align: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  barChart: {paddingHorizontal: 20},
  cardStyle: {flexDirection: 'row', justifyContent: 'space-between'},
  container: {
    backgroundColor: COLORS.white,
    flex: 1,
  },
  leftDot: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    height: 15,
    marginBottom: 6,
    marginRight: 8,
    width: 15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 25,
    marginTop: 25,
  },
  rightDot: {
    backgroundColor: COLORS.lighterBlue,
    borderRadius: 15,
    height: 15,
    marginBottom: 6,
    marginRight: 8,
    width: 15,
  },
  textLegend: {
    color: COLORS.primary,
    fontSize: 15,
    height: 25,
  },
  scoresHeader: {textAlign: 'center', color: COLORS.primary, marginTop: 15},
  viewModeTab: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 120,
    alignSelf: 'center',
  },
  viewModeIndicator: {
    backgroundColor: COLORS.primary,
  },
  viewModeTitle: {
    color: COLORS.primary,
  },
  xAxisLegendStyle: {
    fontSize: 15,
    marginBottom: -5,
  },
  yAxisTextStyle: {
    fontSize: 15,
  },
});

const data = [
  {
    date: '3-2-2023',
    rec: 57,
    intake: 23,
    exercise: 30,
    calorie_intake: 1222,
    rec_drink: 'orange juice',
  },
  {
    date: '3-3-2023',
    rec: 69,
    intake: 37,
    exercise: 75,
    calorie_intake: 757,
    rec_drink: 'coffee',
  },
  {
    date: '3-4-2023',
    rec: 69,
    intake: 37,
    exercise: 75,
    calorie_intake: 757,
    rec_drink: 'orange juice',
  },
  {
    date: '3-5-2023',
    rec: 69,
    intake: 37,
    exercise: 75,
    calorie_intake: 757,
    rec_drink: 'apple juice',
  },
  {
    date: '3-6-2023',
    rec: 69,
    intake: 37,
    exercise: 75,
    calorie_intake: 757,
    rec_drink: 'sparkling water',
  },
  {
    date: '3-7-2023',
    rec: 69,
    intake: 37,
    exercise: 75,
    calorie_intake: 757,
    rec_drink: 'smoothie',
  },
];

const listTitle = item => {
  return <Text>{item.date}</Text>;
};

const listAttribute = (item, unit) => {
  return (
    <View>
      <Text>
        Recommendation: {item.intake} {unit === 'us-system' ? 'oz' : 'ml'}
      </Text>
      <Text>Recommended drink: {item.rec_drink}</Text>
      <Text>
        Water intake: {item.intake} {unit === 'us-system' ? 'oz' : 'ml'}
      </Text>
      <Text>Exercise: {item.exercise} minutes</Text>
      <Text>Calorie intake: {item.calorie_intake} cals</Text>
    </View>
  );
};

export default function TrendsTab({recommendation, intake, unit, newDay}) {
  const [dataBarsWeek, setDataBarsWeek] = useState([]);
  const [dataBarsMonth, setDataBarsMonth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // fetch data for week chart
      setDataBarsWeek([]);
      let days = [];
      for (let i = 1; i <= 7; i += 1) {
        days.push(AsyncStorage.getItem(`@${getCurrentDate(7 - i)}`));
      }
      days = await Promise.all(days);
      for (let i = 0; i < 6; i += 1) {
        const day = days[i];
        if (day) {
          const dailyEntry = JSON.parse(day);
          const recommendationBar = {
            label: getDayOfWeek(6 - i),
            value: dailyEntry.recommendation,
            spacing: 2,
            frontColor: COLORS.primary,
          };
          const intakeBar = {
            value: dailyEntry.intake,
            frontColor: COLORS.lighterBlue,
          };
          setDataBarsWeek(prev => [...prev, recommendationBar, intakeBar]);
        }
      }
      const todayRecommendationBar = {
        label: getDayOfWeek(0),
        value: recommendation,
        spacing: 2,
        frontColor: COLORS.primary,
      };
      const todayIntakeBar = {
        value: intake,
        frontColor: COLORS.lighterBlue,
      };
      setDataBarsWeek(prev => [
        ...prev,
        todayRecommendationBar,
        todayIntakeBar,
      ]);

      // fetch data for month chart
      setDataBarsMonth([]);
      let daysMonth = [];
      for (let i = 1; i <= 30; i += 1) {
        daysMonth.push(AsyncStorage.getItem(`@${getCurrentDate(30 - i)}`));
      }
      daysMonth = await Promise.all(daysMonth);
      for (let i = 0; i < 30; i += 1) {
        const day = daysMonth[i];
        if (day) {
          const dailyEntry = JSON.parse(day);
          const recommendationBar = {
            label: getDayOfWeek(29 - i),
            value: dailyEntry.recommendation,
            spacing: 2,
            frontColor: COLORS.primary,
          };
          const intakeBar = {
            value: dailyEntry.intake,
            frontColor: COLORS.lighterBlue,
          };
          setDataBarsMonth(prev => [...prev, recommendationBar, intakeBar]);
        }
      }
      setDataBarsMonth(prev => [...prev, {value: 0}]);
    };
    fetchData();
  }, [intake, newDay]);

  const [dataScores, setDataScores] = useState([]);
  const [performanceScore, setPerformanceScore] = useState(75);
  useEffect(() => {
    const fetchDrinkScores = async () => {
      drinkScores = JSON.parse(await AsyncStorage.getItem('@drinkScores'));
      let temp = [];
      Object.entries(drinkScores).forEach(entry =>
        temp.push({
          name: entry[0],
          score: entry[1],
        }),
      );
      temp.sort((a, b) => b.score - a.score);
      setDataScores(temp);
    };
    const fetchPerformanceScore = async () => {
      let score = await AsyncStorage.getItem('@performanceScore');
      if (!score) {
        score = 75;
        await AsyncStorage.setItem('@performanceScore', score.toString());
      }
      setPerformanceScore(score);
    };
    fetchDrinkScores();
    fetchPerformanceScore();
  }, [newDay]);

  const renderScores = ({item}) => (
    <Card wrapperStyle={styles.cardStyle}>
      <Text>{item.name}</Text>
      <Text>{item.score}</Text>
    </Card>
  );

  const [viewMode, setViewMode] = useState(0);

  return (
    <View style={styles.container}>
      {viewMode == 0 && (
        <View style={styles.barChart}>
          <View style={styles.legend}>
            <View style={styles.align}>
              <View style={styles.leftDot} />
              <Text style={styles.textLegend}>Recommended Intake</Text>
            </View>
            <View style={styles.align}>
              <View style={styles.rightDot} />
              <Text style={styles.textLegend}>Recorded Intake</Text>
            </View>
          </View>
          <BarChart
            data={dataBarsWeek}
            spacing={27}
            barWidth={20}
            xAxisThickness={1}
            labelsExtraHeight={15}
            yAxisThickness={1}
            yAxisTextStyle={styles.yAxisTextStyle}
            noOfSections={7}
            maxValue={125}
            labelWidth={85}
            height={400}
            xAxisLabelTextStyle={styles.xAxisLegendStyle}
          />
        </View>
      )}

      {viewMode == 1 && (
        <View style={styles.barChart}>
          <View style={styles.legend}>
            <View style={styles.align}>
              <View style={styles.leftDot} />
              <Text style={styles.textLegend}>Recommended Intake</Text>
            </View>
            <View style={styles.align}>
              <View style={styles.rightDot} />
              <Text style={styles.textLegend}>Recorded Intake</Text>
            </View>
          </View>
          <BarChart
            data={dataBarsMonth}
            spacing={27}
            barWidth={20}
            xAxisThickness={1}
            labelsExtraHeight={15}
            yAxisThickness={1}
            yAxisTextStyle={styles.yAxisTextStyle}
            noOfSections={7}
            maxValue={125}
            labelWidth={85}
            height={400}
            xAxisLabelTextStyle={styles.xAxisLegendStyle}
          />
        </View>
      )}

      {viewMode == 2 && (
        <View>
          <AccordionList
            marginTop={55}
            data={data}
            customTitle={item => listTitle(item)}
            customBody={item => listAttribute(item, unit)}
          />
        </View>
      )}

      {viewMode == 3 && (
        <View>
          <Text style={styles.scoresHeader} h4>
            User Performance Score
          </Text>
          <Card wrapperStyle={styles.cardStyle}>
            <Text>Performance score</Text>
            <Text>{performanceScore}</Text>
          </Card>
          <Text style={styles.scoresHeader} h4>
            Drink Tendency Scores
          </Text>
          <FlatList
            data={dataScores}
            renderItem={renderScores}
            keyExtractor={item => item.name}
          />
        </View>
      )}

      <View style={styles.viewModeTab}>
        <Tab
          value={viewMode}
          onChange={setViewMode}
          titleStyle={styles.viewModeTitle}
          indicatorStyle={styles.viewModeIndicator}
          scrollable>
          <Tab.Item
            containerStyle={active => ({
              backgroundColor: active ? COLORS.iceBlue : COLORS.white,
            })}>
            Weekly Graph
          </Tab.Item>
          <Tab.Item
            containerStyle={active => ({
              backgroundColor: active ? COLORS.iceBlue : undefined,
            })}>
            Monthly Graph
          </Tab.Item>
          <Tab.Item
            buttonStyle={active => ({
              backgroundColor: active ? COLORS.iceBlue : COLORS.white,
            })}>
            Drinks
          </Tab.Item>
          <Tab.Item
            buttonStyle={active => ({
              backgroundColor: active ? COLORS.iceBlue : COLORS.white,
            })}>
            Scores
          </Tab.Item>
        </Tab>
      </View>
    </View>
  );
}
